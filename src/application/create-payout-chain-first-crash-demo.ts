import type {
    CreatePayout,
    CreatePayoutInput,
    Payout
} from "./create-payout-now";
import { PostgresPayoutRepository } from "../infrastructure/db/postgres-payout-repository";
import { ViemUsdcTransferGateway } from "../infrastructure/chain/viem-usdc-transfer-gateway";

export class CreatePayoutChainFirstCrashDemo implements CreatePayout {
    constructor(
        private readonly chainTransfer: ViemUsdcTransferGateway,
        private readonly payoutRepository: PostgresPayoutRepository
    ) { }

    async execute(input: CreatePayoutInput): Promise<Payout> {
        const { hash } = await this.chainTransfer.transfer({
            to: input.recipientAddress,
            amount: input.amount
        });

        console.log({ event: "CHAIN_TRANSFERRED", hash });
        process.exit(1);

        await this.payoutRepository.createRequested(input);
    }
}