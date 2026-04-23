/**
 * models/Order.js
 *
 * Central document for all orders. The schema explicitly separates
 * regularItems (for the customer) from suspendedItems (donated meals).
 *
 * Geospatial index on deliveryAddress.coordinates powers the 2km
 * shared-delivery proximity query.
 */

const mongoose = require('mongoose');

// ── Reusable sub-schema for individual line items ─────────────────────────────
const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    name:       { type: String, required: true },
    quantity:   { type: Number, required: true, min: 1 },
    unitPrice:  { type: Number, required: true, min: 0 },
    image:      { type: String },
    category:   { type: String },
  },
  { _id: false } // No separate _id for line items — keeps documents clean
);

// ── Main Order schema ─────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // ── Item separation — this is the core Sufra concept ─────────────────────
    regularItems:   { type: [orderItemSchema], default: [] },
    suspendedItems: { type: [orderItemSchema], default: [] },

    // ── Delivery details ──────────────────────────────────────────────────────
    deliveryAddress: {
      street: { type: String, required: true },
      city:   { type: String, required: true },
      postcode: { type: String },
      // GeoJSON Point for $near queries (optional - added only if GPS available)
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
        },
        coordinates: { 
          type: [Number],
          validate: {
            validator: function(coords) {
              // Only validate coordinates if they exist
              if (!coords) return true;
              return Array.isArray(coords) && coords.length === 2 && 
                     coords.every(coord => typeof coord === 'number' && !isNaN(coord));
            },
            message: 'Coordinates must be an array of [longitude, latitude]'
          }
        },
      },
    },

    // ── Pricing breakdown ─────────────────────────────────────────────────────
    pricing: {
      subtotal:       { type: Number, required: true, min: 0 },
      deliveryFee:    { type: Number, default: 2.50 },
      sharedDiscount: { type: Number, default: 0 },   // Applied if delivery shared
      donationTotal:  { type: Number, default: 0 },   // Value of suspendedItems
      total:          { type: Number, required: true },
    },

    // ── Order lifecycle ───────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    statusHistory: [
      {
        status:    { type: String },
        changedAt: { type: Date, default: Date.now },
        note:      { type: String },
        _id: false,
      },
    ],

    // ── Shared Delivery ───────────────────────────────────────────────────────
    sharedDelivery: {
      isShared:        { type: Boolean, default: false },
      sharedWithOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    },

    // ── Suspended Meal metadata ───────────────────────────────────────────────
    suspendedMeta: {
      donatedMealCount: { type: Number, default: 0 },
      // If this order *claims* suspended meals (ordered for free by recipient)
      claimedMeals:     { type: Number, default: 0 },
    },

    estimatedDeliveryMinutes: { type: Number, default: 35 },
    confirmedAt:  { type: Date },
    deliveredAt:  { type: Date },

    specialInstructions: { type: String, maxlength: 500 },
    paymentMethod: {
      type: String,
      enum: ['card', 'cash', 'wallet'],
      default: 'card',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

// Geospatial index for shared-delivery proximity matching
orderSchema.index(
  { 'deliveryAddress.coordinates': '2dsphere' },
  { sparse: true }
);

// Compound index optimises the shared-delivery query:
//   db.orders.find({ status: ..., createdAt: { $gte: ... }, ... })
orderSchema.index({ status: 1, createdAt: -1 });

// ── Virtuals ──────────────────────────────────────────────────────────────────

orderSchema.virtual('hasDonation').get(function () {
  return this.suspendedItems && this.suspendedItems.length > 0;
});

orderSchema.virtual('allItems').get(function () {
  return [...(this.regularItems || []), ...(this.suspendedItems || [])];
});

// ── Hooks ─────────────────────────────────────────────────────────────────────

// Append each status change to statusHistory automatically
orderSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status });
    if (this.status === 'confirmed') this.confirmedAt = new Date();
    if (this.status === 'delivered') this.deliveredAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
