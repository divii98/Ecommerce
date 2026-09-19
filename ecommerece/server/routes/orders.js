import { Router } from 'express'
import { fromNodeHeaders } from 'better-auth/node'
import { auth } from '../auth.js'
import { pool } from '../db/pool.js'
import { createOrder, getOrder, getOrdersForUser } from '../store/orders.js'

const FREE_SHIPPING_THRESHOLD = 75
const SHIPPING_COST = 5.99
const REQUIRED_SHIPPING_FIELDS = [
  'fullName',
  'email',
  'address',
  'city',
  'postalCode',
  'country',
]

const router = Router()

router.post('/', async (req, res) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) })
  if (!session) {
    return res.status(401).json({ error: 'You must be signed in to place an order' })
  }

  const { items, shippingDetails } = req.body ?? {}

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must include at least one item' })
  }

  const productIds = items.map((item) => Number(item.productId))
  const { rows: productRows } = await pool.query(
    'SELECT * FROM products WHERE id = ANY($1)',
    [productIds]
  )
  const productsById = new Map(productRows.map((product) => [product.id, product]))

  const lines = []
  for (const item of items) {
    const product = productsById.get(Number(item.productId))
    const qty = Number(item.qty)
    if (!product || !Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ error: `Invalid item: ${item.productId}` })
    }
    lines.push({ product, qty })
  }

  for (const field of REQUIRED_SHIPPING_FIELDS) {
    if (!shippingDetails?.[field]) {
      return res.status(400).json({ error: `Missing shipping field: ${field}` })
    }
  }

  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.qty, 0)
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const total = subtotal + shipping

  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`
  const createdAt = new Date().toISOString()

  await createOrder({
    orderId,
    lines: lines.map(({ product, qty }) => ({
      productId: product.id,
      qty,
      unitPrice: product.price,
    })),
    subtotal,
    shipping,
    total,
    shippingDetails,
    createdAt,
    userId: session.user.id,
  })

  res.status(201).json({
    orderId,
    lines,
    subtotal,
    shipping,
    total,
    shippingDetails,
    createdAt,
  })
})

router.get('/mine', async (req, res) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) })
  if (!session) {
    return res.status(401).json({ error: 'You must be signed in to view your orders' })
  }

  const orders = await getOrdersForUser(session.user.id)
  res.json(orders)
})

router.get('/:orderId', async (req, res) => {
  const order = await getOrder(req.params.orderId)
  if (!order) {
    return res.status(404).json({ error: 'Order not found' })
  }
  res.json(order)
})

export default router
