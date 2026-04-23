/**
 * components/tracking/TrackingPage.jsx
 *
 * Real-time order tracking. Joins the order's Socket.io room and updates
 * the progress timeline as statuses change.
 *
 * Uses Lucide icons for a clean, icon-driven status timeline.
 */

import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, Clock, ChefHat, Bike, Package,
  MapPin, Heart, Leaf, ArrowLeft, Loader2, RefreshCw
} from 'lucide-react'
import { useOrderTracking } from '../../hooks/useSocket'
import api from '../../utils/api'
import toast from 'react-hot-toast'

// ── Status step config ─────────────────────────────────────────────────────────
const STATUS_STEPS = [
  {
    key:   'pending',
    label: 'Order Received',
    icon:  Package,
    desc:  'We\'ve received your order and are processing payment.',
  },
  {
    key:   'confirmed',
    label: 'Order Confirmed',
    icon:  CheckCircle2,
    desc:  'Your order has been confirmed and sent to the kitchen.',
  },
  {
    key:   'preparing',
    label: 'Preparing',
    icon:  ChefHat,
    desc:  'Our chefs are preparing your meal with care.',
  },
  {
    key:   'out_for_delivery',
    label: 'Out for Delivery',
    icon:  Bike,
    desc:  'Your order is on its way. Estimated arrival in 15–20 min.',
  },
  {
    key:   'delivered',
    label: 'Delivered',
    icon:  CheckCircle2,
    desc:  'Your order has been delivered. Enjoy! 🫕',
  },
]

const STATUS_INDEX = Object.fromEntries(STATUS_STEPS.map((s, i) => [s.key, i]))

