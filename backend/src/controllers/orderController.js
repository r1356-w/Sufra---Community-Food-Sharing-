/**
 * controllers/orderController.js
 *
 * Core business logic for Sufra orders.
 *
 * Key flows:
 *  createOrder        → validates items, matches shared delivery, saves order,
 *                        increments Impact doc, emits Socket.io events
 *  updateOrderStatus  → enforces state machine, emits per-order WS event
 *  checkSharedDelivery → proximity check endpoint for the cart UI
 *  getMyOrders        → paginated order history for the authenticated user
 */

const Order   = require('../models/Order');
const { Impact } = require('../models/Impact');
const User    = require('../models/User');
const socketManager = require('../socket/socketManager');

// ── Constants ──────────────────────────────────────────────────────────────────
const CO2_PER_SHARED_TRIP_KG = 0.35;  // Estimated CO2 saved per shared delivery
const SHARED_DISCOUNT_GBP    = 1.00;  // Discount applied when delivery is shared
const IMPACT_POINTS_PER_MEAL = 10;    // Points awarded per donated meal
const DELIVERY_FEE_GBP       = 2.50;

// Valid status transitions — enforces order lifecycle integrity
const STATUS_TRANSITIONS = {
  pending:          ['confirmed', 'cancelled'],
  confirmed:        ['preparing', 'cancelled'],
  preparing:        ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered:        [],
  cancelled:        [],
};

// ─── Helper: Get or initialise the singleton Impact document ─────────────────
async function getImpact() {
  return Impact.findByIdAndUpdate(
    'global',
    { $setOnInsert: { _id: 'global' } },
    { upsert: true, new: true }
  );
}

