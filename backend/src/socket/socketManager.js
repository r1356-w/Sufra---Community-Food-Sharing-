/**
 * socket/socketManager.js
 *
 * Centralised Socket.io management.
 *
 * Room strategy:
 *  - 'charity-dashboard'  → Charity staff see live suspended meal changes
 *  - 'impact-feed'        → Landing page impact counter subscribers
 *  - 'order:{orderId}'    → Per-order tracking room for customers
 *
 * This module is a singleton: init() sets _io once, getIO() retrieves it
 * from anywhere without prop-drilling.
 */

let _io = null;

// ─── Initialise ───────────────────────────────────────────────────────────────

function init(httpServer) {
  const { Server } = require('socket.io');

  _io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Ping every 25 seconds to keep connections alive through proxies
    pingInterval: 25000,
    pingTimeout:  60000,
  });

  _io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // ── Room subscriptions ────────────────────────────────────────────────
    socket.on('join:charity-dashboard', () => {
      socket.join('charity-dashboard');
      console.log(`[Socket] ${socket.id} joined charity-dashboard`);
    });

    socket.on('join:impact-feed', () => {
      socket.join('impact-feed');
    });

    socket.on('join:order-tracking', ({ orderId }) => {
      if (orderId) {
        socket.join(`order:${orderId}`);
        console.log(`[Socket] ${socket.id} tracking order ${orderId}`);
      }
    });

    socket.on('leave:order-tracking', ({ orderId }) => {
      if (orderId) socket.leave(`order:${orderId}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Disconnected: ${socket.id} (${reason})`);
    });

    socket.on('error', (err) => {
      console.error(`[Socket] Error on ${socket.id}:`, err);
    });
  });

  return _io;
}

// ─── Accessor ─────────────────────────────────────────────────────────────────

function getIO() {
  if (!_io) {
    throw new Error('Socket.io not initialised. Call socketManager.init(httpServer) first.');
  }
  return _io;
}

// ─── Named event emitters ─────────────────────────────────────────────────────

/**
 * Broadcast updated global impact counters to ALL connected clients.
 * Consumed by the landing page live counters.
 */
function emitImpactUpdate(impactData) {
  getIO().emit('impact:updated', {
    suspendedMealsAvailable: impactData.suspendedMealsAvailable,
    totalMealsDonated:       impactData.totalMealsDonated,
    totalMealsDelivered:     impactData.totalMealsDelivered,
    totalCo2Saved:           Number(impactData.totalCo2Saved.toFixed(2)),
    totalSharedDeliveries:   impactData.totalSharedDeliveries,
    totalOrders:             impactData.totalOrders,
    timestamp:               new Date().toISOString(),
  });
}

/**
 * Notify charity dashboard of suspended meal changes.
 */
function emitSuspendedMealsUpdate({ available, donated, orderId, donorName }) {
  getIO().to('charity-dashboard').emit('suspended-meals:updated', {
    available,
    donated,
    orderId,
    donorName,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Push an order status update to only the clients tracking this order.
 */
function emitOrderStatusUpdate(orderId, statusData) {
  getIO().to(`order:${orderId}`).emit('order:status-changed', {
    orderId,
    ...statusData,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Notify all clients when a new shared delivery pair is formed.
 */
function emitSharedDeliveryFormed({ orderId1, orderId2, savings }) {
  getIO().emit('shared-delivery:formed', {
    orderId1,
    orderId2,
    co2Savings: savings,
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  init,
  getIO,
  emitImpactUpdate,
  emitSuspendedMealsUpdate,
  emitOrderStatusUpdate,
  emitSharedDeliveryFormed,
};
