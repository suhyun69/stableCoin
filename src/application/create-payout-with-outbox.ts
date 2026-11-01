export type CreatePayoutWithOutboxInput = {
    merchantId: string;
    recipientAddress: string;
    amountAtomic: string;
    idempotencyKey: string;
    requestFingerprint: string;
};

export type RequestedPayout = {
    id: string;
    status: "REQUESTED";
};

export interface PayoutCreationStore {
    createRequested(input: CreatePayoutWithOutboxInput): Promise<RequestedPayout>;
}

export class CreatePayoutWithOutbox {
    constructor(private readonly store: PayoutCreationStore) { }

    execute(input: CreatePayoutWithOutboxInput): Promise<RequestedPayout> {
        return this.store.createRequested(input);
    }
}