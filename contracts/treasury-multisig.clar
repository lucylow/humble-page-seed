;; ========================================
;; Treasury MultiSig Contract
;; ========================================
;; Multi-signature approval for invoice funding and payments
;; Enables safer DAO treasury control with M-of-N signatures
;; Part of BitMind DeFi Advanced Features

;; ========================================
;; Constants
;; ========================================
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u300))
(define-constant err-not-signer (err u301))
(define-constant err-already-signed (err u302))
(define-constant err-proposal-not-found (err u303))
(define-constant err-proposal-expired (err u304))
(define-constant err-insufficient-signatures (err u305))
(define-constant err-already-executed (err u306))
(define-constant err-invalid-threshold (err u307))

;; Proposal types
(define-constant proposal-type-fund-invoice u1)
(define-constant proposal-type-release-payment u2)
(define-constant proposal-type-approve-refund u3)
(define-constant proposal-type-add-signer u4)
(define-constant proposal-type-remove-signer u5)
(define-constant proposal-type-change-threshold u6)

;; ========================================
;; Data Variables
;; ========================================
(define-data-var signature-threshold uint u3) ;; Default 3-of-5
(define-data-var proposal-count uint u0)

;; ========================================
;; Data Maps
;; ========================================

;; Authorized signers
(define-map authorized-signers
  { signer: principal }
  { 
    active: bool,
    added-at: uint,
    added-by: principal
  }
)

;; Proposals
(define-map proposals
  { proposal-id: uint }
  {
    proposal-type: uint,
    proposer: principal,
    invoice-id: uint,
    target-address: principal,
    amount: uint,
    created-at: uint,
    expires-at: uint,
    executed: bool,
    signature-count: uint,
    description: (string-utf8 256)
  }
)

;; Signatures on proposals
(define-map proposal-signatures
  { proposal-id: uint, signer: principal }
  {
    signed: bool,
    signed-at: uint
  }
)

;; Treasury stats
(define-map treasury-stats
  { key: (string-ascii 20) }
  { value: uint }
)

;; Invoice approval tracking
(define-map invoice-approvals
  { invoice-id: uint }
  {
    proposal-id: uint,
    approved: bool,
    approved-at: uint,
    amount: uint
  }
)

;; ========================================
;; Initialization
;; ========================================

;; Initialize contract owner as first signer
(map-set authorized-signers
  { signer: contract-owner }
  {
    active: true,
    added-at: block-height,
    added-by: contract-owner
  }
)

(map-set treasury-stats { key: "total-proposals" } { value: u0 })
(map-set treasury-stats { key: "approved-proposals" } { value: u0 })
(map-set treasury-stats { key: "total-funded" } { value: u0 })

;; ========================================
;; Private Functions
;; ========================================

(define-private (is-authorized-signer (signer principal))
  (match (map-get? authorized-signers { signer: signer })
    signer-data (get active signer-data)
    false
  )
)

(define-private (increment-stat (key (string-ascii 20)))
  (match (map-get? treasury-stats { key: key })
    stat (map-set treasury-stats { key: key } { value: (+ (get value stat) u1) })
    false
  )
)

;; ========================================
;; Public Functions - Proposal Creation
;; ========================================

;; Create proposal to fund invoice
(define-public (propose-fund-invoice
  (invoice-id uint)
  (amount uint)
  (description (string-utf8 256))
  (duration uint))
  (let
    (
      (new-proposal-id (+ (var-get proposal-count) u1))
    )
    ;; Verify caller is authorized signer
    (asserts! (is-authorized-signer tx-sender) err-not-signer)
    
    ;; Create proposal
    (map-set proposals
      { proposal-id: new-proposal-id }
      {
        proposal-type: proposal-type-fund-invoice,
        proposer: tx-sender,
        invoice-id: invoice-id,
        target-address: tx-sender,
        amount: amount,
        created-at: block-height,
        expires-at: (+ block-height duration),
        executed: false,
        signature-count: u0,
        description: description
      }
    )
    
    ;; Auto-sign by proposer
    (try! (sign-proposal new-proposal-id))
    
    ;; Update proposal count
    (var-set proposal-count new-proposal-id)
    (increment-stat "total-proposals")
    
    (ok new-proposal-id)
  )
)

;; Create proposal to release payment
(define-public (propose-release-payment
  (invoice-id uint)
  (payee principal)
  (amount uint)
  (description (string-utf8 256))
  (duration uint))
  (let
    (
      (new-proposal-id (+ (var-get proposal-count) u1))
    )
    (asserts! (is-authorized-signer tx-sender) err-not-signer)
    
    (map-set proposals
      { proposal-id: new-proposal-id }
      {
        proposal-type: proposal-type-release-payment,
        proposer: tx-sender,
        invoice-id: invoice-id,
        target-address: payee,
        amount: amount,
        created-at: block-height,
        expires-at: (+ block-height duration),
        executed: false,
        signature-count: u0,
        description: description
      }
    )
    
    (try! (sign-proposal new-proposal-id))
    (var-set proposal-count new-proposal-id)
    (increment-stat "total-proposals")
    
    (ok new-proposal-id)
  )
)

