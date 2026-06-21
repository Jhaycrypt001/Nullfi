import { prisma } from '../app';
import jwt from 'jsonwebtoken';
import { verifyPersonalMessageSignature } from '@mysten/sui.js/verify';

interface AuthPayload {
  userId: string;
  walletAddress: string;
}

export class AuthService {
  static generateToken(userId: string, walletAddress: string): string {
    const payload: AuthPayload = {
      userId,
      walletAddress,
    };

    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRY || '7d',
    });
  }

  static verifyToken(token: string): AuthPayload | null {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
    } catch (error) {
      return null;
    }
  }

  static async authenticateWallet(
    walletAddress: string,
    message: string,
    signature: string,
    publicKey: string,
  ) {
    try {
      // Validate inputs
      if (!walletAddress || walletAddress.length < 10) {
        throw new Error('Invalid wallet address');
      }

      if (!signature || signature.length < 10) {
        throw new Error('Invalid signature');
      }

      if (!publicKey || publicKey.length < 10) {
        throw new Error('Invalid public key');
      }

      // Validate wallet address format (Sui addresses)
      if (!this.isValidSuiAddress(walletAddress)) {
        throw new Error('Invalid Sui wallet address format');
      }

      // TODO: Verify Sui wallet signature using @mysten/sui.js verifyPersonalMessageSignature
      // For production, uncomment and use:
      // try {
      //   const isValid = await verifyPersonalMessageSignature(
      //     new TextEncoder().encode(message),
      //     signature,
      //     publicKey
      //   );
      //   if (!isValid) {
      //     throw new Error('Invalid signature - verification failed');
      //   }
      // } catch (e) {
      //   throw new Error('Signature verification failed: ' + (e as Error).message);
      // }

      // For now, basic validation (in production use real signature verification above)
      if (!signature.includes('_') && signature.length < 20) {
        throw new Error('Invalid signature format');
      }

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { walletAddress },
        include: { creditScore: true },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            walletAddress,
            creditScore: {
              create: {
                rating: 50,
                tier: 'TIER_4',
                borrowLimit: 0n,
              },
            },
          },
          include: { creditScore: true },
        });
      }

      // Generate JWT token
      const token = this.generateToken(user.id, walletAddress);

      return {
        user,
        token,
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  static async walletLogin(walletAddress: string) {
    try {
      // Validate input
      if (!walletAddress || walletAddress.length < 10) {
        throw new Error('Invalid wallet address');
      }

      if (!this.isValidSuiAddress(walletAddress)) {
        throw new Error('Invalid Sui wallet address format');
      }

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { walletAddress },
        include: { creditScore: true },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            walletAddress,
            email: `${walletAddress}@nullfi.local`,
            username: `user_${walletAddress.slice(0, 8)}`,
            creditScore: {
              create: {
                rating: 50,
                tier: 'TIER_4',
                borrowLimit: 0n,
              },
            },
          },
          include: { creditScore: true },
        });
      }

      // Generate JWT token
      const token = this.generateToken(user.id, walletAddress);

      return {
        user,
        token,
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  private static isValidSuiAddress(address: string): boolean {
    // Sui addresses are 0x + 64 hex characters
    const suiAddressRegex = /^0x[a-fA-F0-9]{64}$/;
    return suiAddressRegex.test(address);
  }

  static async generateSignMessage(): Promise<string> {
    const timestamp = Date.now();
    return `Sign this message to authenticate with Nullfi:\nTimestamp: ${timestamp}`;
  }

  static async signupUser(
    walletAddress: string,
    email: string,
    username: string,
  ) {
    try {
      // Validate input
      if (!walletAddress || !email || !username) {
        throw new Error('Missing required fields');
      }

      // Check if user already exists by email
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        throw new Error('Email already registered');
      }

      // Check if username already exists
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUsername) {
        throw new Error('Username already taken');
      }

      // Check if wallet already exists
      const existingWallet = await prisma.user.findUnique({
        where: { walletAddress },
      });

      if (existingWallet) {
        throw new Error('Wallet address already registered');
      }

      // Create new user with credit score
      const user = await prisma.user.create({
        data: {
          walletAddress,
          email,
          username,
          creditScore: {
            create: {
              rating: 50,
              tier: 'TIER_4',
              borrowLimit: 0n,
            },
          },
        },
        include: { creditScore: true },
      });

      return {
        success: true,
        user,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
}
