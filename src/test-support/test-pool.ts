import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL ??
    "postgresql://stablepay:stablepay@localhost:5433/stablepay"

export const testPool = new Pool({
    connectionString: connectionString
});