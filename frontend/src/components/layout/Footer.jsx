import { Link } from 'react-router-dom'
import { Heart, Instagram, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-charcoal-900 text-charcoal-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/food-truck-logo.png" alt="Sufra Food Truck" className="h-8 w-8" />
              <span className="font-display text-xl font-bold text-white">Sufra</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Every meal tells a story. Every order can write someone else's.
              Community-driven food with purpose, rooted in the tradition of the
              shared table.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href="#" className="p-2 rounded-full bg-charcoal-800 hover:bg-charcoal-700 transition-colors">
                <Instagram size={16} />
              </a>
              <a href="#" className="p-2 rounded-full bg-charcoal-800 hover:bg-charcoal-700 transition-colors">
                <Twitter size={16} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-medium mb-4">Explore</h4>
            <ul className="space-y-2 text-sm">
              {['Menu', 'Suspend a Meal', 'Shared Delivery', 'Impact Dashboard'].map((l) => (
                <li key={l}>
                  <Link to="/menu" className="hover:text-saffron-400 transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              {['About Us', 'Our Partners', 'Charity Network', 'Press'].map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-saffron-400 transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-charcoal-700 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>© {new Date().getFullYear()} Sufra. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Made with dev rand oraij
          </p>
        </div>
      </div>
    </footer>
  )
}
