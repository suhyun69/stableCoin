import {
    createWalletClient,
    http,
    parseUnits,
    type Address,
    type Hex
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { token } from "viem/actions";
import { foundry } from "viem/chains";

const mockUsdcAbi = [{
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
        { name: "to", type: "address" },
        { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }]
}] as const;

export class ViemUsdcTransferGateway {
    private readonly walletClient;

    constructor(private readonly tokenAddress: Address) {
        const account = privateKeyToAccount(process.env.ANVIL_PRIVATE_KEY as Hex);
        this.walletClient = createWalletClient({
            account,
            chain: foundry,
            transport: http(process.env.ANVIL_RPC_URL)
        });
    }

    async transfer(input: { to: string; amount: string }): Promise<{ hash: string }> {
        const hash = await this.walletClient.writeContract({
            address: this.tokenAddress,
            abi: mockUsdcAbi,
            functionName: "transfer",
            args: [input.to as Address, parseUnits(input.amount, 6)] // 25.5 -> 25.5 * 10^6
        });

        return { hash };
    }
}