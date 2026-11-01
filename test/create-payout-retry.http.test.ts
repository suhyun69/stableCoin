import { afterEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/api/build-app";
import { CreatePayoutNow } from "../src/application/create-payout-now";
import { InMemoryPayoutRepository } from "../src/test-support/in-memory-payout-repository";
import { RecordingUsdcTransferGateway } from "../src/test-support/recording-usdc-transfer-gateway";

describe("POST /payouts retry", () => {
    let app: FastifyInstance;

    afterEach(async () => {
        await app?.close();
    });

    it("creates two transfers when the same request is retried", async () => {
        const payoutRepository = new InMemoryPayoutRepository();
        const transferGateway = new RecordingUsdcTransferGateway();
        app = buildApp({
            createPayout: new CreatePayoutNow(payoutRepository, transferGateway)
        });

        const request = {
            method: "POST" as const,
            url: "/payouts",
            headers: { "idempotency-key": "payout-2026-004" },
            payload: {
                merchantId: "merchant_demo_01",
                recipientAddress: "0x1111111111111111111111111111111111111111",
                amount: "25.50"
            }
        };

        await app.inject(request);
        await app.inject(request);

        expect(transferGateway.transfers).toHaveLength(2);
        expect(transferGateway.transfers).toEqual([
            { to: "0x1111111111111111111111111111111111111111", amount: "25.50" },
            { to: "0x1111111111111111111111111111111111111111", amount: "25.50" }
        ]);
    });
});