# BitMind Images Directory

This directory contains screenshots and visual assets referenced in the main README.

## Required Images

The following images should be placed in this directory:

### Screenshots
- `dashboard.png` - Dashboard overview showing real-time invoice tracking with live crypto prices
- `ai-parsing.png` - AI invoice parsing demo showing text input and structured output
- `contract-deploy.png` - Smart contract deployment interface
- `market-data.png` - Live market data display (BTC, STX, ETH prices)
- `invoice-lifecycle.png` - Invoice state machine diagram (created → funded → verified → released)

### Video Thumbnails
- `video-thumbnail-1.png` - Getting Started tutorial thumbnail
- `video-thumbnail-2.png` - AI Parsing tutorial thumbnail
- `video-thumbnail-3.png` - Smart Contract Deep Dive thumbnail
- `video-thumbnail-4.png` - DAO Treasury Integration thumbnail

## Image Guidelines

### Format
- Use PNG format for screenshots and diagrams
- Use JPG for photographs
- Optimize images for web (compress without losing quality)

### Size Recommendations
- Screenshots: 1920x1080 or 2560x1440 (16:9 aspect ratio)
- Video thumbnails: 1280x720 (YouTube standard)
- Diagrams: SVG preferred, or PNG at 2x resolution for retina displays

### Naming Convention
- Use lowercase with hyphens: `invoice-lifecycle.png`
- Be descriptive: `contract-deployment-flow.png` not `img1.png`
- Add version numbers if needed: `dashboard-v2.png`

## Taking Screenshots

### For Dashboard (`dashboard.png`)
1. Navigate to the Index page with wallet connected
2. Ensure at least 3-4 invoices are visible
3. Show the live price ticker with BTC and STX prices
4. Capture in light mode for better visibility

### For AI Parsing (`ai-parsing.png`)
1. Navigate to /demo page
2. Paste a sample invoice in the text area
3. Show the "before and after" - raw text on left, parsed JSON on right
4. Highlight the 95% accuracy badge

### For Contract Deployment (`contract-deploy.png`)
1. Show the Hiro Wallet popup during contract creation
2. Include contract parameters being sent
3. Show gas fee estimation

### For Market Data (`market-data.png`)
1. Focus on the live market prices card
2. Include the CoinGecko attribution
3. Show the refresh button

### For Invoice Lifecycle (`invoice-lifecycle.png`)
Create a diagram showing:
```
[Created] → [Funded] → [Verified] → [Released]
   ↓            ↓           ↓
[Cancelled] [Disputed] [Refunded]
```

## Creating Video Thumbnails

Use these tools:
- **Canva**: [canva.com](https://canva.com) - Easy drag-and-drop
- **Figma**: [figma.com](https://figma.com) - More customization
- **Photoshop/GIMP**: For advanced editing

### Thumbnail Design Tips
- Use BitMind brand colors: Orange (#F97316), Purple (#A855F7), Blue (#3B82F6)
- Include large, readable text (min 30pt font)
- Add duration badge (e.g., "5:23" in bottom right)
- Use emoji or icons to make it eye-catching
- Maintain consistent style across all thumbnails

## Temporary Placeholders

Until actual screenshots are available, you can:
1. Use placeholder images from [placehold.co](https://placehold.co/)
2. Create simple diagrams with [Excalidraw](https://excalidraw.com/)
3. Take screenshots from the development environment

Example placeholder URLs:
```markdown
![Dashboard](https://placehold.co/1920x1080/orange/white?text=BitMind+Dashboard)
![AI Parsing](https://placehold.co/1920x1080/purple/white?text=AI+Invoice+Parsing)
```

## License

All images in this directory should be:
- Original content created by the BitMind team
- Properly licensed stock images (with attribution)
- Screenshots of the actual BitMind application

Include attribution in captions if using third-party content.

