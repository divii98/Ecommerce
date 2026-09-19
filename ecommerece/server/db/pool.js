import { Pool, types } from 'pg'

// Postgres NUMERIC columns come back as strings by default; the app treats
// prices/totals as JS numbers everywhere, so parse them as floats.
types.setTypeParser(types.builtins.NUMERIC, parseFloat)

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})
