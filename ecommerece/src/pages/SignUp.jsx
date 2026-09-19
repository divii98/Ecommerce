import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { signUp } from '../lib/authClient'

export default function SignUp() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [form, setForm] = useState({ name: '', email: '', password: '' })
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

    const { error: signUpError } = await signUp.email({
      name: form.name,
      email: form.email,
      password: form.password,
    })

    if (signUpError) {
      setError(signUpError.message || 'Failed to sign up')
      setSubmitting(false)
      return
    }

    navigate(redirect, { replace: true })
  }

  return (
    <div className="page">
      <h1>Sign up</h1>
      <form className="checkout-form" onSubmit={handleSubmit}>
        <section className="form-section">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              value={form.name}
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
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={8}
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
        </section>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
      <p>
        Already have an account?{' '}
        <Link to={`/sign-in?redirect=${encodeURIComponent(redirect)}`}>Sign in</Link>
      </p>
    </div>
  )
}
