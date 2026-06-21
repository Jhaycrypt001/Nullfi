import React from 'react';
import { useWallet } from '@suiet/wallet-kit';
import { useAuth } from '@/context/AuthContext';

interface GetStartedButtonProps {
  className?: string;
  variant?: 'white' | 'gradient';
}

export const GetStartedButton: React.FC<GetStartedButtonProps> = ({
  className = '',
  variant = 'white',
}) => {
  const wallet = useWallet();
  const { login, isAuthenticated } = useAuth();
  const [isConnecting, setIsConnecting] = React.useState(false);

  // Auto-login when wallet connects
  React.useEffect(() => {
    if (wallet.connected && wallet.address && !isAuthenticated) {
      login(wallet.address, wallet.address);
    }
  }, [wallet.connected, wallet.address, isAuthenticated, login]);

  const handleClick = async () => {
    if (wallet.connected) {
      await wallet.disconnect();
    } else {
      setIsConnecting(true);
      try {
        await wallet.connect();
      } finally {
        setIsConnecting(false);
      }
    }
  };

  const baseClass =
    variant === 'white'
      ? 'px-6 py-2.5 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition text-sm whitespace-nowrap'
      : 'w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all text-sm';

  return (
    <button
      onClick={handleClick}
      disabled={isConnecting}
      className={`${baseClass} ${className} disabled:opacity-50`}
    >
      {isConnecting ? '🔄 Connecting...' : wallet.connected ? 'Disconnect' : '🔐 Get Started'}
    </button>
  );
};
