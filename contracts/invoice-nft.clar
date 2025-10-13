;; ========================================
;; Invoice NFT Receivables Contract
;; ========================================
;; Tokenizes invoices as tradeable NFT assets for liquidity
;; Enables DAOs and contributors to sell or factor invoices
;; Part of BitMind DeFi Advanced Features

;; ========================================
;; Constants
;; ========================================
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-invalid-invoice (err u102))
(define-constant err-already-minted (err u103))
(define-constant err-not-found (err u104))
(define-constant err-listing-exists (err u105))
(define-constant err-insufficient-payment (err u106))
(define-constant err-not-listed (err u107))

;; ========================================
;; Data Variables
;; ========================================
(define-data-var last-token-id uint u0)
(define-data-var platform-fee-percentage uint u250) ;; 2.5% = 250 basis points

;; ========================================
;; Non-Fungible Token Definition
;; ========================================
(define-non-fungible-token invoice-nft uint)

;; ========================================
;; Data Maps
;; ========================================

;; Map token-id to invoice metadata
(define-map invoice-nft-metadata
  { token-id: uint }
  {
    invoice-id: uint,
    original-owner: principal,
    face-value: uint,
    token-contract: principal,
    due-date: uint,
    status: (string-ascii 20),
    metadata-uri: (optional (string-utf8 256)),
    escrow-contract: principal
  }
)

;; Map invoice-id to token-id (prevent duplicate minting)
(define-map invoice-to-token
  { invoice-id: uint }
  { token-id: uint }
)

;; Marketplace listings
(define-map marketplace-listings
  { token-id: uint }
  {
    seller: principal,
    asking-price: uint,
    discount-percentage: uint,
    listed-at: uint,
    expires-at: uint
  }
)

;; Trading history for analytics
(define-map trading-history
  { token-id: uint, trade-index: uint }
  {
    from: principal,
    to: principal,
    price: uint,
    timestamp: uint
  }
)

(define-map token-trade-count
  { token-id: uint }
  { count: uint }
)

;; ========================================
;; Private Helper Functions
;; ========================================

(define-private (calculate-platform-fee (price uint))
  (/ (* price (var-get platform-fee-percentage)) u10000)
)

;; ========================================
;; Public Functions - Minting
;; ========================================

;; Mint a new invoice NFT
(define-public (mint-invoice-nft
  (invoice-id uint)
  (receiver principal)
  (face-value uint)
  (token-contract principal)
  (due-date uint)
  (metadata-uri (optional (string-utf8 256)))
  (escrow-contract principal))
  (let
    (
      (new-token-id (+ (var-get last-token-id) u1))
    )
    ;; Check if invoice already tokenized
    (asserts! (is-none (map-get? invoice-to-token { invoice-id: invoice-id })) err-already-minted)
    
    ;; Mint NFT
    (try! (nft-mint? invoice-nft new-token-id receiver))
    
    ;; Store metadata
    (map-set invoice-nft-metadata
      { token-id: new-token-id }
      {
        invoice-id: invoice-id,
        original-owner: receiver,
        face-value: face-value,
        token-contract: token-contract,
        due-date: due-date,
        status: "minted",
        metadata-uri: metadata-uri,
        escrow-contract: escrow-contract
      }
    )
    
    ;; Map invoice to token
    (map-set invoice-to-token
      { invoice-id: invoice-id }
      { token-id: new-token-id }
    )
    
    ;; Initialize trade count
    (map-set token-trade-count
      { token-id: new-token-id }
      { count: u0 }
    )
    
    ;; Update last token ID
    (var-set last-token-id new-token-id)
    
    (ok new-token-id)
  )
)

;; ========================================
;; Public Functions - Marketplace
;; ========================================

;; List invoice NFT for sale
(define-public (list-for-sale
  (token-id uint)
  (asking-price uint)
  (discount-percentage uint)
  (duration uint))
  (let
    (
      (token-owner (unwrap! (nft-get-owner? invoice-nft token-id) err-not-found))
      (current-block block-height)
    )
    ;; Verify ownership
    (asserts! (is-eq tx-sender token-owner) err-not-token-owner)
    
    ;; Check not already listed
    (asserts! (is-none (map-get? marketplace-listings { token-id: token-id })) err-listing-exists)
    
    ;; Create listing
    (map-set marketplace-listings
      { token-id: token-id }
      {
        seller: tx-sender,
        asking-price: asking-price,
        discount-percentage: discount-percentage,
        listed-at: current-block,
        expires-at: (+ current-block duration)
      }
    )
    
    (ok true)
  )
)

