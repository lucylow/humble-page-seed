// Security middleware for API protection and rate limiting

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class SecurityMiddleware {
  private rateLimits: Map<string, RateLimitEntry> = new Map();
  private ipRequests: Map<string, number[]> = new Map();

  // Rate limiting configurations
  private readonly LIMITS = {
    API_PER_MINUTE: 100,
    WRITE_OPS_PER_MINUTE: 10,
    AUTH_ATTEMPTS_PER_HOUR: 5,
    WEBSOCKET_MSGS_PER_SEC: 50
  };

  /**
   * Rate limit check for API requests
   */
  checkRateLimit(identifier: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.rateLimits.get(identifier);

    if (!entry || now > entry.resetTime) {
      this.rateLimits.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (entry.count >= limit) {
      return false;
    }

    entry.count++;
    return true;
  }

  /**
   * IP-based rate limiting
   */
  checkIpRateLimit(ip: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const requests = this.ipRequests.get(ip) || [];
    
    // Remove old requests outside window
    const recentRequests = requests.filter(timestamp => now - timestamp < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.ipRequests.set(ip, recentRequests);
    return true;
  }

  /**
   * Wallet-based rate limiting for write operations
   */
  checkWalletRateLimit(walletAddress: string): boolean {
    return this.checkRateLimit(
      `wallet:${walletAddress}`,
      this.LIMITS.WRITE_OPS_PER_MINUTE,
      60000
    );
  }

  /**
   * Input sanitization
   */
  sanitizeInput(input: string): string {
    // Remove potential XSS vectors
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim()
      .slice(0, 1000); // Max length
  }

  /**
   * Validate wallet address format
   */
  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * CSRF token generation and validation
   */
  generateCsrfToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  validateCsrfToken(token: string, storedToken: string): boolean {
    return token === storedToken;
  }

  /**
   * SQL injection prevention (for direct queries)
   */
  escapeString(str: string): string {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
      switch (char) {
        case '\0': return '\\0';
        case '\x08': return '\\b';
        case '\x09': return '\\t';
        case '\x1a': return '\\z';
        case '\n': return '\\n';
        case '\r': return '\\r';
        case '"':
        case "'":
        case '\\':
        case '%':
          return '\\' + char;
        default: return char;
      }
    });
  }

  /**
   * Clean up expired entries periodically
   */
  startCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      
      // Clean rate limits
      for (const [key, entry] of this.rateLimits.entries()) {
        if (now > entry.resetTime) {
          this.rateLimits.delete(key);
        }
      }

      // Clean IP requests older than 1 hour
      for (const [ip, requests] of this.ipRequests.entries()) {
        const recent = requests.filter(t => now - t < 3600000);
        if (recent.length === 0) {
          this.ipRequests.delete(ip);
        } else {
          this.ipRequests.set(ip, recent);
        }
      }
    }, 60000); // Run every minute
  }
}

export const securityMiddleware = new SecurityMiddleware();
securityMiddleware.startCleanup();

// Security headers for responses
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  'Referrer-Policy': 'strict-origin-when-cross-origin'
} as const;
