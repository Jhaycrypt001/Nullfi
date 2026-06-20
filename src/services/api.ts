const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    walletAddress: string;
    email?: string;
    username?: string;
  };
  creditScore?: {
    rating: number;
    tier: string;
  };
  token?: string;
  error?: string;
}

export interface MessageResponse {
  message: string;
  timestamp: number;
}

class ApiClient {
  private baseURL = API_URL;
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      try {
        const error = await response.json();
        console.error('API Error Response:', error);
        throw new Error(error.error || error.message || 'API request failed');
      } catch (e) {
        console.error('Failed to parse error response:', e);
        throw new Error(`API Error ${response.status}: ${response.statusText}`);
      }
    }

    return response.json();
  }

  // Auth endpoints
  async getAuthMessage(): Promise<MessageResponse> {
    return this.request('/api/auth/message', { method: 'GET' });
  }

  async verifySignature(
    walletAddress: string,
    message: string,
    signature: string,
    publicKey: string
  ): Promise<AuthResponse> {
    const response = await this.request('/api/auth/verify-signature', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, message, signature, publicKey }),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async verifyToken(): Promise<{ valid: boolean; payload?: any }> {
    return this.request('/api/auth/verify-token', { method: 'GET' });
  }

  async signup(data: { walletAddress: string; email: string; username: string }): Promise<any> {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Credit Score endpoints - REAL Sui blockchain
  async getCreditScore(walletAddress?: string): Promise<any> {
    const endpoint = walletAddress
      ? `/api/credit-score/me?walletAddress=${walletAddress}`
      : '/api/credit-score/me';
    return this.request(endpoint, { method: 'GET' });
  }

  async rateUser(ratedId: string, escrowId: string, rating: number, comment?: string): Promise<any> {
    return this.request('/api/credit-score/rate', {
      method: 'POST',
      body: JSON.stringify({ ratedId, escrowId, rating, comment }),
    });
  }

  // Escrow endpoints - REAL Sui blockchain
  async createEscrow(escrowData: any): Promise<any> {
    return this.request('/api/escrow/create', {
      method: 'POST',
      body: JSON.stringify(escrowData),
    });
  }

  async getEscrows(walletAddress: string): Promise<any> {
    return this.request(`/api/escrow?walletAddress=${walletAddress}`, { method: 'GET' });
  }

  async getEscrow(escrowId: string): Promise<any> {
    return this.request(`/api/escrow/${escrowId}`, { method: 'GET' });
  }

  async releaseMilestone(escrowId: string, milestoneNum: number, clientAddress: string): Promise<any> {
    return this.request(`/api/escrow/${escrowId}/release-milestone`, {
      method: 'POST',
      body: JSON.stringify({ clientAddress, milestoneNum }),
    });
  }

  async disputeEscrow(escrowId: string, reason: string, initiatorAddress: string): Promise<any> {
    return this.request(`/api/escrow/${escrowId}/dispute`, {
      method: 'POST',
      body: JSON.stringify({ initiatorAddress, reason }),
    });
  }

  // Borrow endpoints - REAL Sui blockchain
  async createBorrow(walletAddress: string, borrowAmount: number, durationDays: number): Promise<any> {
    return this.request('/api/borrow/create', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, borrowAmount, durationDays }),
    });
  }

  async getBorrows(walletAddress: string): Promise<any> {
    return this.request(`/api/borrow?walletAddress=${walletAddress}`, { method: 'GET' });
  }

  async getBorrow(borrowId: string): Promise<any> {
    return this.request(`/api/borrow/${borrowId}`, { method: 'GET' });
  }

  async repayBorrow(borrowId: string, walletAddress: string, repayAmount: number): Promise<any> {
    return this.request(`/api/borrow/${borrowId}/repay`, {
      method: 'POST',
      body: JSON.stringify({ walletAddress, repayAmount }),
    });
  }

  // Transaction endpoints
  async getTransactions(): Promise<any> {
    return this.request('/api/transactions', { method: 'GET' });
  }

  // User settings endpoints
  async getUserSettings(walletAddress: string): Promise<any> {
    return this.request(`/api/user/settings?walletAddress=${walletAddress}`, { method: 'GET' });
  }

  async updateUserSettings(walletAddress: string, settings: any): Promise<any> {
    return this.request('/api/user/settings', {
      method: 'PUT',
      body: JSON.stringify({ walletAddress, settings }),
    });
  }

  async getApiKey(walletAddress: string): Promise<any> {
    return this.request(`/api/user/api-key?walletAddress=${walletAddress}`, { method: 'GET' });
  }

  async regenerateApiKey(walletAddress: string): Promise<any> {
    return this.request('/api/user/api-key', {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    });
  }

  async setup2FA(walletAddress: string): Promise<any> {
    return this.request('/api/user/2fa/setup', {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    });
  }

  async verify2FA(walletAddress: string, token: string, secret: string, backupCodes: string[]): Promise<any> {
    return this.request('/api/user/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, token, secret, backupCodes }),
    });
  }

  async validate2FA(walletAddress: string, token: string): Promise<any> {
    return this.request('/api/user/2fa/validate', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, token }),
    });
  }

  async disable2FA(walletAddress: string): Promise<any> {
    return this.request('/api/user/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    });
  }

  async deleteAccount(walletAddress: string, confirmation: string): Promise<any> {
    return this.request('/api/user/account', {
      method: 'DELETE',
      body: JSON.stringify({ walletAddress, confirmation }),
    });
  }
}

export const api = new ApiClient();
