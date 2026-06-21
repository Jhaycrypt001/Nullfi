import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';

const router = Router();

// GET /api/auth/message
// Get a message to sign for authentication
router.get('/message', async (req: Request, res: Response) => {
  try {
    const message = await AuthService.generateSignMessage();
    res.json({
      message,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate message' });
  }
});

// POST /api/auth/verify-signature
// Verify wallet signature and return JWT
router.post('/verify-signature', async (req: Request, res: Response) => {
  try {
    const { walletAddress, message, signature, publicKey } = req.body;

    if (!walletAddress || !message || !signature || !publicKey) {
      return res.status(400).json({
        error: 'Missing required fields: walletAddress, message, signature, publicKey',
      });
    }

    const result = await AuthService.authenticateWallet(
      walletAddress,
      message,
      signature,
      publicKey,
    );

    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    res.json({
      success: true,
      user: {
        id: result.user!.id,
        walletAddress: result.user!.walletAddress,
        email: result.user!.email,
        username: result.user!.username,
      },
      creditScore: result.user!.creditScore,
      token: result.token,
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// GET /api/auth/verify-token
// Verify JWT token
router.get('/verify-token', (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }

    const payload = AuthService.verifyToken(token);

    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    res.json({
      valid: true,
      payload,
    });
  } catch (error) {
    res.status(500).json({ error: 'Token verification failed' });
  }
});

// POST /api/auth/wallet-login
// Simple wallet login - auto-create user if doesn't exist
router.post('/wallet-login', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    const result = await AuthService.walletLogin(walletAddress);

    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    res.json({
      success: true,
      user: {
        id: result.user!.id,
        walletAddress: result.user!.walletAddress,
        email: result.user!.email,
        username: result.user!.username,
      },
      creditScore: result.user!.creditScore,
      token: result.token,
    });
  } catch (error) {
    console.error('Wallet login error:', error);
    res.status(500).json({ error: 'Wallet login failed' });
  }
});

// POST /api/auth/signup
// Register a new user
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { walletAddress, email, username } = req.body;

    if (!walletAddress || !email || !username) {
      return res.status(400).json({
        error: 'Missing required fields: walletAddress, email, username',
      });
    }

    const result = await AuthService.signupUser(walletAddress, email, username);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      message: 'User registered successfully. Please sign in.',
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

export default router;