;; ========================================
;; Public Functions - Signing & Execution
;; ========================================

;; Sign a proposal
(define-public (sign-proposal (proposal-id uint))
  (let
    (
      (proposal (unwrap! (map-get? proposals { proposal-id: proposal-id }) err-proposal-not-found))
    )
    ;; Verify caller is authorized signer
    (asserts! (is-authorized-signer tx-sender) err-not-signer)
    
    ;; Verify not expired
    (asserts! (<= block-height (get expires-at proposal)) err-proposal-expired)
    
    ;; Verify not already executed
    (asserts! (not (get executed proposal)) err-already-executed)
    
    ;; Check if already signed
    (asserts! 
      (is-none (map-get? proposal-signatures { proposal-id: proposal-id, signer: tx-sender }))
      err-already-signed
    )
    
    ;; Record signature
    (map-set proposal-signatures
      { proposal-id: proposal-id, signer: tx-sender }
      {
        signed: true,
        signed-at: block-height
      }
    )
    
    ;; Update signature count
    (map-set proposals
      { proposal-id: proposal-id }
      (merge proposal { signature-count: (+ (get signature-count proposal) u1) })
    )
    
    (ok true)
  )
)

;; Execute proposal if threshold met
(define-public (execute-proposal (proposal-id uint))
  (let
    (
      (proposal (unwrap! (map-get? proposals { proposal-id: proposal-id }) err-proposal-not-found))
      (threshold (var-get signature-threshold))
    )
    ;; Verify not expired
    (asserts! (<= block-height (get expires-at proposal)) err-proposal-expired)
    
    ;; Verify not already executed
    (asserts! (not (get executed proposal)) err-already-executed)
    
    ;; Verify sufficient signatures
    (asserts! (>= (get signature-count proposal) threshold) err-insufficient-signatures)
    
    ;; Mark as executed
    (map-set proposals
      { proposal-id: proposal-id }
      (merge proposal { executed: true })
    )
    
    ;; Process based on proposal type
    (if (is-eq (get proposal-type proposal) proposal-type-fund-invoice)
      (begin
        ;; Record invoice approval
        (map-set invoice-approvals
          { invoice-id: (get invoice-id proposal) }
          {
            proposal-id: proposal-id,
            approved: true,
            approved-at: block-height,
            amount: (get amount proposal)
          }
        )
        ;; In production: execute funding
        ;; (try! (contract-call? .escrow-contract fund-invoice ...))
        (increment-stat "approved-proposals")
        (ok true)
      )
      (if (is-eq (get proposal-type proposal) proposal-type-release-payment)
        (begin
          ;; In production: execute payment release
          ;; (try! (contract-call? .escrow-contract release-funds ...))
          (increment-stat "approved-proposals")
          (ok true)
        )
        (ok true)
      )
    )
  )
)

;; ========================================
;; Public Functions - Signer Management
;; ========================================

(define-public (add-signer (new-signer principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set authorized-signers
      { signer: new-signer }
      {
        active: true,
        added-at: block-height,
        added-by: tx-sender
      }
    )
    (ok true)
  )
)

(define-public (remove-signer (signer principal))
  (let
    (
      (signer-data (unwrap! (map-get? authorized-signers { signer: signer }) err-not-signer))
    )
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set authorized-signers
      { signer: signer }
      (merge signer-data { active: false })
    )
    (ok true)
  )
)

(define-public (set-signature-threshold (new-threshold uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (> new-threshold u0) err-invalid-threshold)
    (var-set signature-threshold new-threshold)
    (ok true)
  )
)

;; ========================================
;; Read-Only Functions
;; ========================================

(define-read-only (get-proposal (proposal-id uint))
  (map-get? proposals { proposal-id: proposal-id })
)

(define-read-only (has-signed (proposal-id uint) (signer principal))
  (is-some (map-get? proposal-signatures { proposal-id: proposal-id, signer: signer }))
)

(define-read-only (is-signer (address principal))
  (is-authorized-signer address)
)

(define-read-only (get-signature-threshold)
  (ok (var-get signature-threshold))
)

(define-read-only (get-invoice-approval (invoice-id uint))
  (map-get? invoice-approvals { invoice-id: invoice-id })
)

(define-read-only (get-stat (key (string-ascii 20)))
  (map-get? treasury-stats { key: key })
)

(define-read-only (get-proposal-count)
  (ok (var-get proposal-count))
)

;; Check if proposal is ready to execute
(define-read-only (can-execute (proposal-id uint))
  (match (get-proposal proposal-id)
    proposal
      (ok {
        has-threshold: (>= (get signature-count proposal) (var-get signature-threshold)),
        not-expired: (<= block-height (get expires-at proposal)),
        not-executed: (not (get executed proposal)),
        ready: (and 
          (>= (get signature-count proposal) (var-get signature-threshold))
          (<= block-height (get expires-at proposal))
          (not (get executed proposal))
        )
      })
    err-proposal-not-found
  )
)

