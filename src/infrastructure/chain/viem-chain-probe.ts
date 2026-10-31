import { createPublicClient, http, HttpRequestError, TimeoutError } from "viem";
import { foundry } from "viem/chains";
import {
    ChainUnavailableError,
    type ChainProbe
} from "../../application/chain-probe";

export class ViemChainProbe implements ChainProbe {
    private readonly client;

    constructor(rpcUrl: string) {
        this.client = createPublicClient({
            chain: foundry,
            transport: http(rpcUrl)
        });
    }

    async getChainId(): Promise<number> {
        try {
            return await this.client.getChainId();
        } catch (error) {
            if (error instanceof HttpRequestError || error instanceof TimeoutError) {
                throw new ChainUnavailableError();
            }

            throw error;
        }
    }
}