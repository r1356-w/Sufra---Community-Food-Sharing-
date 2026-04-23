/**
 * components/menu/MenuItemCard.jsx
 *
 * Displays a single menu item with:
 *  - Add to cart (regular order)
 *  - "Suspend this Meal" checkbox (donation)
 *  - Quantity stepper
 *  - Dietary tags
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, Heart, Clock, Flame, Leaf, Info } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'

const TAG_STYLES = {
  vegan:           'bg-green-100 text-green-700',
  vegetarian:      'bg-emerald-100 text-emerald-700',
  'gluten-free':   'bg-blue-100 text-blue-700',
  halal:           'bg-purple-100 text-purple-700',
  signature:       'bg-saffron-100 text-saffron-700',
  spicy:           'bg-red-100 text-red-700',
}

export default function MenuItemCard({ item }) {
  const { addRegularItem, addSuspendedItem } = useCart()
  const [qty,        setQty]        = useState(1)
  const [suspended,  setSuspended]  = useState(false)
  const [showInfo,   setShowInfo]   = useState(false)
  const [justAdded,  setJustAdded]  = useState(false)

  const lineItem = {
    menuItemId: item._id,
    name:       item.name,
    unitPrice:  item.price,
    image:      item.image,
    category:   item.category,
    quantity:   qty,
  }

  const handleAddToCart = () => {
    if (suspended) {
      if (!item.isSuspendable) {
        toast.error('This item cannot be donated.')
        return
      }
      addSuspendedItem(lineItem)
      toast.success(`🫕 Meal suspended! Thank you for your generosity.`)
    } else {
      addRegularItem(lineItem)
      toast.success(`${item.name} added to cart`)
    }

    // Animate the button
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1200)
    setQty(1)
    setSuspended(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card overflow-hidden flex flex-col h-full
        ${suspended ? 'ring-2 ring-saffron-400 ring-offset-2' : ''}`}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3] bg-charcoal-100">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
        )}

        {/* Featured badge */}
        {item.featured && (
          <div className="absolute top-3 left-3 bg-saffron-500 text-charcoal-900 text-[10px]
                          font-bold px-2 py-1 rounded-full uppercase tracking-wide">
            Chef's Pick
          </div>
        )}

        {/* Prep time */}
        <div className="absolute bottom-3 right-3 bg-charcoal-900/70 text-white
                        text-xs px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
          <Clock size={11} />
          {item.prepTime} min
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Tags */}
        {item.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full
                  ${TAG_STYLES[tag] || 'bg-charcoal-100 text-charcoal-600'}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Name & description */}
        <h3 className="font-display text-lg font-semibold text-charcoal-900 mb-1">
          {item.name}
        </h3>
        <p className="text-sm text-charcoal-500 leading-relaxed mb-3 flex-1 line-clamp-2">
          {item.description}
        </p>

        {/* Calories */}
        {item.calories && (
          <div className="flex items-center gap-1 text-xs text-charcoal-400 mb-4">
            <Flame size={11} />
            {item.calories} kcal
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-display text-xl font-bold text-charcoal-900">
            £{item.price.toFixed(2)}
          </span>

          {/* Quantity stepper */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-7 h-7 rounded-full border border-charcoal-200 flex items-center
                         justify-center hover:bg-charcoal-100 transition-colors"
            >
              <Minus size={12} />
            </button>
            <span className="w-5 text-center text-sm font-medium">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="w-7 h-7 rounded-full border border-charcoal-200 flex items-center
                         justify-center hover:bg-charcoal-100 transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        {/* Suspend a meal checkbox */}
        {item.isSuspendable && (
          <label
            className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer mb-3
              transition-all duration-200 select-none
              ${suspended
                ? 'bg-saffron-50 border border-saffron-300'
                : 'bg-charcoal-50 border border-charcoal-100 hover:border-saffron-200'
              }`}
          >
            <div className={`w-4 h-4 rounded flex-shrink-0 mt-0.5 flex items-center justify-center
              border transition-all duration-150
              ${suspended
                ? 'bg-saffron-500 border-saffron-500'
                : 'border-charcoal-300 bg-white'
              }`}
            >
              {suspended && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-[9px] text-charcoal-900 font-bold"
                >✓</motion.span>
              )}
            </div>
            <input
              type="checkbox"
              checked={suspended}
              onChange={(e) => setSuspended(e.target.checked)}
              className="sr-only"
            />
            <div>
              <div className="flex items-center gap-1">
                <Heart size={12} className="text-saffron-500" />
                <span className="text-xs font-semibold text-charcoal-800">Suspend this Meal</span>
              </div>
              <p className="text-[11px] text-charcoal-500 mt-0.5">
                Donate to someone in need · earn 10 points
              </p>
            </div>
          </label>
        )}

        {/* Add to cart button */}
        <motion.button
          onClick={handleAddToCart}
          whileTap={{ scale: 0.97 }}
          className={`w-full py-3 rounded-xl font-medium text-sm transition-all duration-200
            ${suspended
              ? 'bg-saffron-500 text-charcoal-900 hover:bg-saffron-400'
              : 'bg-charcoal-900 text-white hover:bg-charcoal-700'
            }
            ${justAdded ? 'scale-95 opacity-80' : ''}`}
        >
          <AnimatePresence mode="wait">
            {justAdded ? (
              <motion.span
                key="added"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                ✓ Added!
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {suspended ? `🫕 Suspend × ${qty}` : `Add to Cart · £${(item.price * qty).toFixed(2)}`}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  )
}
