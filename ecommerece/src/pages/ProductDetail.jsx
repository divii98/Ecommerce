import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import { useCart } from '../context/CartContext'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { getProductById, loading } = useProducts()
  const product = getProductById(id)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  if (loading) {
    return (
      <div className="page">
        <p>Loading product…</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="page">
        <p>Product not found.</p>
        <Link to="/" className="btn btn-secondary">
          Back to products
        </Link>
      </div>
    )
  }

  function handleAddToCart() {
    addItem(product.id, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="page">
      <button className="btn-link" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <div className="product-detail">
        <div
          className="product-image large"
          style={{ backgroundColor: product.color }}
        >
          <span>{product.emoji}</span>
        </div>
        <div className="product-info">
          <span className="product-category">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="product-price">${product.price.toFixed(2)}</p>
          <p className="product-description">{product.description}</p>
          <p className="product-stock">{product.stock} in stock</p>

          <div className="qty-row">
            <label htmlFor="qty">Quantity</label>
            <div className="qty-control">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>
                −
              </button>
              <input
                id="qty"
                type="number"
                min="1"
                max={product.stock}
                value={qty}
                onChange={(e) =>
                  setQty(Math.max(1, Number(e.target.value) || 1))
                }
              />
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
              >
                +
              </button>
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleAddToCart}>
            {added ? 'Added ✓' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}
