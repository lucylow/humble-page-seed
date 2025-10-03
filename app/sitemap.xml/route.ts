import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { generateSitemapData } from '@/lib/seo'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Fetch all domains from database
    const domains = await prisma.domain.findMany({
      select: {
        tokenId: true,
        name: true,
        updatedAt: true,
      },
    })

    // Generate sitemap XML
    const sitemap = generateSitemapData(domains as Record<string, unknown>[])

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // Return basic sitemap on error
    const basicSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://domaland.ai</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`

    return new NextResponse(basicSitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  }
}
