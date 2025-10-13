;; smart-invoice.clar
;; BitMind Smart Invoice Escrow Contract
;; Handles milestone-based payments with dispute resolution

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-status (err u103))
(define-constant err-insufficient-funds (err u104))
(define-constant err-already-exists (err u105))
(define-constant err-milestone-not-pending (err u106))

;; Invoice status types
(define-constant STATUS-PENDING u0)
(define-constant STATUS-FUNDED u1)
(define-constant STATUS-IN-PROGRESS u2)
(define-constant STATUS-COMPLETED u3)
(define-constant STATUS-DISPUTED u4)
(define-constant STATUS-CANCELLED u5)

;; Milestone status types
(define-constant MILESTONE-PENDING u0)
(define-constant MILESTONE-APPROVED u1)
(define-constant MILESTONE-RELEASED u2)
(define-constant MILESTONE-DISPUTED u3)

;; Data structures
(define-map invoices
  { invoice-id: uint }
  {
    issuer: principal,
    client: principal,
    arbitrator: principal,
    total-amount: uint,
    released-amount: uint,
    status: uint,
    created-at: uint,
    milestone-count: uint
  }
)

(define-map milestones
  { invoice-id: uint, milestone-id: uint }
  {
    description: (string-utf8 256),
    amount: uint,
    status: uint,
    approved-at: (optional uint),
    released-at: (optional uint)
  }
)

(define-map disputes
  { invoice-id: uint }
  {
    raised-by: principal,
    reason: (string-utf8 512),
    raised-at: uint,
    resolved: bool,
    resolution: (optional (string-utf8 512))
  }
)

;; Data var for invoice counter
(define-data-var invoice-counter uint u0)

;; Read-only functions
(define-read-only (get-invoice-details (invoice-id uint))
  (map-get? invoices { invoice-id: invoice-id })
)

(define-read-only (get-milestone-details (invoice-id uint) (milestone-id uint))
  (map-get? milestones { invoice-id: invoice-id, milestone-id: milestone-id })
)

(define-read-only (get-dispute-details (invoice-id uint))
  (map-get? disputes { invoice-id: invoice-id })
)

(define-read-only (get-invoice-counter)
  (ok (var-get invoice-counter))
)

;; Private functions
(define-private (is-invoice-party (invoice-id uint) (caller principal))
  (match (map-get? invoices { invoice-id: invoice-id })
    invoice (or 
      (is-eq caller (get issuer invoice))
      (is-eq caller (get client invoice))
      (is-eq caller (get arbitrator invoice))
    )
    false
  )
)

;; Public functions

;; Create a new invoice
(define-public (create-invoice 
  (client principal)
  (arbitrator principal)
  (total-amount uint)
  (milestone-count uint)
)
  (let 
    (
      (new-invoice-id (+ (var-get invoice-counter) u1))
    )
    (asserts! (> milestone-count u0) err-invalid-status)
    (asserts! (> total-amount u0) err-invalid-status)
    
    ;; Store invoice
    (map-set invoices
      { invoice-id: new-invoice-id }
      {
        issuer: tx-sender,
        client: client,
        arbitrator: arbitrator,
        total-amount: total-amount,
        released-amount: u0,
        status: STATUS-PENDING,
        created-at: block-height,
        milestone-count: milestone-count
      }
    )
    
    ;; Increment counter
    (var-set invoice-counter new-invoice-id)
    
    (ok new-invoice-id)
  )
)

;; Add a milestone to an invoice
(define-public (add-milestone
  (invoice-id uint)
  (milestone-id uint)
  (description (string-utf8 256))
  (amount uint)
)
  (let
    (
      (invoice (unwrap! (map-get? invoices { invoice-id: invoice-id }) err-not-found))
    )
    ;; Only issuer can add milestones
    (asserts! (is-eq tx-sender (get issuer invoice)) err-unauthorized)
    (asserts! (is-eq (get status invoice) STATUS-PENDING) err-invalid-status)
    (asserts! (> amount u0) err-invalid-status)
    
    ;; Store milestone
    (map-set milestones
      { invoice-id: invoice-id, milestone-id: milestone-id }
      {
        description: description,
        amount: amount,
        status: MILESTONE-PENDING,
        approved-at: none,
        released-at: none
      }
    )
    
    (ok true)
  )
)

