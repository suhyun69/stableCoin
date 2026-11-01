import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { parseUnits } from "viem";

export class PostgresPayoutRepository {
    constructor(private readonly pool: Pool) { }

    async createRequested(input: {
        merchantId: string;
        recipientAddress: string;
        amount: string;
        idempotencyKey: string;
    }): Promise<void> {
        await this.pool.query(
            `INSERT INTO payouts (
        id, idempotency_key, merchant_id, recipient_address,
        amount_atomic, request_fingerprint, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'REQUESTED')`,
            [
                `pay_${randomUUID()}`,
                input.idempotencyKey,
                input.merchantId,
                input.recipientAddress,
                parseUnits(input.amount, 6).toString(),
                JSON.stringify(input)
            ]
        );
    }
}