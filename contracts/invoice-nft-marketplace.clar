;; Invoice NFT Marketplace Contract
;; Enables tokenization and trading of invoice receivables

(define-constant CONTRACT_OWNER tx-sender)
(define-constant PLATFORM_FEE u50) ;; 0.5% in basis points

(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INVOICE_NOT_FOUND (err u101))
(define-constant ERR_INVALID_STATUS (err u102))
(define-constant ERR_NOT_AUCTION (err u103))
(define-constant ERR_AUCTION_EXPIRED (err u104))
(define-constant ERR_IS_AUCTION (err u105))
(define-constant ERR_BID_TOO_LOW (err u106))
(define-constant ERR_AUCTION_NOT_ENDED (err u107))
(define-constant ERR_TOKEN_NOT_SUPPORTED (err u108))

(define-non-fungible-token invoice-nft uint)

(define-map invoice-nft-metadata
  { token-id: uint }
  { 
    owner: principal, 
    invoice-id: uint, 
    amount: uint, 
    currency: (string-ascii 10),
    due-date: uint,
    debtor: principal,
    status: (string-ascii 20),
    metadata-uri: (string-utf8 256),
    created-at: uint,
    risk-score: uint
  }
)

(define-map invoice-listings
  { token-id: uint }
  { 
    seller: principal,
    ask-price: uint,
    min-bid: uint,
    auction-end: uint,
    highest-bidder: principal,
    highest-bid: uint,
    is-auction: bool
  }
)

(define-map invoice-offers
  { token-id: uint, buyer: principal }
  { amount: uint, expires-at: uint }
)