;; Fund the invoice (client deposits funds)
(define-public (fund-invoice (invoice-id uint))
  (let
    (
      (invoice (unwrap! (map-get? invoices { invoice-id: invoice-id }) err-not-found))
    )
    ;; Only client can fund
    (asserts! (is-eq tx-sender (get client invoice)) err-unauthorized)
    (asserts! (is-eq (get status invoice) STATUS-PENDING) err-invalid-status)
    
    ;; Transfer STX to contract
    (try! (stx-transfer? (get total-amount invoice) tx-sender (as-contract tx-sender)))
    
    ;; Update invoice status
    (map-set invoices
      { invoice-id: invoice-id }
      (merge invoice { status: STATUS-FUNDED })
    )
    
    (ok true)
  )
)

;; Start work on invoice
(define-public (start-invoice (invoice-id uint))
  (let
    (
      (invoice (unwrap! (map-get? invoices { invoice-id: invoice-id }) err-not-found))
    )
    ;; Only issuer can start work
    (asserts! (is-eq tx-sender (get issuer invoice)) err-unauthorized)
    (asserts! (is-eq (get status invoice) STATUS-FUNDED) err-invalid-status)
    
    ;; Update invoice status
    (map-set invoices
      { invoice-id: invoice-id }
      (merge invoice { status: STATUS-IN-PROGRESS })
    )
    
    (ok true)
  )
)

;; Approve a milestone (client approves work)
(define-public (approve-milestone (invoice-id uint) (milestone-id uint))
  (let
    (
      (invoice (unwrap! (map-get? invoices { invoice-id: invoice-id }) err-not-found))
      (milestone (unwrap! (map-get? milestones { invoice-id: invoice-id, milestone-id: milestone-id }) err-not-found))
    )
    ;; Only client can approve milestones
    (asserts! (is-eq tx-sender (get client invoice)) err-unauthorized)
    (asserts! (is-eq (get status milestone) MILESTONE-PENDING) err-milestone-not-pending)
    
    ;; Update milestone status
    (map-set milestones
      { invoice-id: invoice-id, milestone-id: milestone-id }
      (merge milestone { 
        status: MILESTONE-APPROVED,
        approved-at: (some block-height)
      })
    )
    
    (ok true)
  )
)

;; Release payment for approved milestone
(define-public (release-milestone-payment (invoice-id uint) (milestone-id uint))
  (let
    (
      (invoice (unwrap! (map-get? invoices { invoice-id: invoice-id }) err-not-found))
      (milestone (unwrap! (map-get? milestones { invoice-id: invoice-id, milestone-id: milestone-id }) err-not-found))
    )
    ;; Either client or issuer can release
    (asserts! (or 
      (is-eq tx-sender (get client invoice))
      (is-eq tx-sender (get issuer invoice))
    ) err-unauthorized)
    (asserts! (is-eq (get status milestone) MILESTONE-APPROVED) err-invalid-status)
    
    ;; Transfer payment to issuer
    (try! (as-contract (stx-transfer? (get amount milestone) tx-sender (get issuer invoice))))
    
    ;; Update milestone status
    (map-set milestones
      { invoice-id: invoice-id, milestone-id: milestone-id }
      (merge milestone { 
        status: MILESTONE-RELEASED,
        released-at: (some block-height)
      })
    )
    
    ;; Update invoice released amount
    (map-set invoices
      { invoice-id: invoice-id }
      (merge invoice { 
        released-amount: (+ (get released-amount invoice) (get amount milestone))
      })
    )
    
    (ok true)
  )
)

