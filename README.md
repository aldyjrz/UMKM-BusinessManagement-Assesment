# UMKM ERP — Integrated Business Management System

**UMKM ERP** adalah aplikasi web Enterprise Resource Planning (ERP) ringan untuk UMKM (Usaha Mikro, Kecil, dan Menengah) yang mengintegrasikan Sales, Inventory, Customer, Finance, Payment, dan Automation.

## 🏗️ Architecture

```
                    ┌──────────────────────┐
                    │      CUSTOMER        │
                    └──────────┬───────────┘
                               │
            ┌──────────────────┴──────────────────┐
            │                                     │
     Guest Checkout                        Google Login
            │                                     │
            └──────────────────┬──────────────────┘
                               ▼
                   ┌───────────────────┐
                   │    React +        │
                   │  Tailwind CSS     │
                   └─────────┬─────────┘
                             │
                          REST API
                             │
                   ┌─────────▼─────────┐
                   │      Express      │
                   │     Backend      │
                   ├───────────────────┤
                   │ Auth              │
                   │ Sales             │
                   │ Customer          │
                   │ Inventory         │
                   │ Finance          │
                   │ Payment          │
                   │ Dashboard        │
                   └─────────┬─────────┘
                             │
                          ┌─▼─┐
                          │MySQL│
                          └───┘
                             │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
         Google        Midtrans        n8n
         OAuth      Sandbox        Automation
```

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + React Router + TanStack Query + Zustand
- **Backend**: Node.js + Express.js + TypeScript + Sequelize + MySQL
- **Auth**: Google OAuth 2.0 + JWT
- **Payment**: Midtrans Sandbox
- **Automation**: n8n
- **Infrastructure**: Docker + Docker Compose

## 📁 Project Structure

```
umkm-business-management/
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── auth.ts
│   │   │   └── index.ts
│   │   ├── middlewares/
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── validateRequest.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Customer.ts
│   │   │   ├── Category.ts
│   │   │   ├── Supplier.ts
│   │   │   ├── Product.ts
│   │   │   ├── Order.ts
│   │   │   ├── OrderItem.ts
│   │   │   ├── Payment.ts
│   │   │   ├── StockMovement.ts
│   │   │   ├── Income.ts
│   │   │   ├── Expense.ts
│   │   │   ├── OAuthAccount.ts
│   │   │   └── index.ts
│   │   ├── integrations/
│   │   │   ├── google/
│   │   │   │   └── googleService.ts
│   │   │   ├── payment/
│   │   │   │   └── midtrans.ts
│   │   │   └── n8n/
│   │   │       └── n8nClient.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── sales/
│   │   │   ├── inventory/
│   │   │   ├── customer/
│   │   │   ├── finance/
│   │   │   ├── payment/
│   │   │   └── dashboard/
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   └── response.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── migrations/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/ (Button, Input, Modal, Table, Card, Badge, etc.)
│   │   │   └── product/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── modules/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── router/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- npm/yarn

### Option 1: Docker (Recommended)

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit .env files with your credentials (Google OAuth, Midtrans, etc.)

docker-compose up --build
```

- Backend API: http://localhost:3000
- Frontend: http://localhost:5173
- n8n: http://localhost:5678
- MySQL: localhost:3306

### Option 2: Development

```bash
# Terminal 1 - Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
cp .env.example .env
npm run dev
```
  
## 🤖 n8n Workflows

### Payment Notification
- Webhook: `/webhook/payment-notification`
- Triggered when payment is PAID

### Low Stock Alert
- Webhook: `/webhook/low-stock-notification`
- Triggered when product stock <= minimum_stock

### Daily Report
- Cron trigger in n8n
- Calls `GET /api/finance/summary`
- Sends scheduled report

##  API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Local registration |
| POST | `/api/auth/login` | Local login |
| GET | `/api/auth/google` | Google OAuth redirect |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products |
| POST | `/api/products` | Create product (Staff+) |
| GET | `/api/products/:id` | Get product |
| PUT | `/api/products/:id` | Update product (Staff+) |
| DELETE | `/api/products/:id` | Delete product (Admin+) |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | List customers |
| POST | `/api/customers` | Create customer (Admin+) |
| GET | `/api/customers/:id` | Get customer |
| PUT | `/api/customers/:id` | Update customer (Admin+) |
| DELETE | `/api/customers/:id` | Delete customer (Admin+) |

### Orders (Sales)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders/guest` | Create guest order |
| GET | `/api/orders/status/:orderNumber` | Get order status (secure token) |
| GET | `/api/orders/:id` | Get order by ID |
| GET | `/api/orders/my-orders` | Get user's orders |
| GET | `/api/orders` | List all orders (Staff+) |
| GET | `/api/orders/stats` | Order stats (Staff+) |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments` | Create payment |
| GET | `/api/payments/:id` | Get payment |
| GET | `/api/payments/order/:orderId` | Get payment by order |
| POST | `/api/payments/webhook` | Midtrans webhook |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory` | List products |
| GET | `/api/inventory/movements` | List stock movements |
| POST | `/api/inventory/adjustment` | Create stock adjustment |
| POST | `/api/inventory/purchase` | Record purchase |

### Finance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/finance/summary` | Finance summary |
| GET | `/api/finance/incomes` | List incomes |
| POST | `/api/finance/incomes` | Create income (Admin+) |
| GET | `/api/finance/expenses` | List expenses |
| POST | `/api/finance/expenses` | Create expense (Admin+) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Dashboard metrics |

## 👥 User Roles

| Role | Access |
|------|--------|
| Guest | Browse products, add to cart, guest checkout, view order status |
| Customer | All guest access + order history, profile management |
| Staff | Inventory management, order management, sales reports |
| Admin | Full access except user management |
| Owner | All access including user management |
 
```
