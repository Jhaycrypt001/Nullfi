import React from 'react';
import { useWallet } from '@suiet/wallet-kit';

export const SimpleGetStartedButton: React.FC = () => {
  const wallet = useWallet();
  const [isConnecting, setIsConnecting] = React.useState(false);

  const handleClick = async () => {
    setIsConnecting(true);
    try {
      if (wallet.connected) {
        await wallet.disconnect();
      } else {
        await wallet.connect();
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isConnecting}
      className="px-6 py-2.5 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition text-sm whitespace-nowrap disabled:opacity-50"
    >
      {isConnecting ? '🔄 Connecting...' : '🔐 Get Started'}
    </button>
  );
};
