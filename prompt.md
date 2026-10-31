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