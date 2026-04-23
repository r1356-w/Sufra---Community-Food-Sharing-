/**
 * components/landing/ImpactDashboard.jsx
 *
 * Live impact counters section on the landing page.
 * Subscribes to Socket.io 'impact:updated' events and animates
 * each counter when new data arrives.
 */

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Soup, Leaf, Users, Share2, ShoppingBag, Heart } from 'lucide-react'
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter'
import { useImpactSocket } from '../../hooks/useSocket'
import api from '../../utils/api'

// ── Individual stat card ───────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, unit, color, decimals = 0, delay = 0 }) {
  const animated = useAnimatedCounter(value, 1400, decimals)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className="relative group"
    >
      <div className={`
        card p-6 h-full flex flex-col gap-4
        hover:-translate-y-1 transition-transform duration-300
        overflow-hidden
      `}>
        {/* Background glow */}
        <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-xl ${color}`} />

        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-opacity-15`}>
          <Icon size={20} className={color.replace('bg-', 'text-')} />
        </div>

        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-3xl font-bold text-charcoal-900">
              {animated.toLocaleString()}
            </span>
            {unit && (
              <span className="text-sm text-charcoal-500 font-medium">{unit}</span>
            )}
          </div>
          <p className="text-sm text-charcoal-500 mt-1">{label}</p>
        </div>
      </div>
    </motion.div>
  )
}

// ── Live suspended meals banner ────────────────────────────────────────────────
function SuspendedMealsBanner({ available }) {
  const animated = useAnimatedCounter(available, 1000)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-gradient-to-r from-saffron-500 to-terracotta-500 rounded-2xl p-6 md:p-8
                 text-charcoal-900 relative overflow-hidden"
    >
      {/* Decorative ring */}
      <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full border-2
                      border-white/20 animate-spin-slow" />
      <div className="absolute -right-4 -top-4 w-32 h-32 rounded-full border-2
                      border-white/10 animate-spin-slow" style={{ animationDirection: 'reverse' }} />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center
                      justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="live-badge bg-white/30 text-charcoal-900">
              <span className="live-dot bg-charcoal-800" />
              Live
            </div>
          </div>
          <h3 className="font-display text-3xl md:text-4xl font-bold">
            {animated.toLocaleString()}
          </h3>
          <p className="text-lg font-medium mt-1 text-charcoal-800">
            Meals available to claim right now
          </p>
          <p className="text-sm mt-2 text-charcoal-700 max-w-md">
            These are meals donated by our community — ready to be claimed by anyone
            who needs one. No questions asked.
          </p>
        </div>

        <div className="flex-shrink-0">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center justify-center select-none"
          >
            <img src="/food-truck-logo.png" alt="Sufra Food Truck" className="h-30 w-auto" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function ImpactDashboard() {
  const [stats, setStats] = useState({
    suspendedMealsAvailable: 0,
    totalMealsDonated:       0,
    totalMealsDelivered:     0,
    totalCo2Saved:           0,
    totalSharedDeliveries:   0,
    totalOrders:             0,
  })
  const [lastEvent, setLastEvent] = useState(null)

  // Initial fetch
  useEffect(() => {
    api.get('/impact-stats')
      .then(({ data }) => setStats(data))
      .catch(console.error)
  }, [])

  // Live updates via Socket.io
  const handleImpactUpdate = useCallback((data) => {
    setStats(data)
    setLastEvent(data.timestamp)
  }, [])

  useImpactSocket(handleImpactUpdate)

  const statCards = [
    {
      icon: Soup,
      label: 'Total meals donated',
      value: stats.totalMealsDonated,
      color: 'bg-saffron-500',
      delay: 0.1,
    },
    {
      icon: Heart,
      label: 'Meals delivered to people in need',
      value: stats.totalMealsDelivered,
      color: 'bg-terracotta-500',
      delay: 0.2,
    },
    {
      icon: Leaf,
      label: 'kg CO₂ saved via shared delivery',
      value: stats.totalCo2Saved,
      decimals: 1,
      color: 'bg-green-500',
      delay: 0.3,
    },
    {
      icon: Share2,
      label: 'Shared deliveries completed',
      value: stats.totalSharedDeliveries,
      color: 'bg-blue-500',
      delay: 0.4,
    },
    {
      icon: ShoppingBag,
      label: 'Total community orders',
      value: stats.totalOrders,
      color: 'bg-purple-500',
      delay: 0.5,
    },
    {
      icon: Users,
      label: 'Donors in our community',
      value: stats.totalDonors || 0,
      color: 'bg-pink-500',
      delay: 0.6,
    },
  ]

  return (
    <section id="impact" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="section-eyebrow mb-3">Real impact, tracked live</p>
          <h2 className="font-display text-4xl md:text-5xl text-charcoal-900 mb-4">
            Every order counts
          </h2>
          <p className="text-charcoal-500 max-w-xl mx-auto">
            These numbers update in real time as our community orders, donates, and shares.
          </p>
          {lastEvent && (
            <div className="live-badge mx-auto mt-4 w-fit">
              <span className="live-dot" />
              Updated just now
            </div>
          )}
        </motion.div>

        {/* Live suspended meals highlight */}
        <div className="mb-10">
          <SuspendedMealsBanner available={stats.suspendedMealsAvailable} />
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>
      </div>
    </section>
  )
}
