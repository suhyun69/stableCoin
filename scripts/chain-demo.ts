import {
    createPublicClient,
    createWalletClient,
    formatEther,
    http,
    parseEther
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { foundry } from "viem/chains";

function required(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(`${name} is required`);
    }

    return value;
}

const rpcUrl = required("ANVIL_RPC_URL");
const privateKey = required("ANVIL_PRIVATE_KEY") as `0x${string}`;
const recipientAddress = required("ANVIL_RECIPIENT_ADDRESS") as `0x${string}`;
const account = privateKeyToAccount(privateKey);

const publicClient = createPublicClient({
    chain: foundry,
    transport: http(rpcUrl)
});

const walletClient = createWalletClient({
    account,
    chain: foundry,
    transport: http(rpcUrl)
});

const [chainId, senderBalance, recipientBalance] = await Promise.all([
    publicClient.getChainId(),
    publicClient.getBalance({ address: account.address }),
    publicClient.getBalance({ address: recipientAddress })
]);

console.log({
    chainId,
    sender: account.address,
    senderBalance: formatEther(senderBalance),
    recipient: recipientAddress,
    recipientBalance: formatEther(recipientBalance)
});

const hash = await walletClient.sendTransaction({
    account,
    to: recipientAddress,
    value: parseEther("0.01")
});

console.log({ hash });

const receipt = await publicClient.waitForTransactionReceipt({
    hash,
    confirmations: 1
});

console.log({
    status: receipt.status,
    blockNumber: receipt.blockNumber.toString()
});