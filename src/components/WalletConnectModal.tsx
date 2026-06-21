import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ isOpen, onClose }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const wallets = [
    {
      name: 'Sui Wallet',
      icon: '🔷',
      key: 'suiWallet',
      description: 'Official Sui Wallet (Recommended)',
    },
    {
      name: 'OKX Wallet',
      icon: '🟠',
      key: 'okxwallet',
      description: 'OKX Web3 Wallet',
    },
    {
      name: 'Suiet',
      icon: '🌙',
      key: 'suiet',
      description: 'Suiet Wallet',
    },
  ];

  const handleConnect = async (walletKey: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      const wallet = (window as any)[walletKey];

      if (!wallet) {
        setError(`${walletKey} not installed. Please install it first.`);
        setIsConnecting(false);
        return;
      }

      console.log(`🔔 Connecting to ${walletKey}...`);

      // Request connection
      const result = await (wallet.requestPermissions
        ? wallet.requestPermissions()
        : wallet.connect?.());

      const address = result?.accounts?.[0]?.address;

      if (!address) {
        setError('Failed to get wallet address');
        setIsConnecting(false);
        return;
      }

      console.log('✅ Connected:', address);

      // Login with wallet
      await login(address, address);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      console.error('Wallet error:', err);
      setError(msg);
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-black">Connect a Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Wallet Options */}
        <div className="space-y-3">
          {wallets.map((wallet) => (
            <button
              key={wallet.key}
              onClick={() => handleConnect(wallet.key)}
              disabled={isConnecting}
              className="w-full flex items-center gap-4 p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition disabled:opacity-50"
            >
              <span className="text-3xl">{wallet.icon}</span>
              <div className="text-left flex-1">
                <p className="font-semibold text-black text-lg">{wallet.name}</p>
                <p className="text-sm text-gray-600">{wallet.description}</p>
              </div>
              {isConnecting && <span className="text-gray-400">🔄</span>}
            </button>
          ))}
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            💡 <strong>Don't have a wallet?</strong> Install one of the wallets above to get started instantly.
          </p>
        </div>
      </div>
    </div>
  );
};
