export type CreatePayoutInput = {
    merchantId: string;
    recipientAddress: string;
    amount: string;
    idempotencyKey: string;
};

export type Payout = Omit<CreatePayoutInput, "idempotencyKey"> & {
    id: string;
    status: "REQUESTED";
};

export interface PayoutRepository {
    create(input: CreatePayoutInput): Promise<Payout>;
}

export interface UsdcTransferGateway {
    transfer(input: { to: string; amount: string }): Promise<{ hash: string }>;
}

export interface CreatePayout {
    execute(input: CreatePayoutInput): Promise<Payout>;
}

export class CreatePayoutNow implements CreatePayout {
    constructor(
        private readonly payoutRepository: PayoutRepository,
        private readonly usdcTransferGateway: UsdcTransferGateway
    ) { }

    async execute(input: CreatePayoutInput): Promise<Payout> {
        const payout = await this.payoutRepository.create(input); // postgrSQL

        // !여기 이 지점

        await this.usdcTransferGateway.transfer({ // 블록체인 자금 전송
            to: payout.recipientAddress,
            amount: payout.amount
        });

        return payout;
    }
}