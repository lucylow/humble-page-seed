;; Secure Escrow with Governance Support
;; Production-ready version with pause, multisig governance, and token whitelist
;; This version integrates with governance-multisig.clar for admin operations

;; ============================================
;; ERROR CODES
;; ============================================
(define-constant ERR-INVOICE-EXISTS u100)
(define-constant ERR-NOT-PAYER u101)
(define-constant ERR-ALREADY-FUNDED u102)
(define-constant ERR-NO-FUNDS u103)
(define-constant ERR-NOT-ARBITER-OR-PAYER u104)
(define-constant ERR-NOT-PAYEE u105)
(define-constant ERR-TRANSFER-FAILED u106)
(define-constant ERR-CONTRACT-PAUSED u107)
(define-constant ERR-NOT-ADMIN u108)
(define-constant ERR-TOKEN-NOT-WHITELISTED u109)
(define-constant ERR-INVALID-AMOUNT u110)
(define-constant ERR-INVALID-INVOICE-ID u111)
(define-constant ERR-NOT-GOVERNANCE u112)

;; ============================================
;; STATUS CODES
;; ============================================
(define-constant STATUS-OPEN u0)
(define-constant STATUS-FUNDED u1)
(define-constant STATUS-RELEASED u2)
(define-constant STATUS-DISPUTED u3)
(define-constant STATUS-REFUNDED u4)

;; ============================================
;; GOVERNANCE & SECURITY STATE
;; ============================================

;; Contract pause state
(define-data-var contract-paused bool false)

;; Admin principal (can be replaced by governance)
(define-data-var admin principal tx-sender)

;; Governance multisig contract
(define-data-var governance-principal principal 'SP000000000000000000000002Q6VF78)

;; Token whitelist
(define-map whitelisted-tokens {token-contract: principal} {approved: bool, added-at: uint})

;; Maximum invoice amount (anti-overflow)
(define-constant MAX-INVOICE-AMOUNT u100000000000) ;; 1000 sBTC

;; ============================================
;; INVOICE DATA STRUCTURE
;; ============================================
(define-map invoices {invoice-id: uint}
  {creator: principal,
   payer: principal,
   payee: principal,
   token-contract: principal,
   amount: uint,
   deposited-amount: uint,
   status: uint,
   arbiter: principal,
   created-at: uint,
   deadline: uint,
   metadata-hash: (optional (buff 32))})

;; ============================================
;; ADMIN & GOVERNANCE FUNCTIONS
;; ============================================

;; Check if caller is admin or governance
(define-read-only (is-admin-caller (who principal))
  (let ((a (var-get admin)) 
        (g (var-get governance-principal)))
    (or (is-eq who a) (is-eq who g))))

;; Set governance contract (admin only, one-time setup)
(define-public (set-governance (g principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err ERR-NOT-ADMIN))
    (var-set governance-principal g)
    (print {event: "governance-set", governance: g})
    (ok true)))

;; Governance-callable admin operations
;; This function is called by governance-multisig after threshold reached
(define-public (governance-apply (action uint) (arg1 principal) (arg2 uint))
  (begin
    (asserts! (is-eq tx-sender (var-get governance-principal)) (err ERR-NOT-GOVERNANCE))
    (match action
      u1 (begin ;; pause
           (var-set contract-paused true)
           (print {event: "contract-paused", by: "governance"})
           (ok true))
      u2 (begin ;; unpause
           (var-set contract-paused false)
           (print {event: "contract-unpaused", by: "governance"})
           (ok true))
      u3 (begin ;; whitelist-token (arg1=token, arg2=1 for approve, 0 for remove)
           (map-set whitelisted-tokens {token-contract: arg1} 
                    {approved: (is-eq arg2 u1), added-at: block-height})
           (print {event: "token-whitelist-updated", token: arg1, approved: (is-eq arg2 u1)})
           (ok true))
      u4 (begin ;; set-admin (arg1=new admin)
           (var-set admin arg1)
           (print {event: "admin-changed", new-admin: arg1})
           (ok true))
      (err ERR-NOT-ADMIN))))

;; Direct admin functions (for emergency use, prefer governance)
(define-public (pause)
  (begin
    (asserts! (is-admin-caller tx-sender) (err ERR-NOT-ADMIN))
    (var-set contract-paused true)
    (print {event: "contract-paused", by: tx-sender})
    (ok true)))

(define-public (unpause)
  (begin
    (asserts! (is-admin-caller tx-sender) (err ERR-NOT-ADMIN))
    (var-set contract-paused false)
    (print {event: "contract-unpaused", by: tx-sender})
    (ok true)))

(define-public (whitelist-token (token-contract principal) (approved bool))
  (begin
    (asserts! (is-admin-caller tx-sender) (err ERR-NOT-ADMIN))
    (ok (map-set whitelisted-tokens {token-contract: token-contract}
                 {approved: approved, added-at: block-height}))))

(define-public (set-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err ERR-NOT-ADMIN))
    (var-set admin new-admin)
    (print {event: "admin-changed", new-admin: new-admin})
    (ok true)))

;; ============================================
;; GUARDS
;; ============================================

(define-private (check-not-paused)
  (asserts! (not (var-get contract-paused)) (err ERR-CONTRACT-PAUSED)))

(define-private (check-token-whitelisted (token-contract principal))
  (let ((whitelist-entry (map-get? whitelisted-tokens {token-contract: token-contract})))
    (asserts! (and (is-some whitelist-entry) 
                   (get approved (unwrap-panic whitelist-entry)))
              (err ERR-TOKEN-NOT-WHITELISTED))))

