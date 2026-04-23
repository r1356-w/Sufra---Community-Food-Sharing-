import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

import LandingPage from './pages/LandingPage'
import MenuPage from './pages/MenuPage'
import CartPage from './components/cart/CartPage'
import TrackingPage from './components/tracking/TrackingPage'
import { LoginPage, RegisterPage } from './pages/AuthPages'
import AdminLayout from './pages/admin/AdminLayout'
import AdminOverviewPage from './pages/admin/AdminOverviewPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminMealsPage from './pages/admin/AdminMealsPage'

const NO_FOOTER_ROUTES = ['/login', '/register', '/track', '/admin']

function AdminRoute({ children }) {
  const { loading, isAuthenticated, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-charcoal-200 border-t-saffron-500 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const location = useLocation()
  const showFooter = !NO_FOOTER_ROUTES.some((r) => location.pathname.startsWith(r))

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />

          <main className="flex-1">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/track/:orderId" element={<TrackingPage />} />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route index element={<AdminOverviewPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="meals" element={<AdminMealsPage />} />
                </Route>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route
                  path="*"
                  element={
                    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
                      <p className="text-6xl mb-6">404</p>
                      <h1 className="font-display text-4xl text-charcoal-900 mb-3">Page not found</h1>
                      <p className="text-charcoal-500 mb-6">The page you are looking for does not exist.</p>
                      <a href="/" className="btn-primary">Go Home</a>
                    </div>
                  }
                />
              </Routes>
            </AnimatePresence>
          </main>

          {showFooter && <Footer />}
        </div>
      </CartProvider>
    </AuthProvider>
  )
}
