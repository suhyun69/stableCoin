import Fastify from "fastify";
import {
    ChainUnavailableError,
    type ChainProbe
} from "../application/chain-probe";
import { DemoChainProbe } from "../infrastructure/chain/demo-chain-probe";

type BuildAppOptions = {
    chainProbe?: ChainProbe;
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

    return app;
}