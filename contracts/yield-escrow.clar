;; Yield Escrow Contract
;; Enables yield farming on escrowed invoice funds

(define-constant YIELD_ESCROW_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_STRATEGY_NOT_ACTIVE (err u109))
(define-constant ERR_MIN_LOCKUP_NOT_MET (err u110))
(define-constant ERR_POSITION_NOT_ACTIVE (err u111))
(define-constant ERR_POSITION_NOT_FOUND (err u112))

(define-map yield-positions
  { invoice-id: uint }
  { 
    owner: principal,
    principal-amount: uint,
    yield-token: principal,
    yield-accumulated: uint,
    start-block: uint,
    is-active: bool,
    yield-strategy: (string-ascii 20)
  }
)

(define-map yield-strategies
  { strategy-name: (string-ascii 20) }
  { apy: uint, risk-level: uint, min-lockup: uint, is-active: bool }
)

;; Add yield strategy
(define-public (add-yield-strategy
  (strategy-name (string-ascii 20))
  (apy uint)
  (risk-level uint)
  (min-lockup uint)
)
  (begin
    (asserts! (is-eq tx-sender YIELD_ESCROW_OWNER) ERR_NOT_AUTHORIZED)
    (map-set yield-strategies
      { strategy-name: strategy-name }
      { apy: apy, risk-level: risk-level, min-lockup: min-lockup, is-active: true }
    )
    (ok true)
  )
)

;; Create yield position
(define-public (create-yield-position
  (invoice-id uint)
  (principal-amount uint)
  (yield-token principal)
  (strategy-name (string-ascii 20))
)
  (let (
    (strategy (unwrap! (map-get? yield-strategies { strategy-name: strategy-name }) ERR_STRATEGY_NOT_ACTIVE))
    (current-block block-height)
  )
  (asserts! (get is-active strategy) ERR_STRATEGY_NOT_ACTIVE)
  (asserts! (>= principal-amount (get min-lockup strategy)) ERR_MIN_LOCKUP_NOT_MET)
  
  ;; Transfer funds to yield escrow
  (try! (stx-transfer? principal-amount tx-sender (as-contract tx-sender)))
  
  (map-set yield-positions
    { invoice-id: invoice-id }
    { 
      owner: tx-sender,
      principal-amount: principal-amount,
      yield-token: yield-token,
      yield-accumulated: u0,
      start-block: current-block,
      is-active: true,
      yield-strategy: strategy-name
    }
  )
  
  (ok true)
))

;; Harvest yield
(define-public (harvest-yield (invoice-id uint))
  (let (
    (position (unwrap! (map-get? yield-positions { invoice-id: invoice-id }) ERR_POSITION_NOT_FOUND))
    (current-yield (calculate-yield position))
  )
  (asserts! (is-eq tx-sender (get owner position)) ERR_NOT_AUTHORIZED)
  (asserts! (get is-active position) ERR_POSITION_NOT_ACTIVE)
  
  (if (> current-yield u0)
    (try! (as-contract (stx-transfer? current-yield tx-sender (get owner position))))
    true
  )
  
  (map-set yield-positions
    { invoice-id: invoice-id }
    (merge position { 
      yield-accumulated: (+ (get yield-accumulated position) current-yield),
      start-block: block-height
    })
  )
  
  (ok current-yield)
))

;; Close yield position
(define-public (close-yield-position (invoice-id uint))
  (let (
    (position (unwrap! (map-get? yield-positions { invoice-id: invoice-id }) ERR_POSITION_NOT_FOUND))
    (final-yield (calculate-yield position))
    (total-amount (+ (get principal-amount position) final-yield))
  )
  (asserts! (is-eq tx-sender (get owner position)) ERR_NOT_AUTHORIZED)
  
  (try! (as-contract (stx-transfer? total-amount tx-sender (get owner position))))
  
  (map-set yield-positions
    { invoice-id: invoice-id }
    (merge position { is-active: false })
  )
  
  (ok total-amount)
))

;; Calculate yield
(define-private (calculate-yield (position { 
  owner: principal,
  principal-amount: uint,
  yield-token: principal,
  yield-accumulated: uint,
  start-block: uint,
  is-active: bool,
  yield-strategy: (string-ascii 20)
}))
  (let (
    (strategy (unwrap-panic (map-get? yield-strategies { strategy-name: (get yield-strategy position) })))
    (blocks-elapsed (- block-height (get start-block position)))
    (apy (get apy strategy))
    (principal (get principal-amount position))
    (blocks-per-year u525600) ;; Approximate blocks per year
    (yield-amount (/ (* (* principal apy) blocks-elapsed) (* blocks-per-year u10000)))
  )
  yield-amount
))

;; Read-only functions
(define-read-only (get-yield-position (invoice-id uint))
  (map-get? yield-positions { invoice-id: invoice-id })
)

(define-read-only (get-yield-strategy (strategy-name (string-ascii 20)))
  (map-get? yield-strategies { strategy-name: strategy-name })
)

(define-read-only (calculate-projected-yield 
  (invoice-id uint)
)
  (let (
    (position (unwrap! (map-get? yield-positions { invoice-id: invoice-id }) (err u0)))
  )
  (ok (calculate-yield position))
))

