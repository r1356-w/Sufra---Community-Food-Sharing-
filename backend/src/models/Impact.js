/**
 * models/Impact.js
 *
 * Singleton document (fixed _id: 'global') that aggregates platform-wide
 * impact metrics. Atomic $inc operations make this race-condition safe.
 */

const mongoose = require('mongoose');

const impactSchema = new mongoose.Schema(
  {
    _id: { type: String, default: 'global' },

    // ── Suspended Meal counters ───────────────────────────────────────────────
    suspendedMealsAvailable: { type: Number, default: 0, min: 0 },
    totalMealsDonated:       { type: Number, default: 0 },
    totalMealsDelivered:     { type: Number, default: 0 },

    // ── Environmental impact ──────────────────────────────────────────────────
    totalCo2Saved:           { type: Number, default: 0 }, // kg
    totalSharedDeliveries:   { type: Number, default: 0 },

    // ── Community ─────────────────────────────────────────────────────────────
    totalOrders:             { type: Number, default: 0 },
    totalDonors:             { type: Number, default: 0 },

    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    // Prevents Mongoose from wrapping the fixed _id in an ObjectId
    _id: false,
  }
);

const Impact = mongoose.model('Impact', impactSchema);

// ── MenuItem model (kept here to avoid extra files in scope) ──────────────────

const menuItemSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price:       { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ['starters', 'mains', 'sides', 'desserts', 'drinks', 'suspended'],
      required: true,
    },
    image:       { type: String },
    tags:        [{ type: String }],   // e.g. ['vegan', 'gluten-free', 'spicy']
    isAvailable: { type: Boolean, default: true },
    isSuspendable: { type: Boolean, default: true }, // Can this item be donated?
    calories:    { type: Number },
    prepTime:    { type: Number, default: 20 }, // minutes
    featured:    { type: Boolean, default: false },
    sortOrder:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

menuItemSchema.index({ category: 1, isAvailable: 1 });
menuItemSchema.index({ featured: 1 });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = { Impact, MenuItem };
