import type { OutboxStore } from "../infrastructure/db/postgres-outbox-store";
import type { OutboxQueue } from "../infrastructure/queue/bullmq-outbox-queue";

export class PublishOutboxBatch {
    constructor(
        private readonly outboxStore: OutboxStore,
        private readonly outboxQueue: OutboxQueue,
        private readonly options: { failAfterPublish?: boolean } = {}
    ) { }

    async execute(workerId: string): Promise<number> {
        const messages = await this.outboxStore.claimNextBatch(workerId, 20);

        for (const message of messages) {
            await this.outboxQueue.publish(message);

            if (this.options.failAfterPublish) {
                throw new Error("process stopped");
            }

            await this.outboxStore.markPublished(message.id);
        }

        return messages.length;
    }
}