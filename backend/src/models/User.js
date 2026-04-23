/**
 * models/User.js
 *
 * Stores registered users. Key fields:
 *  - location       : GeoJSON Point for shared-delivery proximity matching
 *  - impactPoints   : Gamified currency earned through donations / sharing
 *  - impactSummary  : Denormalised snapshot of the user's contribution story
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // Never returned in queries by default
    },
    phone: { type: String, trim: true },
    avatar: { type: String }, // URL to profile picture

    /**
     * GeoJSON Point — populated from the browser's Geolocation API.
     * Required for the $near shared-delivery matching query.
     * Index is created below with sparse:true so users without a location
     * don't cause index issues.
     */
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },

    // ── Gamification ──────────────────────────────────────────────────────────
    impactPoints: { type: Number, default: 0, min: 0 },

    impactSummary: {
      mealsShared:    { type: Number, default: 0 },
      mealsReceived:  { type: Number, default: 0 },
      deliveriesShared: { type: Number, default: 0 },
      co2Saved:       { type: Number, default: 0 }, // kg
    },

    role: {
      type: String,
      enum: ['customer', 'admin', 'charity'],
      default: 'customer',
    },

    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

// 2dsphere index enables MongoDB geospatial queries ($near, $geoWithin, etc.)
userSchema.index({ location: '2dsphere' }, { sparse: true });
userSchema.index({ email: 1 }, { unique: true });

// ── Hooks ─────────────────────────────────────────────────────────────────────

// Hash password before saving (only if modified)
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// ── Instance methods ──────────────────────────────────────────────────────────

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
