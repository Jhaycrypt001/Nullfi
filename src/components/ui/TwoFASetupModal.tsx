import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import { X, Copy, Check } from 'lucide-react';

interface TwoFASetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (token: string) => Promise<void>;
  qrCode: string;
  secret: string;
  backupCodes: string[];
  isLoading: boolean;
}

export const TwoFASetupModal: React.FC<TwoFASetupModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  qrCode,
  secret,
  backupCodes,
  isLoading,
}) => {
  const [step, setStep] = useState<'scan' | 'verify' | 'backup'>('scan');
  const [token, setToken] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async () => {
    if (token.length !== 6) {
      alert('Please enter a 6-digit code');
      return;
    }
    try {
      await onVerify(token);
      setStep('backup');
    } catch (error) {
      alert('Invalid authenticator code. Please try again.');
      setToken('');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(codesText));
    element.setAttribute('download', 'nullfi-backup-codes.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black border border-white/10 rounded-2xl max-w-md w-full p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Enable Two-Factor Authentication</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-white/60 hover:text-white transition p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Step: Scan QR Code */}
        {step === 'scan' && (
          <div className="space-y-6">
            <div>
              <p className="text-white/80 text-sm mb-4">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)
              </p>
              <div className="bg-white p-4 rounded-lg flex justify-center">
                {qrCode && <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />}
              </div>
            </div>

            {/* Manual Secret */}
            <div>
              <p className="text-white/60 text-xs mb-2">Can't scan? Enter this code manually:</p>
              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/80 text-sm font-mono break-all">
                  {secret}
                </div>
                <button
                  onClick={() => copyToClipboard(secret)}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
                  title="Copy secret"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <button
              onClick={() => setStep('verify')}
              disabled={isLoading}
              className="w-full px-4 py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition disabled:opacity-50"
            >
              Next: Verify Code
            </button>
          </div>
        )}

        {/* Step: Verify */}
        {step === 'verify' && (
          <div className="space-y-6">
            <div>
              <p className="text-white/80 text-sm mb-4">
                Enter the 6-digit code from your authenticator app to verify:
              </p>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-white/30 focus:bg-white/10 transition"
                disabled={isLoading}
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep('scan')}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleVerify}
                disabled={isLoading || token.length !== 6}
                className="flex-1 px-4 py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>
        )}

        {/* Step: Backup Codes */}
        {step === 'backup' && (
          <div className="space-y-6">
            <div>
              <p className="text-white/80 text-sm mb-4">
                🔐 Save these backup codes in a safe place. You can use them to access your account if you lose access to your authenticator app.
              </p>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 max-h-48 overflow-y-auto">
                {backupCodes.map((code, idx) => (
                  <div key={idx} className="text-white/80 font-mono text-sm py-1 px-2 hover:bg-white/5 cursor-pointer flex items-center">
                    <span className="mr-3 text-white/40">{idx + 1}</span>
                    <span
                      onClick={() => copyToClipboard(code)}
                      className="flex-1 hover:text-white transition"
                      title="Click to copy"
                    >
                      {code}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={downloadBackupCodes}
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition text-sm"
            >
              📥 Download Backup Codes
            </button>

            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition"
            >
              ✅ Setup Complete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
