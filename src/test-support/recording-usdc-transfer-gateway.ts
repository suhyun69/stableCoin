import type { UsdcTransferGateway } from "../application/create-payout-now";

export class RecordingUsdcTransferGateway implements UsdcTransferGateway {
    readonly transfers: Array<{ to: string; amount: string }> = [];
    async transfer(input: { to: string; amount: string }): Promise<{ hash: string }> {
        this.transfers.push(input);
        return { hash: `0xtransfer${this.transfers.length}` };
    }
}