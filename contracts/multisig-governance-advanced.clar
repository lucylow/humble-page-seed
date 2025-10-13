;; Advanced Multi-Signature Governance Contract
;; Enables sophisticated DAO treasury approvals with weighted voting

(define-constant GOVERNANCE_CONTRACT tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_DAO_NOT_FOUND (err u101))
(define-constant ERR_THRESHOLD_NOT_MET (err u112))
(define-constant ERR_DAO_NOT_ACTIVE (err u113))
(define-constant ERR_SIGNER_NOT_ACTIVE (err u114))
(define-constant ERR_NOT_IN_VOTING (err u115))
(define-constant ERR_APPROVAL_NOT_FOUND (err u116))

(define-map daos
  { dao-id: uint }
  { 
    name: (string-ascii 50), 
    owner: principal,
    signer-count: uint,
    threshold: uint,
    is-active: bool 
  }
)

(define-map dao-signers
  { dao-id: uint, signer: principal }
  { weight: uint, is-active: bool }
)

(define-map pending-approvals
  { approval-id: uint }
  { 
    dao-id: uint,
    invoice-id: uint,
    amount: uint,
    recipient: principal,
    proposed-by: principal,
    proposed-at: uint,
    status: (string-ascii 20)
  }
)

(define-map approval-votes
  { approval-id: uint, signer: principal }
  { voted: bool, approve: bool, weight: uint, voted-at: uint }
)

;; Create new DAO
(define-public (create-dao 
  (dao-id uint) 
  (name (string-ascii 50)) 
  (threshold uint)
)
  (begin
    (map-set daos
      { dao-id: dao-id }
      { name: name, owner: tx-sender, signer-count: u1, threshold: threshold, is-active: true }
    )
    
    ;; Add creator as first signer
    (map-set dao-signers 
      { dao-id: dao-id, signer: tx-sender } 
      { weight: u1, is-active: true }
    )
    
    (ok true)
  )
)

;; Add signer to DAO
(define-public (add-signer
  (dao-id uint)
  (signer principal)
  (weight uint)
)
  (let (
    (dao (unwrap! (map-get? daos { dao-id: dao-id }) ERR_DAO_NOT_FOUND))
  )
    (asserts! (is-eq tx-sender (get owner dao)) ERR_NOT_AUTHORIZED)
    (asserts! (get is-active dao) ERR_DAO_NOT_ACTIVE)
    
    (map-set dao-signers
      { dao-id: dao-id, signer: signer }
      { weight: weight, is-active: true }
    )
    
    (map-set daos
      { dao-id: dao-id }
      (merge dao { signer-count: (+ (get signer-count dao) u1) })
    )
    
    (ok true)
  )
)

;; Propose payment
(define-public (propose-payment
  (dao-id uint)
  (invoice-id uint)
  (amount uint)
  (recipient principal)
)
  (let (
    (dao (unwrap! (map-get? daos { dao-id: dao-id }) ERR_DAO_NOT_FOUND))
    (approval-id (+ block-height invoice-id))
    (is-signer (unwrap! (map-get? dao-signers { dao-id: dao-id, signer: tx-sender }) ERR_NOT_AUTHORIZED))
  )
  (asserts! (get is-active dao) ERR_DAO_NOT_ACTIVE)
  (asserts! (get is-active is-signer) ERR_SIGNER_NOT_ACTIVE)
  
  (map-set pending-approvals
    { approval-id: approval-id }
    { 
      dao-id: dao-id,
      invoice-id: invoice-id,
      amount: amount,
      recipient: recipient,
      proposed-by: tx-sender,
      proposed-at: block-height,
      status: "voting"
    }
  )
  
  (ok approval-id)
))

;; Vote on payment proposal
(define-public (vote-on-payment 
  (approval-id uint) 
  (approve bool)
)
  (let (
    (approval (unwrap! (map-get? pending-approvals { approval-id: approval-id }) ERR_APPROVAL_NOT_FOUND))
    (dao (unwrap! (map-get? daos { dao-id: (get dao-id approval) }) ERR_DAO_NOT_FOUND))
    (voter-info (unwrap! (map-get? dao-signers { dao-id: (get dao-id approval), signer: tx-sender }) ERR_NOT_AUTHORIZED))
    (current-votes (calculate-current-votes approval-id))
  )
  (asserts! (is-eq (get status approval) "voting") ERR_NOT_IN_VOTING)
  (asserts! (get is-active voter-info) ERR_SIGNER_NOT_ACTIVE)
  
  ;; Record vote
  (map-set approval-votes
    { approval-id: approval-id, signer: tx-sender }
    { voted: true, approve: approve, weight: (get weight voter-info), voted-at: block-height }
  )
  
  ;; Check if threshold met
  (if (>= (get approve-votes current-votes) (get threshold dao))
    (begin
      (map-set pending-approvals
        { approval-id: approval-id }
        (merge approval { status: "approved" })
      )
      (print { 
        event: "payment-approved",
        approval-id: approval-id,
        invoice-id: (get invoice-id approval),
        amount: (get amount approval),
        recipient: (get recipient approval)
      })
    )
    true
  )
  
  (ok true)
))

;; Execute approved payment
(define-public (execute-approved-payment (approval-id uint))
  (let (
    (approval (unwrap! (map-get? pending-approvals { approval-id: approval-id }) ERR_APPROVAL_NOT_FOUND))
  )
  (asserts! (is-eq (get status approval) "approved") ERR_NOT_IN_VOTING)
  
  ;; Transfer funds (simplified - would integrate with escrow in production)
  (try! (as-contract (stx-transfer? (get amount approval) tx-sender (get recipient approval))))
  
  (map-set pending-approvals
    { approval-id: approval-id }
    (merge approval { status: "executed" })
  )
  
  (print { 
    event: "payment-executed", 
    approval-id: approval-id,
    invoice-id: (get invoice-id approval),
    amount: (get amount approval),
    recipient: (get recipient approval)
  })
  
  (ok true)
))

;; Calculate current vote totals
(define-private (calculate-current-votes (approval-id uint))
  ;; Simplified - in production would iterate through all votes
  { approve-votes: u0, reject-votes: u0, total-voted: u0 }
)

;; Read-only functions
(define-read-only (get-dao (dao-id uint))
  (map-get? daos { dao-id: dao-id })
)

(define-read-only (get-dao-signer (dao-id uint) (signer principal))
  (map-get? dao-signers { dao-id: dao-id, signer: signer })
)

(define-read-only (get-approval (approval-id uint))
  (map-get? pending-approvals { approval-id: approval-id })
)

(define-read-only (get-vote (approval-id uint) (signer principal))
  (map-get? approval-votes { approval-id: approval-id, signer: signer })
)

