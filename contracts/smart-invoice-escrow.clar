;; =============================================
;; Smart Invoice Contract - Advanced Escrow System
;; =============================================
;; This contract manages milestone-based escrow payments for smart invoices
;; with support for disputes, arbitration, and multi-milestone releases.

;; =============================================
;; Constants and Error Codes
;; =============================================

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-already-exists (err u102))
(define-constant err-not-found (err u103))
(define-constant err-invalid-state (err u104))
(define-constant err-insufficient-funds (err u105))
(define-constant err-invalid-amount (err u106))
(define-constant err-milestone-not-ready (err u107))
(define-constant err-already-disputed (err u108))
(define-constant err-no-dispute (err u109))

;; =============================================
;; Data Variables and Maps
;; =============================================

;; Counter for invoice IDs
(define-data-var invoice-id-nonce uint u0)

;; Invoice status enum values
(define-constant STATUS-CREATED u0)
(define-constant STATUS-FUNDED u1)
(define-constant STATUS-IN-PROGRESS u2)
(define-constant STATUS-COMPLETED u3)
(define-constant STATUS-DISPUTED u4)
(define-constant STATUS-CANCELLED u5)

;; Milestone status enum values
(define-constant MILESTONE-PENDING u0)
(define-constant MILESTONE-COMPLETED u1)
(define-constant MILESTONE-APPROVED u2)
(define-constant MILESTONE-PAID u3)

;; Invoice data structure
(define-map invoices
    { invoice-id: uint }
    {
        client: principal,
        contractor: principal,
        arbitrator: (optional principal),
        total-amount: uint,
        amount-paid: uint,
        status: uint,
        milestone-count: uint,
        created-at: uint,
        completed-at: (optional uint)
    }
)

;; Milestone data structure
(define-map milestones
    { invoice-id: uint, milestone-index: uint }
    {
        description: (string-ascii 256),
        amount: uint,
        status: uint,
        completed-at: (optional uint),
        approved-at: (optional uint),
        paid-at: (optional uint)
    }
)

;; Dispute data structure
(define-map disputes
    { invoice-id: uint }
    {
        raised-by: principal,
        reason: (string-ascii 512),
        created-at: uint,
        resolved: bool,
        resolution: (optional (string-ascii 512)),
        resolved-at: (optional uint)
    }
)

;; =============================================
;; Private Helper Functions
;; =============================================

(define-private (get-next-invoice-id)
    (let ((current-id (var-get invoice-id-nonce)))
        (var-set invoice-id-nonce (+ current-id u1))
        current-id
    )
)

;; =============================================
;; Public Functions - Invoice Management
;; =============================================

;; Create a new invoice with milestones
(define-public (create-invoice 
    (contractor principal)
    (arbitrator (optional principal))
    (total-amount uint))
    
    (let ((invoice-id (get-next-invoice-id)))
        (asserts! (> total-amount u0) err-invalid-amount)
        (asserts! (not (is-eq tx-sender contractor)) err-not-authorized)
        
        (map-set invoices
            { invoice-id: invoice-id }
            {
                client: tx-sender,
                contractor: contractor,
                arbitrator: arbitrator,
                total-amount: total-amount,
                amount-paid: u0,
                status: STATUS-CREATED,
                milestone-count: u0,
                created-at: block-height,
                completed-at: none
            }
        )
        
        (ok invoice-id)
    )
)

;; Add a milestone to an invoice
(define-public (add-milestone
    (invoice-id uint)
    (description (string-ascii 256))
    (amount uint))
    
    (let (
        (invoice (unwrap! (map-get? invoices { invoice-id: invoice-id }) err-not-found))
        (current-milestone-count (get milestone-count invoice))
    )
        (asserts! (is-eq tx-sender (get client invoice)) err-not-authorized)
        (asserts! (is-eq (get status invoice) STATUS-CREATED) err-invalid-state)
        (asserts! (> amount u0) err-invalid-amount)
        
        ;; Add milestone
        (map-set milestones
            { invoice-id: invoice-id, milestone-index: current-milestone-count }
            {
                description: description,
                amount: amount,
                status: MILESTONE-PENDING,
                completed-at: none,
                approved-at: none,
                paid-at: none
            }
        )
        
        ;; Update invoice milestone count
        (map-set invoices
            { invoice-id: invoice-id }
            (merge invoice { milestone-count: (+ current-milestone-count u1) })
        )
        
        (ok current-milestone-count)
    )
)

