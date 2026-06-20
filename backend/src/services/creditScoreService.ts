import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface RateUserParams {
  raterId: string;
  ratedId: string;
  escrowId: string;
  rating: number;
  comment?: string;
}

export class CreditScoreService {
  // Calculate tier based on rating
  private calculateTier(rating: number): string {
    if (rating >= 90) return "TIER_1";
    if (rating >= 75) return "TIER_2";
    if (rating >= 60) return "TIER_3";
    return "TIER_4";
  }

  // Calculate borrow limit based on credit score
  private calculateBorrowLimit(rating: number, totalEarned: bigint): bigint {
    const baseLimit = 1000000000n; // 1 SUI
    const tier = this.calculateTier(rating);

    const multiplier =
      tier === "TIER_1"
        ? 10n
        : tier === "TIER_2"
          ? 7n
          : tier === "TIER_3"
            ? 4n
            : 2n;

    return baseLimit * multiplier;
  }

  async getCreditScore(userId: string) {
    let creditScore = await prisma.creditScore.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!creditScore) {
      // Create default credit score
      creditScore = await prisma.creditScore.create({
        data: {
          userId,
          rating: 50,
          tier: "TIER_4",
          borrowLimit: 2000000000n,
          totalCompleted: 0,
          totalEarned: 0n,
          onTimeReleases: 0,
          disputeCount: 0,
          refundedCount: 0,
        },
        include: { user: true },
      });
    }

    return creditScore;
  }

  async rateUser(params: RateUserParams) {
    const { raterId, ratedId, escrowId, rating, comment } = params;

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Check if already rated
    const existingRating = await prisma.rating.findUnique({
      where: { raterId_escrowId: { raterId, escrowId } },
    });

    if (existingRating) {
      throw new Error("You have already rated this escrow");
    }

    // Verify escrow exists and user is participant
    const escrow = await prisma.escrow.findUnique({
      where: { id: escrowId },
    });

    if (!escrow) {
      throw new Error("Escrow not found");
    }

    if (escrow.clientId !== raterId && escrow.freelancerId !== raterId) {
      throw new Error("You are not a participant in this escrow");
    }

    // Create rating
    const newRating = await prisma.rating.create({
      data: {
        raterId,
        ratedId,
        escrowId,
        rating,
        comment,
      },
      include: {
        rater: true,
        rated: true,
      },
    });

    // Update rater's credit score
    await this.updateCreditScoreFromEscrow(raterId, escrowId);

    // Recalculate rater's overall rating
    await this.recalculateUserRating(raterId);

    // Recalculate ratedUser's overall rating
    await this.recalculateUserRating(ratedId);

    return newRating;
  }

  private async updateCreditScoreFromEscrow(
    userId: string,
    escrowId: string
  ) {
    const escrow = await prisma.escrow.findUnique({
      where: { id: escrowId },
    });

    if (!escrow) return;

    let creditScore = await prisma.creditScore.findUnique({
      where: { userId },
    });

    if (!creditScore) {
      creditScore = await this.getCreditScore(userId);
    }

    let updates: any = {};

    // Increment completed
    if (escrow.status === "COMPLETED") {
      updates.totalCompleted = creditScore.totalCompleted + 1;
    }

    // Update earned amount (if user is freelancer)
    if (escrow.freelancerId === userId) {
      updates.totalEarned =
        (creditScore.totalEarned || 0n) + escrow.releasedAmount;
    }

    // Update on-time releases
    if (
      escrow.completedMilestones === escrow.milestoneCount &&
      !escrow.status.includes("DISPUTED")
    ) {
      updates.onTimeReleases = creditScore.onTimeReleases + 1;
    }

    // Update dispute count
    if (escrow.status === "DISPUTED") {
      updates.disputeCount = creditScore.disputeCount + 1;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.creditScore.update({
        where: { userId },
        data: updates,
      });
    }
  }

  private async recalculateUserRating(userId: string) {
    // Get all ratings received
    const ratings = await prisma.rating.findMany({
      where: { ratedId: userId },
    });

    if (ratings.length === 0) {
      return; // No ratings yet
    }

    // Calculate average rating (1-5 scale)
    const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageStars = totalRating / ratings.length;

    // Scale 1-5 stars to 0-100: (stars - 1) * 25 + 25, or simply: stars * 20
    const averageRating = Math.round(averageStars * 20);

    // Get current credit score
    const creditScore = await prisma.creditScore.findUnique({
      where: { userId },
    });

    if (!creditScore) return;

    // Calculate new tier
    const newTier = this.calculateTier(averageRating);

    // Update credit score
    await prisma.creditScore.update({
      where: { userId },
      data: {
        rating: Math.min(averageRating, 100), // Cap at 100
        tier: newTier,
        borrowLimit: this.calculateBorrowLimit(averageRating, creditScore.totalEarned || 0n),
      },
    });
  }

  async getUserRatings(userId: string) {
    return prisma.rating.findMany({
      where: { ratedId: userId },
      include: {
        rater: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getEscrowRating(escrowId: string) {
    return prisma.rating.findMany({
      where: { escrowId },
      include: {
        rater: true,
        rated: true,
      },
    });
  }
}
