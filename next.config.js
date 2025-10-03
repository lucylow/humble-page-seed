/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['ipfs.io', 'gateway.pinata.cloud', 'cloudflare-ipfs.com'],
  },
  env: {
    DOMA_RPC_URL: process.env.DOMA_RPC_URL,
    PINATA_API_KEY: process.env.PINATA_API_KEY,
    PINATA_SECRET_KEY: process.env.PINATA_SECRET_KEY,
    PLAUSIBLE_DOMAIN: process.env.PLAUSIBLE_DOMAIN,
  },
}

module.exports = nextConfig

