;; ========================================
;; Arbitration Pool Contract
;; ========================================
;; Decentralized dispute resolution with staked reputation bonds
;; Arbitrators vote on disputes with economic incentives
;; Part of BitMind DeFi Advanced Features

;; ========================================
;; Constants
;; ========================================
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u400))
(define-constant err-not-arbitrator (err u401))
(define-constant err-insufficient-stake (err u402))
(define-constant err-dispute-not-found (err u403))
(define-constant err-already-voted (err u404))
(define-constant err-dispute-closed (err u405))
(define-constant err-voting-period-ended (err u406))
(define-constant err-not-enough-votes (err u407))
(define-constant err-invalid-vote (err u408))

;; Arbitration fees and stakes
(define-constant min-arbitrator-stake u1000000) ;; 0.01 sBTC minimum stake
(define-constant dispute-fee u50000) ;; 0.0005 sBTC dispute filing fee
(define-constant arbitrator-reward-percentage u8000) ;; 80% of fee to winning arbitrators
(define-constant voting-period-blocks u1008) ;; ~1 week

;; Vote options
(define-constant vote-for-payer u1)
(define-constant vote-for-payee u2)
(define-constant vote-partial-refund u3)

;; ========================================
;; Data Variables
;; ========================================
(define-data-var total-staked uint u0)
(define-data-var dispute-count uint u0)
(define-data-var total-arbitrators uint u0)

;; ========================================
;; Data Maps
;; ========================================

;; Arbitrator registry with reputation
(define-map arbitrators
  { arbitrator: principal }
  {
    staked-amount: uint,
    reputation-score: uint,
    total-cases: uint,
    correct-votes: uint,
    active: bool,
    joined-at: uint,
    last-slash-block: uint
  }
)

;; Disputes
(define-map disputes
  { dispute-id: uint }
  {
    invoice-id: uint,
    filed-by: principal,
    payer: principal,
    payee: principal,
    amount-disputed: uint,
    evidence-uri: (optional (string-utf8 256)),
    created-at: uint,
    voting-ends-at: uint,
    resolved: bool,
    resolution: (optional uint),
    total-votes: uint
  }
)

;; Votes on disputes
(define-map dispute-votes
  { dispute-id: uint, arbitrator: principal }
  {
    vote: uint,
    voted-at: uint,
    stake-weight: uint
  }
)

;; Vote tallies
(define-map vote-tallies
  { dispute-id: uint, vote-option: uint }
  { weighted-votes: uint }
)

;; Arbitrator assignments
(define-map dispute-arbitrators
  { dispute-id: uint, arbitrator: principal }
  { assigned: bool }
)

;; Evidence submissions
(define-map evidence-submissions
  { dispute-id: uint, submission-index: uint }
  {
    submitted-by: principal,
    evidence-uri: (string-utf8 256),
    submitted-at: uint
  }
)

(define-map evidence-count
  { dispute-id: uint }
  { count: uint }
)

;; ========================================
;; Private Functions
;; ========================================

(define-private (is-active-arbitrator (arbitrator principal))
  (match (map-get? arbitrators { arbitrator: arbitrator })
    arb-data 
      (and 
        (get active arb-data) 
        (>= (get staked-amount arb-data) min-arbitrator-stake)
      )
    false
  )
)

(define-private (calculate-reputation-weight (arbitrator principal))
  (match (map-get? arbitrators { arbitrator: arbitrator })
    arb-data
      (let
        (
          (base-weight (get staked-amount arb-data))
          (reputation (get reputation-score arb-data))
          ;; Weight = stake * (1 + reputation/1000)
          (reputation-multiplier (+ u1000 reputation))
        )
        (/ (* base-weight reputation-multiplier) u1000)
      )
    u0
  )
)

;; ========================================
;; Public Functions - Arbitrator Management
;; ========================================

