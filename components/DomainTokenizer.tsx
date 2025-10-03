'use client'

import { useState } from 'react'
import { useDomaTokenization } from '@/hooks/useDomaTokenization'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react'

interface DomainTokenizerProps {
  onTokenizationComplete?: (result: Record<string, unknown>) => void
}

export function DomainTokenizer({ onTokenizationComplete }: DomainTokenizerProps) {
  const [domainName, setDomainName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [tld, setTld] = useState('com')
  
  const { tokenizeDomain, status, transactionHash, error, reset } = useDomaTokenization()

  const handleTokenize = async () => {
    if (!domainName.trim()) return

    const fullDomainName = `${domainName}.${tld}`
    
    const result = await tokenizeDomain({
      domain: fullDomainName,
      chainId: 137, // Polygon mainnet
      metadata: {
        description: description || `Tokenized version of ${fullDomainName}`,
        image: imageUrl || `https://api.doma.xyz/thumbnail/${fullDomainName}`,
        attributes: [
          {
            trait_type: 'Top-Level Domain',
            value: tld.toUpperCase()
          },
          {
            trait_type: 'Domain Length',
            value: domainName.length.toString()
          }
        ]
      }
    })

    if (result.success && onTokenizationComplete) {
      onTokenizationComplete(result)
    }
  }

  const handleReset = () => {
    setDomainName('')
    setDescription('')
    setImageUrl('')
    reset()
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Processing...</Badge>
      case 'success':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Success!</Badge>
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Error</Badge>
      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🔗</span>
          Tokenize Domain
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status === 'success' && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Domain tokenized successfully! 
              {transactionHash && (
                <div className="mt-2">
                  <a 
                    href={`https://polygonscan.com/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-800"
                  >
                    View Transaction <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="domain">Domain Name</Label>
            <div className="flex">
              <Input
                id="domain"
                placeholder="example"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                disabled={status === 'processing'}
                className="rounded-r-none"
              />
              <div className="flex items-center px-3 bg-muted border border-l-0 rounded-r-md">
                <span className="text-muted-foreground">.{tld}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tld">Top-Level Domain</Label>
            <select
              id="tld"
              value={tld}
              onChange={(e) => setTld(e.target.value)}
              disabled={status === 'processing'}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="com">.com</option>
              <option value="org">.org</option>
              <option value="net">.net</option>
              <option value="io">.io</option>
              <option value="xyz">.xyz</option>
              <option value="ai">.ai</option>
              <option value="eth">.eth</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Describe your domain..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={status === 'processing'}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Image URL (Optional)</Label>
          <Input
            id="image"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={status === 'processing'}
          />
        </div>

        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <h4 className="font-medium text-sm">Tokenization Summary</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Domain:</span>
              <span className="font-medium">{domainName ? `${domainName}.${tld}` : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Network:</span>
              <span className="font-medium">Polygon</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-medium">
                {status === 'idle' && 'Ready to tokenize'}
                {status === 'processing' && 'Tokenizing...'}
                {status === 'success' && 'Tokenized'}
                {status === 'error' && 'Failed'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleTokenize}
            disabled={!domainName.trim() || status === 'processing'}
            className="flex-1 bg-gradient-to-r from-primary to-primary/80"
          >
            {getStatusIcon()}
            <span className="ml-2">
              {status === 'processing' ? 'Tokenizing...' : 'Tokenize Domain'}
            </span>
          </Button>
          
          {(status === 'success' || status === 'error') && (
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1"
            >
              Tokenize Another
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Tokenizing a domain creates a unique NFT representing ownership. 
          This process is irreversible and requires gas fees.
        </p>
      </CardContent>
    </Card>
  )
}
