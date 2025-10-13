import axios from 'axios';
import { Logger } from '../utils/logger';
import { PrismaClient } from '@prisma/client';

interface WebhookPayload {
  event: string;
  invoiceId: string;
  timestamp: string;
  data: any;
}

export class WebhookService {
  private logger: Logger;
  private prisma: PrismaClient;

  constructor() {
    this.logger = new Logger('WebhookService');
    this.prisma = new PrismaClient();
  }

  public async triggerInvoiceUpdate(
    invoiceId: string,
    eventType: string,
    additionalData?: any
  ): Promise<void> {
    try {
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          milestones: true,
          disputes: true
        }
      });

      if (!invoice) {
        this.logger.warn('Invoice not found for webhook trigger', { invoiceId });
        return;
      }

      const payload: WebhookPayload = {
        event: eventType,
        invoiceId,
        timestamp: new Date().toISOString(),
        data: {
          invoice,
          ...additionalData
        }
      };

      // Here you would typically fetch registered webhook URLs from database
      // For now, we'll just log the webhook trigger
      this.logger.info('Webhook triggered', {
        invoiceId,
        eventType,
        payload: JSON.stringify(payload).substring(0, 200)
      });

      // In production, you would send to registered webhook endpoints:
      // await this.sendWebhook(webhookUrl, payload);

    } catch (error: any) {
      this.logger.error('Failed to trigger webhook', { error, invoiceId, eventType });
    }
  }

  private async sendWebhook(url: string, payload: WebhookPayload): Promise<void> {
    try {
      await axios.post(url, payload, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': payload.event
        }
      });

      this.logger.info('Webhook sent successfully', { url, event: payload.event });
    } catch (error: any) {
      this.logger.error('Failed to send webhook', { error, url, event: payload.event });
    }
  }
}