;; Join as arbitrator
(define-public (join-arbitrator-pool (stake-amount uint))
  (begin
    ;; Verify minimum stake
    (asserts! (>= stake-amount min-arbitrator-stake) err-insufficient-stake)
    
    ;; In production: transfer stake to contract
    ;; (try! (contract-call? .token transfer stake-amount tx-sender contract-address))
    
    ;; Register arbitrator
    (map-set arbitrators
      { arbitrator: tx-sender }
      {
        staked-amount: stake-amount,
        reputation-score: u100, ;; Start at 100
        total-cases: u0,
        correct-votes: u0,
        active: true,
        joined-at: block-height,
        last-slash-block: u0
      }
    )
    
    ;; Update global stats
    (var-set total-staked (+ (var-get total-staked) stake-amount))
    (var-set total-arbitrators (+ (var-get total-arbitrators) u1))
    
    (ok true)
  )
)

;; Increase stake
(define-public (increase-stake (additional-amount uint))
  (let
    (
      (arb-data (unwrap! (map-get? arbitrators { arbitrator: tx-sender }) err-not-arbitrator))
    )
    ;; In production: transfer additional stake
    ;; (try! (contract-call? .token transfer additional-amount tx-sender contract-address))
    
    (map-set arbitrators
      { arbitrator: tx-sender }
      (merge arb-data { 
        staked-amount: (+ (get staked-amount arb-data) additional-amount)
      })
    )
    
    (var-set total-staked (+ (var-get total-staked) additional-amount))
    (ok true)
  )
)

;; Withdraw stake (if no active disputes)
(define-public (withdraw-stake (amount uint))
  (let
    (
      (arb-data (unwrap! (map-get? arbitrators { arbitrator: tx-sender }) err-not-arbitrator))
      (remaining-stake (- (get staked-amount arb-data) amount))
    )
    ;; Verify remaining stake meets minimum or withdraw all
    (asserts! 
      (or 
        (>= remaining-stake min-arbitrator-stake)
        (is-eq remaining-stake u0)
      ) 
      err-insufficient-stake
    )
    
    ;; Update arbitrator data
    (map-set arbitrators
      { arbitrator: tx-sender }
      (merge arb-data { 
        staked-amount: remaining-stake,
        active: (>= remaining-stake min-arbitrator-stake)
      })
    )
    
    ;; In production: transfer stake back
    ;; (try! (contract-call? .token transfer amount contract-address tx-sender))
    
    (var-set total-staked (- (var-get total-staked) amount))
    
    (ok true)
  )
)

;; ========================================
;; Public Functions - Dispute Filing
;; ========================================

;; File a dispute
(define-public (file-dispute
  (invoice-id uint)
  (payer principal)
  (payee principal)
  (amount-disputed uint)
  (evidence-uri (optional (string-utf8 256))))
  (let
    (
      (new-dispute-id (+ (var-get dispute-count) u1))
    )
    ;; In production: collect dispute fee
    ;; (try! (contract-call? .token transfer dispute-fee tx-sender contract-address))
    
    ;; Create dispute
    (map-set disputes
      { dispute-id: new-dispute-id }
      {
        invoice-id: invoice-id,
        filed-by: tx-sender,
        payer: payer,
        payee: payee,
        amount-disputed: amount-disputed,
        evidence-uri: evidence-uri,
        created-at: block-height,
        voting-ends-at: (+ block-height voting-period-blocks),
        resolved: false,
        resolution: none,
        total-votes: u0
      }
    )
    
    ;; Initialize vote tallies
    (map-set vote-tallies { dispute-id: new-dispute-id, vote-option: vote-for-payer } { weighted-votes: u0 })
    (map-set vote-tallies { dispute-id: new-dispute-id, vote-option: vote-for-payee } { weighted-votes: u0 })
    (map-set vote-tallies { dispute-id: new-dispute-id, vote-option: vote-partial-refund } { weighted-votes: u0 })
    
    ;; Initialize evidence count
    (map-set evidence-count { dispute-id: new-dispute-id } { count: u0 })
    
    (var-set dispute-count new-dispute-id)
    
    (ok new-dispute-id)
  )
)

