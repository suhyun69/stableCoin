import { afterEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/api/build-app";
import { ChainUnavailableError } from "../src/application/chain-probe";

describe("GET /dependencies/chain", () => {
    let app: FastifyInstance;

    afterEach(async () => {
        await app?.close();
    });

    it("returns 503 when the chain cannot be reached", async () => {
        app = buildApp({
            chainProbe: {
                async getChainId() {
                    throw new ChainUnavailableError();
                }
            }
        });

        const response = await app.inject({
            method: "GET",
            url: "/dependencies/chain"
        });

        expect(response.statusCode).toBe(503);
        expect(response.json()).toEqual({
            code: "CHAIN_UNAVAILABLE",
            message: "chain is temporarily unavailable"
        });
    });
});