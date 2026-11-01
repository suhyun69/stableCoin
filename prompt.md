npm init -y 
npm i fastify
npm i -D typescript tsx vitest @types/node
npm pkg set name=stablepay
npm run dev

docker ps
docker compose up -d
docker compose exec postgres-2 psql -U stablepay -d stablepay -c "SELECT current_database(), current_user;"

docker compose exec postgres-2 psql -U stablepay -d stablepay
BEGIN;
CREATE TABLE transaction_demo (
  id text PRIMARY KEY,
  amount_atomic numeric(78, 0) NOT NULL
);
INSERT INTO transaction_demo(id, amount_atomic) VALUES ('demo_1', 25500000);
SELECT * FROM transaction_demo;
ROLLBACK;
SELECT to_regclass('public.transaction_demo') AS table_after_rollback;

CREATE TABLE idempotency_demo (
  idempotency_key text PRIMARY KEY,
  payout_id text NOT NULL
);
INSERT INTO idempotency_demo (idempotency_key, payout_id) VALUES ('request-001', 'pay_001');
DROP TABLE idempotency_demo;
\q

curl -L https://getfoundry.sh/install | bash && export PATH="$PATH:$HOME/.foundry/bin" && foundryup && anvil --version
anvil --chain-id 31337
curl -s -X POST http://127.0.0.1:8545 -H 'content-type: application/json' --data '{"jsonrpc":"2.0", "id":1, "method":"eth_chainId", "params":[]}'

npm i viem
set -a
source .env
set +a
npm test
curl -i http://localhost:3000/dependencies/chain
npx tsx --env-file=.env scripts/chain-demo.ts

npm test -- create-payout.http.test.ts
curl -i -X POST http://localhost:3000/payouts \
  -H 'content-type: application/json' \
  -H 'idempotency-key: payout-2026-001' \
  -d '{"merchantId":"merchant_demo_01","recipientAddress":"0x1111111111111111111111111111111111111111","amount":"25.50"}'

/*****/
docker compose exec postgres psql -U stablepay -d stablepay

CREATE TABLE payouts (
  id text PRIMARY KEY,
  idempotency_key text NOT NULL UNIQUE,
  merchant_id text NOT NULL,
  recipient_address text NOT NULL,
  amount_atomic numeric(78, 0) NOT NULL CHECK (amount_atomic > 0),
  request_fingerprint text NOT NULL,
  status text NOT NULL CHECK (
    status IN ('REQUESTED', 'AWAITING_CONFIRMATION', 'SETTLED', 'FAILED', 'REQUIRES_REVIEW')
  ),
  created_at timestamptz NOT NULL DEFAULT now()
);

set -a
source .env
set +a
forge create contracts/MockUSDC.sol:MockUSDC \
  --rpc-url "$ANVIL_RPC_URL" \
  --private-key "$ANVIL_PRIVATE_KEY" \
  --broadcast \
  --constructor-args 1000000000000

npm i pg

anvil --chain-id 31337 --hardfork paris
forge create contracts/MockUSDC.sol:MockUSDC \
  --rpc-url "$ANVIL_RPC_URL" \
  --private-key "$ANVIL_PRIVATE_KEY" \
  --broadcast \
  --constructor-args 1000000000000
/*****/