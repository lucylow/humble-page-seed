;; Mock SIP-010 Token for Testing
;; Simple fungible token implementation for demo purposes

(define-fungible-token mock-token)

(define-constant ERR-INSUFFICIENT-BALANCE u200)
(define-constant ERR-UNAUTHORIZED u201)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Mint tokens (for testing only)
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-public (mint (amount uint) (to principal))
  (begin
    (try! (ft-mint? mock-token amount to))
    (ok true)))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Transfer tokens
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-public (transfer (amount uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) (err ERR-UNAUTHORIZED))
    (try! (ft-transfer? mock-token amount sender recipient))
    (ok true)))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Get balance (read-only)
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-read-only (get-balance (owner principal))
  (ok (ft-get-balance mock-token owner)))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Get token name (read-only)
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-read-only (get-name)
  (ok "Mock Token"))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Get token symbol (read-only)
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-read-only (get-symbol)
  (ok "MOCK"))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Get decimals (read-only)
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-read-only (get-decimals)
  (ok u8))

