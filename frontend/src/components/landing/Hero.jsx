/**
 * components/landing/Hero.jsx
 *
 * Full-viewport hero with layered typography, animated food emoji,
 * and clear CTAs. Dark, atmospheric background with saffron accents.
 */

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown, Soup, Leaf, Users } from 'lucide-react'

const HERO_PILLS = [
  { icon: Soup,  label: 'Suspend a Meal' },
  { icon: Leaf,  label: 'Share Delivery' },
  { icon: Users, label: 'Feed the Community' },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center bg-charcoal-900 overflow-hidden">

      {/* ── Background texture ────────────────────────────────────────────── */}
      <div className="absolute inset-0 grain-overlay" />

      {/* Radial glow — saffron centre */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-saffron-500/10 blur-3xl" />
      </div>

      {/* Subtle grid lines */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(#F59E0B 1px, transparent 1px), linear-gradient(90deg, #F59E0B 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* ── Floating emoji elements ───────────────────────────────────────── */}
      <motion.div
        animate={{ y: [0, -16, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 right-[8%] text-5xl opacity-60 select-none hidden lg:block"
      >🌿</motion.div>
      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, -4, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-1/3 left-[6%] text-4xl opacity-40 select-none hidden lg:block"
      >🍋</motion.div>
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-1/3 left-[12%] text-3xl opacity-30 select-none hidden lg:block"
      >✦</motion.div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: text */}
          <div>
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-px w-8 bg-saffron-500" />
              <span className="text-saffron-400 text-sm font-medium tracking-widest uppercase">
                Community Restaurant
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6"
            >
              Food that{' '}
              <span className="relative inline-block">
                <span className="text-saffron-400 italic">feeds</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="absolute bottom-1 left-0 right-0 h-0.5 bg-saffron-400 origin-left"
                />
              </span>
              <br />
              more than just{' '}
              <span className="text-charcoal-400 italic">you.</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-charcoal-300 text-lg max-w-md mb-8 leading-relaxed"
            >
              Order your favourite dishes, suspend a meal for someone in need,
              and share your delivery with neighbours — all in one checkout.
            </motion.p>

            {/* Concept pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-2 mb-10"
            >
              {HERO_PILLS.map(({ icon: Icon, label }, i) => (
                <motion.span
                  key={label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                             bg-charcoal-800 border border-charcoal-700
                             text-charcoal-300 text-sm"
                >
                  <Icon size={13} className="text-saffron-400" />
                  {label}
                </motion.span>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/menu" className="btn-primary text-base px-8 py-4 rounded-full group">
                Order Now
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#impact" className="btn-secondary text-base px-8 py-4 rounded-full
                                           border-charcoal-600 text-charcoal-300 hover:bg-charcoal-800">
                See Our Impact
              </a>
            </motion.div>
          </div>

          {/* Right: Visual card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Main card */}
              <div className="bg-charcoal-800 border border-charcoal-700 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute inset-0 grain-overlay" />
                <div className="relative z-10">
                  <div className="mb-6 text-center animate-float flex justify-center">
                <img src="/food-truck-logo.png" alt="Sufra Food Truck" className="h-30 w-auto" />
              </div>
                  <h3 className="font-display text-2xl text-white text-center mb-2">
                    Lamb Mansaf
                  </h3>
                  <p className="text-charcoal-400 text-sm text-center mb-6">
                    Slow-cooked lamb, saffron rice, jameed sauce
                  </p>

                  {/* Suspend toggle */}
                  <div className="bg-saffron-500/10 border border-saffron-500/30 rounded-2xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded bg-saffron-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-charcoal-900 text-xs">✓</span>
                      </div>
                      <div>
                        <p className="text-saffron-300 text-sm font-medium">Suspend a Meal</p>
                        <p className="text-charcoal-400 text-xs mt-0.5">Donate this meal to someone in need</p>
                      </div>
                    </div>
                  </div>

                  {/* Shared delivery */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <Leaf size={16} className="text-blue-400 flex-shrink-0" />
                      <div>
                        <p className="text-blue-300 text-sm font-medium">Shared Delivery matched!</p>
                        <p className="text-charcoal-400 text-xs mt-0.5">Save £1.00 · 0.35kg CO₂</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-4 -left-4 bg-saffron-500 text-charcoal-900
                           rounded-2xl px-4 py-2 shadow-lg"
              >
                <p className="text-xs font-bold">+10 Impact Points</p>
                <p className="text-[10px] opacity-70">for donating a meal</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#how-it-works"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col
                   items-center gap-2 text-charcoal-500 hover:text-charcoal-300 transition-colors"
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown size={18} />
        </motion.div>
      </motion.a>
    </section>
  )
}
