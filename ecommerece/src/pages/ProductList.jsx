import { useProducts } from '../context/ProductsContext'
import ProductCard from '../components/ProductCard'

export default function ProductList() {
  const { products, loading, error } = useProducts()

  return (
    <div className="page">
      <h1>Products</h1>
      {loading && <p>Loading products…</p>}
      {error && <p>Couldn't load products: {error}</p>}
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
