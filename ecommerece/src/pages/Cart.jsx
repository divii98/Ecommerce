import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { lines, subtotal, updateQty, removeItem, clearCart } = useCart()

  if (lines.length === 0) {
    return (
      <div className="page">
        <h1>Your Cart</h1>
        <p>Your cart is empty.</p>
        <Link to="/" className="btn btn-primary">
          Browse products
        </Link>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Your Cart</h1>
      <div className="cart-list">
        {lines.map(({ product, qty }) => (
          <div className="cart-line" key={product.id}>
            <div
              className="product-image small"
              style={{ backgroundColor: product.color }}
            >
              <span>{product.emoji}</span>
            </div>
            <div className="cart-line-info">
              <h3>{product.name}</h3>
              <p className="product-price">${product.price.toFixed(2)}</p>
            </div>
            <div className="qty-control">
              <button onClick={() => updateQty(product.id, qty - 1)}>−</button>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={qty}
                onChange={(e) =>
                  updateQty(product.id, Math.max(1, Number(e.target.value) || 1))
                }
              />
              <button onClick={() => updateQty(product.id, qty + 1)}>+</button>
            </div>
            <p className="line-total">${(product.price * qty).toFixed(2)}</p>
            <button
              className="btn-link remove"
              onClick={() => removeItem(product.id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <p>
          Subtotal: <strong>${subtotal.toFixed(2)}</strong>
        </p>
        <div className="cart-actions">
          <button className="btn btn-secondary" onClick={clearCart}>
            Clear cart
          </button>
          <Link to="/checkout" className="btn btn-primary">
            Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}
