import { Router, Request, Response } from 'express';
import { prisma } from '../app';
import crypto from 'crypto';
import { TwoFactorService } from '../services/twoFactorService';

const router = Router();

// Middleware to verify auth token
const verifyAuth = async (req: Request, res: Response, next: Function) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    // Token validation would happen here - for now trust the frontend
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// GET /api/user/profile
// Get user profile
router.get('/profile', verifyAuth, async (req: Request, res: Response) => {
  try {
    const walletAddress = req.query.walletAddress as string;
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress },
      include: {
        creditScore: true,
        settings: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        email: user.email,
        username: user.username,
        displayName: user.displayName || user.username,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
      creditScore: user.creditScore,
      settings: user.settings,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/user/profile
// Update user profile
router.put('/profile', verifyAuth, async (req: Request, res: Response) => {
  try {
    const { walletAddress, displayName, profileImage } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    const user = await prisma.user.update({
      where: { walletAddress },
      data: {
        displayName: displayName || undefined,
        profileImage: profileImage || undefined,
      },
      include: { creditScore: true },
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// DELETE /api/user/account
// Permanently delete user account
router.delete('/account', verifyAuth, async (req: Request, res: Response) => {
  try {
    const { walletAddress, confirmation } = req.body;

    if (!walletAddress || confirmation !== 'DELETE_ACCOUNT') {
      return res.status(400).json({ error: 'Invalid deletion request' });
    }

    // Delete all related data
    await prisma.escrow.deleteMany({
      where: { clientAddress: walletAddress },
    });

    await prisma.borrow.deleteMany({
      where: { userAddress: walletAddress },
    });

    await prisma.creditScore.deleteMany({
      where: { userId: (await prisma.user.findUnique({
        where: { walletAddress },
      }))?.id },
    });

    await prisma.user.delete({
      where: { walletAddress },
    });

    res.json({
      success: true,
      message: 'Account permanently deleted',
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// GET /api/user/api-key
// Get or create API key
router.get('/api-key', verifyAuth, async (req: Request, res: Response) => {
  try {
    const walletAddress = req.query.walletAddress as string || req.headers['x-wallet-address'] as string;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    let user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate if doesn't exist
    if (!user.apiKey) {
      const apiKey = 'sk_live_' + crypto.randomBytes(32).toString('hex');
      user = await prisma.user.update({
        where: { walletAddress },
        data: { apiKey },
      });
    }

    res.json({
      success: true,
      apiKey: user.apiKey,
    });
  } catch (error) {
    console.error('Error getting API key:', error);
    res.status(500).json({ error: 'Failed to get API key' });
  }
});

// POST /api/user/api-key
// Regenerate API key
router.post('/api-key', verifyAuth, async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new API key
    const apiKey = 'sk_live_' + crypto.randomBytes(32).toString('hex');

    await prisma.user.update({
      where: { walletAddress },
      data: { apiKey },
    });

    res.json({
      success: true,
      apiKey,
    });
  } catch (error) {
    console.error('Error regenerating API key:', error);
    res.status(500).json({ error: 'Failed to regenerate API key' });
  }
});

// PUT /api/user/settings
// Update user settings
router.put('/settings', async (req: Request, res: Response) => {
  try {
    const { walletAddress, settings } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create or update settings (only notification/profile settings, not 2FA)
    const updatedSettings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {
        emailNotifications: settings.emailNotifications ?? undefined,
        transactionAlerts: settings.transactionAlerts ?? undefined,
        publicProfile: settings.publicProfile ?? undefined,
        theme: settings.theme ?? undefined,
      },
      create: {
        userId: user.id,
        emailNotifications: settings.emailNotifications ?? true,
        transactionAlerts: settings.transactionAlerts ?? true,
        publicProfile: settings.publicProfile ?? false,
        theme: settings.theme ?? 'dark',
      },
    });

    res.json({
      success: true,
      settings: updatedSettings,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// GET /api/user/public-profile/:username
// Fetch public profile (only if public)
router.get('/public-profile/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ error: 'Username required' });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: { creditScore: true, settings: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if profile is public
    if (!user.settings?.publicProfile) {
      return res.status(403).json({ error: 'This profile is private' });
    }

    // Calculate account age in days
    const accountAgeDays = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    res.json({
      success: true,
      profile: {
        username: user.username,
        displayName: user.displayName || user.username,
        profileImage: user.profileImage,
        creditScore: user.creditScore?.rating || 0,
        tier: user.creditScore?.tier || 'TIER_4',
        accountAgeDays,
        totalCompleted: user.creditScore?.totalCompleted || 0,
        totalEarned: user.creditScore?.totalEarned || 0,
        onTimeReleases: user.creditScore?.onTimeReleases || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// GET /api/user/settings
// Get user settings
router.get('/settings', async (req: Request, res: Response) => {
  try {
    const walletAddress = req.query.walletAddress as string || req.headers['x-wallet-address'] as string;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let settings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId: user.id,
          theme: 'dark',
          emailNotifications: true,
          transactionAlerts: true,
          publicProfile: false,
        },
      });
    }

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// POST /api/user/2fa/setup
// Generate 2FA secret and QR code
router.post('/2fa/setup', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate 2FA secret and QR code
    const { secret, qrCode, backupCodes } = await TwoFactorService.generateSecret(
      walletAddress,
      user.email || walletAddress,
    );

    res.json({
      success: true,
      secret,
      qrCode,
      backupCodes,
      message: 'Scan QR code with authenticator app',
    });
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    res.status(500).json({ error: 'Failed to setup 2FA' });
  }
});

// POST /api/user/2fa/verify
// Verify TOTP code and enable 2FA
router.post('/2fa/verify', async (req: Request, res: Response) => {
  try {
    const { walletAddress, token, secret, backupCodes } = req.body;

    if (!walletAddress || !token || !secret) {
      return res.status(400).json({ error: 'Wallet address, token, and secret required' });
    }

    // Ensure token is string of 6 digits
    const cleanToken = String(token).trim();
    console.log('2FA Verify - Token:', cleanToken, 'Length:', cleanToken.length, 'Secret length:', secret.length);

    // Verify TOTP token
    const isValid = TwoFactorService.verifyToken(secret, cleanToken);
    console.log('2FA Verification result:', isValid, 'with token:', cleanToken);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid authenticator code' });
    }

    // Save 2FA to user
    const user = await prisma.user.update({
      where: { walletAddress },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        twoFactorBackupCodes: JSON.stringify(backupCodes || []),
      },
    });

    res.json({
      success: true,
      message: '2FA enabled successfully',
      twoFactorEnabled: user.twoFactorEnabled,
    });
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    res.status(500).json({ error: 'Failed to verify 2FA' });
  }
});

// POST /api/user/2fa/validate
// Validate TOTP during login
router.post('/2fa/validate', async (req: Request, res: Response) => {
  try {
    const { walletAddress, token } = req.body;

    if (!walletAddress || !token) {
      return res.status(400).json({ error: 'Wallet address and token required' });
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ error: '2FA not enabled' });
    }

    // Try TOTP code first
    const isValidTOTP = TwoFactorService.verifyToken(user.twoFactorSecret, token);

    if (isValidTOTP) {
      return res.json({
        success: true,
        valid: true,
        message: 'Valid authenticator code',
      });
    }

    // Try backup code
    const backupCodes = user.twoFactorBackupCodes ? JSON.parse(user.twoFactorBackupCodes) : [];
    const isValidBackup = TwoFactorService.verifyBackupCode(backupCodes, token);

    if (isValidBackup) {
      // Remove used backup code
      const updatedCodes = TwoFactorService.removeBackupCode(backupCodes, token);
      await prisma.user.update({
        where: { walletAddress },
        data: { twoFactorBackupCodes: JSON.stringify(updatedCodes) },
      });

      return res.json({
        success: true,
        valid: true,
        message: 'Valid backup code (one-time use)',
      });
    }

    res.status(401).json({
      success: false,
      valid: false,
      error: 'Invalid authenticator code',
    });
  } catch (error) {
    console.error('Error validating 2FA:', error);
    res.status(500).json({ error: 'Failed to validate 2FA' });
  }
});

// POST /api/user/2fa/disable
// Disable 2FA
router.post('/2fa/disable', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    await prisma.user.update({
      where: { walletAddress },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null,
      },
    });

    res.json({
      success: true,
      message: '2FA disabled',
    });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    res.status(500).json({ error: 'Failed to disable 2FA' });
  }
});

export default router;
