import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, ShoppingBag, UtensilsCrossed } from 'lucide-react'

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/meals', label: 'Meals', icon: UtensilsCrossed },
]

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-charcoal-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <p className="section-eyebrow">Admin</p>
          <h1 className="font-display text-3xl text-charcoal-900">Website Administration</h1>
          <p className="text-sm text-charcoal-500 mt-1">Manage users, orders, meals, and platform operations.</p>
        </div>

        <div className="card p-2 mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {LINKS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-charcoal-900 text-white'
                      : 'text-charcoal-600 hover:bg-charcoal-100'
                  }`
                }
              >
                <Icon size={16} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        <Outlet />
      </div>
    </div>
  )
}
