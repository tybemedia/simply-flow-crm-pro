import { Pool } from "pg";

const connectionString = 'postgresql://postgres:WexCNDyRGgUZLGajrRCvuDhtLTlJYYxb@switchback.proxy.rlwy.net:40434/railway';

export const pool = new Pool({
  connectionString,
});

module.exports = {
    pool,
}; 