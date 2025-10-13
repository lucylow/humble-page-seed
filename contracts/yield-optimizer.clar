;; ========================================
;; Yield Optimizer Contract
;; ========================================
;; Automatically stakes escrowed funds to generate yield
;; While maintaining liquidity for milestone payments
;; Part of BitMind DeFi Advanced Features

;; ========================================
;; Constants
;; ========================================
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u200))
(define-constant err-not-authorized (err u201))
(define-constant err-insufficient-balance (err u202))
(define-constant err-pool-not-found (err u203))
(define-constant err-withdrawal-locked (err u204))
(define-constant err-invalid-amount (err u205))

;; Yield strategies
(define-constant strategy-conservative u1)
(define-constant strategy-balanced u2)
(define-constant strategy-aggressive u3)

;; ========================================
;; Data Variables
;; ========================================
(define-data-var total-value-locked uint u0)
(define-data-var total-yield-earned uint u0)
(define-data-var emergency-shutdown bool false)

;; ========================================
;; Data Maps
;; ========================================

;; Track deposits per invoice
(define-map invoice-deposits
  { invoice-id: uint }
  {
    principal-amount: uint,
    yield-earned: uint,
    strategy: uint,
    deposit-block: uint,
    last-claim-block: uint,
    is-locked: bool,
    escrow-contract: principal
  }
)

;; Yield pools with APY rates
(define-map yield-pools
  { pool-id: uint }
  {
    name: (string-ascii 50),
    apy: uint, ;; basis points (500 = 5%)
    tvl: uint,
    risk-level: uint, ;; 1=low, 2=medium, 3=high
    min-lock-period: uint,
    active: bool
  }
)

;; User preferences
(define-map user-yield-preferences
  { user: principal }
  {
    default-strategy: uint,
    auto-compound: bool,
    risk-tolerance: uint
  }
)

;; Allocation tracking
(define-map pool-allocations
  { invoice-id: uint, pool-id: uint }
  { allocated-amount: uint }
)

;; ========================================
;; Initialization - Set up yield pools
;; ========================================

;; Initialize default yield pools
(map-set yield-pools
  { pool-id: u1 }
  {
    name: "Stacks Staking Pool",
    apy: u750,  ;; 7.5% APY
    tvl: u0,
    risk-level: u1,
    min-lock-period: u144,  ;; ~1 day in blocks
    active: true
  }
)

(map-set yield-pools
  { pool-id: u2 }
  {
    name: "sBTC Lending Pool",
    apy: u1200,  ;; 12% APY
    tvl: u0,
    risk-level: u2,
    min-lock-period: u1008,  ;; ~1 week
    active: true
  }
)

(map-set yield-pools
  { pool-id: u3 }
  {
    name: "DeFi Yield Aggregator",
    apy: u2500,  ;; 25% APY
    tvl: u0,
    risk-level: u3,
    min-lock-period: u4320,  ;; ~1 month
    active: true
  }
)

;; ========================================
;; Private Functions
;; ========================================

;; Calculate yield earned based on APY and time
(define-private (calculate-yield
  (principal-amount uint)
  (apy uint)
  (blocks-elapsed uint))
  ;; Simple interest calculation: (principal * APY * time) / (10000 * blocks-per-year)
  ;; Assuming 52560 blocks per year (10 min blocks)
  (/ (* (* principal-amount apy) blocks-elapsed) (* u10000 u52560))
)

;; Get best pool for strategy
(define-private (get-pool-for-strategy (strategy uint))
  (if (is-eq strategy strategy-conservative)
    u1
    (if (is-eq strategy strategy-balanced)
      u2
      u3
    )
  )
)

;; ========================================
;; Public Functions - Deposit & Withdraw
;; ========================================

;; Deposit funds for yield optimization
(define-public (deposit-for-yield
  (invoice-id uint)
  (amount uint)
  (strategy uint)
  (escrow-contract principal))
  (let
    (
      (pool-id (get-pool-for-strategy strategy))
      (pool (unwrap! (map-get? yield-pools { pool-id: pool-id }) err-pool-not-found))
    )
    ;; Validate
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (not (var-get emergency-shutdown)) err-withdrawal-locked)
    
    ;; Store deposit info
    (map-set invoice-deposits
      { invoice-id: invoice-id }
      {
        principal-amount: amount,
        yield-earned: u0,
        strategy: strategy,
        deposit-block: block-height,
        last-claim-block: block-height,
        is-locked: false,
        escrow-contract: escrow-contract
      }
    )
    
    ;; Allocate to pool
    (map-set pool-allocations
      { invoice-id: invoice-id, pool-id: pool-id }
      { allocated-amount: amount }
    )
    
    ;; Update pool TVL
    (map-set yield-pools
      { pool-id: pool-id }
      (merge pool { tvl: (+ (get tvl pool) amount) })
    )
    
    ;; Update global TVL
    (var-set total-value-locked (+ (var-get total-value-locked) amount))
    
    (ok true)
  )
)

