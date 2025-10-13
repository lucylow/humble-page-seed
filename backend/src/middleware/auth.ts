import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

const logger = new Logger('AuthMiddleware');

export interface AuthRequest extends Request {
  walletAddress?: string;
  user?: any;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract wallet address from various sources
    const walletAddress = 
      req.headers['x-wallet-address'] as string ||
      req.body.walletAddress ||
      req.query.walletAddress as string;

    if (!walletAddress) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Wallet address not provided'
      });
      return;
    }

    // Validate wallet address format (basic validation)
    if (!isValidStacksAddress(walletAddress)) {
      res.status(401).json({
        success: false,
        error: 'Invalid wallet address',
        message: 'Provided wallet address is not a valid Stacks address'
      });
      return;
    }

    // Attach wallet address to request
    req.walletAddress = walletAddress;
    req.body.walletAddress = walletAddress;

    logger.debug('Request authenticated', { walletAddress });
    next();

  } catch (error: any) {
    logger.error('Authentication failed', { error });
    res.status(500).json({
      success: false,
      error: 'Authentication error',
      message: error.message
    });
  }
};

function isValidStacksAddress(address: string): boolean {
  // Basic Stacks address validation
  // Mainnet addresses start with SP, Testnet with ST
  return /^(SP|ST)[0-9A-Z]{38,41}$/.test(address);
}

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const walletAddress = 
      req.headers['x-wallet-address'] as string ||
      req.body.walletAddress ||
      req.query.walletAddress as string;

    if (walletAddress && isValidStacksAddress(walletAddress)) {
      req.walletAddress = walletAddress;
      req.body.walletAddress = walletAddress;
    }

    next();
  } catch (error) {
    next();
  }
};

