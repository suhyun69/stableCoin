import { afterEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/api/build-app";
import type { CreatePayout } from "../src/application/create-payout-now";

describe("POST /payouts", () => {
    let app: FastifyInstance;

    afterEach(async () => {
        await app?.close();
    });

    it("accepts a payout request", async () => {
        const createPayout: CreatePayout = {
            async execute() {
                return {
                    id: "pay_demo_01",
                    merchantId: "merchant_demo_01",
                    recipientAddress: "0x1111111111111111111111111111111111111111",
                    amount: "25.50",
                    status: "REQUESTED" as const
                };
            }
        };

        app = buildApp({ createPayout });
        const response = await app.inject({
            method: "POST",
            url: "/payouts",
            headers: { "idempotency-key": "payout-2026-001" },
            payload: {
                merchantId: "merchant_demo_01",
                recipientAddress: "0x1111111111111111111111111111111111111111",
                amount: "25.50"
            }
        });

        expect(response.statusCode).toBe(202);
        expect(response.json()).toMatchObject({
            id: "pay_demo_01",
            status: "REQUESTED",
            amount: "25.50"
        });
    });
});