import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export class TwoFactorService {
  // Generate a new 2FA secret and QR code
  static async generateSecret(walletAddress: string, email: string) {
    try {
      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `Nullfi (${email})`,
        issuer: 'Nullfi',
        length: 32,
      });

      // Generate QR code as data URL
      const qrCode = await QRCode.toDataURL(secret.otpauth_url || '');

      return {
        secret: secret.base32,
        qrCode,
        backupCodes: this.generateBackupCodes(10),
      };
    } catch (error) {
      throw new Error('Failed to generate 2FA secret: ' + (error as Error).message);
    }
  }

  // Verify TOTP code
  static verifyToken(secret: string, token: string): boolean {
    try {
      const cleanToken = String(token).replace(/\D/g, '').slice(0, 6);
      console.log('verifyToken - Secret encoding: base32, Token:', cleanToken, 'Window: 2');

      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token: cleanToken,
        window: 2, // Allow 2 windows of time drift (±1 minute)
      });

      console.log('speakeasy result:', verified);
      return !!verified;
    } catch (error) {
      console.error('2FA verification error:', error);
      return false;
    }
  }

  // Generate backup codes for account recovery
  static generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  // Verify backup code
  static verifyBackupCode(backupCodes: string[], code: string): boolean {
    return backupCodes.includes(code.toUpperCase());
  }

  // Remove used backup code
  static removeBackupCode(backupCodes: string[], code: string): string[] {
    return backupCodes.filter(c => c !== code.toUpperCase());
  }
}
