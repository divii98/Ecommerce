import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Orders() {
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    fetch('/api/orders/mine')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load orders')
        return res.json()
      })
      .then((data) => {
        if (!cancelled) setOrders(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <div className="page">
        <h1>My orders</h1>
        <p className="form-error">{error}</p>
      </div>
    )
  }

  if (!orders) {
    return (
      <div className="page">
        <h1>My orders</h1>
        <p>Loading…</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="page">
        <h1>My orders</h1>
        <p>You haven&apos;t placed any orders yet.</p>
        <Link to="/" className="btn btn-primary">
          Browse products
        </Link>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>My orders</h1>
      <div className="cart-list">
        {orders.map((order) => (
          <div className="cart-line summary-line" key={order.orderId}>
            <div className="cart-line-info">
              <h3>
                <Link to={`/order-confirmation/${order.orderId}`}>{order.orderId}</Link>
              </h3>
              <p className="product-price">
                {new Date(order.createdAt).toLocaleDateString()} ·{' '}
                {order.lines.reduce((sum, line) => sum + line.qty, 0)} item(s)
              </p>
            </div>
            <p className="line-total">${order.total.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
