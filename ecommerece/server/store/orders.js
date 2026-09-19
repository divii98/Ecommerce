import { pool } from '../db/pool.js'

export async function createOrder(order) {
  await pool.query(
    `INSERT INTO orders (order_id, lines, subtotal, shipping, total, shipping_details, created_at, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      order.orderId,
      JSON.stringify(order.lines),
      order.subtotal,
      order.shipping,
      order.total,
      JSON.stringify(order.shippingDetails),
      order.createdAt,
      order.userId,
    ]
  )
  return order
}

export async function getOrdersForUser(userId) {
  const { rows } = await pool.query(
    'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  )
  if (rows.length === 0) return []

  const productIds = [...new Set(rows.flatMap((row) => row.lines.map((line) => line.productId)))]
  const { rows: productRows } = await pool.query(
    'SELECT * FROM products WHERE id = ANY($1)',
    [productIds]
  )
  const productsById = new Map(productRows.map((product) => [product.id, product]))

  return rows.map((row) => ({
    orderId: row.order_id,
    lines: row.lines.map((line) => ({
      product: { ...productsById.get(line.productId), price: line.unitPrice },
      qty: line.qty,
    })),
    subtotal: row.subtotal,
    shipping: row.shipping,
    total: row.total,
    shippingDetails: row.shipping_details,
    createdAt: row.created_at,
  }))
}

export async function getOrder(orderId) {
  const { rows } = await pool.query('SELECT * FROM orders WHERE order_id = $1', [
    orderId,
  ])
  if (rows.length === 0) return null

  const row = rows[0]
  const productIds = row.lines.map((line) => line.productId)

  const { rows: productRows } = await pool.query(
    'SELECT * FROM products WHERE id = ANY($1)',
    [productIds]
  )
  const productsById = new Map(productRows.map((product) => [product.id, product]))

  return {
    orderId: row.order_id,
    lines: row.lines.map((line) => ({
      product: { ...productsById.get(line.productId), price: line.unitPrice },
      qty: line.qty,
    })),
    subtotal: row.subtotal,
    shipping: row.shipping,
    total: row.total,
    shippingDetails: row.shipping_details,
    createdAt: row.created_at,
  }
}