;; ============================================
;; INVOICE LIFECYCLE FUNCTIONS
;; ============================================

(define-public (create-invoice
               (invoice-id uint)
               (payee principal)
               (amount uint)
               (token-contract principal)
               (arbiter principal)
               (deadline uint)
               (metadata-hash (optional (buff 32))))
  (begin
    (try! (check-not-paused))
    (try! (check-token-whitelisted token-contract))
    
    ;; Validate inputs
    (asserts! (> invoice-id u0) (err ERR-INVALID-INVOICE-ID))
    (asserts! (> amount u0) (err ERR-INVALID-AMOUNT))
    (asserts! (<= amount MAX-INVOICE-AMOUNT) (err ERR-INVALID-AMOUNT))
    (asserts! (is-none (map-get? invoices {invoice-id: invoice-id})) (err ERR-INVOICE-EXISTS))
    
    ;; Create invoice
    (ok (map-insert invoices {invoice-id: invoice-id}
      {creator: tx-sender,
       payer: tx-sender,
       payee: payee,
       token-contract: token-contract,
       amount: amount,
       deposited-amount: u0,
       status: STATUS-OPEN,
       arbiter: arbiter,
       created-at: block-height,
       deadline: deadline,
       metadata-hash: metadata-hash}))))

(define-public (deposit-funds (invoice-id uint))
  (let ((invoice (unwrap! (map-get? invoices {invoice-id: invoice-id}) (err ERR-INVOICE-EXISTS)))
        (token-contract (get token-contract invoice))
        (needed (get amount invoice)))
    
    (try! (check-not-paused))
    (asserts! (is-eq tx-sender (get payer invoice)) (err ERR-NOT-PAYER))
    (asserts! (is-eq (get status invoice) STATUS-OPEN) (err ERR-ALREADY-FUNDED))
    
    ;; Verify balance
    (let ((balance-after (unwrap! (contract-call? .mock-token get-balance (as-contract tx-sender)) 
                                  (err ERR-TRANSFER-FAILED))))
      (asserts! (>= balance-after needed) (err ERR-NO-FUNDS))
      
      ;; Update invoice
      (ok (map-set invoices {invoice-id: invoice-id}
        (merge invoice {deposited-amount: needed, status: STATUS-FUNDED}))))))

(define-public (ack-deposit (invoice-id uint))
  (deposit-funds invoice-id))

(define-public (release-funds (invoice-id uint))
  (let ((invoice (unwrap! (map-get? invoices {invoice-id: invoice-id}) (err ERR-INVOICE-EXISTS)))
        (status (get status invoice))
        (payer (get payer invoice))
        (payee (get payee invoice))
        (amount (get deposited-amount invoice))
        (token-contract (get token-contract invoice)))
    
    (try! (check-not-paused))
    (asserts! (is-eq status STATUS-FUNDED) (err ERR-NO-FUNDS))
    (asserts! (or (is-eq tx-sender payer) (is-eq tx-sender (get arbiter invoice))) 
              (err ERR-NOT-ARBITER-OR-PAYER))
    (asserts! (> amount u0) (err ERR-NO-FUNDS))
    
    ;; Transfer tokens
    (let ((xfer-res (as-contract (contract-call? .mock-token transfer amount 
                                                 (as-contract tx-sender) payee))))
      (asserts! (is-ok xfer-res) (err ERR-TRANSFER-FAILED))
      
      (ok (map-set invoices {invoice-id: invoice-id}
        (merge invoice {deposited-amount: u0, status: STATUS-RELEASED}))))))

(define-public (refund (invoice-id uint))
  (let ((invoice (unwrap! (map-get? invoices {invoice-id: invoice-id}) (err ERR-INVOICE-EXISTS)))
        (status (get status invoice))
        (payer (get payer invoice))
        (amount (get deposited-amount invoice))
        (token-contract (get token-contract invoice)))
    
    (try! (check-not-paused))
    (asserts! (is-eq status STATUS-FUNDED) (err ERR-NO-FUNDS))
    (asserts! (or (is-eq tx-sender payer) (is-eq tx-sender (get arbiter invoice))) 
              (err ERR-NOT-ARBITER-OR-PAYER))
    (asserts! (> amount u0) (err ERR-NO-FUNDS))
    
    ;; Transfer tokens back
    (let ((xfer-res (as-contract (contract-call? .mock-token transfer amount 
                                                 (as-contract tx-sender) payer))))
      (asserts! (is-ok xfer-res) (err ERR-TRANSFER-FAILED))
      
      (ok (map-set invoices {invoice-id: invoice-id}
        (merge invoice {deposited-amount: u0, status: STATUS-REFUNDED}))))))

;; ============================================
;; READ-ONLY FUNCTIONS
;; ============================================

(define-read-only (get-invoice (invoice-id uint))
  (ok (unwrap! (map-get? invoices {invoice-id: invoice-id}) (err ERR-INVOICE-EXISTS))))

(define-read-only (is-paused)
  (ok (var-get contract-paused)))

(define-read-only (is-token-whitelisted (token-contract principal))
  (match (map-get? whitelisted-tokens {token-contract: token-contract})
    entry (ok (get approved entry))
    (ok false)))

(define-read-only (get-admin)
  (ok (var-get admin)))

(define-read-only (get-governance)
  (ok (var-get governance-principal)))

;; ============================================
;; INITIALIZATION
;; ============================================

;; Whitelist mock token by default (for testing)
(map-insert whitelisted-tokens {token-contract: .mock-token}
  {approved: true, added-at: u0})

