import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { authMiddleware } from './middleware/auth';
import { invoiceRoutes } from './routes/invoices';
import { aiRoutes } from './routes/ai';
import { webhookRoutes } from './routes/webhooks';
import { healthRoutes } from './routes/health';
import { PrismaClient } from '@prisma/client';
import { StacksService } from './services/stacks';
import { AIService } from './services/ai';
import { IPFSService } from './services/ipfs';

export class Server {
  public app: express.Application;
  public prisma: PrismaClient;
  public stacksService: StacksService;
  public aiService: AIService;
  public ipfsService: IPFSService;

  constructor() {
    this.app = express();
    this.prisma = new PrismaClient();
    this.stacksService = new StacksService();
    this.aiService = new AIService();
    this.ipfsService = new IPFSService();
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private async initializeServices(): Promise<void> {
    try {
      // Test database connection
      await this.prisma.$connect();
      console.log('✅ Database connected successfully');

      // Initialize Stacks service
      await this.stacksService.initialize();
      console.log('✅ Stacks service initialized');

      // Initialize AI service
      await this.aiService.initialize();
      console.log('✅ AI service initialized');

    } catch (error) {
      console.error('❌ Service initialization failed:', error);
      process.exit(1);
    }
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }));

    // CORS configuration
    this.app.use(cors({
      origin: config.cors.origins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Wallet-Address']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests from this IP, please try again later.'
      }
    });
    this.app.use(limiter);

    // API-specific rate limiting
    const aiLimiter = rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 10, // 10 AI requests per minute
      message: {
        error: 'AI processing rate limit exceeded. Please wait a moment.'
      }
    });

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression
    this.app.use(compression());

    // Logging
    if (config.nodeEnv !== 'test') {
      this.app.use(morgan('combined'));
    }
    this.app.use(requestLogger);
  }

  private initializeRoutes(): void {
    // Health check (no auth required)
    this.app.use('/health', healthRoutes);

    // API routes (auth required)
    this.app.use('/api/v1/invoices', authMiddleware, invoiceRoutes);
    this.app.use('/api/v1/ai', authMiddleware, aiRoutes);
    this.app.use('/api/v1/webhooks', webhookRoutes);

    // 404 handler
    this.app.use('*', (req: express.Request, res: express.Response) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    await this.initializeServices();
    
    const PORT = config.port;
    
    this.app.listen(PORT, () => {
      console.log(`
🚀 Smart Invoice Backend Server Started!
📍 Port: ${PORT}
🌍 Environment: ${config.nodeEnv}
📊 Database: Connected
⛓️  Blockchain: ${config.stacks.network}
🤖 AI Services: Enabled
      `);
    });
  }

  public async shutdown(): Promise<void> {
    console.log('🛑 Shutting down server gracefully...');
    
    try {
      await this.prisma.$disconnect();
      console.log('✅ Database disconnected');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new Server();
  server.start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', () => server.shutdown());
  process.on('SIGTERM', () => server.shutdown());
}

