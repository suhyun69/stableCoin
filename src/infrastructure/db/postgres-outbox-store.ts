import type { Pool } from "pg";

export type ClaimedOutboxMessage = {
    id: string;
    type: "PAYOUT_REQUESTED";
    aggregateId: string;
    payload: { payoutId: string; recipientAddress: string; amountAtomic: string };
};

export interface OutboxStore {
    claimNextBatch(workerId: string, limit: number): Promise<ClaimedOutboxMessage[]>;
    markPublished(messageId: string): Promise<void>;
}

export class PostgresOutboxStore implements OutboxStore {
    constructor(private readonly pool: Pool) { }

    async claimNextBatch(workerId: string, limit: number): Promise<ClaimedOutboxMessage[]> {
        const result = await this.pool.query(
            `WITH candidates AS (
         SELECT id
         FROM outbox_messages
         WHERE status = 'PENDING'
           AND available_at <= now()
           AND (locked_at IS NULL OR locked_at < now() - interval '30 seconds')
         ORDER BY created_at, id
         LIMIT $1
         FOR UPDATE SKIP LOCKED
       )
       UPDATE outbox_messages AS outbox
       SET locked_at = now(), locked_by = $2, attempts = attempts + 1
       FROM candidates
       WHERE outbox.id = candidates.id
       RETURNING outbox.id, outbox.type, outbox.aggregate_id, outbox.payload`,
            [limit, workerId]
        );

        return result.rows.map((row) => ({
            id: row.id,
            type: row.type,
            aggregateId: row.aggregate_id,
            payload: row.payload
        }));
    }

    async markPublished(messageId: string): Promise<void> {
        await this.pool.query(
            `UPDATE outbox_messages
       SET status = 'PUBLISHED', published_at = now(), locked_at = NULL, locked_by = NULL
       WHERE id = $1`,
            [messageId]
        );
    }
}