;; Submit additional evidence
(define-public (submit-evidence
  (dispute-id uint)
  (evidence-uri (string-utf8 256)))
  (let
    (
      (dispute (unwrap! (map-get? disputes { dispute-id: dispute-id }) err-dispute-not-found))
      (evidence-data (unwrap! (map-get? evidence-count { dispute-id: dispute-id }) err-dispute-not-found))
      (submission-index (get count evidence-data))
    )
    ;; Verify dispute not resolved
    (asserts! (not (get resolved dispute)) err-dispute-closed)
    
    ;; Store evidence
    (map-set evidence-submissions
      { dispute-id: dispute-id, submission-index: submission-index }
      {
        submitted-by: tx-sender,
        evidence-uri: evidence-uri,
        submitted-at: block-height
      }
    )
    
    ;; Update count
    (map-set evidence-count
      { dispute-id: dispute-id }
      { count: (+ submission-index u1) }
    )
    
    (ok true)
  )
)

;; ========================================
;; Public Functions - Voting
;; ========================================

;; Cast vote on dispute
(define-public (vote-on-dispute
  (dispute-id uint)
  (vote uint))
  (let
    (
      (dispute (unwrap! (map-get? disputes { dispute-id: dispute-id }) err-dispute-not-found))
      (arb-data (unwrap! (map-get? arbitrators { arbitrator: tx-sender }) err-not-arbitrator))
    )
    ;; Verify active arbitrator
    (asserts! (is-active-arbitrator tx-sender) err-not-arbitrator)
    
    ;; Verify voting period active
    (asserts! (<= block-height (get voting-ends-at dispute)) err-voting-period-ended)
    
    ;; Verify not already voted
    (asserts! 
      (is-none (map-get? dispute-votes { dispute-id: dispute-id, arbitrator: tx-sender }))
      err-already-voted
    )
    
    ;; Verify valid vote
    (asserts! 
      (or 
        (is-eq vote vote-for-payer)
        (is-eq vote vote-for-payee)
        (is-eq vote vote-partial-refund)
      )
      err-invalid-vote
    )
    
    ;; Calculate vote weight based on stake and reputation
    (let
      (
        (vote-weight (calculate-reputation-weight tx-sender))
        (current-tally (unwrap! (map-get? vote-tallies { dispute-id: dispute-id, vote-option: vote }) err-dispute-not-found))
      )
      ;; Record vote
      (map-set dispute-votes
        { dispute-id: dispute-id, arbitrator: tx-sender }
        {
          vote: vote,
          voted-at: block-height,
          stake-weight: vote-weight
        }
      )
      
      ;; Update tally
      (map-set vote-tallies
        { dispute-id: dispute-id, vote-option: vote }
        { weighted-votes: (+ (get weighted-votes current-tally) vote-weight) }
      )
      
      ;; Update dispute vote count
      (map-set disputes
        { dispute-id: dispute-id }
        (merge dispute { total-votes: (+ (get total-votes dispute) u1) })
      )
      
      ;; Update arbitrator stats
      (map-set arbitrators
        { arbitrator: tx-sender }
        (merge arb-data { total-cases: (+ (get total-cases arb-data) u1) })
      )
      
      (ok true)
    )
  )
)

;; ========================================
;; Public Functions - Resolution
;; ========================================

