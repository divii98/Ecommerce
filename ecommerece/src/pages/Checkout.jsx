import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const FREE_SHIPPING_THRESHOLD = 75
const SHIPPING_COST = 5.99

const initialForm = {
  fullName: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
  cardNumber: '',
  expiry: '',
  cvc: '',
}

export default function Checkout() {
  const { lines, subtotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const total = subtotal + shipping

  if (lines.length === 0) {
    return (
      <div className="page">
        <h1>Checkout</h1>
        <p>Your cart is empty.</p>
        <Link to="/" className="btn btn-primary">
          Browse products
        </Link>
      </div>
    )
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: lines.map(({ product, qty }) => ({ productId: product.id, qty })),
          shippingDetails: {
            fullName: form.fullName,
            email: form.email,
            address: form.address,
            city: form.city,
            postalCode: form.postalCode,
            country: form.country,
          },
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to place order')
      }

      const order = await res.json()
      clearCart()
      navigate(`/order-confirmation/${order.orderId}`, { state: { order } })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <h1>Checkout</h1>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <section className="form-section">
            <h2>Shipping information</h2>
            <div className="form-group">
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="postalCode">Postal code</label>
                <input
                  id="postalCode"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                id="country"
                name="country"
                value={form.country}
                onChange={handleChange}
                required
              />
            </div>
          </section>

          <section className="form-section">
            <h2>Payment</h2>
            <div className="form-group">
              <label htmlFor="cardNumber">Card number</label>
              <input
                id="cardNumber"
                name="cardNumber"
                inputMode="numeric"
                pattern="[0-9\s]{12,19}"
                placeholder="4242 4242 4242 4242"
                value={form.cardNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="expiry">Expiry (MM/YY)</label>
                <input
                  id="expiry"
                  name="expiry"
                  placeholder="MM/YY"
                  pattern="(0[1-9]|1[0-2])\/[0-9]{2}"
                  value={form.expiry}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="cvc">CVC</label>
                <input
                  id="cvc"
                  name="cvc"
                  inputMode="numeric"
                  pattern="[0-9]{3,4}"
                  value={form.cvc}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </section>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary checkout-submit" disabled={submitting}>
            {submitting ? 'Placing order…' : `Place order · $${total.toFixed(2)}`}
          </button>
        </form>

        <aside className="checkout-summary">
          <h2>Order summary</h2>
          <div className="cart-list">
            {lines.map(({ product, qty }) => (
              <div className="cart-line summary-line" key={product.id}>
                <div
                  className="product-image small"
                  style={{ backgroundColor: product.color }}
                >
                  <span>{product.emoji}</span>
                </div>
                <div className="cart-line-info">
                  <h3>{product.name}</h3>
                  <p className="product-price">Qty {qty}</p>
                </div>
                <p className="line-total">${(product.price * qty).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
