import { afterEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/api/build-app";

describe("GET /health", () => {
    let app: FastifyInstance;

    afterEach(async () => {
        await app?.close();
    });

    it("returns that the API process can receive requests", async () => {
        app = buildApp();

        const response = await app.inject({
            method: "GET",
            url: "/health"
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ status: "ok" });
    });
});