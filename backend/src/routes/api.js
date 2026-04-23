/**
 * routes/api.js
 *
 * All API routes mounted under /api in app.js
 */

const express = require('express');
const router  = express.Router();

const authController   = require('../controllers/authController');
const orderController  = require('../controllers/orderController');
const impactController = require('../controllers/impactController');
const adminRoutes      = require('./admin');
const { protect, restrictTo } = require('../middleware/auth');

// ─── Auth ─────────────────────────────────────────────────────────────────────
router.post('/auth/register', authController.registerValidation, authController.register);
router.post('/auth/login',    authController.loginValidation,    authController.login);
router.get ('/auth/me',       protect,                           authController.getMe);

// ─── Menu ─────────────────────────────────────────────────────────────────────
router.get ('/menu',                                          impactController.getMenu);
router.get ('/menu/featured',                                 impactController.getFeaturedItems);
router.post('/menu', protect, restrictTo('admin'),            impactController.createMenuItem);

// ─── Impact stats (public — consumed by landing page) ─────────────────────────
router.get('/impact-stats', impactController.getImpactStats);

// ─── Orders ───────────────────────────────────────────────────────────────────
// Shared delivery proximity check (must come before /:id to avoid routing conflict)
router.get ('/orders/shared-delivery/check', protect, orderController.checkSharedDelivery);
router.get ('/orders/my',                    protect, orderController.getMyOrders);
router.get ('/orders/:id',                   protect, orderController.getOrderById);
router.post('/orders',                       protect, orderController.createOrder);
router.patch('/orders/:id/status',           protect, orderController.updateOrderStatus);

// Admin routes
router.use('/admin', protect, adminRoutes);

module.exports = router;