;; Finalize dispute based on votes
(define-public (finalize-dispute (dispute-id uint))
  (let
    (
      (dispute (unwrap! (map-get? disputes { dispute-id: dispute-id }) err-dispute-not-found))
      (payer-votes (unwrap! (map-get? vote-tallies { dispute-id: dispute-id, vote-option: vote-for-payer }) err-dispute-not-found))
      (payee-votes (unwrap! (map-get? vote-tallies { dispute-id: dispute-id, vote-option: vote-for-payee }) err-dispute-not-found))
      (partial-votes (unwrap! (map-get? vote-tallies { dispute-id: dispute-id, vote-option: vote-partial-refund }) err-dispute-not-found))
    )
    ;; Verify voting period ended
    (asserts! (> block-height (get voting-ends-at dispute)) err-voting-period-ended)
    
    ;; Verify not already resolved
    (asserts! (not (get resolved dispute)) err-dispute-closed)
    
    ;; Verify minimum votes received (at least 3)
    (asserts! (>= (get total-votes dispute) u3) err-not-enough-votes)
    
    ;; Determine winner
    (let
      (
        (payer-weight (get weighted-votes payer-votes))
        (payee-weight (get weighted-votes payee-votes))
        (partial-weight (get weighted-votes partial-votes))
        (max-weight (if (> payer-weight payee-weight)
                       (if (> payer-weight partial-weight) payer-weight partial-weight)
                       (if (> payee-weight partial-weight) payee-weight partial-weight)))
        (resolution (if (is-eq max-weight payer-weight)
                       vote-for-payer
                       (if (is-eq max-weight payee-weight)
                         vote-for-payee
                         vote-partial-refund)))
      )
      ;; Mark as resolved
      (map-set disputes
        { dispute-id: dispute-id }
        (merge dispute { 
          resolved: true,
          resolution: (some resolution)
        })
      )
      
      ;; In production: distribute rewards to winning arbitrators
      ;; and update reputation scores
      
      (ok resolution)
    )
  )
)

;; ========================================
;; Read-Only Functions
;; ========================================

(define-read-only (get-arbitrator-info (arbitrator principal))
  (map-get? arbitrators { arbitrator: arbitrator })
)

(define-read-only (get-dispute (dispute-id uint))
  (map-get? disputes { dispute-id: dispute-id })
)

(define-read-only (get-vote (dispute-id uint) (arbitrator principal))
  (map-get? dispute-votes { dispute-id: dispute-id, arbitrator: arbitrator })
)

(define-read-only (get-vote-tally (dispute-id uint) (vote-option uint))
  (map-get? vote-tallies { dispute-id: dispute-id, vote-option: vote-option })
)

(define-read-only (get-evidence (dispute-id uint) (submission-index uint))
  (map-get? evidence-submissions { dispute-id: dispute-id, submission-index: submission-index })
)

(define-read-only (get-total-staked)
  (ok (var-get total-staked))
)

(define-read-only (get-total-arbitrators)
  (ok (var-get total-arbitrators))
)

(define-read-only (get-dispute-count)
  (ok (var-get dispute-count))
)

;; Check if arbitrator is eligible to vote
(define-read-only (can-vote (dispute-id uint) (arbitrator principal))
  (match (get-dispute dispute-id)
    dispute
      (ok {
        is-arbitrator: (is-active-arbitrator arbitrator),
        not-voted: (is-none (map-get? dispute-votes { dispute-id: dispute-id, arbitrator: arbitrator })),
        voting-active: (<= block-height (get voting-ends-at dispute)),
        not-resolved: (not (get resolved dispute)),
        eligible: (and
          (is-active-arbitrator arbitrator)
          (is-none (map-get? dispute-votes { dispute-id: dispute-id, arbitrator: arbitrator }))
          (<= block-height (get voting-ends-at dispute))
          (not (get resolved dispute))
        )
      })
    err-dispute-not-found
  )
)

;; Get current vote standing
(define-read-only (get-vote-standing (dispute-id uint))
  (let
    (
      (payer-votes (unwrap! (get-vote-tally dispute-id vote-for-payer) err-dispute-not-found))
      (payee-votes (unwrap! (get-vote-tally dispute-id vote-for-payee) err-dispute-not-found))
      (partial-votes (unwrap! (get-vote-tally dispute-id vote-partial-refund) err-dispute-not-found))
    )
    (ok {
      payer: (get weighted-votes payer-votes),
      payee: (get weighted-votes payee-votes),
      partial: (get weighted-votes partial-votes)
    })
  )
)

