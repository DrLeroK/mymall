# 🛍️ MyMall Frontend — Multi-Tenant E-Commerce SaaS & POS Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![React Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=for-the-badge&logo=react-query&logoColor=white)](https://tanstack.com/query)
[![Socket.io](https://img.shields.io/badge/Socket.io-Client-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Mapbox](https://img.shields.io/badge/Mapbox_GL-v3-000000?style=for-the-badge&logo=mapbox&logoColor=white)](https://www.mapbox.com/)

A modern, high-performance, enterprise-grade multi-tenant e-commerce marketplace, SaaS platform, and Point-of-Sale (POS) frontend built with **Next.js 16 (Turbopack & App Router)**, **React 19**, **Tailwind CSS v4**, and **TypeScript**.

Designed specifically for multi-store retail ecosystems, subscription SaaS billing, cashier POS registers with 80mm thermal receipt printing, interactive Mapbox delivery geolocation, and localized Ethiopian payment methods (Telebirr, CBE Birr, Chapa, and Bank Screenshot proof).

---

## 📸 Screenshots Showcase

<!-- ================================================================= -->
<!-- PLACEHOLDER FOR SCREENSHOTS - REPLACE IMAGE LINKS WITH YOUR OWN  -->
<!-- ================================================================= -->

| 🏪 Storefront & Marketplace | 🗺️ Interactive Mapbox Delivery Picker |
|:---:|:---:|
| ![Storefront Screenshot](https://via.placeholder.com/600x340/0f172a/f8fafc?text=Storefront+%26+Catalog) | ![Mapbox Location Picker](https://via.placeholder.com/600x340/0f172a/f8fafc?text=Mapbox+Delivery+Location+Picker) |

| 💼 Merchant Dashboard & Staff Management | 📠 Point of Sale (POS) & Thermal Receipt |
|:---:|:---:|
| ![Merchant Staff Management](https://via.placeholder.com/600x340/0f172a/f8fafc?text=Merchant+Staff+Control+Center) | ![POS Register](https://via.placeholder.com/600x340/0f172a/f8fafc?text=Point+of+Sale+(POS)+Terminal) |

| 💬 Real-Time Live Chat Drawer | 🛡️ Platform Super Admin Center |
|:---:|:---:|
| ![Live Chat Drawer](https://via.placeholder.com/600x340/0f172a/f8fafc?text=Real-Time+Customer+Chat) | ![Superadmin Dashboard](https://via.placeholder.com/600x340/0f172a/f8fafc?text=Super+Admin+Verifications) |

---

## 🔗 Backend Engine Repository

This frontend client connects to a dedicated, high-performance backend API engine:

👉 **Backend Repository:** [`mymall_backend`](https://github.com/DrLeroK/mymall_backend)
- **Stack:** Node.js, Express, TypeScript, PostgreSQL, Prisma ORM, Socket.io, Multer, JWT.
- **Port:** `http://localhost:5001` (REST API: `/api/v1`, Socket.io: `ws://localhost:5001`)

*Ensure the backend is running before launching the frontend to enable authentication, real-time WebSockets, product management, and order processing.*

---

## ✨ Key Features

### 🏪 1. Multi-Tenant Storefronts, Variants & Marketplace
- **Dedicated Store Routes**: Direct slug-based storefront routing (`/store/[slug]`) with custom branding, banner hero images, store policies, and operating hours.
- **Multi-Attribute Product Variants**: Interactive product pages with dynamic option selectors (Color, Size, Material), live variant price updates, and variant-level inventory stock indicators.
- **Auto-Hide Out of Stock**: Stores can toggle `hideOutOfStock` to automatically conceal sold-out items from public catalogs.
- **Dynamic Store Switching**: Customers can explore diverse merchants across the marketplace or purchase directly from individual vendor storefronts.

### 👥 2. Multi-Store Switcher & Merchant Dashboard Controls
- **Topbar Active Store Switcher**: Integrated multi-store dropdown in the merchant topbar header for staff/owners belonging to multiple stores. Displays store member counts and switches active store context on the fly with live session refresh.
- **Interactive User Profile Dropdown (`UserMenu`)**: Displays user initials avatar, full name, email, role badge, settings shortcuts, and secure logout.
- **Quick Cart Control**: Topbar cart button with live count badge synced with `CartContext`.
- **Granular Staff Management (`/merchant/staff`)**: Manage staff roles (`CASHIER`, `MANAGER`, `INVENTORY_CLERK`, `ACCOUNTANT`), toggle instant login deactivation, and dispatch one-time invitations with custom permission overrides.
- **Cashier & Custom Permission Isolation**: Strict defense-in-depth layout and navigation guards. Cashiers and staff without store-level overview rights (`view_reports` or managerial roles) are automatically blocked from financial dashboards (`/merchant`) and directed immediately to their authorized tools (`/merchant/products`, `/pos`).
- **Live Dynamic Quick Operations**: Merchant dashboard operational shortcuts display real-time live database counts (e.g., active bank accounts, pending payment proofs, out-of-stock items) and route directly with pre-selected filters (`?new=1`, `?tab=banks`, `?filter=pending_proof`).
- **Worker & Store Owner Personal Order Tracking (`/customer`)**: Allows employees and store owners to shop as marketplace customers, track personal order statuses, and view receipts without mixing personal purchases into merchant store analytics.

### 🛡️ 3. Platform Admin Store Owners & Merchant Directory (`/admin/merchants`)
- **Dedicated Store Owners Governance**: Full directory of all registered store owners and multi-store operators across Ethiopia.
- **Live Platform KPI Badges**: Real-time counts of total store owners, active stores, enterprise/growth subscribers, and total platform products.
- **Multi-Tenant Portfolio Modal**: Inspect every store owned by a merchant, including subscription plan, 5-day trial status, product count, and creation date.
- **Search, Filter & Sorting**: Instantly filter merchants by search term, verification status, or sort by creation date and store volume.

### 🔔 3. Real-Time Syncboard Notifications & Single-Use Modal Popups
- **Entrance Unseen Alerts Modal (`UnseenAlertsModal`)**: Queries `/alerts/unseen` on login; displays unseen alerts with type icons, timestamp, and dismiss controls. Alerts are marked `isSeen: true` atomically in the database to prevent duplicate popups on re-login or page refresh.
- **Live Active Session Popups**: Listens to WebSocket `alert:new` events in real time via `SocketContext`, triggering an immediate popup modal whenever a new notification arrives while the user is actively using the system.
- **Persistent Notification Bell Center**: Retains full notification history and unread counters even after modals have been dismissed.

### 🧭 4. Refined Navigation & Mobile Drawer
- **Decluttered Public Navbar**: Clean layout with direct navigation links (Home, Explore, Stores, Reviews, About, Contact), shopping cart shortcut with live count, and authenticated user controls.
- **Small-Screen Hamburger Drawer**: Consolidates language selection, dark/light theme toggle, notifications bell, and quick links without layout shifting.

### 🗺️ 5. Professional Mapbox Delivery Location Picker (Satellite & Streets)
- **High-Fidelity Mapbox GL JS**: Uses custom Mapbox vector tiles (`streets-v12` for light mode, `dark-v11` for dark mode).
- **Satellite vs Streets Switcher**: Floating layer toggle allowing customers to switch between high-resolution Satellite Imagery (`satellite-streets-v12`) and vector Streets — ideal for Ethiopian cities where buildings and compound gates are easier to recognize from the air.
- **GPS Auto-Locate Button**: One-tap device GPS geolocation centering the map on user coordinates and placing the marker with accuracy verification.
- **Interactive Pin Placement**: Click anywhere directly on the map or drag the custom `"Delivery Spot"` marker pin to set doorstep coordinates.
- **Reverse Geocoding**: Automatically fetches and populates real-world Ethiopian street names and neighborhoods using the Mapbox Geocoding API.
- **Smart Ethiopian Landmarks**: Quick-fly chips for popular Addis Ababa and regional hubs (Bole Medhanealem, Bole Atlas, Kazanchis, Mexico, Piassa, Megenagna, CMC, Summit, Sarbet, Ayat, Lebu, Gotera, Adama, Hawassa).

### 📊 6. Plan Upgrades & Full Subscription History (`/merchant/billing`)
- **Upgraded Tier Notification Banner**: Prominently displays the upgraded plan name, previous tier, and the exact days of access granted with this plan.
- **Active Tier Summary Card**: Displays current active plan with `Upgraded` and `X Days Granted` badges, plus real-time renewal countdown.
- **Plan & Upgrade History Table**: Full chronological audit trail of all purchased and upgraded plans, showing granted days (+30, +90, +180, +365 days), billing cycle, active period, payment method (`Chapa Gateway` / `Bank Transfer`), status (`Active`, `Completed`, `Pending Review`), and one-click receipt view.

### 💳 7. Localized Ethiopian Checkout & Payments
- **Chapa Payment Gateway**: Seamless checkout with Telebirr, CBE Birr, Awash, and debit/credit cards.
- **Dynamic Store Key Detection**: Automatically detects whether the merchant has configured their Chapa API keys. If keys are missing, Chapa payment is gracefully hidden or disabled with a helpful notification.
- **Bank Transfer with Screenshot Proof**: Direct transfer to Commercial Bank of Ethiopia (CBE), Telebirr, or Awash Bank with client-side screenshot proof upload (`image/jpeg`, `image/png`, `application/pdf`).
- **Flexible Fulfillment**: Choice between Doorstep Delivery (with Mapbox GPS coordinates) and In-Store Pickup.

### 📠 7. Point of Sale (POS) Terminal & Cashier Register (`/pos`)
- **Cashier Register UI**: High-speed touch-friendly interface for in-store sales, barcode scanning, manual search, and rapid line-item discounts.
- **80mm Thermal Receipt Printing**: Built-in standard POS thermal receipt formatting ready for ESC/POS or browser window printing.
- **Cash Reconciliation (`/pos/reconciliation`)**: Shift opening/closing balance tracking, cash-in/cash-out tracking, and discrepancy reporting.

### 💬 8. Real-Time Socket.io Live Chat
- **Multi-Party Chat**: Platform Admin ⟷ Store Owner, Store Owner ⟷ Customer, and Customer ⟷ Platform Admin.
- **Live Slide-Over Drawer (`LiveChatDrawer`)**: Instant typing indicators, unread badges, image attachments, and conversation history.

### 🌍 9. Multilingual Internationalization (i18n)
- Runtime instant language switching with zero page reloads:
  - 🇬🇧 **English (`en`)**
  - 🇪🇹 **Amharic (`am` / አማርኛ)**
  - 🇪🇹 **Afaan Oromoo (`om`)**

### 🛡️ 10. Super Admin Governance (`/admin`)
- **Verification Center**: Review and approve customer bank transfer receipts before dispatching orders.
- **Store Approval & Monitoring**: Onboard, verify, freeze, or monitor active vendor storefronts.
- **Dispute Resolution**: Dedicated dispute mediation portal for order complaints.
- **Platform Bank Accounts**: Manage centralized corporate bank accounts displayed during checkout.

### 🤖 11. Advanced SEO, AEO, and GEO Optimization
- **Answer Engine Optimization (AEO)**: Schema.org JSON-LD structured data (`WebSite`, `Organization`, and `FAQPage`) enabling direct answering on ChatGPT, Perplexity, Gemini, and Claude.
- **Generative Engine Optimization (GEO)**: Localized Ethiopian geographical meta tags (`ICBM`, `geo.position`, `geo.placename: Addis Ababa`, `geo.region: ET-AA`).
- **AI-Friendly Directives (`robots.ts`)**: Explicit user-agent crawler rules for `GPTBot`, `ChatGPT-User`, `PerplexityBot`, `ClaudeBot`, and `Google-Extended`.
- **Dynamic XML Sitemap (`sitemap.ts`)**: Auto-indexed public URLs with freshness priorities.

---

## 🛠️ Tech Stack & Libraries

| Technology | Purpose |
| :--- | :--- |
| **Next.js 16 (App Router & Turbopack)** | React full-stack framework with Server & Client components |
| **React 19** | Modern UI component architecture, hooks, and automatic batching |
| **TypeScript 5.9** | Static type checking and full end-to-end type safety |
| **Tailwind CSS v4** | Modern CSS-first utility engine with custom `@theme` brand tokens |
| **TanStack React Query v5** | Server-state caching, background synchronization, and optimistic updates |
| **Zustand v5** | Minimalist, high-performance client state management (sidebars, carts) |
| **Mapbox GL JS** | Interactive vector mapping, geocoding, and GPS picking |
| **Socket.io Client** | Real-time WebSocket connection for chat and notifications |
| **Lucide React** | Lightweight, accessible UI icon system |
| **Next Themes** | Robust dark and light theme switching with localStorage sync |
| **Framer Motion** | Fluid animations, slide-overs, and transitions |

---

## 📁 Project Directory Structure

```text
mymall/
├── .env                      # Local environment configuration
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore configuration
├── next.config.mjs           # Next.js 16 configuration & security response headers
├── package.json              # Project dependencies and run scripts
├── pnpm-workspace.yaml       # pnpm package manager configuration
├── postcss.config.mjs        # PostCSS configuration with @tailwindcss/postcss
├── tsconfig.json             # TypeScript compiler settings
│
├── public/                   # Static assets, logos, and placeholders
│
└── src/
    ├── app/                  # Next.js 16 Route Groups & Root Entrypoints
    │   ├── layout.tsx        # Root HTML layout with JSON-LD, fonts, and AppProviders
    │   ├── globals.css       # Tailwind v4 @import, @theme tokens, print receipt styles
    │   ├── not-found.tsx     # 404 Not Found page
    │   ├── error.tsx         # Global error boundary
    │   ├── unauthorized/     # 403 Access Denied page
    │   ├── robots.ts         # Search engine and AI crawler rules (AEO/GEO)
    │   ├── sitemap.ts        # Dynamic XML sitemap
    │   │
    │   ├── (public)/         # Public marketplace & storefront route group
    │   │   ├── layout.tsx    # Public header/footer shell with Navbar & Footer
    │   │   ├── page.tsx      # Main marketplace landing (/)
    │   │   ├── about/        # /about
    │   │   ├── contact/      # /contact
    │   │   ├── explore/      # /explore
    │   │   ├── reviews/      # /reviews
    │   │   ├── cart/         # /cart (Checkout, Chapa, Bank transfer, Mapbox picker)
    │   │   ├── orders/[id]/  # /orders/:id (Customer receipt & tracking)
    │   │   └── store/[slug]/ # Multi-tenant storefront & vendor catalog
    │   │       └── product/[productId]/ # Product detail page & customer reviews
    │   │
    │   ├── (auth)/           # Authentication route group
    │   │   ├── layout.tsx    # Clean authentication shell
    │   │   ├── login/        # /login
    │   │   ├── register/     # /register
    │   │   ├── forgot-password/ # /forgot-password
    │   │   └── staff/accept/ # /staff/accept
    │   │
    │   ├── (admin)/          # Platform governance route group
    │   │   └── admin/        # /admin and admin subroutes
    │   │       ├── layout.tsx
    │   │       ├── page.tsx
    │   │       ├── bank-accounts/
    │   │       ├── chat/
    │   │       ├── disputes/
    │   │       ├── plans/
    │   │       ├── reviews/
    │   │       ├── stores/[id]/
    │   │       └── verifications/
    │   │
    │   ├── (merchant)/       # Merchant center route group
    │   │   └── merchant/     # /merchant and store owner subroutes
    │   │       ├── layout.tsx
    │   │       ├── page.tsx
    │   │       ├── billing/
    │   │       ├── chat/
    │   │       ├── onboard/
    │   │       ├── orders/
    │   │       ├── products/
    │   │       ├── settings/
    │   │       └── staff/
    │   │
    │   ├── (user)/           # Customer account route group
    │   │   └── customer/     # /customer and customer chat
    │   │       ├── layout.tsx
    │   │       ├── page.tsx
    │   │       └── chat/
    │   │
    │   └── (pos)/            # In-store Point of Sale route group
    │       └── pos/          # /pos and shift reconciliation
    │           ├── layout.tsx
    │           ├── page.tsx
    │           └── reconciliation/
    │
    ├── components/           # Component library
    │   ├── ui/               # Primitives (Button, Modal, Card, Input, Badge, Tabs)
    │   ├── shared/           # PageHeader, StatCard, EmptyState
    │   ├── layout/           # DashboardShell, Sidebar, Topbar, UserMenu
    │   ├── theme/            # ThemeProvider, ThemeToggle
    │   ├── checkout/         # MapPickerModal.tsx (Mapbox GL JS)
    │   ├── common/           # Navbar, Footer, NotificationBell, LanguageSwitcher
    │   ├── chat/             # LiveChatDrawer.tsx
    │   └── storefront/       # ProductCard.tsx
    │
    ├── features/             # Domain-driven business logic
    │   ├── auth/             # Zod schemas, auth feature api
    │   ├── products/         # Products feature api
    │   ├── orders/           # Orders feature api
    │   ├── merchant/         # Merchant & staff feature api
    │   └── pos/              # POS feature api
    │
    ├── config/               # App configuration
    │   ├── site.ts           # Site metadata, GEO tags, AEO FAQs
    │   ├── navigation.ts     # Sidebar navigation per role
    │   └── roles.ts          # RBAC roles & permissions
    │
    ├── providers/            # React context and state providers
    │   ├── app-providers.tsx # Unified root provider
    │   ├── query-provider.tsx# TanStack Query client
    │   └── theme-provider.tsx# NextThemes provider
    │
    ├── store/                # Zustand client stores
    │   └── sidebar-store.ts  # Responsive sidebar collapse state
    │
    ├── lib/                  # Utilities & services
    │   ├── api-client.ts     # Centralized ApiClient
    │   ├── api.ts            # REST API endpoints
    │   ├── permissions.ts    # RBAC can() & hasRole() helpers
    │   ├── constants.ts      # App constants & keys
    │   ├── security.ts       # Defensive storage, JWT validation
    │   └── utils.ts          # Tailwind cn merge, formatting
    │
    ├── hooks/                # Custom React hooks
    │   ├── useDebounce.ts
    │   └── useMediaQuery.ts
    │
    ├── context/              # Core React contexts
    │   ├── AuthContext.tsx
    │   ├── CartContext.tsx
    │   ├── I18nContext.tsx
    │   └── SocketContext.tsx
    │
    ├── middleware.ts         # Edge route protection proxy
    └── types/                # TypeScript interfaces
```

---

## 🚀 Getting Started & How to Run

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` (Recommended: `v20+ LTS`)
- **pnpm** (`v12+`) or **npm** (`v9+`)
- **Running Backend**: The [`mymall_backend`](https://github.com/DrLeroK/mymall_backend) must be running on port `5001`.

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/DrLeroK/mymall.git
cd mymall
```

### Step 2: Install Dependencies
```bash
pnpm install
# or: npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file in the root directory (or copy from `.env.example`):
```bash
cp .env.example .env
```

Ensure your `.env` configuration contains:
```env
# Backend REST API endpoint (Express server base route)
BACK_API_URL=http://localhost:5001/api/v1

# Real-Time WebSocket server endpoint (Socket.io server)
BACK_SOCKET_URL=http://localhost:5001

# Static uploaded assets base URL
BACK_UPLOADS_URL=http://localhost:5001/uploads

# Default store slug for direct storefront routing
DEFAULT_STORE_SLUG=urbantrend

# Mapbox Access Token & Geocoding API for Delivery Location & Storefront Maps
MAPBOX_TOKEN=your_mapbox_access_token_here
MAPBOX_GEOCODING_URL=https://api.mapbox.com/geocoding/v5/mapbox.places

# Chapa Key for Telebirr / CBE Birr Ethiopian checkout
CHAPA_KEY=CHAPUBK_TEST-xxxxxx

# Frontend application root URL
NEXT_APP_URL=http://localhost:3000

# Node environment mode
NODE_ENV=development
```

> 🔒 **Vercel Compliance Standard**: Vercel rejects system or client environment variable names containing the reserved keyword `PUBLIC` or `_PUBLIC_`. In MyMall, variables are cleanly named (`BACK_API_URL`, `BACK_SOCKET_URL`, `BACK_UPLOADS_URL`, `MAPBOX_TOKEN`, `MAPBOX_GEOCODING_URL`, `CHAPA_KEY`, `DEFAULT_STORE_SLUG`, `NEXT_APP_URL`) and exposed to client bundles via the Next.js `env: { ... }` configuration in [`next.config.mjs`](next.config.mjs).

#### Detailed Environment Variables Explanation:

| Variable | Description & Rationale |
|---|---|
| `BACK_API_URL` | Base HTTP REST API URL pointing to the Express backend (e.g. `http://localhost:5001/api/v1` or `https://mymall-backend.onrender.com/api/v1`). Used by `api.ts` and `api-client.ts` for all catalog, auth, order, and billing queries. |
| `BACK_SOCKET_URL` | Base WebSocket URL for real-time Socket.io connections (e.g. `http://localhost:5001` or `https://mymall-backend.onrender.com`). Used by `SocketContext.tsx` for live chat drawers, instant order notifications, and syncboard popups. |
| `BACK_UPLOADS_URL` | Base static file URL for uploaded product images, branding logos, banners, and payment screenshots when local disk fallback is active on the server. Next.js also proxies `/backend-uploads/*` to this destination. |
| `DEFAULT_STORE_SLUG` | Fallback merchant store slug (e.g. `urbantrend` or `addisfashion`) used when a customer visits the storefront directly without specifying a store path. |
| `MAPBOX_TOKEN` | Public access token from Mapbox (`pk.eyJ1...`). Required by Mapbox GL JS in `MapPickerModal.tsx` to render vector and high-resolution satellite map tiles and enable interactive delivery pin placement. |
| `MAPBOX_GEOCODING_URL` | REST endpoint for reverse geocoding pin coordinates into Ethiopian street and neighborhood names (default: `https://api.mapbox.com/geocoding/v5/mapbox.places`). |
| `CHAPA_KEY` | Public client key for Chapa payment gateway (`CHAPUBK_TEST-...`), enabling Telebirr, CBE Birr, and card checkout in Ethiopia. |
| `NEXT_APP_URL` | Canonical root URL of the frontend application (e.g. `http://localhost:3000` or `https://mymall.vercel.app`). Used for open-graph SEO metadata and return URLs. |
| `NODE_ENV` | Application runtime environment (`development` or `production`). |

---

### Step 4: Run the Development Server
```bash
pnpm run dev
# or: npm run dev
```
Open your browser and navigate to:
```text
http://localhost:3000
```

### Step 5: Build & Run for Production Locally
```bash
# Compile and optimize production build
pnpm run build

# Start the optimized production server on port 3000
pnpm run start
```

### Step 6: Run Code Quality & Lint Checks
```bash
pnpm run lint
```

---

## 👥 Authentic Ethiopian Demo Accounts (`/login`)

The login screen (`/login`) includes quick one-click credential buttons for each system role:

| Role | Email | Password | Scope & Dashboard |
|---|---|---|---|
| **Super Admin** | `admin@mymall.et` | `P@ssw0rd2026!` | Platform Governance (`/admin`) |
| **Store Owner** | `owner@addisfashion.et` | `P@ssw0rd2026!` | Addis Fashion Hub (`/merchant`) |
| **Store Owner** | `owner@ethiotech.et` | `P@ssw0rd2026!` | Ethio Tech Zone (`/merchant`) |
| **Cashier Staff** | `cashier@addisfashion.et` | `P@ssw0rd2026!` | In-Store POS Register (`/pos`) |
| **Accountant Staff** | `accountant@addisfashion.et` | `P@ssw0rd2026!` | Store Financials (`/merchant/billing`) |
| **Multi-Store Staff** | `staff@multiethio.et` | `P@ssw0rd2026!` | Dual Store Membership (Topbar Switcher) |
| **Customer Shopper** | `customer@addis.et` | `P@ssw0rd2026!` | Marketplace Buyer (`/customer`, `/cart`) |

---

## 🤝 Related Repositories

| Repository | Description | Link |
| :--- | :--- | :--- |
| **`mymall`** *(This Repo)* | Next.js 16 Multi-Tenant Frontend & POS | *Current Repository* |
| **`mymall_backend`** | Express, Prisma, PostgreSQL & Socket.io Engine | [mymall_backend](https://github.com/DrLeroK/mymall_backend) |

---

## 📄 License

This project is licensed under the **MIT License**.
