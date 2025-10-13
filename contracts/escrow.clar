;; Single-milestone escrow (Clarity)
;; Demo-oriented; assumes SIP-010 token (e.g., sBTC) and that payer will transfer token -> this contract,
;; then call `ack-deposit` to attribute funds to an invoice.

(define-constant ERR-INVOICE-EXISTS u100)
(define-constant ERR-NOT-PAYER u101)
(define-constant ERR-ALREADY-FUNDED u102)
(define-constant ERR-NO-FUNDS u103)
(define-constant ERR-NOT-ARBITER-OR-PAYER u104)
(define-constant ERR-NOT-PAYEE u105)
(define-constant ERR-TRANSFER-FAILED u106)

;; invoice-status codes
(define-constant STATUS-OPEN u0)
(define-constant STATUS-FUNDED u1)
(define-constant STATUS-RELEASED u2)
(define-constant STATUS-DISPUTED u3)
(define-constant STATUS-REFUNDED u4)

;; invoice tuple: payer is tx-sender who created the invoice by default in this demo
(define-map invoices
  ;; key: invoice-id
  {invoice-id: uint}
  ;; value: tuple
  {creator: principal,
   payer: principal,
   payee: principal,
   token-contract: principal,
   token-transfer-fn: (string-ascii 32),
   amount: uint,
   status: uint,
   arbiter: principal,
   created-at: uint,
   deadline: uint})

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Create invoice
;; - tx-sender becomes payer
;; - token-contract must be the contract principal of the SIP-010 token (e.g., 'SP... .sbtc)
;; - token-transfer-fn default "transfer" but stored as string for clarity / adapt when calling
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-public (create-invoice
               (invoice-id uint)
               (payee principal)
               (amount uint)
               (token-contract principal)
               (arbiter principal)
               (deadline uint))
  (begin
    (asserts! (is-none (map-get? invoices {invoice-id: invoice-id})) (err ERR-INVOICE-EXISTS))
    (ok (map-insert invoices
      {invoice-id: invoice-id}
      {creator: tx-sender,
       payer: tx-sender,
       payee: payee,
       token-contract: token-contract,
       token-transfer-fn: "transfer",
       amount: amount,
       status: STATUS-OPEN,
       arbiter: arbiter,
       created-at: block-height,
       deadline: deadline}))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; ack-deposit
;; Payer calls this AFTER they have transferred the required tokens to the contract
;; The function validates that the contract's balance for the specified token is >= required amount
;; and marks invoice as FUNDED.
;; This avoids tricky cross-contract transfer-from patterns.
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-public (ack-deposit (invoice-id uint))
  (let ((invoice (unwrap! (map-get? invoices {invoice-id: invoice-id}) (err ERR-INVOICE-EXISTS)))
        (token-contract (get token-contract invoice))
        (needed (get amount invoice)))
    (let ((bal-res (unwrap! (contract-call? .mock-token get-balance (as-contract tx-sender)) (err ERR-NO-FUNDS))))
      (asserts! (>= bal-res needed) (err ERR-NO-FUNDS))
      (asserts! (is-eq (get status invoice) STATUS-OPEN) (err ERR-ALREADY-FUNDED))
      (ok (map-set invoices
        {invoice-id: invoice-id}
        (merge invoice {status: STATUS-FUNDED}))))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; release-funds
;; Caller must be payer or arbiter
;; Contract transfers token amount to payee using as-contract -> token contract transfer
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-public (release-funds (invoice-id uint))
  (let ((invoice (unwrap! (map-get? invoices {invoice-id: invoice-id}) (err ERR-INVOICE-EXISTS)))
        (status (get status invoice))
        (payer (get payer invoice))
        (payee (get payee invoice))
        (amount (get amount invoice))
        (token-contract (get token-contract invoice)))
    (asserts! (is-eq status STATUS-FUNDED) (err ERR-NO-FUNDS))
    (asserts! (or (is-eq tx-sender payer) (is-eq tx-sender (get arbiter invoice))) (err ERR-NOT-ARBITER-OR-PAYER))
    (let ((xfer-res (as-contract (contract-call? .mock-token transfer amount tx-sender payee))))
      (asserts! (is-ok xfer-res) (err ERR-TRANSFER-FAILED))
      (ok (map-set invoices
        {invoice-id: invoice-id}
        (merge invoice {amount: u0, status: STATUS-RELEASED}))))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; refund
;; Allows payer or arbiter to refund back to payer
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-public (refund (invoice-id uint))
  (let ((invoice (unwrap! (map-get? invoices {invoice-id: invoice-id}) (err ERR-INVOICE-EXISTS)))
        (status (get status invoice))
        (payer (get payer invoice))
        (amount (get amount invoice))
        (token-contract (get token-contract invoice)))
    (asserts! (is-eq status STATUS-FUNDED) (err ERR-NO-FUNDS))
    (asserts! (or (is-eq tx-sender payer) (is-eq tx-sender (get arbiter invoice))) (err ERR-NOT-ARBITER-OR-PAYER))
    (let ((xfer-res (as-contract (contract-call? .mock-token transfer amount tx-sender payer))))
      (asserts! (is-ok xfer-res) (err ERR-TRANSFER-FAILED))
      (ok (map-set invoices
        {invoice-id: invoice-id}
        (merge invoice {amount: u0, status: STATUS-REFUNDED}))))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; get-invoice (read-only)
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-read-only (get-invoice (invoice-id uint))
  (ok (unwrap! (map-get? invoices {invoice-id: invoice-id}) (err ERR-INVOICE-EXISTS))))

