import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Validate Sui wallet address format
  const isValidSuiAddress = (address: string): boolean => {
    const suiAddressRegex = /^0x[a-fA-F0-9]{64}$/;
    return suiAddressRegex.test(address);
  };

  // Real Sui wallet connection
  const handleConnectWallet = async () => {
    setIsConnectingWallet(true);
    setError('');

    try {
      const anyWindow = window as any;

      // Try Sui Wallet (standard method)
      if (anyWindow.suiWallet) {
        try {
          const accounts = await anyWindow.suiWallet.requestPermissions();
          if (accounts?.accounts && accounts.accounts.length > 0) {
            const suiAddress = accounts.accounts[0].address;
            if (!isValidSuiAddress(suiAddress)) {
              throw new Error('Invalid Sui wallet address format');
            }
            setWalletAddress(suiAddress);
            setWalletConnected(true);
            return;
          }
        } catch (e) {
          console.log('Sui Wallet attempt failed:', e);
        }
      }

      // Try OKX Wallet
      if (anyWindow.okxwallet?.sui) {
        try {
          const accounts = await anyWindow.okxwallet.sui.requestPermissions();
          if (accounts?.accounts && accounts.accounts.length > 0) {
            const suiAddress = accounts.accounts[0].address;
            if (!isValidSuiAddress(suiAddress)) {
              throw new Error('Invalid Sui wallet address format');
            }
            setWalletAddress(suiAddress);
            setWalletConnected(true);
            return;
          }
        } catch (e) {
          console.log('OKX Wallet attempt failed:', e);
        }
      }

      // Try Martian Wallet
      if (anyWindow.martian) {
        try {
          const accounts = await anyWindow.martian.requestPermissions();
          if (accounts?.accounts && accounts.accounts.length > 0) {
            const suiAddress = accounts.accounts[0].address;
            if (!isValidSuiAddress(suiAddress)) {
              throw new Error('Invalid Sui wallet address format');
            }
            setWalletAddress(suiAddress);
            setWalletConnected(true);
            return;
          }
        } catch (e) {
          console.log('Martian Wallet attempt failed:', e);
        }
      }

      // Try wallet standard method
      if (anyWindow.suiWallet?.requestAccounts) {
        try {
          const accounts = await anyWindow.suiWallet.requestAccounts();
          if (accounts && accounts.length > 0) {
            const suiAddress = accounts[0];
            if (!isValidSuiAddress(suiAddress)) {
              throw new Error('Invalid Sui wallet address format');
            }
            setWalletAddress(suiAddress);
            setWalletConnected(true);
            return;
          }
        } catch (e) {
          console.log('requestAccounts attempt failed:', e);
        }
      }

      throw new Error(
        'No Sui wallet detected or connection failed. Please install Sui Wallet, OKX Wallet, or Martian Wallet and try again.'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      console.error('Wallet connection error:', err);
    } finally {
      setIsConnectingWallet(false);
    }
  };

  // Real Sui wallet message signing
  const handleSignMessage = async (): Promise<{ signature: string; publicKey: string } | null> => {
    try {
      const anyWindow = window as any;

      if (!walletAddress) {
        throw new Error('Wallet not connected');
      }

      // Get message to sign
      const messageResponse = await api.getAuthMessage();
      if (!messageResponse.message) {
        throw new Error('Failed to get auth message');
      }

      const message = messageResponse.message;

      // Try to sign with connected wallet (real signing)
      let wallet = null;

      // Detect which wallet is connected
      if (anyWindow.suiWallet) {
        wallet = anyWindow.suiWallet;
      } else if (anyWindow.okxwallet?.sui) {
        wallet = anyWindow.okxwallet.sui;
      } else if (anyWindow.martian) {
        wallet = anyWindow.martian;
      }

      if (!wallet) {
        throw new Error('No Sui wallet detected');
      }

      // Sign message with the wallet
      const messageBytes = new TextEncoder().encode(message);

      let signedData;
      try {
        // Try standard Sui wallet signing method
        signedData = await wallet.signMessage({
          message: messageBytes,
        });
      } catch (e) {
        // Try alternative method names
        try {
          signedData = await wallet.signPersonalMessage?.({
            message: messageBytes,
          });
        } catch (e2) {
          throw new Error('Wallet signing not supported. Please use Sui Wallet, OKX Wallet, or Martian Wallet.');
        }
      }

      if (!signedData || !signedData.signature) {
        throw new Error('No signature returned from wallet');
      }

      return {
        signature: signedData.signature,
        publicKey: signedData.publicKey || walletAddress,
      };
    } catch (err) {
      console.error('Message signing error:', err);
      throw err;
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validation
      if (!walletAddress.trim()) {
        throw new Error('Please connect your Sui wallet first');
      }

      if (!isValidSuiAddress(walletAddress)) {
        throw new Error('Invalid Sui wallet address format');
      }

      if (isSignUp) {
        // Sign Up validation
        if (!email.trim() || !username.trim()) {
          throw new Error('Email and username are required');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new Error('Please enter a valid email address');
        }

        // Call backend signup endpoint
        const signupResponse = await api.signup({
          walletAddress,
          email,
          username,
        });

        if (!signupResponse.success) {
          throw new Error(signupResponse.error || 'Sign up failed');
        }
      } else {
        // Sign In validation
        if (!email.trim()) {
          throw new Error('Email is required to sign in');
        }
      }

      // Get message and sign with real wallet
      setError('Please sign the message in your wallet popup...');
      const signResult = await handleSignMessage();

      if (!signResult) {
        throw new Error('Wallet signature failed. Please try again.');
      }

      // Get fresh message for authentication
      const messageResponse = await api.getAuthMessage();
      const message = messageResponse.message;

      // Call backend with REAL signature
      setError('');
      await login(walletAddress, message, signResult.signature, signResult.publicKey);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectWallet = () => {
    setWalletAddress('');
    setWalletConnected(false);
  };

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation spacing */}
      <div className="h-16 sm:h-20"></div>

      {/* Content */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="max-w-sm mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3 leading-tight">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h1>
            <p className="text-white/60 text-sm sm:text-base md:text-base leading-relaxed">
              {isSignUp ? 'Join Nullfi today' : 'Connect your Sui wallet to continue'}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-7 md:p-8 backdrop-blur-sm w-full">
            <form onSubmit={handleAuth} className="space-y-4 sm:space-y-5 md:space-y-6">
              {/* Email */}
              <div className="w-full">
                <label className="block text-xs sm:text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition"
                  disabled={isLoading}
                />
              </div>

              {/* Username (Sign Up only) */}
              {isSignUp && (
                <div className="w-full">
                  <label className="block text-xs sm:text-sm font-medium text-white mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a unique username"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition"
                    disabled={isLoading || isConnectingWallet}
                  />
                </div>
              )}

              {/* Wallet Address */}
              <div className="w-full">
                <label className="block text-xs sm:text-sm font-medium text-white mb-2">
                  Sui Wallet Address
                </label>
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  {walletConnected && walletAddress ? (
                    <>
                      <div className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-green-500/10 border border-green-500/30 rounded-lg sm:rounded-xl text-green-300 text-sm sm:text-base font-mono overflow-hidden text-ellipsis">
                        {walletAddress}
                      </div>
                      <button
                        type="button"
                        onClick={handleDisconnectWallet}
                        className="px-4 sm:px-5 py-2.5 sm:py-3 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg sm:rounded-xl transition disabled:opacity-50 text-xs sm:text-sm whitespace-nowrap"
                        disabled={isLoading}
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleConnectWallet}
                      className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 bg-white text-black font-semibold rounded-lg sm:rounded-xl hover:bg-white/90 transition disabled:opacity-50 text-xs sm:text-sm w-full sm:w-auto"
                      disabled={isLoading || isConnectingWallet}
                    >
                      {isConnectingWallet ? 'Connecting...' : 'Connect Sui Wallet'}
                    </button>
                  )}
                </div>
                <p className="text-white/40 text-xs mt-2">
                  🔐 Supports: Sui Wallet, OKX Wallet, Martian Wallet
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-lg sm:rounded-xl text-red-300 text-xs sm:text-sm w-full">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !walletAddress || !email || isConnectingWallet}
                className="w-full px-4 sm:px-4 py-2.5 sm:py-3 bg-white text-black font-semibold rounded-lg sm:rounded-xl hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6 sm:mt-8 text-sm sm:text-base"
              >
                {isLoading ? (isSignUp ? 'Creating Account...' : 'Signing in...') : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            {/* Toggle Sign Up / Sign In */}
            <div className="mt-6 sm:mt-6 md:mt-8 text-center text-white/60 text-xs sm:text-sm">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setUsername('');
                }}
                className="text-white hover:text-white/70 font-semibold transition"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 sm:mt-8 md:mt-10 text-white/40 text-xs sm:text-sm">
            <p>🚀 Real Sui Wallet Integration - PostgreSQL Backend</p>
          </div>
        </div>
      </section>
    </main>
  );
};
