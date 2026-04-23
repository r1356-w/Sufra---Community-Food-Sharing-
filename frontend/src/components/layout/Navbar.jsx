import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout, isAuthenticated, isAdmin } = useAuth()
  const { totalItems } = useCart()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Menu', to: '/menu' },
    { label: 'Impact', to: '/#impact' },
    { label: 'About', to: '/#about' },
  ]

  const isActive = (path) => (path.startsWith('/#') ? false : location.pathname === path)

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-cream/90 backdrop-blur-md shadow-sm border-b border-charcoal-100'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/food-truck-logo.png" alt="Sufra Food Truck" className="h-10 w-auto" />
              <span
                className={`font-display text-xl font-bold transition-colors ${
                  scrolled ? 'text-charcoal-900 group-hover:text-saffron-600' : 'text-white group-hover:text-saffron-400'
                }`}
              >
                Sufra
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                    isActive(to)
                      ? 'bg-saffron-100 text-saffron-700'
                      : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/cart"
                className="relative p-2 rounded-full hover:bg-charcoal-100 transition-colors"
                aria-label={`Cart, ${totalItems} items`}
              >
                <ShoppingBag size={20} className="text-charcoal-700" />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-saffron-500 text-charcoal-900 text-[10px] font-bold rounded-full flex items-center justify-center"
                    >
                      {totalItems > 9 ? '9+' : totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {isAuthenticated ? (
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-sm text-charcoal-600">Hi, {user?.name?.split(' ')[0]}</span>
                  {isAdmin && (
                    <Link to="/admin" className="text-sm text-saffron-600 hover:text-saffron-700 font-medium">
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="p-2 rounded-full hover:bg-charcoal-100 transition-colors"
                    title="Sign out"
                  >
                    <LogOut size={18} className="text-charcoal-600" />
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/login" className="btn-ghost text-sm py-1.5">
                    Sign in
                  </Link>
                  <Link to="/register" className="btn-primary text-sm py-2">
                    Join
                  </Link>
                </div>
              )}

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-full hover:bg-charcoal-100 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={20} className="text-charcoal-700" /> : <Menu size={20} className="text-charcoal-700" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-cream border-b border-charcoal-100 shadow-lg md:hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  className="block px-4 py-3 rounded-xl text-charcoal-700 hover:bg-charcoal-100 font-medium"
                >
                  {label}
                </Link>
              ))}
              {isAuthenticated && isAdmin && (
                <Link to="/admin" className="block px-4 py-3 rounded-xl text-saffron-700 bg-saffron-50 font-medium">
                  Admin Panel
                </Link>
              )}
              <div className="border-t border-charcoal-100 pt-3 mt-3 flex flex-col gap-2">
                {isAuthenticated ? (
                  <button onClick={logout} className="btn-ghost justify-start">
                    <LogOut size={16} /> Sign out
                  </button>
                ) : (
                  <>
                    <Link to="/login" className="btn-secondary">
                      Sign in
                    </Link>
                    <Link to="/register" className="btn-primary">
                      Create account
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
