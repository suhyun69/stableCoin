import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { CreatePayoutWithOutbox } from "../src/application/create-payout-with-outbox";
import { PostgresPayoutCreationStore } from "../src/infrastructure/db/postgres-payout-creation-store";
import { testPool } from "../src/test-support/test-pool";

describe("CreatePayoutWithOutbox", () => {
    beforeAll(async () => {
        const keys = ["payout-2026-005", "payout-2026-006"];
        await testPool.query(
            "DELETE FROM outbox_messages WHERE aggregate_id IN (SELECT id FROM payouts WHERE idempotency_key = ANY($1::text[]))",
            [keys]
        );
        await testPool.query(
            "DELETE FROM payout_status_history WHERE payout_id IN (SELECT id FROM payouts WHERE idempotency_key = ANY($1::text[]))",
            [keys]
        );
        await testPool.query("DELETE FROM payouts WHERE idempotency_key = ANY($1::text[])", [keys]);
    });

    it("stores the payout, first history, and outbox message together", async () => {

        const store = new PostgresPayoutCreationStore(testPool);
        const service = new CreatePayoutWithOutbox(store);

        const payout = await service.execute({
            merchantId: "merchant_demo_01",
            recipientAddress: "0x1111111111111111111111111111111111111111",
            amountAtomic: "25500000",
            idempotencyKey: "payout-2026-005",
            requestFingerprint: "fingerprint-2026-005"
        });

        expect(payout.status).toBe("REQUESTED");
        await expect(store.loadBundle(payout.id)).resolves.toMatchObject({
            payout: { id: payout.id, status: "REQUESTED" },
            history: [{ toStatus: "REQUESTED", reason: "PAYOUT_CREATED" }],
            outbox: [{ type: "PAYOUT_REQUESTED", status: "PENDING" }]
        });
    });

    it("rolls back the payout and history when outbox insertion fails", async () => {
        const store = new PostgresPayoutCreationStore(testPool, {
            failAfterHistory: true
        });
        const service = new CreatePayoutWithOutbox(store);

        await expect(service.execute({
            merchantId: "merchant_demo_01",
            recipientAddress: "0x1111111111111111111111111111111111111111",
            amountAtomic: "25500000",
            idempotencyKey: "payout-2026-006",
            requestFingerprint: "fingerprint-2026-006"
        })).rejects.toThrow("outbox insert failed");

        await expect(store.findByIdempotencyKey("payout-2026-006"))
            .resolves.toBeNull();
    });
});