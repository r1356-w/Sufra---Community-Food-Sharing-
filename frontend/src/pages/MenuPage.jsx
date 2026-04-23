/**
 * pages/MenuPage.jsx
 *
 * Full menu with category tab filtering, search, and the MenuItemCard grid.
 * Fetches from /api/menu and groups results by category.
 */

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, Heart, Leaf } from 'lucide-react'
import MenuItemCard from '../components/menu/MenuItemCard'
import api from '../utils/api'

const CATEGORIES = [
  { key: 'all',      label: 'All',       emoji: '🍽️' },
  { key: 'starters', label: 'Starters',  emoji: '🥗' },
  { key: 'mains',    label: 'Mains',     emoji: '🫕' },
  { key: 'sides',    label: 'Sides',     emoji: '🥙' },
  { key: 'desserts', label: 'Desserts',  emoji: '🍯' },
  { key: 'drinks',   label: 'Drinks',    emoji: '🧃' },
]

function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-[4/3] w-full" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-5/6 rounded" />
        <div className="skeleton h-10 w-full rounded-xl mt-4" />
      </div>
    </div>
  )
}

export default function MenuPage() {
  const [items,    setItems]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [category, setCategory] = useState('all')
  const [search,   setSearch]   = useState('')

  useEffect(() => {
    api.get('/menu')
      .then(({ data }) => setItems(data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let result = items
    if (category !== 'all') result = result.filter((i) => i.category === category)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((i) =>
        i.name.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q) ||
        i.tags?.some((t) => t.includes(q))
      )
    }
    return result
  }, [items, category, search])

  return (
    <div className="min-h-screen bg-cream pt-20">

      {/* ── Hero strip ───────────────────────────────────────────────────── */}
      <div className="bg-charcoal-900 py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 grain-overlay pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-eyebrow text-saffron-400 mb-3"
          >
            Community Kitchen
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl text-white mb-4"
          >
            The Sufra Menu
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-charcoal-400 max-w-md mx-auto text-sm"
          >
            Every item can be suspended — ordered for someone in need.
            Look for the <Heart size={12} className="inline text-saffron-400 fill-saffron-400" /> checkbox.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Filters ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center
                        justify-between gap-4 mb-8">

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(({ key, label, emoji }) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm
                            font-medium transition-all duration-150
                  ${category === key
                    ? 'bg-charcoal-900 text-white shadow-sm'
                    : 'bg-white border border-charcoal-200 text-charcoal-600 hover:border-charcoal-400'
                  }`}
              >
                <span>{emoji}</span> {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 py-2.5 text-sm"
            />
          </div>
        </div>

        {/* Shared delivery reminder */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8
                     flex items-center gap-3 text-sm"
        >
          <Leaf size={16} className="text-blue-500 flex-shrink-0" />
          <p className="text-blue-700">
            <strong>Shared Delivery</strong> is available at checkout —
            match with a neighbour within 2km and save money + CO₂.
          </p>
        </motion.div>

        {/* ── Item grid ────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">🔍</p>
            <h3 className="font-display text-xl text-charcoal-700">No items found</h3>
            <p className="text-charcoal-500 text-sm mt-2">
              Try a different category or search term.
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            <AnimatePresence>
              {filtered.map((item) => (
                <MenuItemCard key={item._id} item={item} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}
