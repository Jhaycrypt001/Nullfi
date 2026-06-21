/**
 * Contract Executor - Real Blockchain Integration
 */

import { api } from './api';

export interface ContractResult {
  success: boolean;
  transactionDigest?: string;
  data?: any;
  error?: string;
  message: string;
}

export class ContractExecutor {
  static async createEscrow(
    clientAddress: string,
    freelancerAddress: string,
    jobTitle: string,
    jobDescription: string,
    category: string,
    totalAmount: number,
    milestoneCount: number
  ): Promise<ContractResult> {
    try {
      const backendResponse = await api.createEscrow({
        clientAddress,
        freelancerAddress,
        jobTitle,
        jobDescription,
        category,
        totalAmount,
        milestoneCount,
      });

      if (!backendResponse?.success) {
        return { success: false, message: 'Failed', error: backendResponse?.error };
      }

      return {
        success: true,
        data: backendResponse.escrow,
        message: '✅ Escrow created! Click "Sign & Execute" to confirm on blockchain.',
        transactionDigest: 'created',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create escrow',
        error: error instanceof Error ? error.message : 'Error',
      };
    }
  }

  static async releaseMilestone(
    escrowId: string,
    milestoneNum: number,
    clientAddress: string
  ): Promise<ContractResult> {
    try {
      const backendResponse = await api.releaseMilestone(escrowId, milestoneNum, clientAddress);
      if (!backendResponse?.success) {
        return { success: false, message: 'Failed', error: backendResponse?.error };
      }
      return { success: true, data: backendResponse.escrow, message: '✅ Ready to release!', transactionDigest: 'ready' };
    } catch (error) {
      return { success: false, message: 'Failed', error: error instanceof Error ? error.message : 'Error' };
    }
  }

  static async borrowSUI(walletAddress: string, borrowAmount: number, durationDays: number): Promise<ContractResult> {
    try {
      const backendResponse = await api.createBorrow(walletAddress, borrowAmount, durationDays);
      if (!backendResponse?.success) {
        return { success: false, message: 'Failed', error: backendResponse?.error };
      }
      return { success: true, data: backendResponse.loan, message: '✅ Loan ready!', transactionDigest: 'loan' };
    } catch (error) {
      return { success: false, message: 'Failed', error: error instanceof Error ? error.message : 'Error' };
    }
  }

  static async repayLoan(loanId: string, walletAddress: string, repayAmount: number): Promise<ContractResult> {
    try {
      const backendResponse = await api.repayBorrow(loanId, walletAddress, repayAmount);
      if (!backendResponse?.success) {
        return { success: false, message: 'Failed', error: backendResponse?.error };
      }
      return { success: true, data: backendResponse.loan, message: '✅ Repay ready!', transactionDigest: 'ready' };
    } catch (error) {
      return { success: false, message: 'Failed', error: error instanceof Error ? error.message : 'Error' };
    }
  }

  static async executeEscrow(
    escrowId: string,
    clientAddress: string,
    freelancerAddress: string,
    amountMist: number
  ): Promise<ContractResult> {
    try {
      // Execute real blockchain transaction
      return await this.signTransaction(clientAddress, freelancerAddress, amountMist);
    } catch (error) {
      return {
        success: false,
        message: 'Failed to execute escrow',
        error: error instanceof Error ? error.message : 'Error',
      };
    }
  }

  /**
   * REAL BLOCKCHAIN - Execute with wallet signature
   */
  static async signTransaction(
    senderAddress: string,
    recipientAddress: string,
    amountMist: number
  ): Promise<ContractResult> {
    try {
      console.log('🔔 REAL BLOCKCHAIN EXECUTION...');
      const RealBlockchainExecutor = (await import('./realBlockchainExecutor')).default;
      const digest = await RealBlockchainExecutor.executeRealTransaction(
        senderAddress,
        recipientAddress,
        amountMist,
        'Escrow release'
      );

      return {
        success: true,
        transactionDigest: digest,
        message: `✅ CONFIRMED!\n💎 Real SUI transferred!\nTX: ${digest?.slice(0, 12)}...`,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg.includes('rejected') || errorMsg.includes('Cancelled')) {
        return { success: false, message: '⏸️ You cancelled', error: 'User rejected' };
      }
      return { success: false, message: `❌ Error: ${errorMsg}`, error: errorMsg };
    }
  }
}

export default ContractExecutor;
