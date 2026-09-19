import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { signIn } from '../lib/authClient'

export default function SignIn() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error: signInError } = await signIn.email({
      email: form.email,
      password: form.password,
    })

    if (signInError) {
      setError(signInError.message || 'Failed to sign in')
      setSubmitting(false)
      return
    }

    navigate(redirect, { replace: true })
  }

  return (
    <div className="page">
      <h1>Sign in</h1>
      <form className="checkout-form" onSubmit={handleSubmit}>
        <section className="form-section">
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
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
        </section>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p>
        Don&apos;t have an account?{' '}
        <Link to={`/sign-up?redirect=${encodeURIComponent(redirect)}`}>Sign up</Link>
      </p>
    </div>
  )
}
