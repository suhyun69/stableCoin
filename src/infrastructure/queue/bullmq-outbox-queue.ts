import { Queue } from "bullmq";
import type { ClaimedOutboxMessage } from "../db/postgres-outbox-store";

export interface OutboxQueue {
    publish(message: ClaimedOutboxMessage): Promise<void>;
}

export class BullMqOutboxQueue implements OutboxQueue {
    private readonly queue = new Queue("stablepay-outbox", {
        connection: { host: "127.0.0.1", port: 6380 }
    });

    async publish(message: ClaimedOutboxMessage): Promise<void> {
        await this.queue.add(message.type, message.payload, {
            jobId: message.id,
            removeOnComplete: false,
            removeOnFail: false
        });
    }
}