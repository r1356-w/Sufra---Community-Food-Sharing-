import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function AuthLayout({ title, subtitle, children, alt, altLink, altLabel }) {
  return (
    <div className="min-h-screen bg-charcoal-900 flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 grain-overlay pointer-events-none" />
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src="/food-truck-logo.png" alt="Sufra Food Truck" className="h-8 w-auto" />
            <span className="font-display text-2xl font-bold text-white">Sufra</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <h1 className="font-display text-2xl text-charcoal-900 mb-1">{title}</h1>
          <p className="text-charcoal-500 text-sm mb-8">{subtitle}</p>

          {children}

          <p className="text-center text-sm text-charcoal-500 mt-6">
            {alt}{' '}
            <Link to={altLink} className="text-saffron-600 hover:text-saffron-700 font-medium">
              {altLabel}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(email, password)
      toast.success('Welcome back!')
      navigate(user?.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Sufra account"
      alt="New to Sufra?"
      altLink="/register"
      altLabel="Create an account"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pr-10"
              placeholder="********"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <>Sign in <ArrowRight size={16} /></>}
        </button>
      </form>
    </AuthLayout>
  )
}

export function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      const user = await register(form.name, form.email, form.password)
      toast.success('Account created successfully!')
      navigate(user?.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Join the community"
      subtitle="Create your Sufra account and start making an impact"
      alt="Already have an account?"
      altLink="/login"
      altLabel="Sign in"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Full name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={update('name')}
            className="input"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={update('email')}
            className="input"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              required
              minLength={8}
              value={form.password}
              onChange={update('password')}
              className="input pr-10"
              placeholder="Min. 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <>Create Account <ArrowRight size={16} /></>}
        </button>
      </form>
    </AuthLayout>
  )
}
