npm init -y 
npm i fastify
npm i -D typescript tsx vitest @types/node
npm pkg set name=stablepay
npm run dev

docker ps
docker compose up -d
docker compose exec postgres-2 psql -U stablepay -d stablepay -c "SELECT current_database(), current_user;"