;; Fund the invoice escrow
(define-public (fund-invoice (invoice-id uint))
    (let (
        (invoice (unwrap! (map-get? invoices { invoice-id: invoice-id }) err-not-found))
        (amount (get total-amount invoice))
    )
        (asserts! (is-eq tx-sender (get client invoice)) err-not-authorized)
        (asserts! (is-eq (get status invoice) STATUS-CREATED) err-invalid-state)
        (asserts! (> (get milestone-count invoice) u0) err-invalid-state)
        
        ;; Transfer STX to contract
        (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
        
        ;; Update invoice status
        (map-set invoices
            { invoice-id: invoice-id }
            (merge invoice { status: STATUS-FUNDED })
        )
        
        (ok true)
    )
)

;; Contractor marks a milestone as completed
(define-public (complete-milestone
    (invoice-id uint)
    (milestone-index uint))
    
    (let (
        (invoice (unwrap! (map-get? invoices { invoice-id: invoice-id }) err-not-found))
        (milestone (unwrap! (map-get? milestones { invoice-id: invoice-id, milestone-index: milestone-index }) err-not-found))
    )
        (asserts! (is-eq tx-sender (get contractor invoice)) err-not-authorized)
        (asserts! (or (is-eq (get status invoice) STATUS-FUNDED) (is-eq (get status invoice) STATUS-IN-PROGRESS)) err-invalid-state)
        (asserts! (is-eq (get status milestone) MILESTONE-PENDING) err-invalid-state)
        
        ;; Update milestone
        (map-set milestones
            { invoice-id: invoice-id, milestone-index: milestone-index }
            (merge milestone { 
                status: MILESTONE-COMPLETED,
                completed-at: (some block-height)
            })
        )
        
        ;; Update invoice to in-progress if funded
        (if (is-eq (get status invoice) STATUS-FUNDED)
            (map-set invoices
                { invoice-id: invoice-id }
                (merge invoice { status: STATUS-IN-PROGRESS })
            )
            true
        )
        
        (ok true)
    )
)

;; Client approves and releases payment for a milestone
(define-public (approve-and-pay-milestone
    (invoice-id uint)
    (milestone-index uint))
    
    (let (
        (invoice (unwrap! (map-get? invoices { invoice-id: invoice-id }) err-not-found))
        (milestone (unwrap! (map-get? milestones { invoice-id: invoice-id, milestone-index: milestone-index }) err-not-found))
        (milestone-amount (get amount milestone))
    )
        (asserts! (is-eq tx-sender (get client invoice)) err-not-authorized)
        (asserts! (is-eq (get status milestone) MILESTONE-COMPLETED) err-milestone-not-ready)
        (asserts! (or (is-eq (get status invoice) STATUS-IN-PROGRESS) (is-eq (get status invoice) STATUS-FUNDED)) err-invalid-state)
        
        ;; Transfer payment to contractor
        (try! (as-contract (stx-transfer? milestone-amount tx-sender (get contractor invoice))))
        
        ;; Update milestone status
        (map-set milestones
            { invoice-id: invoice-id, milestone-index: milestone-index }
            (merge milestone {
                status: MILESTONE-PAID,
                approved-at: (some block-height),
                paid-at: (some block-height)
            })
        )
        
        ;; Update invoice
        (let ((new-amount-paid (+ (get amount-paid invoice) milestone-amount)))
            (map-set invoices
                { invoice-id: invoice-id }
                (merge invoice {
                    amount-paid: new-amount-paid,
                    status: (if (is-eq new-amount-paid (get total-amount invoice))
                        STATUS-COMPLETED
                        STATUS-IN-PROGRESS
                    ),
                    completed-at: (if (is-eq new-amount-paid (get total-amount invoice))
                        (some block-height)
                        none
                    )
                })
            )
        )
        
        (ok true)
    )
)

;; =============================================
;; Public Functions - Dispute Management
;; =============================================

;; Raise a dispute
(define-public (raise-dispute
    (invoice-id uint)
    (reason (string-ascii 512)))
    
    (let (
        (invoice (unwrap! (map-get? invoices { invoice-id: invoice-id }) err-not-found))
    )
        (asserts! 
            (or 
                (is-eq tx-sender (get client invoice))
                (is-eq tx-sender (get contractor invoice))
            )
            err-not-authorized
        )
        (asserts! (is-none (map-get? disputes { invoice-id: invoice-id })) err-already-disputed)
        (asserts! (or (is-eq (get status invoice) STATUS-FUNDED) (is-eq (get status invoice) STATUS-IN-PROGRESS)) err-invalid-state)
        
        ;; Create dispute
        (map-set disputes
            { invoice-id: invoice-id }
            {
                raised-by: tx-sender,
                reason: reason,
                created-at: block-height,
                resolved: false,
                resolution: none,
                resolved-at: none
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
    (resolution (string-ascii 512))
    (refund-to-client uint))
    
    (let (
        (invoice (unwrap! (map-get? invoices { invoice-id: invoice-id }) err-not-found))
        (dispute (unwrap! (map-get? disputes { invoice-id: invoice-id }) err-no-dispute))
        (arbitrator (unwrap! (get arbitrator invoice) err-not-authorized))
        (remaining-funds (- (get total-amount invoice) (get amount-paid invoice)))
    )
        (asserts! (is-eq tx-sender arbitrator) err-not-authorized)
        (asserts! (not (get resolved dispute)) err-invalid-state)
        (asserts! (<= refund-to-client remaining-funds) err-invalid-amount)
        
        ;; Distribute remaining funds
        (if (> refund-to-client u0)
            (try! (as-contract (stx-transfer? refund-to-client tx-sender (get client invoice))))
            true
        )
        
        (let ((pay-to-contractor (- remaining-funds refund-to-client)))
            (if (> pay-to-contractor u0)
                (try! (as-contract (stx-transfer? pay-to-contractor tx-sender (get contractor invoice))))
                true
            )
        )
        
        ;; Update dispute
        (map-set disputes
            { invoice-id: invoice-id }
            (merge dispute {
                resolved: true,
                resolution: (some resolution),
                resolved-at: (some block-height)
            })
        )
        
        ;; Update invoice
        (map-set invoices
            { invoice-id: invoice-id }
            (merge invoice {
                status: STATUS-COMPLETED,
                completed-at: (some block-height)
            })
        )
        
        (ok true)
    )
)

;; =============================================
;; Read-Only Functions
;; =============================================

(define-read-only (get-invoice (invoice-id uint))
    (ok (map-get? invoices { invoice-id: invoice-id }))
)

(define-read-only (get-milestone (invoice-id uint) (milestone-index uint))
    (ok (map-get? milestones { invoice-id: invoice-id, milestone-index: milestone-index }))
)

(define-read-only (get-dispute (invoice-id uint))
    (ok (map-get? disputes { invoice-id: invoice-id }))
)

(define-read-only (get-escrow-balance)
    (ok (stx-get-balance (as-contract tx-sender)))
)

(define-read-only (get-current-invoice-id)
    (ok (var-get invoice-id-nonce))
)