;; Cancel listing
(define-public (cancel-listing (token-id uint))
  (let
    (
      (listing (unwrap! (map-get? marketplace-listings { token-id: token-id }) err-not-listed))
      (seller (get seller listing))
    )
    ;; Verify caller is seller
    (asserts! (is-eq tx-sender seller) err-not-token-owner)
    
    ;; Remove listing
    (map-delete marketplace-listings { token-id: token-id })
    
    (ok true)
  )
)

;; Purchase invoice NFT from marketplace
(define-public (purchase-invoice-nft
  (token-id uint)
  (payment-amount uint))
  (let
    (
      (listing (unwrap! (map-get? marketplace-listings { token-id: token-id }) err-not-listed))
      (seller (get seller listing))
      (asking-price (get asking-price listing))
      (platform-fee (calculate-platform-fee asking-price))
      (seller-proceeds (- asking-price platform-fee))
      (metadata (unwrap! (map-get? invoice-nft-metadata { token-id: token-id }) err-not-found))
      (trade-count-data (unwrap! (map-get? token-trade-count { token-id: token-id }) err-not-found))
      (current-trade-index (get count trade-count-data))
    )
    ;; Verify payment amount
    (asserts! (>= payment-amount asking-price) err-insufficient-payment)
    
    ;; Verify listing not expired
    (asserts! (<= block-height (get expires-at listing)) err-not-listed)
    
    ;; Transfer NFT
    (try! (nft-transfer? invoice-nft token-id seller tx-sender))
    
    ;; Transfer payment to seller (would need actual token transfer in production)
    ;; In production: (try! (contract-call? .token-contract transfer seller-proceeds tx-sender seller))
    
    ;; Record trade history
    (map-set trading-history
      { token-id: token-id, trade-index: current-trade-index }
      {
        from: seller,
        to: tx-sender,
        price: asking-price,
        timestamp: block-height
      }
    )
    
    ;; Update trade count
    (map-set token-trade-count
      { token-id: token-id }
      { count: (+ current-trade-index u1) }
    )
    
    ;; Remove listing
    (map-delete marketplace-listings { token-id: token-id })
    
    ;; Update status
    (map-set invoice-nft-metadata
      { token-id: token-id }
      (merge metadata { status: "traded" })
    )
    
    (ok true)
  )
)

;; ========================================
;; Public Functions - Bidding (Future Enhancement)
;; ========================================

;; Place bid on invoice NFT
(define-public (place-bid
  (token-id uint)
  (bid-amount uint)
  (bid-expiry uint))
  ;; Future implementation: escrow-based bidding system
  (ok true)
)

;; ========================================
;; Read-Only Functions
;; ========================================

;; Get invoice NFT metadata
(define-read-only (get-nft-metadata (token-id uint))
  (map-get? invoice-nft-metadata { token-id: token-id })
)

;; Get token ID for invoice
(define-read-only (get-token-id-by-invoice (invoice-id uint))
  (map-get? invoice-to-token { invoice-id: invoice-id })
)

;; Get marketplace listing
(define-read-only (get-listing (token-id uint))
  (map-get? marketplace-listings { token-id: token-id })
)

;; Get trade count
(define-read-only (get-trade-count (token-id uint))
  (map-get? token-trade-count { token-id: token-id })
)

;; Get trade history entry
(define-read-only (get-trade-history (token-id uint) (trade-index uint))
  (map-get? trading-history { token-id: token-id, trade-index: trade-index })
)

;; Get owner of token
(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? invoice-nft token-id))
)

;; Get last token ID
(define-read-only (get-last-token-id)
  (ok (var-get last-token-id))
)

;; Calculate discount from face value
(define-read-only (calculate-purchase-return (token-id uint) (purchase-price uint))
  (match (get-nft-metadata token-id)
    metadata
      (let
        (
          (face-value (get face-value metadata))
          (discount (- face-value purchase-price))
          (return-percentage (/ (* discount u10000) face-value))
        )
        (ok {
          face-value: face-value,
          purchase-price: purchase-price,
          discount: discount,
          return-percentage: return-percentage
        })
      )
    err-not-found
  )
)

;; ========================================
;; Admin Functions
;; ========================================

(define-public (update-platform-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set platform-fee-percentage new-fee)
    (ok true)
  )
)

;; Update invoice status (for escrow contract to call)
(define-public (update-invoice-status (token-id uint) (new-status (string-ascii 20)))
  (let
    (
      (metadata (unwrap! (map-get? invoice-nft-metadata { token-id: token-id }) err-not-found))
    )
    ;; In production, add authorization check for escrow contract
    (map-set invoice-nft-metadata
      { token-id: token-id }
      (merge metadata { status: new-status })
    )
    (ok true)
  )
)

