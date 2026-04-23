/**
 * pages/LandingPage.jsx
 *
 * Home page — composes Hero, HowItWorks, ImpactDashboard, and a CTA section.
 */

import Hero from '../components/landing/Hero'
import HowItWorks from '../components/landing/HowItWorks'
import ImpactDashboard from '../components/landing/ImpactDashboard'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

// ── Featured testimonials ──────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "I ordered my lunch and suspended a meal at the same time. It felt like the most natural thing in the world.",
    name: 'Aisha M.',
    role: 'Regular customer',
    emoji: '🌟',
  },
  {
    quote: "Shared delivery matched me with my next-door neighbour. We ended up introducing ourselves over the doorstep.",
    name: 'Daniel R.',
    role: 'Community member',
    emoji: '🛵',
  },
  {
    quote: "The charity dashboard is incredible — watching suspended meal counts go up in real time is genuinely moving.",
    name: 'Fatima A.',
    role: 'Charity coordinator',
    emoji: '💛',
  },
]

function Testimonial({ quote, name, role, emoji }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card p-6"
    >
      <p className="text-2xl mb-4">{emoji}</p>
      <blockquote className="font-display text-lg text-charcoal-800 leading-relaxed mb-4 italic">
        "{quote}"
      </blockquote>
      <div>
        <p className="font-medium text-charcoal-900 text-sm">{name}</p>
        <p className="text-charcoal-500 text-xs">{role}</p>
      </div>
    </motion.div>
  )
}

function AdminLink() {
  const { isAuthenticated, isAdmin } = useAuth()
  
  // Always show admin button for testing (remove this later)
  if (isAuthenticated) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Link 
          to="/admin" 
          className="bg-saffron-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-saffron-700 transition-colors"
        >
          Admin Dashboard
        </Link>
      </div>
    )
  }
  
  return null
}

export default function LandingPage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <ImpactDashboard />

      {/* Testimonials */}
      <section className="py-24 bg-white" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="section-eyebrow mb-3">Community voices</p>
            <h2 className="font-display text-4xl md:text-5xl text-charcoal-900">
              Heard around the table
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {TESTIMONIALS.map((t) => <Testimonial key={t.name} {...t} />)}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-charcoal-900 relative overflow-hidden">
        <div className="absolute inset-0 grain-overlay pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] rounded-full bg-saffron-500/8 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-10 flex justify-center">
              <img src="/food-truck-logo.png" alt="Sufra Food Truck" className="h-24 w-auto" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-6">
              Ready to be part of<br />
              <span className="text-saffron-400 italic">something bigger?</span>
            </h2>
            <p className="text-charcoal-400 mb-10 max-w-md mx-auto">
              Join thousands of community members who eat well and give back
              with every single order.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/menu" className="btn-primary text-base px-8 py-4">
                Order Now <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn-secondary border-charcoal-600
                                               text-charcoal-300 hover:bg-charcoal-800
                                               text-base px-8 py-4">
                Create Account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
