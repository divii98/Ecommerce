import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { signOut, useSession } from '../lib/authClient'

export default function Header() {
  const { itemCount } = useCart()
  const { data: session } = useSession()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="header">
      <Link to="/" className="logo">
        🛍️ ShopLite
      </Link>
      <nav className="nav">
        <Link to="/">Products</Link>
        <Link to="/cart" className="cart-link">
          Cart
          {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
        </Link>
        {session ? (
          <>
            <Link to="/orders">My orders</Link>
            <span>{session.user.name || session.user.email}</span>
            <button type="button" className="btn" onClick={handleSignOut}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/sign-in">Sign in</Link>
            <Link to="/sign-up">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  )
}
