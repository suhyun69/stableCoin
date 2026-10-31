import { ViemChainProbe } from "../infrastructure/chain/viem-chain-probe";
import { buildApp } from "./build-app";

const port = Number(process.env.PORT ?? 3000);
const rpcUrl = process.env.ANVIL_RPC_URL ?? "http://127.0.0.1:8545"

const app = buildApp({
    chainProbe: new ViemChainProbe(rpcUrl)
});

await app.listen({
    host: "0.0.0.0",
    port
});