import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import type {
    CreatePayoutWithOutboxInput,
    PayoutCreationStore,
    RequestedPayout
} from "../../application/create-payout-with-outbox";

export class PostgresPayoutCreationStore implements PayoutCreationStore {
    constructor(
        private readonly pool: Pool,
        private readonly options: { failAfterHistory?: boolean } = {}
    ) { }

    async createRequested(
        input: CreatePayoutWithOutboxInput
    ): Promise<RequestedPayout> {
        const client = await this.pool.connect();
        const payoutId = `pay_${randomUUID()}`;
        const outboxId = `out_${randomUUID()}`;

        try {
            await client.query("BEGIN");

            await client.query(
                `INSERT INTO payouts
          (id, idempotency_key, merchant_id, recipient_address, amount_atomic, request_fingerprint, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'REQUESTED')`,
                [payoutId, input.idempotencyKey, input.merchantId, input.recipientAddress,
                    input.amountAtomic, input.requestFingerprint]
            );

            await client.query(
                `INSERT INTO payout_status_history (id, payout_id, from_status, to_status, reason)
         VALUES ($1, $2, NULL, 'REQUESTED', 'PAYOUT_CREATED')`,
                [`hist_${randomUUID()}`, payoutId]
            );

            if (this.options.failAfterHistory) {
                throw new Error("outbox insert failed");
            }

            await client.query(
                `INSERT INTO outbox_messages (id, aggregate_type, aggregate_id, type, payload)
         VALUES ($1, 'PAYOUT', $2, 'PAYOUT_REQUESTED', $3::jsonb)`,
                [outboxId, payoutId, JSON.stringify({
                    payoutId,
                    recipientAddress: input.recipientAddress,
                    amountAtomic: input.amountAtomic
                })]
            );

            await client.query("COMMIT");
            return { id: payoutId, status: "REQUESTED" };
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async loadBundle(payoutId: string) {
        const [payout, history, outbox] = await Promise.all([
            this.pool.query<{ id: string; status: string }>(
                "SELECT id, status FROM payouts WHERE id = $1",
                [payoutId]
            ),
            this.pool.query<{ to_status: string; reason: string }>(
                `SELECT to_status, reason
         FROM payout_status_history
         WHERE payout_id = $1
         ORDER BY occurred_at, id`,
                [payoutId]
            ),
            this.pool.query<{ type: string; status: string }>(
                `SELECT type, status
         FROM outbox_messages
         WHERE aggregate_id = $1
         ORDER BY created_at, id`,
                [payoutId]
            )
        ]);

        return {
            payout: payout.rows[0]
                ? { id: payout.rows[0].id, status: payout.rows[0].status }
                : null,
            history: history.rows.map((row) => ({
                toStatus: row.to_status,
                reason: row.reason
            })),
            outbox: outbox.rows.map((row) => ({
                type: row.type,
                status: row.status
            }))
        };
    }

    async findByIdempotencyKey(idempotencyKey: string) {
        const result = await this.pool.query<{
            id: string;
            merchant_id: string;
            recipient_address: string;
            amount_atomic: string;
            request_fingerprint: string;
            status: "REQUESTED";
        }>(
            `SELECT id, merchant_id, recipient_address, amount_atomic,
              request_fingerprint, status
       FROM payouts
       WHERE idempotency_key = $1`,
            [idempotencyKey]
        );
        const row = result.rows[0];

        return row
            ? {
                id: row.id,
                merchantId: row.merchant_id,
                recipientAddress: row.recipient_address,
                amountAtomic: row.amount_atomic,
                requestFingerprint: row.request_fingerprint,
                status: row.status
            }
            : null;
    }
}