// ── Progress bar ───────────────────────────────────────────────────────────────
function ProgressBar({ currentStatus }) {
  const currentIdx = STATUS_INDEX[currentStatus] ?? 0
  const progress   = currentStatus === 'delivered'
    ? 100
    : (currentIdx / (STATUS_STEPS.length - 1)) * 100

  return (
    <div className="relative mb-12">
      {/* Track */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-charcoal-100" />
      {/* Fill */}
      <motion.div
        className="absolute top-5 left-0 h-0.5 bg-saffron-500"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />

      {/* Steps */}
      <div className="relative flex justify-between">
        {STATUS_STEPS.map((step, i) => {
          const done    = i < currentIdx
          const active  = i === currentIdx
          const future  = i > currentIdx

          return (
            <div key={step.key} className="flex flex-col items-center gap-3">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: active ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`relative w-10 h-10 rounded-full flex items-center justify-center
                  border-2 transition-all duration-500 z-10
                  ${done
                    ? 'bg-saffron-500 border-saffron-500 text-charcoal-900'
                    : active
                    ? 'bg-white border-saffron-500 text-saffron-600'
                    : 'bg-white border-charcoal-200 text-charcoal-300'
                  }`}
              >
                <step.icon size={17} strokeWidth={active ? 2.5 : 2} />
                {active && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-saffron-400"
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>

              <div className="text-center hidden md:block">
                <p className={`text-xs font-medium ${
                  active ? 'text-saffron-600' : done ? 'text-charcoal-700' : 'text-charcoal-400'
                }`}>
                  {step.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function TrackingPage() {
  const { orderId }   = useParams()
  const [order,       setOrder]       = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [lastUpdate,  setLastUpdate]  = useState(null)

  // Fetch order details
  const fetchOrder = useCallback(async () => {
    try {
      const { data } = await api.get(`/orders/${orderId}`)
      setOrder(data.order)
    } catch (err) {
      toast.error('Could not load order details.')
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => { fetchOrder() }, [fetchOrder])

  // Real-time status updates via Socket.io
  const handleStatusChange = useCallback((data) => {
    setOrder((prev) => prev ? { ...prev, status: data.status } : prev)
    setLastUpdate(new Date())

    const messages = {
      confirmed:        'Order confirmed! Kitchen is ready.',
      preparing:        'The chefs are cooking your meal 🍳',
      out_for_delivery: 'Your food is on its way! 🛵',
      delivered:        'Order delivered! Enjoy your meal 🫕',
    }
    if (messages[data.status]) toast.success(messages[data.status])
  }, [])

  useOrderTracking(orderId, handleStatusChange)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-saffron-500 mx-auto mb-3" />
          <p className="text-charcoal-500">Loading your order...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <p className="text-4xl mb-4">🔍</p>
          <h2 className="font-display text-2xl mb-2">Order not found</h2>
          <Link to="/" className="btn-primary mt-4">Go Home</Link>
        </div>
      </div>
    )
  }

  const currentStep = STATUS_STEPS.find((s) => s.key === order.status) || STATUS_STEPS[0]
  const isDelivered = order.status === 'delivered'

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Back */}
        <Link to="/menu" className="inline-flex items-center gap-2 text-sm text-charcoal-500
                                    hover:text-charcoal-900 mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to Menu
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="section-eyebrow mb-1">Order Tracking</p>
            <h1 className="font-display text-3xl text-charcoal-900">
              {isDelivered ? 'Delivered! 🎉' : 'On its way...'}
            </h1>
            <p className="text-charcoal-500 text-sm mt-1">
              #{orderId.slice(-8).toUpperCase()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdate && (
              <p className="text-xs text-charcoal-400">
                Updated {lastUpdate.toLocaleTimeString()}
              </p>
            )}
            <button
              onClick={fetchOrder}
              className="p-2 rounded-full hover:bg-charcoal-100 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={15} className="text-charcoal-600" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="card p-6 md:p-8 mb-6">
          <ProgressBar currentStatus={order.status} />

          {/* Current status description */}
          <AnimatePresence mode="wait">
            <motion.div
              key={order.status}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-center"
            >
              <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3
                ${isDelivered ? 'bg-green-100' : 'bg-saffron-100'}`}
              >
                <currentStep.icon
                  size={24}
                  className={isDelivered ? 'text-green-600' : 'text-saffron-600'}
                  strokeWidth={isDelivered ? 2.5 : 2}
                />
              </div>
              <h2 className="font-display text-xl text-charcoal-900 mb-1">
                {currentStep.label}
              </h2>
              <p className="text-charcoal-500 text-sm">{currentStep.desc}</p>

              {order.status === 'out_for_delivery' && (
                <div className="flex items-center justify-center gap-1.5 mt-3
                                text-sm text-charcoal-600">
                  <Clock size={14} />
                  <span>Est. arrival: {order.estimatedDeliveryMinutes || 35} minutes</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Order breakdown */}
        <div className="grid md:grid-cols-2 gap-5">

          {/* Regular items */}
          {order.regularItems?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-medium text-charcoal-900 mb-4 flex items-center gap-2">
                <Package size={15} /> Your Order
              </h3>
              <ul className="space-y-2">
                {order.regularItems.map((item, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span className="text-charcoal-700">
                      {item.quantity}× {item.name}
                    </span>
                    <span className="text-charcoal-500">
                      £{(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suspended items */}
          {order.suspendedItems?.length > 0 && (
            <div className="bg-saffron-50 border border-saffron-200 rounded-2xl p-5">
              <h3 className="font-medium text-saffron-800 mb-4 flex items-center gap-2">
                <Heart size={15} className="fill-saffron-400" /> Meals Donated
              </h3>
              <ul className="space-y-2">
                {order.suspendedItems.map((item, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span className="text-saffron-700">
                      {item.quantity}× {item.name}
                    </span>
                    <span className="text-saffron-500">
                      £{(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-saffron-600 mt-3 border-t border-saffron-200 pt-3">
                These meals are now available in our community pool 🫕
              </p>
            </div>
          )}

          {/* Pricing */}
          <div className="card p-5">
            <h3 className="font-medium text-charcoal-900 mb-4">Pricing</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-charcoal-600">
                <span>Subtotal</span>
                <span>£{order.pricing?.subtotal?.toFixed(2)}</span>
              </div>
              {order.pricing?.donationTotal > 0 && (
                <div className="flex justify-between text-saffron-600">
                  <span>Donations</span>
                  <span>£{order.pricing.donationTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-charcoal-600">
                <span>Delivery</span>
                <span>£{order.pricing?.deliveryFee?.toFixed(2)}</span>
              </div>
              {order.pricing?.sharedDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1"><Leaf size={12} /> Shared</span>
                  <span>−£{order.pricing.sharedDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-charcoal-100 pt-2 flex justify-between font-bold text-charcoal-900">
                <span>Total</span>
                <span>£{order.pricing?.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery address */}
          <div className="card p-5">
            <h3 className="font-medium text-charcoal-900 mb-4 flex items-center gap-2">
              <MapPin size={15} /> Delivery To
            </h3>
            <p className="text-sm text-charcoal-600">
              {order.deliveryAddress?.street}<br />
              {order.deliveryAddress?.city}
              {order.deliveryAddress?.postcode ? `, ${order.deliveryAddress.postcode}` : ''}
            </p>
            {order.sharedDelivery?.isShared && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-600">
                <Leaf size={12} />
                Shared delivery — CO₂ saved!
              </div>
            )}
          </div>
        </div>

        {/* Status history */}
        {order.statusHistory?.length > 0 && (
          <div className="card p-5 mt-5">
            <h3 className="font-medium text-charcoal-900 mb-4">Timeline</h3>
            <ul className="space-y-3">
              {[...order.statusHistory].reverse().map((h, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${i === 0 ? 'bg-saffron-500' : 'bg-charcoal-300'}`} />
                  <span className="text-charcoal-700 capitalize">{h.status.replace('_', ' ')}</span>
                  <span className="text-charcoal-400 text-xs ml-auto">
                    {new Date(h.changedAt).toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
