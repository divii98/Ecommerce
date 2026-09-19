import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'

export default function OrderConfirmation() {
  const { orderId } = useParams()
  const { state } = useLocation()
  const [order, setOrder] = useState(state?.order ?? null)
  const [loading, setLoading] = useState(!state?.order)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (state?.order) return

    fetch(`/api/orders/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Order not found')
        return res.json()
      })
      .then(setOrder)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [orderId, state])

  if (loading) {
    return (
      <div className="page">
        <p>Loading order…</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="page">
        <h1>No order found</h1>
        <p>We couldn't find an order to show. It may have already been placed.</p>
        <Link to="/" className="btn btn-primary">
          Back to shop
        </Link>
      </div>
    )
  }

  const { lines, subtotal, shipping, total, shippingDetails } = order

  return (
    <div className="page">
      <div className="order-confirmation">
        <span className="order-check">✓</span>
        <h1>Thank you, your order is confirmed!</h1>
        <p className="order-id">
          Order <strong>{order.orderId}</strong>
        </p>

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

        <div className="shipping-recap">
          <h2>Shipping to</h2>
          <p>
            {shippingDetails.fullName}
            <br />
            {shippingDetails.address}
            <br />
            {shippingDetails.city}, {shippingDetails.postalCode}
            <br />
            {shippingDetails.country}
          </p>
        </div>

        <Link to="/" className="btn btn-primary">
          Continue shopping
        </Link>
      </div>
    </div>
  )
}
