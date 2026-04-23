/**
 * controllers/impactController.js + menuController.js
 *
 * Impact: serves the live platform statistics consumed by the landing page
 *         and the charity dashboard.
 *
 * Menu:   CRUD for menu items (admin only for mutations).
 */

const { Impact, MenuItem } = require('../models/Impact');

// ─── GET /api/impact-stats ────────────────────────────────────────────────────
exports.getImpactStats = async (req, res, next) => {
  try {
    const stats = await Impact.findById('global').lean();

    const defaults = {
      suspendedMealsAvailable: 0,
      totalMealsDonated:       0,
      totalMealsDelivered:     0,
      totalCo2Saved:           0,
      totalSharedDeliveries:   0,
      totalOrders:             0,
      totalDonors:             0,
      lastUpdated:             new Date().toISOString(),
    };

    return res.json(stats ? { ...defaults, ...stats } : defaults);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/menu ────────────────────────────────────────────────────────────
exports.getMenu = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = { isAvailable: true };
    if (category) filter.category = category;

    const items = await MenuItem.find(filter).sort({ sortOrder: 1, name: 1 }).lean();

    // Group items by category for convenient frontend consumption
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    return res.json({ items, grouped });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/menu/featured ───────────────────────────────────────────────────
exports.getFeaturedItems = async (req, res, next) => {
  try {
    const items = await MenuItem.find({ featured: true, isAvailable: true })
      .sort({ sortOrder: 1 })
      .limit(6)
      .lean();
    return res.json({ items });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/menu (admin) ───────────────────────────────────────────────────
exports.createMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.create(req.body);
    return res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
};
