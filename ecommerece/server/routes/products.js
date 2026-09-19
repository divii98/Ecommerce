import { Router } from 'express'
import { pool } from '../db/pool.js'

const router = Router()

router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM products ORDER BY id')
  res.json(rows)
})

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: 'Product not found' })
  }

  const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id])
  if (rows.length === 0) {
    return res.status(404).json({ error: 'Product not found' })
  }
  res.json(rows[0])
})

export default router
