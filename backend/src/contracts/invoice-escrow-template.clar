;; BitMind Smart Invoice Escrow Contract Template
;; This is a template that will be customized by the AI for each invoice

;; Contract Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-client (err u101))
(define-constant err-not-contractor (err u102))
(define-constant err-not-arbitrator (err u103))
(define-constant err-invalid-milestone (err u104))
(define-constant err-already-released (err u105))
(define-constant err-insufficient-funds (err u106))
(define-constant err-dispute-active (err u107))
(define-constant err-no-dispute (err u108))

;; Contract Data Variables
(define-data-var client principal tx-sender)
(define-data-var contractor principal tx-sender)
(define-data-var arbitrator (optional principal) none)
(define-data-var total-amount uint u0)
(define-data-var locked-amount uint u0)
(define-data-var released-amount uint u0)
(define-data-var is-disputed bool false)
(define-data-var contract-active bool true)

;; Milestone Data Structure
(define-map milestones
  { milestone-id: uint }
  {
    amount: uint,
    description: (string-ascii 256),
    released: bool,
    approved: bool
  }
)

;; Contract Initialization
(define-public (initialize 
  (client-address principal)
  (contractor-address principal)
  (arbitrator-address (optional principal))
  (invoice-amount uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set client client-address)
    (var-set contractor contractor-address)
    (var-set arbitrator arbitrator-address)
    (var-set total-amount invoice-amount)
    (ok true)
  )
)

;; Lock funds in escrow
(define-public (lock-funds (amount uint))
  (let
    (
      (sender tx-sender)
      (current-locked (var-get locked-amount))
    )
    (asserts! (is-eq sender (var-get client)) err-not-client)
    (asserts! (var-get contract-active) (err u109))
    (try! (stx-transfer? amount sender (as-contract tx-sender)))
    (var-set locked-amount (+ current-locked amount))
    (ok true)
  )
)

;; Approve milestone
(define-public (approve-milestone (milestone-id uint))
  (let
    (
      (sender tx-sender)
      (milestone (unwrap! (map-get? milestones { milestone-id: milestone-id }) err-invalid-milestone))
    )
    (asserts! (is-eq sender (var-get client)) err-not-client)
    (asserts! (not (get released milestone)) err-already-released)
    (map-set milestones
      { milestone-id: milestone-id }
      (merge milestone { approved: true })
    )
    (ok true)
  )
)

;; Release milestone payment
(define-public (release-milestone (milestone-id uint))
  (let
    (
      (sender tx-sender)
      (milestone (unwrap! (map-get? milestones { milestone-id: milestone-id }) err-invalid-milestone))
      (milestone-amount (get amount milestone))
    )
    (asserts! (is-eq sender (var-get client)) err-not-client)
    (asserts! (get approved milestone) (err u110))
    (asserts! (not (get released milestone)) err-already-released)
    (asserts! (not (var-get is-disputed)) err-dispute-active)
    (asserts! (>= (var-get locked-amount) milestone-amount) err-insufficient-funds)
    
    ;; Transfer funds to contractor
    (try! (as-contract (stx-transfer? milestone-amount tx-sender (var-get contractor))))
    
    ;; Update milestone status
    (map-set milestones
      { milestone-id: milestone-id }
      (merge milestone { released: true })
    )
    
    ;; Update amounts
    (var-set released-amount (+ (var-get released-amount) milestone-amount))
    (var-set locked-amount (- (var-get locked-amount) milestone-amount))
    
    (ok true)
  )
)

;; Raise a dispute
(define-public (raise-dispute)
  (let
    (
      (sender tx-sender)
    )
    (asserts! 
      (or 
        (is-eq sender (var-get client))
        (is-eq sender (var-get contractor))
      )
      (err u111)
    )
    (asserts! (not (var-get is-disputed)) (err u112))
    (var-set is-disputed true)
    (ok true)
  )
)

;; Resolve dispute (arbitrator only)
(define-public (resolve-dispute (favor-client bool))
  (let
    (
      (sender tx-sender)
      (arb (unwrap! (var-get arbitrator) err-not-arbitrator))
      (remaining-funds (var-get locked-amount))
    )
    (asserts! (is-eq sender arb) err-not-arbitrator)
    (asserts! (var-get is-disputed) err-no-dispute)
    
    ;; Transfer remaining funds based on arbitration decision
    (if favor-client
      (try! (as-contract (stx-transfer? remaining-funds tx-sender (var-get client))))
      (try! (as-contract (stx-transfer? remaining-funds tx-sender (var-get contractor))))
    )
    
    ;; Update state
    (var-set is-disputed false)
    (var-set locked-amount u0)
    (var-set contract-active false)
    
    (ok true)
  )
)

;; Refund (mutual cancellation)
(define-public (cancel-and-refund)
  (let
    (
      (sender tx-sender)
      (remaining-funds (var-get locked-amount))
    )
    (asserts! (is-eq sender (var-get client)) err-not-client)
    (asserts! (not (var-get is-disputed)) err-dispute-active)
    
    ;; Refund remaining funds to client
    (try! (as-contract (stx-transfer? remaining-funds tx-sender (var-get client))))
    
    ;; Deactivate contract
    (var-set locked-amount u0)
    (var-set contract-active false)
    
    (ok true)
  )
)

;; Read-only functions

(define-read-only (get-contract-info)
  {
    client: (var-get client),
    contractor: (var-get contractor),
    arbitrator: (var-get arbitrator),
    total-amount: (var-get total-amount),
    locked-amount: (var-get locked-amount),
    released-amount: (var-get released-amount),
    is-disputed: (var-get is-disputed),
    contract-active: (var-get contract-active)
  }
)

(define-read-only (get-milestone (milestone-id uint))
  (map-get? milestones { milestone-id: milestone-id })
)

(define-read-only (get-locked-balance)
  (var-get locked-amount)
)

(define-read-only (is-contract-active)
  (var-get contract-active)
)

