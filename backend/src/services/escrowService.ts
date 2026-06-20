import { PrismaClient } from "@prisma/client";
import SuiContractService from "./suiContractService";

const prisma = new PrismaClient();

interface CreateEscrowParams {
  clientAddress: string;
  freelancerAddress: string;
  jobTitle: string;
  jobDescription?: string;
  category: string;
  totalAmount: number;
  milestoneCount: number;
}

interface ReleaseMilestoneParams {
  escrowId: string;
  milestoneNum: number;
  clientAddress: string;
}

interface DisputeEscrowParams {
  escrowId: string;
  reason: string;
  initiatorAddress: string;
}

export class EscrowService {
  /**
   * Create real escrow on Sui blockchain + database
   */
  async createEscrow(params: CreateEscrowParams) {
    const {
      clientAddress,
      freelancerAddress,
      jobTitle,
      jobDescription,
      category,
      totalAmount,
      milestoneCount,
    } = params;

    try {
      // 1. Look up CLIENT (must exist since they're logged in)
      const client = await prisma.user.findUnique({
        where: { walletAddress: clientAddress },
      });

      if (!client) {
        throw new Error("Client wallet address not found");
      }

      // 2. For FREELANCER: If they don't have account, create one automatically!
      let freelancer = await prisma.user.findUnique({
        where: { walletAddress: freelancerAddress },
      });

      if (!freelancer) {
        // Auto-create freelancer account
        freelancer = await prisma.user.create({
          data: {
            walletAddress: freelancerAddress,
          },
        });
      }

      // 3. Convert SUI to MIST (1 SUI = 1,000,000,000 MIST)
      const totalAmountInMist = Math.floor(totalAmount * 1_000_000_000);

      // 4. Call REAL Sui smart contract to create escrow
      const suiTx = await SuiContractService.createEscrow(
        clientAddress,
        freelancerAddress,
        totalAmountInMist,
        jobTitle,
        milestoneCount
      );

      // 5. Store in database (with blockchain reference)
      const escrow = await prisma.escrow.create({
        data: {
          clientId: client.id,
          freelancerId: freelancer.id,
          jobTitle,
          jobDescription,
          category,
          totalAmount: BigInt(totalAmountInMist),
          status: "ACTIVE",
          milestoneCount: milestoneCount,
          completedMilestones: 0,
          releasedAmount: BigInt(0),
        },
      });

      return {
        success: true,
        escrow,
        suiTransaction: suiTx,
        message: "Escrow created on Sui blockchain and database",
      };
    } catch (error) {
      console.error("Error creating escrow:", error);
      throw error;
    }
  }

  /**
   * Release milestone - REAL SUI transfer
   */
  async releaseMilestone(params: ReleaseMilestoneParams) {
    const { escrowId, milestoneNum, clientAddress } = params;

    try {
      // 1. Get escrow from database
      const escrow = await prisma.escrow.findUnique({
        where: { id: escrowId },
      });

      if (!escrow) {
        throw new Error("Escrow not found");
      }

      if (escrow.completedMilestones >= escrow.milestones) {
        throw new Error("All milestones already released");
      }

      // 2. Calculate milestone amount
      const milestoneAmount = Number(escrow.totalAmount) / escrow.milestones;

      // 3. Call REAL Sui smart contract to release
      const suiTx = await SuiContractService.releaseMilestone(
        escrowId,
        milestoneAmount,
        milestoneNum
      );

      // 4. Update database
      const updated = await prisma.escrow.update({
        where: { id: escrowId },
        data: {
          completedMilestones: escrow.completedMilestones + 1,
          releasedAmount:
            BigInt(escrow.releasedAmount) + BigInt(Math.floor(milestoneAmount)),
          status:
            escrow.completedMilestones + 1 === escrow.milestones
              ? "COMPLETED"
              : "ACTIVE",
        },
      });

      // 5. Update credit score
      await SuiContractService.updateCreditScoreOnChain(
        escrow.freelancerAddress,
        escrow.completedMilestones + 1,
        escrow.completedMilestones + 1, // on-time releases
        Number(updated.releasedAmount)
      );

      return {
        success: true,
        escrow: updated,
        suiTransaction: suiTx,
        message: "Milestone released on Sui blockchain",
      };
    } catch (error) {
      console.error("Error releasing milestone:", error);
      throw error;
    }
  }

  /**
   * Dispute escrow - return funds to client
   */
  async disputeEscrow(params: DisputeEscrowParams) {
    const { escrowId, reason, initiatorAddress } = params;

    try {
      // 1. Get escrow
      const escrow = await prisma.escrow.findUnique({
        where: { id: escrowId },
      });

      if (!escrow) {
        throw new Error("Escrow not found");
      }

      // 2. Call REAL Sui smart contract to dispute
      const suiTx = await SuiContractService.disputeEscrow(escrowId);

      // 3. Update database
      const updated = await prisma.escrow.update({
        where: { id: escrowId },
        data: {
          status: "DISPUTED",
        },
      });

      // 4. Create dispute record
      // TODO: Add dispute model to Prisma schema if needed

      return {
        success: true,
        escrow: updated,
        suiTransaction: suiTx,
        reason,
        message: "Dispute initiated on Sui blockchain",
      };
    } catch (error) {
      console.error("Error disputing escrow:", error);
      throw error;
    }
  }

  /**
   * Get all escrows for user (client or freelancer)
   */
  async getUserEscrows(walletAddress: string) {
    try {
      // First, find the user by wallet address to get their ID
      const user = await prisma.user.findUnique({
        where: { walletAddress },
      });

      if (!user) {
        return [];
      }

      const escrows = await prisma.escrow.findMany({
        where: {
          OR: [
            { clientId: user.id },
            { freelancerId: user.id },
          ],
        },
        orderBy: { createdAt: "desc" },
      });

      return escrows;
    } catch (error) {
      console.error("Error fetching user escrows:", error);
      throw error;
    }
  }

  /**
   * Get single escrow
   */
  async getEscrow(escrowId: string) {
    try {
      const escrow = await prisma.escrow.findUnique({
        where: { id: escrowId },
      });

      return escrow;
    } catch (error) {
      console.error("Error fetching escrow:", error);
      throw error;
    }
  }

  /**
   * Get escrows by status
   */
  async getEscrowsByStatus(walletAddress: string, status: string) {
    try {
      const escrows = await prisma.escrow.findMany({
        where: {
          OR: [
            { clientAddress: walletAddress },
            { freelancerAddress: walletAddress },
          ],
          status,
        },
      });

      return escrows;
    } catch (error) {
      console.error("Error fetching escrows by status:", error);
      throw error;
    }
  }
}

export default EscrowService;
