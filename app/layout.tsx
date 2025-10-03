import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'DomaLand.AI - Dynamic Digital Assets',
  description: 'Transform static domains into dynamic, monetizable digital storefronts with Web3 infrastructure',
  keywords: 'domain, tokenization, web3, blockchain, marketplace, fractional ownership',
  authors: [{ name: 'DomaLand Team' }],
  openGraph: {
    title: 'DomaLand.AI - Dynamic Digital Assets',
    description: 'Transform static domains into dynamic, monetizable digital storefronts',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DomaLand.AI - Dynamic Digital Assets',
    description: 'Transform static domains into dynamic, monetizable digital storefronts',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

