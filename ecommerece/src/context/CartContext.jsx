import { createContext, useContext, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useProducts } from './ProductsContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useLocalStorage('ecommerce_cart', [])
  const { getProductById } = useProducts()

  function addItem(productId, qty = 1) {
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === productId)
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, qty: item.qty + qty }
            : item
        )
      }
      return [...prev, { productId, qty }]
    })
  }

  function removeItem(productId) {
    setItems((prev) => prev.filter((item) => item.productId !== productId))
  }

  function updateQty(productId, qty) {
    if (qty <= 0) {
      removeItem(productId)
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, qty } : item
      )
    )
  }

  function clearCart() {
    setItems([])
  }

  const lines = useMemo(
    () =>
      items
        .map((item) => {
          const product = getProductById(item.productId)
          if (!product) return null
          return { ...item, product }
        })
        .filter(Boolean),
    [items, getProductById]
  )

  const itemCount = useMemo(
    () => lines.reduce((sum, line) => sum + line.qty, 0),
    [lines]
  )

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.qty * line.product.price, 0),
    [lines]
  )

  const value = {
    lines,
    itemCount,
    subtotal,
    addItem,
    removeItem,
    updateQty,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return ctx
}
