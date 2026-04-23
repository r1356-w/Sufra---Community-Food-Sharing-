/**
 * server.js — Sufra API Entry Point
 *
 * Bootstraps MongoDB, creates the HTTP server, attaches Socket.io,
 * and begins listening. All configuration is pulled from .env via dotenv.
 */

require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('./src/app');
const socketManager = require('./src/socket/socketManager');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

async function bootstrap() {
  // ── 1. Connect to MongoDB ─────────────────────────────────────────────────
  await mongoose.connect(MONGO_URI);
  console.log('✅ [DB] MongoDB connected successfully');

  // ── 2. Create HTTP server (wraps Express so Socket.io can share it) ───────
  const httpServer = http.createServer(app);

  // ── 3. Attach Socket.io BEFORE listening ─────────────────────────────────
  socketManager.init(httpServer);
  console.log('✅ [Socket] Socket.io initialised');

  // ── 4. Start listening ────────────────────────────────────────────────────
  httpServer.listen(PORT, () => {
    console.log(`✅ [Server] Sufra API running on http://localhost:${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV}`);
  });
}

// Surface async bootstrap errors clearly
bootstrap().catch((err) => {
  console.error('❌ [Bootstrap] Fatal startup error:', err.message);
  process.exit(1);
});
