import type { CreatePayoutInput, Payout, PayoutRepository } from "../application/create-payout-now";

export class InMemoryPayoutRepository implements PayoutRepository {
    private nextId = 1;
    async create(input: CreatePayoutInput): Promise<Payout> {
        const { idempotencyKey: _ignored, ...payout } = input;
        return { id: `pay_memory_${this.nextId++}`, ...payout, status: "REQUESTED" };
    }
}