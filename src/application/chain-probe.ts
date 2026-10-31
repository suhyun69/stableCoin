export interface ChainProbe {
    getChainId(): Promise<number>;
}

export class ChainUnavailableError extends Error {
    constructor() {
        super("chain is temporarily unavailable");
    }
}