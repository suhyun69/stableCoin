import { Pool } from "pg";
import { buildApp } from "../api/build-app";
import { CreatePayoutChainFirstCrashDemo } from "../application/create-payout-chain-first-crash-demo";
import { ViemUsdcTransferGateway } from "../infrastructure/chain/viem-usdc-transfer-gateway";
import { PostgresPayoutRepository } from "../infrastructure/db/postgres-payout-repository";

console.log(process.env.MOCK_USDC_ADDRESS)

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const createPayout = new CreatePayoutChainFirstCrashDemo(
    new ViemUsdcTransferGateway(process.env.MOCK_USDC_ADDRESS as `0x${string}`),
    new PostgresPayoutRepository(pool)
);
const app = buildApp({ createPayout });

await app.listen({ host: "0.0.0.0", port: 3001 });


// 0x74d3aae5b88a551827c2c47fa806577228bf603fc2bcb789a79cb0ff55e39175


// CHAIN_TRANSCATION_HASH="0x74d3aae5b88a551827c2c47fa806577228bf603fc2bcb789a79cb0ff55e39175"