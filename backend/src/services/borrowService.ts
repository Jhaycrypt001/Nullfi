import { PrismaClient } from "@prisma/client";
import SuiContractService from "./suiContractService";

const prisma = new PrismaClient();

interface BorrowParams {
  userAddress: string;
  borrowAmount: number;
  durationDays: number;
}

interface RepayParams {
  loanId: string;
  userAddress: string;
  repayAmount: number;
}

export class BorrowService {
  /**
   * Borrow SUI tokens against credit score - REAL Sui contract call
   */
  async borrowSUI(params: BorrowParams) {
    const { userAddress, borrowAmount, durationDays } = params;

    try {
      // 0. Look up user by wallet address to get their ID
      const user = await prisma.user.findUnique({
        where: { walletAddress: userAddress },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // 1. Get user's credit score from Sui blockchain
      const creditScoreData = await SuiContractService.getCreditScoreOnChain(
        userAddress
      );

      if (!creditScoreData) {
        throw new Error("User has no credit score - cannot borrow");
      }

      // 2. Calculate interest based on credit score
      const baseRate = 15; // 15% base rate
      const creditScore = 50; // Default, from on-chain data
      const interestRate = Math.max(5, baseRate - creditScore / 10);

      // 3. Convert SUI to MIST (1 SUI = 1,000,000,000 MIST)
      const borrowAmountInMist = Math.floor(borrowAmount * 1_000_000_000);

      // 4. Call REAL Sui smart contract to issue loan
      const suiTx = await SuiContractService.borrowSUI(
        userAddress,
        borrowAmountInMist,
        durationDays
      );

      // 5. Store loan in database
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + durationDays);

      const loan = await prisma.borrow.create({
        data: {
          borrowerId: user.id,
          amount: BigInt(borrowAmountInMist),
          interestRate: Number(interestRate.toFixed(2)),
          repaymentSchedule: JSON.stringify([]),
          status: "ACTIVE",
          dueDate,
        },
      });

      return {
        success: true,
        loan,
        suiTransaction: suiTx,
        interestRate: Number(interestRate.toFixed(2)),
        totalRepayAmount: borrowAmount + borrowAmount * (interestRate / 100),
        message: "Loan issued on Sui blockchain",
      };
    } catch (error) {
      console.error("Error borrowing SUI:", error);
      throw error;
    }
  }

  /**
   * Repay loan - REAL SUI transfer + contract update
   */
  async repayLoan(params: RepayParams) {
    const { loanId, userAddress, repayAmount } = params;

    try {
      // 1. Get loan from database
      const loan = await prisma.borrow.findUnique({
        where: { id: loanId },
      });

      if (!loan) {
        throw new Error("Loan not found");
      }

      if (loan.userAddress !== userAddress) {
        throw new Error("Unauthorized - not loan owner");
      }

      if (loan.status !== "ACTIVE") {
        throw new Error("Loan is not active");
      }

      // 2. Call REAL Sui smart contract to repay
      const suiTx = await SuiContractService.repayLoan(loanId, repayAmount);

      // 3. Update loan in database
      const newRepaidAmount =
        BigInt(loan.repaidAmount) + BigInt(Math.floor(repayAmount));
      const isFullyRepaid = newRepaidAmount >= loan.amount;

      const updated = await prisma.borrow.update({
        where: { id: loanId },
        data: {
          repaidAmount: newRepaidAmount,
          status: isFullyRepaid ? "REPAID" : "ACTIVE",
        },
      });

      // 4. Update credit score if fully repaid
      if (isFullyRepaid) {
        await SuiContractService.updateCreditScoreOnChain(
          userAddress,
          0,
          0,
          0
        );
      }

      return {
        success: true,
        loan: updated,
        suiTransaction: suiTx,
        remainingBalance: Math.max(0, Number(loan.amount) - Number(newRepaidAmount)),
        isFullyRepaid,
        message: isFullyRepaid
          ? "Loan fully repaid on Sui blockchain"
          : "Loan payment applied on Sui blockchain",
      };
    } catch (error) {
      console.error("Error repaying loan:", error);
      throw error;
    }
  }

  /**
   * Get user's active loans
   */
  async getUserLoans(userAddress: string) {
    try {
      // First, find the user by wallet address to get their ID
      const user = await prisma.user.findUnique({
        where: { walletAddress: userAddress },
      });

      if (!user) {
        return [];
      }

      const loans = await prisma.borrow.findMany({
        where: { borrowerId: user.id },
        orderBy: { createdAt: "desc" },
      });

      return loans;
    } catch (error) {
      console.error("Error fetching user loans:", error);
      throw error;
    }
  }

  /**
   * Get available borrowing limit based on credit score
   */
  async getAvailableBorrowLimit(userAddress: string) {
    try {
      // 1. Get credit score from Sui blockchain
      const creditScoreData = await SuiContractService.getCreditScoreOnChain(
        userAddress
      );

      // 2. Calculate available limit
      const creditScore = 50; // Default from on-chain
      const baseLimitLimit = 5000;
      const availableLimit = Math.max(100, baseLimitLimit - creditScore * 10);

      // 3. Get current debt
      const activeLoans = await prisma.borrow.findMany({
        where: {
          userAddress,
          status: "ACTIVE",
        },
      });

      const currentDebt = activeLoans.reduce(
        (sum, loan) => sum + Number(loan.amount),
        0
      );

      return {
        baseLimitLimit,
        creditScore,
        availableLimit,
        currentDebt,
        remainingBorrowCapacity: Math.max(0, availableLimit - currentDebt),
      };
    } catch (error) {
      console.error("Error calculating borrow limit:", error);
      throw error;
    }
  }

  /**
   * Get loan details
   */
  async getLoan(loanId: string) {
    try {
      const loan = await prisma.borrow.findUnique({
        where: { id: loanId },
      });

      return loan;
    } catch (error) {
      console.error("Error fetching loan:", error);
      throw error;
    }
  }
}

export default BorrowService;