;; Mint new invoice NFT
(define-public (mint-invoice-nft 
  (invoice-id uint) 
  (receiver principal) 
  (amount uint)
  (currency (string-ascii 10))
  (due-date uint)
  (debtor principal)
  (metadata-uri (string-utf8 256))
  (risk-score uint)
)
  (let (
    (token-id invoice-id)
    (current-block block-height)
  )
  (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
  (try! (nft-mint? invoice-nft token-id receiver))
  (map-set invoice-nft-metadata 
    { token-id: token-id } 
    { 
      owner: receiver, 
      invoice-id: invoice-id, 
      amount: amount,
      currency: currency,
      due-date: due-date,
      debtor: debtor,
      status: "active",
      metadata-uri: metadata-uri,
      created-at: current-block,
      risk-score: risk-score
    }
  )
  (ok token-id)
))

;; List invoice for fixed price sale
(define-public (list-invoice-fixed-price 
  (token-id uint) 
  (ask-price uint) 
  (expires-in uint)
)
  (let (
    (seller tx-sender)
    (metadata (unwrap! (map-get? invoice-nft-metadata { token-id: token-id }) ERR_INVOICE_NOT_FOUND))
    (auction-end (+ block-height expires-in))
  )
  (asserts! (is-eq (get owner metadata) seller) ERR_NOT_AUTHORIZED)
  (asserts! (is-eq (get status metadata) "active") ERR_INVALID_STATUS)
  
  (map-set invoice-listings
    { token-id: token-id }
    { 
      seller: seller,
      ask-price: ask-price,
      min-bid: ask-price,
      auction-end: auction-end,
      highest-bidder: seller,
      highest-bid: ask-price,
      is-auction: false
    }
  )
  (ok true)
))

;; List invoice for auction
(define-public (list-invoice-auction 
  (token-id uint) 
  (min-bid uint) 
  (auction-duration uint)
)
  (let (
    (seller tx-sender)
    (metadata (unwrap! (map-get? invoice-nft-metadata { token-id: token-id }) ERR_INVOICE_NOT_FOUND))
    (auction-end (+ block-height auction-duration))
  )
  (asserts! (is-eq (get owner metadata) seller) ERR_NOT_AUTHORIZED)
  (asserts! (is-eq (get status metadata) "active") ERR_INVALID_STATUS)
  
  (map-set invoice-listings
    { token-id: token-id }
    { 
      seller: seller,
      ask-price: min-bid,
      min-bid: min-bid,
      auction-end: auction-end,
      highest-bidder: seller,
      highest-bid: min-bid,
      is-auction: true
    }
  )
  (ok true)
))

;; Buy invoice at fixed price
(define-public (buy-invoice (token-id uint))
  (let (
    (buyer tx-sender)
    (listing (unwrap! (map-get? invoice-listings { token-id: token-id }) ERR_INVOICE_NOT_FOUND))
    (metadata (unwrap! (map-get? invoice-nft-metadata { token-id: token-id }) ERR_INVOICE_NOT_FOUND))
    (seller (get seller listing))
    (ask-price (get ask-price listing))
    (platform-fee (/ (* ask-price PLATFORM_FEE) u10000))
    (seller-amount (- ask-price platform-fee))
  )
  (asserts! (is-eq (get is-auction listing) false) ERR_IS_AUCTION)
  (asserts! (<= block-height (get auction-end listing)) ERR_AUCTION_EXPIRED)
  
  ;; Transfer payment to contract
  (try! (stx-transfer? ask-price buyer (as-contract tx-sender)))
  ;; Transfer payment to seller
  (try! (as-contract (stx-transfer? seller-amount tx-sender seller)))
  
  ;; Transfer NFT to buyer
  (try! (nft-transfer? invoice-nft token-id seller buyer))
  
  ;; Update metadata
  (map-set invoice-nft-metadata 
    { token-id: token-id } 
    (merge metadata { owner: buyer })
  )
  (map-delete invoice-listings { token-id: token-id })
  (ok true)
))

;; Place bid on auction
(define-public (place-bid (token-id uint) (bid-amount uint))
  (let (
    (bidder tx-sender)
    (listing (unwrap! (map-get? invoice-listings { token-id: token-id }) ERR_INVOICE_NOT_FOUND))
    (current-bid (get highest-bid listing))
    (min-increment (/ current-bid u20)) ;; 5% minimum increment
  )
  (asserts! (is-eq (get is-auction listing) true) ERR_NOT_AUCTION)
  (asserts! (<= block-height (get auction-end listing)) ERR_AUCTION_EXPIRED)
  (asserts! (>= bid-amount (+ current-bid min-increment)) ERR_BID_TOO_LOW)
  
  ;; Refund previous highest bidder if not seller
  (if (not (is-eq (get highest-bidder listing) (get seller listing)))
    (try! (as-contract (stx-transfer? current-bid tx-sender (get highest-bidder listing))))
    true
  )
  
  ;; Transfer bid to contract
  (try! (stx-transfer? bid-amount bidder (as-contract tx-sender)))
  
  ;; Update listing
  (map-set invoice-listings
    { token-id: token-id }
    (merge listing { 
      highest-bidder: bidder,
      highest-bid: bid-amount 
    })
  )
  (ok true)
))

;; Settle auction after it ends
(define-public (settle-auction (token-id uint))
  (let (
    (listing (unwrap! (map-get? invoice-listings { token-id: token-id }) ERR_INVOICE_NOT_FOUND))
    (metadata (unwrap! (map-get? invoice-nft-metadata { token-id: token-id }) ERR_INVOICE_NOT_FOUND))
    (seller (get seller listing))
    (winner (get highest-bidder listing))
    (winning-bid (get highest-bid listing))
    (platform-fee (/ (* winning-bid PLATFORM_FEE) u10000))
    (seller-amount (- winning-bid platform-fee))
  )
  (asserts! (> block-height (get auction-end listing)) ERR_AUCTION_NOT_ENDED)
  (asserts! (is-eq (get is-auction listing) true) ERR_NOT_AUCTION)
  
  ;; Transfer payment to seller
  (try! (as-contract (stx-transfer? seller-amount tx-sender seller)))
  
  ;; Transfer NFT if there was a winner
  (if (not (is-eq winner seller))
    (begin
      (try! (nft-transfer? invoice-nft token-id seller winner))
      (map-set invoice-nft-metadata 
        { token-id: token-id } 
        (merge metadata { owner: winner })
      )
    )
    true
  )
  
  (map-delete invoice-listings { token-id: token-id })
  (ok true)
))

;; Read-only functions
(define-read-only (get-invoice-metadata (token-id uint))
  (map-get? invoice-nft-metadata { token-id: token-id })
)

(define-read-only (get-listing (token-id uint))
  (map-get? invoice-listings { token-id: token-id })
)

(define-read-only (get-invoice-owner (token-id uint))
  (nft-get-owner? invoice-nft token-id)
)

