# Bonbon — Sweet Shop (Storefront + POS Dashboard)

A full-stack sweet-shop platform for a candy & bakery business: a customer-facing **storefront** (browse, cart, checkout, account) plus a premium **point-of-sale / store-management dashboard**. Built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **shadcn/ui (radix-nova)** — backed by a live **MongoDB** database.

![Stack](https://img.shields.io/badge/Next.js-16-000) ![React](https://img.shields.io/badge/React-19-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-7-47a248) ![Razorpay](https://img.shields.io/badge/Razorpay-Checkout-02042b)

## ✨ Features

### Storefront

- **Home, About & Contact** — marketing pages with the Sweet-Shop design system
- **Product catalog** — `/shop` grid + `/shop/[slug]` detail pages, category browsing
- **Cart** — add/remove/update quantities, promo-code discount, delivery fee, totals
- **Checkout** — validated contact + delivery details, payment methods: **Cash on Delivery**, **Razorpay** (cards / UPI / netbanking), **PayPal**
  - Razorpay uses a server-created order at the checkout.razorpay.com modal; the impact on inventory/post-payment verification is signature-verified before the order is stored
- **Order success** — session-persisted receipt after placement
- **Customer accounts** — profile, saved addresses, and order history (JWT protected)

### POS / Dashboard (`/dashboard`)

- **Overview** — premium live dashboard with hero banner, animated KPI cards, revenue trend chart, sales-by-status donut, top customers, expenses-by-category, recent orders, and low-stock alerts
- **Products** — CRUD for candies & baked goods
- **Categories** — organize products (with in-use delete protection)
- **Orders** — auto-numbered `SO-####` (shared with storefront), full CRUD, search/filter/sort/pagination
- **Customers** — CRUD with normalized email (duplicate detection) and status/VIP filters
- **Inventory** — stock view + atomic adjustments (clamps at 0, auto status, movement history); storefront orders decrement stock automatically
- **Expenses** — tracking with category breakdown & total-spend aggregation
- **Reports** — revenue trends, profit, top customers, low-stock alerts, expenses by category
- **Staff management** — add/edit/deactivate staff accounts (admins only)

### Security & UX

- **Role-based auth** — customer, staff, and admin accounts via JWT (`jose`), with separate sign-in routes: customers at `/login`, staff/admins at `/admin/login`
- Server-side validation, authoritative price re-pricing, and atomic stock updates on every order
- **Premium UI** — dark "chocolate" sidebar, frosted-glass header, light/dark/system theme toggle, Playfair Display + Inter, warm-cream/caramel/berry tokens, micro-interactions

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 20+
- A MongoDB deployment (Atlas or local) with the connection string

### 2. Install

```bash
npm install
```

### 3. Configure environment

Create a `.env.local` file in the project root:

```bash
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>/<db>"
MONGODB_DB="sweet-shop"

# JWT signing secret for the auth cookies (any long random string)
AUTH_SECRET="replace-with-a-long-random-secret"

# Razorpay — optional. Without keys the Razorpay checkout method is hidden.
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx
RAZORPAY_CURRENCY=INR   # optional, defaults to INR
```

> `.env.local` is gitignored — never commit your real credentials.

### 4. (Optional) Seed the database

Populate the database with realistic sample data:

```bash
node scripts/ensure-indexes.mjs   # unique indexes (first run)
node scripts/seed-admin.mjs       # creates the admin account
node scripts/seed-products.mjs
node scripts/seed-customers.mjs
node scripts/seed-orders.mjs
node scripts/seed-expenses.mjs
node scripts/verify-seed.mjs      # sanity-check the seeded data
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront. Sign in to the dashboard at `/dashboard`.

Seed credentials:

- **Admin** — `/admin/login` with `admin@bonbon.app` / `admin1234`
- **Customer** — `/login`; create an account from the sign-in page or `/register`

## 📜 Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## 🗄️ Database

`src/lib/mongodb.ts` (`getClient`, `getDb`, `connectDb`) manages the shared connection and exposes the following collections:

`products`, `categories`, `customers`, `orders`, `expenses`, `inventory_movements`, `users`, `customer_profiles`

### API Routes

All endpoints are under `/api`:

- **Auth** — `POST /api/auth/login-customer`, `POST /api/auth/login-staff`, `POST /api/auth/logout`, `POST /api/auth/register-customer`
- `GET/POST /api/products`, `/api/categories`, `/api/customers`, `/api/orders`, `/api/expenses`
- `PATCH/DELETE /api/products/[id]`, `/api/categories/[id]`, `/api/customers/[id]`, `/api/orders/[id]`, `/api/expenses/[id]`
- `GET /api/inventory` (optional `?movements=true`), `POST /api/inventory/[id]/adjust`
- `GET /api/reports`
- **Staff (admin-only)** — `GET/POST /api/staff`, `PATCH/DELETE /api/staff/[id]`

## 🧱 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, TypeScript, Tailwind CSS v4, shadcn/ui (radix-nova)
- **Data**: MongoDB (official Node driver)
- **Forms**: react-hook-form + zod
- **Auth**: jose (JWT in httpOnly cookies), scrypt password hashing
- **Payments**: Razorpay (server-side order creation + signature verification)
- **Notifications**: sonner; **Theming**: next-themes

## 📁 Project Structure

```
src/
  app/
    api/          # REST API route handlers (auth, staff, catalog, ...)
    (store)/      # Storefront: /, /shop, /cart, /checkout, /account, /login
    admin/        # Admin sign-in (/admin/login)
    dashboard/    # Dashboard pages (overview, products, orders, customers, ...)
    globals.css   # Design tokens (light + dark palettes, fonts)
    layout.tsx    # Root layout (fonts + ThemeProvider)
  components/
    dashboard/    # POS feature UI (tables, forms, dialogs, overview)
    store/        # Storefront UI (product cards, cart, checkout, auth forms)
    ui/           # shadcn/ui primitives
  lib/
    *-repo.ts     # MongoDB data-access layer
    *-schemas.ts  # zod validation schemas
    *-types.ts    # TypeScript types
    auth.ts       # JWT signing / session helpers
    razorpay.ts   # Razorpay order creation & signature verification
scripts/          # Standalone DB seed, index, and verify scripts
```

## 📝 License

This is a private project. All rights reserved.