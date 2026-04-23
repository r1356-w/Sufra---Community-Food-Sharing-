import { useEffect, useMemo, useState } from 'react'
import { Users, ShoppingBag, UtensilsCrossed, Heart } from 'lucide-react'
import { adminApi } from '../../utils/adminApi'
import toast from 'react-hot-toast'

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-charcoal-500">{title}</p>
        <Icon size={18} className="text-saffron-600" />
      </div>
      <p className="font-display text-3xl text-charcoal-900">{value}</p>
    </div>
  )
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    Promise.all([adminApi.getStats(), adminApi.getOrders()])
      .then(([statsData, ordersData]) => {
        if (!mounted) return
        setStats(statsData)
        setOrders(ordersData)
      })
      .catch((error) => {
        toast.error(error?.response?.data?.error || 'Failed to load admin dashboard.')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const recentOrders = useMemo(() => orders.slice(0, 6), [orders])

  if (loading) {
    return <div className="card p-8 text-center text-charcoal-500">Loading admin dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats?.totalUsers ?? 0} icon={Users} />
        <StatCard title="Total Orders" value={stats?.totalOrders ?? 0} icon={ShoppingBag} />
        <StatCard title="Meals in Menu" value={stats?.totalMenuItems ?? 0} icon={UtensilsCrossed} />
        <StatCard title="Total Donations" value={`GBP ${(stats?.totalDonations ?? 0).toFixed(2)}`} icon={Heart} />
      </div>

      <div className="card p-5">
        <h2 className="font-display text-xl text-charcoal-900 mb-4">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-charcoal-500">No orders available.</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between border border-charcoal-100 rounded-xl p-3">
                <div>
                  <p className="font-medium text-charcoal-900">Order #{order._id.slice(-6)}</p>
                  <p className="text-xs text-charcoal-500">{order.user?.name || 'Unknown user'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-charcoal-900">GBP {(order.pricing?.total ?? 0).toFixed(2)}</p>
                  <p className="text-xs text-charcoal-500 capitalize">{String(order.status || '').replaceAll('_', ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
