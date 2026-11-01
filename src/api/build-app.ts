import Fastify from "fastify";
import {
    ChainUnavailableError,
    type ChainProbe
} from "../application/chain-probe";
import { DemoChainProbe } from "../infrastructure/chain/demo-chain-probe";
import { CreatePayout } from "../application/create-payout-now";

type BuildAppOptions = {
    chainProbe?: ChainProbe;
    createPayout?: CreatePayout;
};

export function buildApp(options: BuildAppOptions = {}) {
    const app = Fastify();
    const chainProbe = options.chainProbe ?? new DemoChainProbe();

    app.get("/health", async () => {
        return { status: "ok" };
    });

    app.get("/dependencies/chain", async (_request, reply) => {
        try {
            const chainId = await chainProbe.getChainId();

            return {
                status: "reachable",
                chainId
            };
        } catch (error) {
            if (error instanceof ChainUnavailableError) {
                return reply.code(503).send({
                    code: "CHAIN_UNAVAILABLE",
                    message: "chain is temporarily unavailable"
                });
            }

            throw error;
        }
    });

    app.post("/payouts", async (request, reply) => {
        if (!options.createPayout) {
            return reply.code(503).send({ code: "PAYOUTS_NOT_READY" });
        }

        const body = request.body as {
            merchantId: string;
            recipientAddress: string;
            amount: string;
        };
        const idempotencyKey = request.headers["idempotency-key"];

        if (typeof idempotencyKey !== "string") {
            return reply.code(400).send({ code: "VALIDATION_ERROR" });
        }

        const payout = await options.createPayout.execute({
            ...body,
            idempotencyKey
        });

        return reply.code(202).send(payout);
    });

    return app;
}