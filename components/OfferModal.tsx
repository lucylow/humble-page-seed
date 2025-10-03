'use client'

import { useState } from 'react'
import { DomainData } from '@/types/domain'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAccount, useWriteContract } from 'wagmi'
import { toast } from 'sonner'

interface OfferModalProps {
  isOpen: boolean
  onClose: () => void
  domainData: DomainData
}

export function OfferModal({ isOpen, onClose, domainData }: OfferModalProps) {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()
  
  const [offerAmount, setOfferAmount] = useState('')
  const [paymentToken, setPaymentToken] = useState('usdc')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitOffer = async () => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      toast.error('Please enter a valid offer amount')
      return
    }

    setIsSubmitting(true)

    try {
      // In a real implementation, this would call the OfferFactory contract
      // For now, we'll simulate the transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Offer submitted successfully!')
      onClose()
      
      // Reset form
      setOfferAmount('')
      setMessage('')
      
    } catch (error) {
      console.error('Error submitting offer:', error)
      toast.error('Failed to submit offer. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Make an Offer for {domainData.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Offer Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter your offer amount"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="token">Payment Token</Label>
            <Select value={paymentToken} onValueChange={setPaymentToken}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment token" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usdc">USDC</SelectItem>
                <SelectItem value="usdt">USDT</SelectItem>
                <SelectItem value="eth">ETH</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a message to the domain owner"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">Offer Summary</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Domain:</span>
                <span className="font-medium">{domainData.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Offer Amount:</span>
                <span className="font-medium">${offerAmount || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Token:</span>
                <span className="font-medium">{paymentToken.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Expires:</span>
                <span className="font-medium">7 days</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitOffer}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80"
              disabled={isSubmitting || !offerAmount}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Offer'}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Your offer will be locked in a smart contract for 7 days. 
            The domain owner can accept it at any time during this period.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

