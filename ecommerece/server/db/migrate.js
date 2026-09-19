import { pool } from './pool.js'
import { products } from '../data/products.js'

export async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      price NUMERIC(10,2) NOT NULL,
      category TEXT NOT NULL,
      emoji TEXT NOT NULL,
      color TEXT NOT NULL,
      description TEXT NOT NULL,
      stock INTEGER NOT NULL
    )
  `)

  // Better Auth's own schema (generated via `npx @better-auth/cli generate`
  // against server/auth.js) for the email/password + session plugin.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "user" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "emailVerified" BOOLEAN NOT NULL,
      "image" TEXT,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "session" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "expiresAt" TIMESTAMPTZ NOT NULL,
      "token" TEXT NOT NULL UNIQUE,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMPTZ NOT NULL,
      "ipAddress" TEXT,
      "userAgent" TEXT,
      "userId" TEXT NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "account" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "accountId" TEXT NOT NULL,
      "providerId" TEXT NOT NULL,
      "userId" TEXT NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
      "accessToken" TEXT,
      "refreshToken" TEXT,
      "idToken" TEXT,
      "accessTokenExpiresAt" TIMESTAMPTZ,
      "refreshTokenExpiresAt" TIMESTAMPTZ,
      "scope" TEXT,
      "password" TEXT,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMPTZ NOT NULL
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "verification" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "identifier" TEXT NOT NULL,
      "value" TEXT NOT NULL,
      "expiresAt" TIMESTAMPTZ NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await pool.query('CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" ("userId")')
  await pool.query('CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account" ("userId")')
  await pool.query(
    'CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" ("identifier")'
  )

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      order_id TEXT PRIMARY KEY,
      lines JSONB NOT NULL,
      subtotal NUMERIC(10,2) NOT NULL,
      shipping NUMERIC(10,2) NOT NULL,
      total NUMERIC(10,2) NOT NULL,
      shipping_details JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      user_id TEXT REFERENCES "user" ("id")
    )
  `)

  await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user" ("id")')

  for (const product of products) {
    await pool.query(
      `INSERT INTO products (id, name, price, category, emoji, color, description, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         price = EXCLUDED.price,
         category = EXCLUDED.category,
         emoji = EXCLUDED.emoji,
         color = EXCLUDED.color,
         description = EXCLUDED.description,
         stock = EXCLUDED.stock`,
      [
        product.id,
        product.name,
        product.price,
        product.category,
        product.emoji,
        product.color,
        product.description,
        product.stock,
      ]
    )
  }
}
