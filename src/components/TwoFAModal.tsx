import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface TwoFAModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: string;
  secret: string;
  backupCodes: string[];
  onVerify: (code: string) => Promise<void>;
  isLoading: boolean;
}

export const TwoFAModal: React.FC<TwoFAModalProps> = ({
  isOpen,
  onClose,
  qrCode,
  secret,
  backupCodes,
  onVerify,
  isLoading,
}) => {
  const [step, setStep] = useState<'scan' | 'verify' | 'done'>('scan');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleVerify = async () => {
    setError('');
    if (code.length !== 6) {
      setError('Enter 6-digit code');
      return;
    }
    try {
      // Convert code to number to ensure proper format
      const numericCode = String(parseInt(code, 10)).padStart(6, '0');
      console.log('Verifying code:', numericCode, 'Length:', numericCode.length);
      await onVerify(numericCode);
      setStep('done');
    } catch (e) {
      console.error('Verification error:', e);
      setError('Invalid code. Try again. Make sure your phone time is synced.');
      setCode('');
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCodes = () => {
    const text = backupCodes.join('\n');
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', 'nullfi-backup-codes.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-center justify-center p-4">
      <div className="bg-black border border-white/10 rounded-2xl w-full max-w-md p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Enable 2FA</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white p-1">
            <X size={24} />
          </button>
        </div>

        {step === 'scan' && (
          <div className="space-y-6">
            <p className="text-white/80 text-sm">Scan with Google Authenticator, Authy, or Microsoft Authenticator</p>
            {qrCode && (
              <div className="bg-white p-4 rounded-lg flex justify-center">
                <img src={qrCode} alt="2FA QR" className="w-40 h-40" />
              </div>
            )}
            <div>
              <p className="text-white/60 text-xs mb-2">Manual entry code:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={secret}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-white/80 text-sm font-mono text-center"
                />
                <button
                  onClick={copySecret}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded transition"
                >
                  {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            <button
              onClick={() => setStep('verify')}
              className="w-full px-4 py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition"
            >
              Next
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-6">
            <p className="text-white/80 text-sm">Enter 6-digit code from your authenticator app</p>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              autoFocus
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded text-white text-center text-3xl font-mono tracking-widest focus:outline-none focus:border-white/30"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setStep('scan');
                  setCode('');
                  setError('');
                }}
                className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
              >
                Back
              </button>
              <button
                onClick={handleVerify}
                disabled={isLoading || code.length !== 6}
                className="flex-1 px-4 py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="space-y-6">
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-300 font-semibold">✅ 2FA Enabled!</p>
            </div>
            <div>
              <p className="text-white/80 text-sm mb-3">Save backup codes (one-time use only):</p>
              <div className="bg-white/5 border border-white/10 rounded p-3 max-h-40 overflow-y-auto space-y-1">
                {backupCodes.map((c, i) => (
                  <p key={i} className="text-white/70 font-mono text-xs">
                    {c}
                  </p>
                ))}
              </div>
            </div>
            <button
              onClick={downloadCodes}
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition text-sm"
            >
              📥 Download Codes
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
