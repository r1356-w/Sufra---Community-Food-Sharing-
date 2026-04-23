/**
 * routes/admin.js
 *
 * Admin-only routes for dashboard data and management
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const { MenuItem } = require('../models/Impact');
const { restrictTo } = require('../middleware/auth');

const VALID_ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

// All routes in this file require admin role.
router.use(restrictTo('admin'));

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalOrders,
      totalMenuItems,
      totalRevenue,
      activeOrders,
      completedOrders,
      totalDonations
    ] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      MenuItem.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$pricing.total' } } }]),
      Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'preparing', 'out_for_delivery'] } }),
      Order.countDocuments({ status: 'delivered' }),
      Order.aggregate([
        { $unwind: '$suspendedItems' },
        { $group: { _id: null, total: { $sum: '$suspendedItems.unitPrice' } } }
      ])
    ]);

    res.json({
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      activeOrders,
      completedOrders,
      totalDonations: totalDonations[0]?.total || 0,
      totalMenuItems,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 250);
    const users = await User.find({})
      .select('name email role impactPoints isActive createdAt')
      .sort({ createdAt: -1 })
      .limit(limit);
    
    res.json(users);
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 250);
    const status = req.query.status;
    const filter = {};
    if (status && VALID_ORDER_STATUSES.includes(status)) {
      filter.status = status;
    }

    const orders = await Order.find({})
      .find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);
    
    res.json(orders);
  } catch (error) {
    console.error('Admin orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get all reviews (mock data for now)
router.get('/reviews', async (req, res) => {
  try {
    // Mock reviews data - in a real app, this would come from a Review model
    const mockReviews = [
      {
        _id: '1',
        user: { name: 'John Doe' },
        rating: 5,
        comment: 'Excellent food and delivery service!',
        orderId: 'abc123',
        createdAt: new Date('2024-01-15')
      },
      {
        _id: '2',
        user: { name: 'Jane Smith' },
        rating: 4,
        comment: 'Great quality, delivery was a bit late but food was amazing.',
        orderId: 'def456',
        createdAt: new Date('2024-01-14')
      },
      {
        _id: '3',
        user: { name: 'Mike Johnson' },
        rating: 5,
        comment: 'Love the concept of suspended meals! Will definitely order again.',
        orderId: 'ghi789',
        createdAt: new Date('2024-01-13')
      }
    ];
    
    res.json(mockReviews);
  } catch (error) {
    console.error('Admin reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Update user status
router.patch('/users/:userId/status', async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean value' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isActive },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('Admin user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Update order status
router.patch('/orders/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!VALID_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status provided' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { 
        status,
        $push: {
          statusHistory: {
            status,
            changedAt: new Date(),
            changedBy: req.user._id
          }
        }
      },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Admin order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Get full menu list for admin (includes unavailable items)
router.get('/menu', async (_req, res) => {
  try {
    const items = await MenuItem.find({}).sort({ category: 1, sortOrder: 1, createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('Admin menu error:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Create menu item
router.post('/menu', async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    console.error('Admin create menu error:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// Update menu item
router.patch('/menu/:menuItemId', async (req, res) => {
  try {
    const allowedFields = [
      'name',
      'description',
      'price',
      'category',
      'image',
      'tags',
      'isAvailable',
      'isSuspendable',
      'calories',
      'prepTime',
      'featured',
      'sortOrder',
    ];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );

    const item = await MenuItem.findByIdAndUpdate(req.params.menuItemId, updates, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Admin update menu error:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// Delete menu item
router.delete('/menu/:menuItemId', async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.menuItemId);
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Admin delete menu error:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

module.exports = router;
