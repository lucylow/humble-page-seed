;; Payment Router Contract
;; Enables cross-chain multi-asset payments and swaps

(define-constant ROUTER_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_TOKEN_NOT_SUPPORTED (err u108))

(define-map supported-tokens
  { token-contract: principal }
  { token-name: (string-ascii 20), decimals: uint, is-active: bool }
)

(define-map bridge-oracles
  { oracle-address: principal }
  { bridge-name: (string-ascii 20), is-trusted: bool }
)

;; Add supported token
(define-public (add-supported-token 
  (token-contract principal) 
  (token-name (string-ascii 20)) 
  (decimals uint)
)
  (begin
    (asserts! (is-eq tx-sender ROUTER_OWNER) ERR_NOT_AUTHORIZED)
    (map-set supported-tokens
      { token-contract: token-contract }
      { token-name: token-name, decimals: decimals, is-active: true }
    )
    (ok true)
  )
)

;; Add bridge oracle
(define-public (add-bridge-oracle
  (oracle-address principal)
  (bridge-name (string-ascii 20))
)
  (begin
    (asserts! (is-eq tx-sender ROUTER_OWNER) ERR_NOT_AUTHORIZED)
    (map-set bridge-oracles
      { oracle-address: oracle-address }
      { bridge-name: bridge-name, is-trusted: true }
    )
    (ok true)
  )
)

;; Execute cross-chain payment
(define-public (execute-cross-chain-payment
  (invoice-id uint)
  (payment-token principal)
  (payment-amount uint)
  (recipient principal)
  (target-chain (string-ascii 20))
)
  (let (
    (token-info (unwrap! (map-get? supported-tokens { token-contract: payment-token }) ERR_TOKEN_NOT_SUPPORTED))
  )
  (asserts! (get is-active token-info) ERR_TOKEN_NOT_SUPPORTED)
  
  ;; Transfer tokens to router (would need token interface in production)
  (try! (stx-transfer? payment-amount tx-sender (as-contract tx-sender)))
  
  ;; Emit cross-chain transfer event
  (print { 
    event: "cross-chain-payment", 
    invoice-id: invoice-id, 
    token: payment-token,
    amount: payment-amount,
    recipient: recipient,
    target-chain: target-chain
  })
  
  (ok true)
))

;; Quote swap amounts
(define-read-only (quote-swap
  (input-token principal)
  (output-token principal)
  (input-amount uint)
)
  (let (
    (input-info (unwrap! (map-get? supported-tokens { token-contract: input-token }) ERR_TOKEN_NOT_SUPPORTED))
    (output-info (unwrap! (map-get? supported-tokens { token-contract: output-token }) ERR_TOKEN_NOT_SUPPORTED))
    (estimated-output (calculate-swap-output input-amount))
    (fee (/ estimated-output u200))
  )
  (ok {
    input-amount: input-amount,
    output-amount: estimated-output,
    fee: fee,
    price-impact: u0
  })
))

;; Private helper to calculate swap output (simplified)
(define-private (calculate-swap-output (input-amount uint))
  (let (
    (input-reserves u1000000000) ;; Mock reserves
    (output-reserves u1000000000)
    (input-amount-with-fee (* input-amount u995)) ;; 0.5% fee
    (numerator (* input-amount-with-fee output-reserves))
    (denominator (+ (* input-reserves u1000) input-amount-with-fee))
  )
  (/ numerator denominator)
))

;; Read-only functions
(define-read-only (get-supported-token (token-contract principal))
  (map-get? supported-tokens { token-contract: token-contract })
)

(define-read-only (get-bridge-oracle (oracle-address principal))
  (map-get? bridge-oracles { oracle-address: oracle-address })
)

