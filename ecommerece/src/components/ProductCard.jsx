import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  return (
    <div className="product-card">
      <div className="product-image" style={{ backgroundColor: product.color }}>
        <span>{product.emoji}</span>
      </div>
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3>{product.name}</h3>
        <p className="product-price">${product.price.toFixed(2)}</p>
        <Link to={`/product/${product.id}`} className="btn btn-secondary">
          View details
        </Link>
      </div>
    </div>
  )
}