// ─── POST /api/orders ─────────────────────────────────────────────────────────
exports.createOrder = async (req, res, next) => {
  try {
    const {
      regularItems   = [],
      suspendedItems = [],
      deliveryAddress,
      specialInstructions,
      paymentMethod   = 'card',
      sharedDeliveryOptIn = false,
    } = req.body;

    const userId = req.user._id;

    // ── 1. Input validation ──────────────────────────────────────────────────
    if (!regularItems.length && !suspendedItems.length) {
      return res.status(400).json({ error: 'Order must contain at least one item.' });
    }

    if (!deliveryAddress?.street || !deliveryAddress?.city) {
      return res.status(400).json({ error: 'Delivery address is required.' });
    }

    // ── 2. Pricing calculation ───────────────────────────────────────────────
    const calcSubtotal = (items) =>
      items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    const subtotal      = calcSubtotal(regularItems);
    const donationTotal = calcSubtotal(suspendedItems);
    let   sharedDiscount = 0;
    let   sharedWithOrder = null;

    // ── 3. Shared Delivery Matching Algorithm ────────────────────────────────
    //
    // Logic: Find any active order within a 2km radius placed in the last 15
    // minutes that hasn't already been paired. We use MongoDB's $near with a
    // 2dsphere index — this is a fast, native geospatial index scan.
    //
    if (
      sharedDeliveryOptIn &&
      deliveryAddress?.coordinates?.coordinates?.length === 2
    ) {
      const [lng, lat]    = deliveryAddress.coordinates.coordinates;
      const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);

      const nearbyOrder = await Order.findOne({
        status:    { $in: ['pending', 'confirmed'] },
        createdAt: { $gte: fifteenMinAgo },
        'sharedDelivery.isShared':       false,
        'deliveryAddress.coordinates': {
          $near: {
            $geometry:    { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: 2000, // 2 kilometres in metres
          },
        },
      }).select('_id user');

      if (nearbyOrder) {
        sharedWithOrder  = nearbyOrder._id;
        sharedDiscount   = SHARED_DISCOUNT_GBP;

        // Mark the matched order as part of a shared pair
        await Order.findByIdAndUpdate(nearbyOrder._id, {
          'sharedDelivery.isShared': true,
          // sharedWithOrder will be back-filled after this order is saved
        });
      }
    }

    const total = Math.max(
      0,
      subtotal + donationTotal + DELIVERY_FEE_GBP - sharedDiscount
    );

    // ── 4. Persist order ─────────────────────────────────────────────────────
    const order = await Order.create({
      user: userId,
      regularItems,
      suspendedItems,
      deliveryAddress,
      specialInstructions,
      paymentMethod,
      pricing: {
        subtotal,
        deliveryFee: DELIVERY_FEE_GBP,
        sharedDiscount,
        donationTotal,
        total,
      },
      sharedDelivery: {
        isShared:        !!sharedWithOrder,
        sharedWithOrder,
      },
      suspendedMeta: {
        donatedMealCount: suspendedItems.reduce((n, i) => n + i.quantity, 0),
      },
    });

    // ── 5. Back-fill the paired order's reference ────────────────────────────
    if (sharedWithOrder) {
      await Order.findByIdAndUpdate(sharedWithOrder, {
        'sharedDelivery.sharedWithOrder': order._id,
      });
    }

    // ── 6. Suspended Meal impact tracking ────────────────────────────────────
    let impactDoc = null;
    const donatedMealCount = order.suspendedMeta.donatedMealCount;

    if (donatedMealCount > 0) {
      // Atomic increment — safe under concurrent requests
      impactDoc = await Impact.findByIdAndUpdate(
        'global',
        {
          $inc: {
            suspendedMealsAvailable: donatedMealCount,
            totalMealsDonated:       donatedMealCount,
            totalOrders:             1,
          },
          $set: { lastUpdated: new Date() },
        },
        { new: true, upsert: true }
      );

      // Award impact points to the donor
      await User.findByIdAndUpdate(userId, {
        $inc: {
          impactPoints:                   donatedMealCount * IMPACT_POINTS_PER_MEAL,
          'impactSummary.mealsShared':    donatedMealCount,
        },
      });

      // Notify charity dashboard via Socket.io
      socketManager.emitSuspendedMealsUpdate({
        available:  impactDoc.suspendedMealsAvailable,
        donated:    impactDoc.totalMealsDonated,
        orderId:    order._id,
        donorName:  req.user.name,
      });
    } else {
      // Still increment total orders even if no donation
      impactDoc = await Impact.findByIdAndUpdate(
        'global',
        { $inc: { totalOrders: 1 }, $set: { lastUpdated: new Date() } },
        { new: true, upsert: true }
      );
    }

    // ── 7. Shared delivery CO2 tracking ─────────────────────────────────────
    if (sharedWithOrder) {
      impactDoc = await Impact.findByIdAndUpdate(
        'global',
        {
          $inc: {
            totalSharedDeliveries: 1,
            totalCo2Saved:         CO2_PER_SHARED_TRIP_KG,
          },
          $set: { lastUpdated: new Date() },
        },
        { new: true, upsert: true }
      );

      await User.findByIdAndUpdate(userId, {
        $inc: {
          impactPoints:                        5,
          'impactSummary.deliveriesShared':    1,
          'impactSummary.co2Saved':            CO2_PER_SHARED_TRIP_KG,
        },
      });

      // Broadcast the shared delivery event to all clients
      socketManager.emitSharedDeliveryFormed({
        orderId1: sharedWithOrder,
        orderId2: order._id,
        savings:  CO2_PER_SHARED_TRIP_KG,
      });
    }

    // ── 8. Broadcast updated impact counters to all connected clients ────────
    if (impactDoc) {
      socketManager.emitImpactUpdate(impactDoc);
    }

    // ── 9. Respond ───────────────────────────────────────────────────────────
    return res.status(201).json({
      success: true,
      order: {
        _id:            order._id,
        status:         order.status,
        pricing:        order.pricing,
        sharedDelivery: order.sharedDelivery,
        hasDonation:    donatedMealCount > 0,
        donatedMealCount,
        estimatedDeliveryMinutes: order.estimatedDeliveryMinutes,
      },
      impactEarned: {
        points:      donatedMealCount * IMPACT_POINTS_PER_MEAL + (sharedWithOrder ? 5 : 0),
        mealsShared: donatedMealCount,
        co2Saved:    sharedWithOrder ? CO2_PER_SHARED_TRIP_KG : 0,
      },
    });

  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/orders/:id/status ────────────────────────────────────────────
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id }     = req.params;
    const { status, note } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Enforce state machine
    const allowed = STATUS_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        error: `Cannot transition from '${order.status}' to '${status}'.`,
        allowed,
      });
    }

    order.status = status;
    if (note) order.statusHistory[order.statusHistory.length - 1].note = note;
    await order.save(); // pre-save hook appends to statusHistory

    // ── Delivery completed: decrement available suspended meals ──────────
    if (status === 'delivered' && order.suspendedMeta.donatedMealCount > 0) {
      const count = order.suspendedMeta.donatedMealCount;
      const impactDoc = await Impact.findByIdAndUpdate(
        'global',
        {
          $inc: {
            suspendedMealsAvailable: -count,
            totalMealsDelivered:      count,
          },
          $set: { lastUpdated: new Date() },
        },
        { new: true, upsert: true }
      );

      socketManager.emitImpactUpdate(impactDoc);
      socketManager.emitSuspendedMealsUpdate({
        available: impactDoc.suspendedMealsAvailable,
        donated:   impactDoc.totalMealsDonated,
        orderId:   order._id,
      });
    }

    // Push real-time status update to the order's tracking room
    socketManager.emitOrderStatusUpdate(id, {
      status,
      estimatedDeliveryMinutes: order.estimatedDeliveryMinutes,
    });

    return res.json({ success: true, order: { _id: id, status } });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/orders/shared-delivery/check ────────────────────────────────────
exports.checkSharedDelivery = async (req, res, next) => {
  try {
    const { lng, lat } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({ error: 'lng and lat query params are required.' });
    }

    const coordinates    = [parseFloat(lng), parseFloat(lat)];
    const fifteenMinAgo  = new Date(Date.now() - 15 * 60 * 1000);

    const nearbyCount = await Order.countDocuments({
      status:    { $in: ['pending', 'confirmed'] },
      createdAt: { $gte: fifteenMinAgo },
      'sharedDelivery.isShared': false,
      'deliveryAddress.coordinates': {
        $near: {
          $geometry:    { type: 'Point', coordinates },
          $maxDistance: 2000,
        },
      },
    });

    return res.json({
      eligible:      nearbyCount > 0,
      matchCount:    nearbyCount,
      discountValue: nearbyCount > 0 ? SHARED_DISCOUNT_GBP : 0,
      co2Saving:     nearbyCount > 0 ? CO2_PER_SHARED_TRIP_KG : 0,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/orders/my ───────────────────────────────────────────────────────
exports.getMyOrders = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ user: req.user._id }),
    ]);

    return res.json({
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/orders/:id ──────────────────────────────────────────────────────
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id:  req.params.id,
      user: req.user._id,
    })
      .populate('user', 'name email')
      .lean();

    if (!order) return res.status(404).json({ error: 'Order not found.' });

    return res.json({ order });
  } catch (err) {
    next(err);
  }
};
