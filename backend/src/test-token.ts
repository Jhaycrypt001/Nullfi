import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function generateTestToken() {
  // Create or get test client user
  const testClient = await prisma.user.upsert({
    where: { walletAddress: "0xtest1234567890abcdef" },
    update: {},
    create: {
      walletAddress: "0xtest1234567890abcdef",
      email: "client@nullfi.dev",
      username: "testclient",
      creditScore: {
        create: {
          rating: 80,
          tier: "TIER_2",
        },
      },
    },
    include: { creditScore: true },
  });

  // Create or get test freelancer user
  const testFreelancer = await prisma.user.upsert({
    where: { walletAddress: "0xtest9876543210fedcba" },
    update: {},
    create: {
      walletAddress: "0xtest9876543210fedcba",
      email: "freelancer@nullfi.dev",
      username: "testfreelancer",
      creditScore: {
        create: {
          rating: 75,
          tier: "TIER_3",
        },
      },
    },
    include: { creditScore: true },
  });

  // Generate JWT for client
  const clientToken = jwt.sign(
    {
      userId: testClient.id,
      walletAddress: testClient.walletAddress,
    },
    process.env.JWT_SECRET || "secret-key",
    { expiresIn: "7d" }
  );

  // Generate JWT for freelancer
  const freelancerToken = jwt.sign(
    {
      userId: testFreelancer.id,
      walletAddress: testFreelancer.walletAddress,
    },
    process.env.JWT_SECRET || "secret-key",
    { expiresIn: "7d" }
  );

  console.log("=== Test Users Created ===\n");
  console.log("CLIENT USER:");
  console.log("- ID:", testClient.id);
  console.log("- Wallet:", testClient.walletAddress);
  console.log("\nFREELANCER USER:");
  console.log("- ID:", testFreelancer.id);
  console.log("- Wallet:", testFreelancer.walletAddress);
  console.log("\n=== JWT Token (Client) ===");
  console.log(clientToken);
  console.log("\n=== JWT Token (Freelancer) ===");
  console.log(freelancerToken);
  console.log("\n=== Use in requests ===");
  console.log("Client Token: Authorization: Bearer " + clientToken);
  console.log("Freelancer Token: Authorization: Bearer " + freelancerToken);

  await prisma.$disconnect();
}

generateTestToken().catch(console.error);
