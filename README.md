# 🍕 Swigto — Food Delivery Frontend

A modern, full-featured food delivery platform frontend built with **React 19**, **Vite**, and **Tailwind CSS v4**. Inspired by Swiggy/Zomato, Swigto provides a complete multi-role experience for **Customers**, **Restaurant Owners**, and **Delivery Agents**.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)

---

## ✨ Features

### 👤 Customer Portal
- 🏠 Home feed with restaurant discovery & search
- 🍽️ Restaurant detail pages with full menu browsing
- 🛒 Cart management & checkout with **Razorpay** integration
- 📦 Order history & real-time order tracking (WebSocket)
- ⭐ Submit reviews for completed orders
- 👤 Profile management

### 🍳 Restaurant Owner Portal
- 📊 Dashboard with key business metrics
- 📋 Full menu management (CRUD for items & variants)
- 📝 Restaurant profile & settings management
- 🔔 Live incoming orders view
- ⭐ Reviews management

### 🚴 Delivery Agent Portal
- 📊 Agent dashboard with delivery stats

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 8 | Build tool & dev server |
| Tailwind CSS v4 | Utility-first styling |
| Zustand | Lightweight state management |
| React Query (TanStack) | Server-state & caching |
| React Router v7 | Client-side routing |
| Axios | HTTP client |
| Socket.io Client | Real-time order tracking |
| React Hook Form + Zod | Form handling & validation |
| Recharts | Dashboard analytics charts |
| Leaflet | Map-based order tracking |
| Lucide React | Icon library |
| Sonner | Toast notifications |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** (recommended) or npm

### 1. Clone the Repository

```bash
git clone https://github.com/alokX01/Swigto-frontend.git
cd Swigto-frontend
```

### 2. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and update the values:

```env
VITE_API_BASE_URL=http://your-backend-url/api/v1
VITE_WS_BASE_URL=ws://your-backend-url
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 4. Start Development Server

```bash
pnpm dev
# or
npm run dev
```

The app will open at **http://localhost:5173**

### 5. Build for Production

```bash
pnpm build
# or
npm run build
```

Preview the production build:

```bash
pnpm preview
# or
npm run preview
```

---

## 📁 Project Structure

```
Swigto-frontend/
├── public/                  # Static assets (favicon, icons)
├── src/
│   ├── api/                 # API service layers (Axios calls)
│   │   ├── auth.js          # Authentication API
│   │   ├── axios.js         # Axios instance & interceptors
│   │   ├── cart.js          # Cart API
│   │   ├── orders.js        # Orders API
│   │   ├── profiles.js      # Profile API
│   │   ├── restaurants.js   # Restaurants & menu API
│   │   └── reviews.js       # Reviews API
│   ├── assets/              # Images & SVGs
│   ├── components/          # Shared/reusable components
│   │   ├── layouts/         # Page layout wrappers
│   │   ├── ErrorBoundary.jsx
│   │   ├── MobileBottomNav.jsx
│   │   ├── PageLoader.jsx
│   │   └── Sidebar.jsx
│   ├── lib/                 # Utilities & helpers
│   │   ├── helpers.js
│   │   ├── utils.js
│   │   └── validators.js
│   ├── pages/               # Route-level page components
│   │   ├── customer/        # Customer-facing pages
│   │   ├── restaurant/      # Restaurant owner pages
│   │   └── agent/           # Delivery agent pages
│   ├── routes/              # Route guards & config
│   │   └── ProtectedRoute.jsx
│   ├── store/               # Zustand state stores
│   │   ├── authStore.js
│   │   ├── cartStore.js
│   │   ├── locationStore.js
│   │   ├── menuManagementStore.js
│   │   ├── orderStore.js
│   │   ├── profileStore.js
│   │   └── restaurantOwnerStore.js
│   ├── App.jsx              # Root component with routing
│   ├── App.css              # App-level styles
│   ├── index.css            # Global styles & Tailwind
│   └── main.jsx             # Entry point
├── scripts/                 # Dev utility scripts
├── .env.example             # Environment variable template
├── .gitignore
├── eslint.config.js         # ESLint configuration
├── index.html               # HTML entry point
├── package.json
├── pnpm-lock.yaml           # Dependency lock file
└── vite.config.js           # Vite configuration
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server with HMR |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build locally |
| `pnpm lint` | Run ESLint checks |

---

## 🔗 Backend API

This frontend connects to a Django REST API backend. See the [API Reference](./API_STORE_REFERENCE.md) for endpoint documentation.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Alok Kumar** — [@alokX01](https://github.com/alokX01)
