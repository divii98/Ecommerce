import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { ensureSchema } from './db/migrate.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 3000

if (!process.env.DATABASE_URL) {
  console.error(
    'DATABASE_URL is not set. Create a Neon Postgres project and put its connection string in a .env file (see .env.example).'
  )
  process.exit(1)
}

if (!process.env.BETTER_AUTH_SECRET) {
  console.error(
    'BETTER_AUTH_SECRET is not set. Add a random secret to your .env file (see .env.example).'
  )
  process.exit(1)
}

async function createServer() {
  await ensureSchema()

  // Deferred until after ensureSchema() so Better Auth's own startup schema
  // check (which runs when server/auth.js is first imported) never races
  // against table creation on a brand-new database.
  const { toNodeHandler } = await import('better-auth/node')
  const { auth } = await import('./auth.js')
  const { default: productsRouter } = await import('./routes/products.js')
  const { default: ordersRouter } = await import('./routes/orders.js')

  const app = express()

  // Mounted before express.json() — Better Auth parses its own request body.
  app.all('/api/auth/*splat', toNodeHandler(auth))

  app.use(express.json())

  app.use('/api/products', productsRouter)
  app.use('/api/orders', ordersRouter)

  if (isProduction) {
    const distPath = path.join(root, 'dist')
    app.use(express.static(distPath))
    app.get(/^(?!\/api).*/, (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'))
    })
  } else {
    const { createServer: createViteServer } = await import('vite')
    const vite = await createViteServer({
      root,
      server: { middlewareMode: true },
      appType: 'spa',
    })
    app.use(vite.middlewares)
  }

  app.listen(port, () => {
    console.log(
      `Server running at http://localhost:${port} (${isProduction ? 'production' : 'development'})`
    )
  })
}

createServer()
