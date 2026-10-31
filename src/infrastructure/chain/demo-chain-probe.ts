import type { ChainProbe } from "../../application/chain-probe";

export class DemoChainProbe implements ChainProbe {
    async getChainId(): Promise<number> {
        return 31337;
    }
}