import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { adminApi } from '../../utils/adminApi'

const STATUSES = ['all', 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [busyId, setBusyId] = useState('')

  const loadOrders = () => {
    setLoading(true)
    adminApi
      .getOrders(filterStatus)
      .then((data) => setOrders(data || []))
      .catch((error) => {
        toast.error(error?.response?.data?.error || 'Failed to load orders.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrders()
  }, [filterStatus])

  const rows = useMemo(() => orders, [orders])

  const updateStatus = async (orderId, status) => {
    setBusyId(orderId)
    try {
      await adminApi.setOrderStatus(orderId, status)
      toast.success('Order status updated.')
      loadOrders()
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to update order status.')
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="font-display text-2xl text-charcoal-900">Orders</h2>
        <select
          className="input py-2.5 max-w-xs"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-charcoal-500">Loading orders...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-charcoal-100 text-charcoal-500">
                <th className="py-3 pr-3">Order</th>
                <th className="py-3 pr-3">Customer</th>
                <th className="py-3 pr-3">Total</th>
                <th className="py-3 pr-3">Created</th>
                <th className="py-3 pr-3">Status</th>
                <th className="py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((order) => (
                <tr key={order._id} className="border-b border-charcoal-100">
                  <td className="py-3 pr-3 font-medium text-charcoal-900">#{order._id.slice(-6)}</td>
                  <td className="py-3 pr-3">{order.user?.name || 'Unknown user'}</td>
                  <td className="py-3 pr-3">GBP {(order.pricing?.total ?? 0).toFixed(2)}</td>
                  <td className="py-3 pr-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 pr-3 capitalize">{String(order.status || '').replaceAll('_', ' ')}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <select
                        className="input py-1.5 px-2 text-xs min-w-36"
                        defaultValue={order.status}
                        disabled={busyId === order._id}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                      >
                        {STATUSES.filter((s) => s !== 'all').map((status) => (
                          <option key={status} value={status}>
                            {status.replaceAll('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-charcoal-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
