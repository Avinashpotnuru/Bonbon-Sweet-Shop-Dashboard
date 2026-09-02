# Bonbon — Premium POS Dashboard

A premium point-of-sale / store-management dashboard for a candy & bakery business, built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **shadcn/ui (radix-nova)** — backed by a live **MongoDB** database.

![Stack](https://img.shields.io/badge/Next.js-16-000) ![React](https://img.shields.io/badge/React-19-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-7-47a248)

## ✨ Features

- **Dashboard** — premium live overview with hero banner, animated KPI cards, revenue trend chart, sales-by-status donut, top customers, expenses-by-category, recent orders, and low-stock alerts
- **Products** — CRUD for candies & baked goods
- **Categories** — organize products into categories (with in-use delete protection)
- **Orders** — auto-numbered orders (`SO-####`), full CRUD, search/filter/sort/pagination
- **Customers** — CRUD with normalized e-mail (duplicate detection) and status/VIP filters
- **Inventory** — stock level view + atomic stock adjustments (clamps at 0, auto status, movement history)
- **Expenses** — expense tracking with category breakdown & total-spend aggregation
- **Reports** — revenue trends, profit, top customers, low-stock alerts, expenses by category

### Premium UI/UX

- Dark "chocolate" sidebar with grouped nav, berry active pills, and a Pro upsell card
- Frosted-glass sticky header with page title chip, working **light/dark/system theme toggle** (via `next-themes`), notifications, and a user menu
- **Playfair Display** headings + Inter body, warm-cream + berry + caramel design tokens
- Micro-interactions: hover lifts, gradient chips, count-up animations, status pills, progress bars

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
```

> `.env.local` is gitignored — never commit your real credentials.

### 4. (Optional) Seed the database

Populate the database with realistic sample data:

```bash
node scripts/seed-products.mjs
node scripts/seed-customers.mjs
node scripts/seed-orders.mjs
node scripts/seed-expenses.mjs
```

Verify the seeded data:

```bash
node scripts/verify-seed.mjs
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign into the dashboard at `/dashboard`.

## 📜 Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## 🗄️ Database

`src/lib/mongodb.ts` (`getClient`, `getDb`, `connectDb`) manages the shared connection and exposes the following collections:

`products`, `categories`, `customers`, `orders`, `expenses`, `inventory_movements`

### API Routes

All endpoints are under `/api`:

- `GET/POST /api/products`, `/api/categories`, `/api/customers`, `/api/orders`, `/api/expenses`
- `PATCH/DELETE /api/products/[id]`, `/api/categories/[id]`, `/api/customers/[id]`, `/api/orders/[id]`, `/api/expenses/[id]`
- `GET /api/inventory` (optional `?movements=true`), `POST /api/inventory/[id]/adjust`
- `GET /api/reports`

## 🧱 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, TypeScript, Tailwind CSS v4, shadcn/ui (radix-nova)
- **Data**: MongoDB (official Node driver)
- **Forms**: react-hook-form + zod
- **Theming**: next-themes
- **Notifications**: sonner

## 📁 Project Structure

```
src/
  app/
    api/          # REST API route handlers
    dashboard/    # Dashboard pages (products, orders, customers, ...)
    globals.css   # Design tokens (light + dark palettes, fonts)
    layout.tsx    # Root layout (fonts + ThemeProvider)
  components/
    dashboard/    # Feature UI (tables, forms, dialogs, overview)
    ui/           # shadcn/ui primitives
  lib/
    *-repo.ts     # MongoDB data-access layer
    *-schemas.ts  # zod validation schemas
    *-types.ts    # TypeScript types
scripts/          # Standalone DB seed & verify scripts
```

## 📝 License

This is a private project. All rights reserved.