;; Claim accumulated yield
(define-public (claim-yield (invoice-id uint))
  (let
    (
      (deposit (unwrap! (map-get? invoice-deposits { invoice-id: invoice-id }) err-pool-not-found))
      (strategy (get strategy deposit))
      (pool-id (get-pool-for-strategy strategy))
      (pool (unwrap! (map-get? yield-pools { pool-id: pool-id }) err-pool-not-found))
      (blocks-elapsed (- block-height (get last-claim-block deposit)))
      (yield-earned (calculate-yield (get principal-amount deposit) (get apy pool) blocks-elapsed))
      (total-yield (+ (get yield-earned deposit) yield-earned))
    )
    ;; Update deposit with claimed yield
    (map-set invoice-deposits
      { invoice-id: invoice-id }
      (merge deposit {
        yield-earned: total-yield,
        last-claim-block: block-height
      })
    )
    
    ;; Update global yield
    (var-set total-yield-earned (+ (var-get total-yield-earned) yield-earned))
    
    ;; In production: transfer yield to caller
    ;; (try! (contract-call? .token transfer yield-earned contract-address tx-sender))
    
    (ok yield-earned)
  )
)

;; Withdraw principal + yield for invoice payment
(define-public (withdraw-for-payment
  (invoice-id uint)
  (amount uint))
  (let
    (
      (deposit (unwrap! (map-get? invoice-deposits { invoice-id: invoice-id }) err-pool-not-found))
      (strategy (get strategy deposit))
      (pool-id (get-pool-for-strategy strategy))
      (pool (unwrap! (map-get? yield-pools { pool-id: pool-id }) err-pool-not-found))
      (allocation (unwrap! (map-get? pool-allocations { invoice-id: invoice-id, pool-id: pool-id }) err-pool-not-found))
    )
    ;; Verify not locked
    (asserts! (not (get is-locked deposit)) err-withdrawal-locked)
    
    ;; Verify sufficient balance
    (asserts! (<= amount (get principal-amount deposit)) err-insufficient-balance)
    
    ;; First claim any pending yield
    (try! (claim-yield invoice-id))
    
    ;; Update deposit
    (map-set invoice-deposits
      { invoice-id: invoice-id }
      (merge deposit {
        principal-amount: (- (get principal-amount deposit) amount)
      })
    )
    
    ;; Update allocation
    (map-set pool-allocations
      { invoice-id: invoice-id, pool-id: pool-id }
      { allocated-amount: (- (get allocated-amount allocation) amount) }
    )
    
    ;; Update pool TVL
    (map-set yield-pools
      { pool-id: pool-id }
      (merge pool { tvl: (- (get tvl pool) amount) })
    )
    
    ;; Update global TVL
    (var-set total-value-locked (- (var-get total-value-locked) amount))
    
    (ok true)
  )
)

;; ========================================
;; Public Functions - User Preferences
;; ========================================

(define-public (set-yield-preferences
  (default-strategy uint)
  (auto-compound bool)
  (risk-tolerance uint))
  (begin
    (map-set user-yield-preferences
      { user: tx-sender }
      {
        default-strategy: default-strategy,
        auto-compound: auto-compound,
        risk-tolerance: risk-tolerance
      }
    )
    (ok true)
  )
)

;; ========================================
;; Read-Only Functions
;; ========================================

(define-read-only (get-deposit-info (invoice-id uint))
  (map-get? invoice-deposits { invoice-id: invoice-id })
)

(define-read-only (get-pool-info (pool-id uint))
  (map-get? yield-pools { pool-id: pool-id })
)

(define-read-only (get-user-preferences (user principal))
  (map-get? user-yield-preferences { user: user })
)

(define-read-only (get-total-tvl)
  (ok (var-get total-value-locked))
)

(define-read-only (get-total-yield-earned)
  (ok (var-get total-yield-earned))
)

;; Calculate projected yield for amount and strategy
(define-read-only (calculate-projected-yield
  (amount uint)
  (strategy uint)
  (duration-blocks uint))
  (let
    (
      (pool-id (get-pool-for-strategy strategy))
      (pool (unwrap! (map-get? yield-pools { pool-id: pool-id }) err-pool-not-found))
    )
    (ok (calculate-yield amount (get apy pool) duration-blocks))
  )
)

;; Get current yield for invoice
(define-read-only (get-current-yield (invoice-id uint))
  (match (get-deposit-info invoice-id)
    deposit
      (let
        (
          (strategy (get strategy deposit))
          (pool-id (get-pool-for-strategy strategy))
          (pool (unwrap! (map-get? yield-pools { pool-id: pool-id }) err-pool-not-found))
          (blocks-elapsed (- block-height (get last-claim-block deposit)))
          (new-yield (calculate-yield (get principal-amount deposit) (get apy pool) blocks-elapsed))
        )
        (ok {
          accumulated-yield: (get yield-earned deposit),
          pending-yield: new-yield,
          total-yield: (+ (get yield-earned deposit) new-yield)
        })
      )
    err-pool-not-found
  )
)

;; ========================================
;; Admin Functions
;; ========================================

(define-public (update-pool-apy (pool-id uint) (new-apy uint))
  (let
    (
      (pool (unwrap! (map-get? yield-pools { pool-id: pool-id }) err-pool-not-found))
    )
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set yield-pools
      { pool-id: pool-id }
      (merge pool { apy: new-apy })
    )
    (ok true)
  )
)

(define-public (toggle-emergency-shutdown)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set emergency-shutdown (not (var-get emergency-shutdown)))
    (ok true)
  )
)

(define-public (add-yield-pool
  (pool-id uint)
  (name (string-ascii 50))
  (apy uint)
  (risk-level uint)
  (min-lock-period uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set yield-pools
      { pool-id: pool-id }
      {
        name: name,
        apy: apy,
        tvl: u0,
        risk-level: risk-level,
        min-lock-period: min-lock-period,
        active: true
      }
    )
    (ok true)
  )
)

