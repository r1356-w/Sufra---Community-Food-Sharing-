# Sufra - Community Food Sharing Platform

A modern full-stack web application that connects restaurants with communities through meal donations, shared delivery, and real-time impact tracking.

## 🌟 Features

### Customer Experience
- **Browse Menu**: Interactive restaurant menu with categories and search
- **Smart Cart**: Separate regular orders and suspended meal donations
- **Shared Delivery**: Eco-friendly delivery matching with nearby orders
- **Live Tracking**: Real-time order status updates via Socket.io
- **Impact Dashboard**: Track your community contributions and CO₂ savings

### Admin Management
- **Dashboard Overview**: Real-time statistics and key metrics
- **User Management**: Activate/deactivate user accounts
- **Order Management**: Update order statuses and track deliveries
- **Menu Management**: Full CRUD operations for menu items
- **Impact Analytics**: Monitor community impact and donations

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **Socket.io** - Real-time WebSocket communication
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - UI library with hooks
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Axios** - HTTP client

## 📁 Project Structure

```
sufra-fullstack-final/
├── backend/
│   ├── server.js
│   ├── src/
│   │   ├── app.js
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── middleware/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── utils/
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or cloud instance)

### 1. Clone & Install
```bash
git clone <repository-url>
cd sufra-fullstack-final

# Backend
cd backend
npm install
cp .env.example .env
npm run seed
npm start

# Frontend
cd frontend
npm install
npm run dev
```

### 2. Access the Application
- **Customer Website**: `http://localhost:5173`
- **Admin Panel**: `http://localhost:5173/admin`

### Demo Credentials
- **Admin**: `admin@sufra.com` / `Password123!`
- **Customer**: `customer@sufra.com` / `Password123!`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Menu
- `GET /api/menu` - Get all menu items

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/my` - Get user's order history

### Admin (Protected)
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - User management
- `GET /api/admin/orders` - Order management
- `GET /api/admin/menu` - Menu management

## 🔧 Key Features

### Suspended Meals
Users can "suspend" meals - paying for meals that go to community members in need, creating social impact while supporting restaurants.

### Shared Delivery
Uses geospatial queries to match nearby orders within 2km, enabling shared deliveries that reduce CO₂ emissions and costs.

### Real-time Updates
WebSocket integration provides live order tracking and impact statistics updates.

## 🔒 Security

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting
- CORS configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**Built with Rand Oraij for communities that care**
