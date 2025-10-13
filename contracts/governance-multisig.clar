;; governance-multisig.clar
;; Lightweight multisig controller for admin operations on the escrow contract.
;; Deploy with owners and threshold set.

(define-data-var owners (list 10 principal) (list))
(define-data-var threshold uint u1)
(define-data-var escrow-principal principal 'SP000000000000000000000002Q6VF78) ;; set post-deploy via set-escrow
(define-data-var next-proposal-id uint u1)

;; Error codes
(define-constant ERR-NOT-OWNER u100)
(define-constant ERR-NOT-CONTRACT-OWNER u101)
(define-constant ERR-NOT-AUTHORIZED u102)
(define-constant ERR-DUPLICATE-PROPOSAL u103)
(define-constant ERR-PROPOSAL-NOT-FOUND u110)
(define-constant ERR-ALREADY-CONFIRMED u111)
(define-constant ERR-PROPOSAL-NOT-FOUND-2 u112)
(define-constant ERR-ALREADY-EXECUTED u120)
(define-constant ERR-INSUFFICIENT-CONFIRMATIONS u121)
(define-constant ERR-PAUSE-FAILED u122)
(define-constant ERR-UNPAUSE-FAILED u123)
(define-constant ERR-WHITELIST-FAILED u124)
(define-constant ERR-SET-ADMIN-FAILED u125)
(define-constant ERR-INVALID-ACTION u126)
(define-constant ERR-NO-ESCROW u127)
(define-constant ERR-PROPOSAL-EXECUTION-FAILED u128)

;; Proposal struct:
(define-map proposals {proposal-id: uint}
  {action: uint,              ;; 1=pause,2=unpause,3=whitelist-token,4=set-admin
   arg1: principal,           ;; token principal or new-admin (or zero)
   arg2: uint,                ;; uint arg (used for bool as 0/1)
   creator: principal,
   executed: bool,
   confirm-count: uint})

;; confirmations mapping: (proposal-id, owner) -> bool
(define-map confirmations {proposal-id: uint, owner: principal} {confirmed: bool})

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Helpers
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-read-only (is-owner (who principal))
  (let ((owners-list (var-get owners)))
    (is-some (index-of owners-list who))))

(define-read-only (get-owners)
  (ok (var-get owners)))

(define-read-only (get-threshold)
  (ok (var-get threshold)))

(define-read-only (get-escrow-principal)
  (ok (var-get escrow-principal)))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Initialization (call once at deployment)
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-public (init-owners (owners-list (list 10 principal)) (thr uint))
  (begin
    (asserts! (is-eq tx-sender contract-caller) (err ERR-NOT-CONTRACT-OWNER))
    (asserts! (is-eq (len (var-get owners)) u0) (err ERR-NOT-AUTHORIZED)) ;; only once
    (var-set owners owners-list)
    (var-set threshold thr)
    (print {event: "owners-initialized", owners: owners-list, threshold: thr})
    (ok true)))

(define-public (set-escrow (esc principal))
  (begin
    (asserts! (is-eq tx-sender contract-caller) (err ERR-NOT-CONTRACT-OWNER))
    (var-set escrow-principal esc)
    (print {event: "escrow-set", escrow: esc})
    (ok true)))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Propose: create a proposal
;; action codes: 1=pause,2=unpause,3=whitelist-token,4=set-admin
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-public (propose (action uint) (arg1 principal) (arg2 uint))
  (let ((proposal-id (var-get next-proposal-id)))
    (asserts! (is-owner tx-sender) (err ERR-NOT-OWNER))
    (asserts! (is-none (map-get? proposals {proposal-id: proposal-id})) (err ERR-DUPLICATE-PROPOSAL))
    
    (map-set proposals {proposal-id: proposal-id}
      {action: action,
       arg1: arg1,
       arg2: arg2,
       creator: tx-sender,
       executed: false,
       confirm-count: u0})
    
    (var-set next-proposal-id (+ proposal-id u1))
    (print {event: "proposal-created", id: proposal-id, action: action, creator: tx-sender})
    (ok proposal-id)))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Confirm: owner registers confirmation for a proposal
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-public (confirm (proposal-id uint))
  (let ((proposal (unwrap! (map-get? proposals {proposal-id: proposal-id}) (err ERR-PROPOSAL-NOT-FOUND))))
    (asserts! (is-owner tx-sender) (err ERR-NOT-OWNER))
    (asserts! (is-none (map-get? confirmations {proposal-id: proposal-id, owner: tx-sender})) 
              (err ERR-ALREADY-CONFIRMED))
    
    (map-set confirmations {proposal-id: proposal-id, owner: tx-sender} {confirmed: true})
    (map-set proposals {proposal-id: proposal-id}
      (merge proposal {confirm-count: (+ (get confirm-count proposal) u1)}))
    
    (print {event: "proposal-confirmed", id: proposal-id, by: tx-sender})
    (ok true)))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Execute: if confirmations >= threshold, perform action by calling the escrow contract
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-public (execute (proposal-id uint))
  (let ((proposal (unwrap! (map-get? proposals {proposal-id: proposal-id}) (err ERR-PROPOSAL-NOT-FOUND)))
        (thr (var-get threshold))
        (esc (var-get escrow-principal)))
    
    (asserts! (not (get executed proposal)) (err ERR-ALREADY-EXECUTED))
    (asserts! (>= (get confirm-count proposal) thr) (err ERR-INSUFFICIENT-CONFIRMATIONS))
    
    (let ((act (get action proposal))
          (a1 (get arg1 proposal))
          (a2 (get arg2 proposal)))
      
      ;; Execute action
      (try! (match act
        u1 (contract-call? .escrow-secure governance-apply u1 a1 a2) ;; pause
        u2 (contract-call? .escrow-secure governance-apply u2 a1 a2) ;; unpause
        u3 (contract-call? .escrow-secure governance-apply u3 a1 a2) ;; whitelist-token
        u4 (contract-call? .escrow-secure governance-apply u4 a1 a2) ;; set-admin
        (err ERR-INVALID-ACTION)))
      
      ;; Mark executed
      (map-set proposals {proposal-id: proposal-id}
        (merge proposal {executed: true}))
      
      (print {event: "proposal-executed", id: proposal-id, action: act})
      (ok true))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Read-only functions
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-read-only (get-proposal (proposal-id uint))
  (ok (unwrap! (map-get? proposals {proposal-id: proposal-id}) (err ERR-PROPOSAL-NOT-FOUND))))

(define-read-only (has-confirmed (proposal-id uint) (owner principal))
  (ok (is-some (map-get? confirmations {proposal-id: proposal-id, owner: owner}))))

(define-read-only (get-confirmation-count (proposal-id uint))
  (match (map-get? proposals {proposal-id: proposal-id})
    proposal (ok (get confirm-count proposal))
    (err ERR-PROPOSAL-NOT-FOUND)))

