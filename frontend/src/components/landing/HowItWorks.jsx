import { motion } from 'framer-motion'
import { ShoppingBag, Heart, Share2, Star } from 'lucide-react'

const STEPS = [
  {
    icon: ShoppingBag,
    number: '01',
    title: 'Order your meal',
    description: 'Browse our curated menu of traditional dishes made with seasonal, ethically sourced ingredients.',
    color: 'text-saffron-500',
    bg: 'bg-saffron-50',
  },
  {
    icon: Heart,
    number: '02',
    title: 'Suspend a Meal',
    description: 'Add a meal for someone in need at checkout. It goes into our community pool — redeemable by anyone, no questions asked.',
    color: 'text-terracotta-500',
    bg: 'bg-terracotta-50',
  },
  {
    icon: Share2,
    number: '03',
    title: 'Share your delivery',
    description: 'Opt in to match with a neighbour within 2km placing an order in the same 15-minute window. Save money and CO₂ together.',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    icon: Star,
    number: '04',
    title: 'Earn Impact Points',
    description: 'Every donation and shared delivery earns you points. Track your personal impact story in your profile.',
    color: 'text-green-500',
    bg: 'bg-green-50',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="section-eyebrow mb-3">How it works</p>
          <h2 className="font-display text-4xl md:text-5xl text-charcoal-900">
            Simple steps,<br />
            <span className="text-saffron-600 italic">real impact</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative group"
            >
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(100%_-_16px)] w-[calc(100%_-_48px)] h-px bg-charcoal-100 z-0" />
              )}

              <div className="relative z-10 card p-6 h-full group-hover:-translate-y-1 transition-transform duration-300">
                <div className={`w-12 h-12 rounded-xl ${step.bg} flex items-center justify-center mb-4`}>
                  <step.icon size={22} className={step.color} />
                </div>
                <span className="text-xs font-bold tracking-widest text-charcoal-300 uppercase">
                  {step.number}
                </span>
                <h3 className="font-display text-lg font-semibold text-charcoal-900 mt-1 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-charcoal-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
