import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import escrowRoutes from './routes/escrow';
import creditScoreRoutes from './routes/creditScore';
import borrowRoutes from './routes/borrow';
import userRoutes from './routes/user';

// Load environment variables
dotenv.config();

const app: Express = express();
const prisma = new PrismaClient();

// ===== MIDDLEWARE =====

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Custom JSON serializer for BigInt
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Override JSON.stringify to handle BigInt
const originalJson = express.response.json;
express.response.json = function(data: any) {
  const serialized = JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  );
  return originalJson.call(this, JSON.parse(serialized));
};

// ===== HEALTH CHECK =====

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
  });
});

// ===== ROUTES =====

app.use('/api/auth', authRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/credit-score', creditScoreRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/user', userRoutes);

// Transactions endpoint (for demo, return empty array)
app.get('/api/transactions', (req: Request, res: Response) => {
  res.json({
    success: true,
    transactions: [],
  });
});

// ===== ERROR HANDLING =====

app.use((err: any, req: Request, res: Response) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ===== 404 =====

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// ===== START SERVER =====

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Nullfi Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Sui Network: ${process.env.SUI_NETWORK}`);
});

export default app;
export { prisma };
