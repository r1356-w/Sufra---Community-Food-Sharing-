/**
 * components/cart/CartPage.jsx
 *
 * Displays:
 *  1. Regular items section
 *  2. Donated (suspended) items section with distinct styling
 *  3. Shared Delivery opt-in with live API check
 *  4. Pricing breakdown and checkout trigger
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag, Heart, Leaf, X, Plus, Minus,
  ArrowRight, Info, Loader2, MapPin
} from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'

// ── Line item row ──────────────────────────────────────────────────────────────
function CartItem({ item, onIncrease, onDecrease, onRemove, isDonation }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16, height: 0 }}
      className={`flex items-center gap-3 py-3 border-b last:border-0
        ${isDonation ? 'border-saffron-100' : 'border-charcoal-100'}`}
    >
      {/* Image */}
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-charcoal-100 flex-shrink-0">
        {item.image
          ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
        }
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-charcoal-900 truncate">{item.name}</p>
        <p className="text-sm text-charcoal-500">£{item.unitPrice.toFixed(2)} each</p>
      </div>

      {/* Qty stepper */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onDecrease}
          className="w-6 h-6 rounded-full border border-charcoal-200
                     flex items-center justify-center hover:bg-charcoal-100"
        >
          <Minus size={10} />
        </button>
        <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
        <button
          onClick={onIncrease}
          className="w-6 h-6 rounded-full border border-charcoal-200
                     flex items-center justify-center hover:bg-charcoal-100"
        >
          <Plus size={10} />
        </button>
      </div>

      {/* Subtotal */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-sm font-medium text-charcoal-900 w-12 text-right">
          £{(item.unitPrice * item.quantity).toFixed(2)}
        </span>
        <button
          onClick={onRemove}
          className="p-1 text-charcoal-400 hover:text-charcoal-700"
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function CartPage() {
  const {
    regularItems, suspendedItems,
    updateRegularQty, updateSuspendedQty,
    removeRegularItem, removeSuspendedItem,
    sharedDeliveryOptIn, setSharedDeliveryOptIn,
    sharedDeliveryMatch, setSharedDeliveryMatch,
    pricing, isEmpty, clearCart,
  } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [placingOrder,   setPlacingOrder]   = useState(false)
  const [checkingShared, setCheckingShared] = useState(false)
  const [address, setAddress] = useState({
    street: '', city: '', postcode: ''
  })

  // ── Check shared delivery eligibility ────────────────────────────────────// Check shared delivery eligibility
  const checkSharedDelivery = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    
    setCheckingShared(true);
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
      );
      
      const { latitude: lat, longitude: lng } = pos.coords;
      const { data } = await api.get('/orders/shared-delivery/check', {
        params: { lng, lat }
      });
      
      setSharedDeliveryMatch(data);
      if (data.eligible) {
        toast.success(`Shared delivery match found! Save £${data.discountValue.toFixed(2)}`);
      } else {
        toast('No nearby orders at the moment. Try again closer to checkout.', { icon: '??' });
      }
    } catch (error) {
      console.log('Location error:', error);
      if (error.code === 1) {
        toast.error('Location access denied. Please enable location permissions in your browser settings.', { duration: 5000 });
      } else if (error.code === 3) {
        toast.error('Location request timed out. Please check your connection and try again.', { duration: 4000 });
      } else {
        toast.error('Unable to get your location. You can still proceed with regular delivery.', { duration: 4000 });
      }
    } finally {
      setCheckingShared(false);
    }
  }

  // ── Place order ────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to place an order.')
      navigate('/login')
      return
    }
    if (!address.street || !address.city) {
      toast.error('Please enter your delivery address.')
      return
    }
    if (isEmpty) {
      toast.error('Your cart is empty.')
      return
    }

    setPlacingOrder(true)
    try {
      let coords
      try {
        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 4000 })
        )
        coords = {
          type: 'Point',
          coordinates: [pos.coords.longitude, pos.coords.latitude]
        }
      } catch { /* GPS optional */ }

      const deliveryAddress = coords ? { ...address, coordinates: coords } : address;
      
      const payload = {
        regularItems:        regularItems.map(({ menuItemId, name, quantity, unitPrice, image, category }) =>
                               ({ menuItemId, name, quantity, unitPrice, image, category })),
        suspendedItems:      suspendedItems.map(({ menuItemId, name, quantity, unitPrice, image, category }) =>
                               ({ menuItemId, name, quantity, unitPrice, image, category })),
        deliveryAddress,
        sharedDeliveryOptIn: sharedDeliveryOptIn && !!sharedDeliveryMatch?.eligible,
        paymentMethod:       'card',
      }

      const { data } = await api.post('/orders', payload)

      // Show impact earned
      if (data.impactEarned.points > 0) {
        toast.success(`+${data.impactEarned.points} Impact Points earned! 🌟`)
      }
      if (data.order.hasDonation) {
        toast.success(`Thank you! ${data.donatedMealCount} meal${data.donatedMealCount > 1 ? 's' : ''} suspended for the community 🫕`, { duration: 5000 })
      }

      clearCart()
      navigate(`/track/${data.order._id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order. Please try again.')
    } finally {
      setPlacingOrder(false)
    }
  }

  if (isEmpty) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl mb-6 animate-float">🛒</div>
        <h2 className="font-display text-3xl text-charcoal-900 mb-3">Your cart is empty</h2>
        <p className="text-charcoal-500 mb-8 max-w-sm">
          Browse our menu and add some dishes — don't forget you can suspend a meal for someone in need.
        </p>
        <Link to="/menu" className="btn-primary">
          Browse Menu <ArrowRight size={16} />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-28">
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-4xl text-charcoal-900 mb-10"
      >
        Your Cart
      </motion.h1>

      <div className="grid lg:grid-cols-5 gap-8">

        {/* ── Left: items ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-6">

          {/* Regular items */}
          {regularItems.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag size={16} className="text-charcoal-600" />
                <h2 className="font-medium text-charcoal-900">Your Order</h2>
              </div>
              <AnimatePresence>
                {regularItems.map((item) => (
                  <CartItem
                    key={item.menuItemId}
                    item={item}
                    onIncrease={() => updateRegularQty(item.menuItemId, 1)}
                    onDecrease={() => updateRegularQty(item.menuItemId, -1)}
                    onRemove={()  => removeRegularItem(item.menuItemId)}
                    isDonation={false}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Suspended / donated items */}
          <AnimatePresence>
            {suspendedItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-saffron-50 border border-saffron-200 rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Heart size={16} className="text-saffron-600 fill-saffron-200" />
                  <h2 className="font-medium text-saffron-800">Suspended Meals</h2>
                </div>
                <p className="text-xs text-saffron-600 mb-4">
                  These meals will go to someone in the community who needs them. Thank you.
                </p>
                <AnimatePresence>
                  {suspendedItems.map((item) => (
                    <CartItem
                      key={item.menuItemId}
                      item={item}
                      onIncrease={() => updateSuspendedQty(item.menuItemId, 1)}
                      onDecrease={() => updateSuspendedQty(item.menuItemId, -1)}
                      onRemove={()  => removeSuspendedItem(item.menuItemId)}
                      isDonation={true}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Delivery address */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={16} className="text-charcoal-600" />
              <h2 className="font-medium text-charcoal-900">Delivery Address</h2>
            </div>
            <div className="space-y-3">
              <input
                className="input"
                placeholder="Street address"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="input"
                  placeholder="City"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                />
                <input
                  className="input"
                  placeholder="Postcode"
                  value={address.postcode}
                  onChange={(e) => setAddress({ ...address, postcode: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Shared delivery */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={sharedDeliveryOptIn}
                onChange={(e) => {
                  setSharedDeliveryOptIn(e.target.checked)
                  if (e.target.checked && !sharedDeliveryMatch) checkSharedDelivery()
                }}
                className="w-4 h-4 accent-blue-500"
              />
              <div>
                <div className="flex items-center gap-2">
                  <Leaf size={15} className="text-blue-500" />
                  <span className="font-medium text-charcoal-900 text-sm">
                    Share my delivery
                  </span>
                </div>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Match with a neighbour within 2km · save CO2 and money
                </p>
                <p className="text-xs text-charcoal-400 mt-1">
                  Requires location access · Optional feature
                </p>
              </div>
            </label>

            {sharedDeliveryOptIn && (
              <button
                onClick={checkSharedDelivery}
                disabled={checkingShared}
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 flex-shrink-0"
              >
                {checkingShared
                  ? <Loader2 size={13} className="animate-spin" />
                  : <MapPin size={13} />
                }
                {checkingShared ? 'Checking...' : 'Check area'}
              </button>
            )}
          </div>
        </div>

        {/* Right: Order summary ──────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="card p-6 sticky top-24">
            <h2 className="font-display text-xl text-charcoal-900 mb-6">Order Summary</h2>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-charcoal-600">
                <span>Subtotal</span>
                <span>£{pricing.subtotal.toFixed(2)}</span>
              </div>
              {pricing.donationTotal > 0 && (
                <div className="flex justify-between text-saffron-600">
                  <span className="flex items-center gap-1">
                    <Heart size={12} className="fill-saffron-400" /> Donations
                  </span>
                  <span>£{pricing.donationTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-charcoal-600">
                <span>Delivery fee</span>
                <span>£{pricing.deliveryFee.toFixed(2)}</span>
              </div>
              {pricing.sharedDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Leaf size={12} /> Shared delivery
                  </span>
                  <span>−£{pricing.sharedDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-charcoal-100 pt-3 flex justify-between font-bold text-charcoal-900 text-base">
                <span>Total</span>
                <span>£{pricing.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Impact summary */}
            {(suspendedItems.length > 0 || (sharedDeliveryOptIn && sharedDeliveryMatch?.eligible)) && (
              <div className="bg-saffron-50 border border-saffron-200 rounded-xl p-4 mb-5">
                <p className="text-xs font-semibold text-saffron-700 mb-2">Your impact this order:</p>
                <ul className="space-y-1 text-xs text-saffron-600">
                  {suspendedItems.length > 0 && (
                    <li>🫕 {suspendedItems.reduce((n, i) => n + i.quantity, 0)} meal{suspendedItems.reduce((n, i) => n + i.quantity, 0) > 1 ? 's' : ''} suspended</li>
                  )}
                  {sharedDeliveryOptIn && sharedDeliveryMatch?.eligible && (
                    <li>🌿 {sharedDeliveryMatch.co2Saving}kg CO₂ saved</li>
                  )}
                </ul>
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder}
              className="btn-primary w-full py-4 text-base"
            >
              {placingOrder ? (
                <><Loader2 size={18} className="animate-spin" /> Placing Order...</>
              ) : (
                <>Place Order · £{pricing.total.toFixed(2)} <ArrowRight size={18} /></>
              )}
            </button>

            <p className="text-xs text-charcoal-400 text-center mt-3">
              Secure checkout · No hidden fees
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