;; Raise a dispute
(define-public (raise-dispute (invoice-id uint) (reason (string-utf8 512)))
  (let
    (
      (invoice (unwrap! (map-get? invoices { invoice-id: invoice-id }) err-not-found))
    )
    ;; Only issuer or client can raise disputes
    (asserts! (or 
      (is-eq tx-sender (get issuer invoice))
      (is-eq tx-sender (get client invoice))
    ) err-unauthorized)
    (asserts! (is-eq (get status invoice) STATUS-IN-PROGRESS) err-invalid-status)
    
    ;; Create dispute
    (map-set disputes
      { invoice-id: invoice-id }
      {
        raised-by: tx-sender,
        reason: reason,
        raised-at: block-height,
        resolved: false,
        resolution: none
      }
    )
    
    ;; Update invoice status
    (map-set invoices
      { invoice-id: invoice-id }
      (merge invoice { status: STATUS-DISPUTED })
    )
    
    (ok true)
  )
)

;; Resolve a dispute (arbitrator only)
(define-public (resolve-dispute 
  (invoice-id uint) 
  (resolution (string-utf8 512))
  (refund-to-client uint)
)
  (let
    (
      (invoice (unwrap! (map-get? invoices { invoice-id: invoice-id }) err-not-found))
      (dispute (unwrap! (map-get? disputes { invoice-id: invoice-id }) err-not-found))
      (remaining-funds (- (get total-amount invoice) (get released-amount invoice)))
    )
    ;; Only arbitrator can resolve
    (asserts! (is-eq tx-sender (get arbitrator invoice)) err-unauthorized)
    (asserts! (is-eq (get status invoice) STATUS-DISPUTED) err-invalid-status)
    (asserts! (not (get resolved dispute)) err-invalid-status)
    (asserts! (<= refund-to-client remaining-funds) err-insufficient-funds)
    
    ;; Refund to client if applicable
    (if (> refund-to-client u0)
      (try! (as-contract (stx-transfer? refund-to-client tx-sender (get client invoice))))
      true
    )
    
    ;; Release remaining to issuer
    (let
      (
        (issuer-payment (- remaining-funds refund-to-client))
      )
      (if (> issuer-payment u0)
        (try! (as-contract (stx-transfer? issuer-payment tx-sender (get issuer invoice))))
        true
      )
    )
    
    ;; Update dispute
    (map-set disputes
      { invoice-id: invoice-id }
      (merge dispute {
        resolved: true,
        resolution: (some resolution)
      })
    )
    
    ;; Update invoice
    (map-set invoices
      { invoice-id: invoice-id }
      (merge invoice { 
        status: STATUS-COMPLETED,
        released-amount: (get total-amount invoice)
      })
    )
    
    (ok true)
  )
)

;; Cancel invoice (only if pending)
(define-public (cancel-invoice (invoice-id uint))
  (let
    (
      (invoice (unwrap! (map-get? invoices { invoice-id: invoice-id }) err-not-found))
    )
    ;; Only issuer can cancel
    (asserts! (is-eq tx-sender (get issuer invoice)) err-unauthorized)
    (asserts! (is-eq (get status invoice) STATUS-PENDING) err-invalid-status)
    
    ;; Update invoice status
    (map-set invoices
      { invoice-id: invoice-id }
      (merge invoice { status: STATUS-CANCELLED })
    )
    
    (ok true)
  )
)

;; Complete invoice (mark as fully completed)
(define-public (complete-invoice (invoice-id uint))
  (let
    (
      (invoice (unwrap! (map-get? invoices { invoice-id: invoice-id }) err-not-found))
    )
    ;; Only issuer or client can complete
    (asserts! (or 
      (is-eq tx-sender (get issuer invoice))
      (is-eq tx-sender (get client invoice))
    ) err-unauthorized)
    (asserts! (is-eq (get released-amount invoice) (get total-amount invoice)) err-invalid-status)
    
    ;; Update invoice status
    (map-set invoices
      { invoice-id: invoice-id }
      (merge invoice { status: STATUS-COMPLETED })
    )
    
    (ok true)
  )
)
