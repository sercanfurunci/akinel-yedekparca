# Akinel Yedek Parça — Project Documentation

> **Maintenance Rule:** Whenever a major architectural, deployment, storage, database, authentication, external-service, or folder-structure change is made, update this document in the same change. This is the single source of truth for the project.

**Last verified:** 2026-10-01  
**Canonical documentation:** This file (`PROJECT_DOCUMENTATION.md`) supersedes `docs/ARCHITECTURE.md` and `docs/DATABASE.md`.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Diagram](#2-architecture-diagram)
3. [Technology Stack](#3-technology-stack)
4. [Repository Structure](#4-repository-structure)
5. [How to Run Locally](#5-how-to-run-locally)
6. [Frontend](#6-frontend)
7. [Backend](#7-backend)
8. [Database](#8-database)
9. [Database Migrations](#9-database-migrations)
10. [Images & File Storage](#10-images--file-storage)
11. [Domain & DNS](#11-domain--dns)
12. [Deployment](#12-deployment)
13. [Environment Variables](#13-environment-variables)
14. [External Services](#14-external-services)
15. [Authentication & Session Architecture](#15-authentication--session-architecture)
16. [Product & E-Commerce Logic](#16-product--e-commerce-logic)
17. [Vehicle Catalog](#17-vehicle-catalog)
18. [OEM System](#18-oem-system)
19. [Homepage / Hero / Slideshow](#19-homepage--hero--slideshow)
20. [Legal Pages](#20-legal-pages)
21. [Testing](#21-testing)
22. [Common Troubleshooting](#22-common-troubleshooting)
23. [Security Notes](#23-security-notes)
24. [Current Production Status](#24-current-production-status)

---

## 1. Project Overview

**Project name:** Akinel Yedek Parça  
**Domain:** akinelotoyedekparca.com.tr (TODO: Verify current DNS/hosting)  
**Purpose:** Automotive spare-parts e-commerce platform for Turkish market. Customers search for parts by vehicle (Make → Model → Generation → Engine), OEM part number, or VIN. Admins manage the full catalog, inventory, orders, and homepage content.

**Business domain:**  
- Spare-parts retailer with online storefront
- Vehicle-fitment-based part discovery
- OEM cross-reference search
- Distance-sales compliant checkout (Turkish consumer law)

---

## 2. Architecture Diagram

```
Browser / Mobile
       │
       ▼
  Next.js 16  (port 3000 local / Railway frontend)
       │  NEXT_PUBLIC_API_URL
       ▼
ASP.NET Core 10 API  (port 5100 local / Railway backend)
       │
       ├──► PostgreSQL 16  (Docker locally / Railway managed DB)
       │
       └──► Backblaze B2  (S3-compatible object storage)
                  ↕ presigned URLs proxied via /api/files/*
            (product images, hero slides, category images)
```

---

## 3. Technology Stack

| Area | Technology | Version | Purpose |
|---|---|---|---|
| Frontend framework | Next.js | 16.3.6 | App Router, SSR/SSG, standalone build |
| Frontend language | TypeScript | ~5 (strict) | Type safety across all frontend code |
| UI library | React | 19.2.8 | Component rendering |
| Styling | Tailwind CSS | ^4 | Utility-first CSS |
| Component primitives | Radix UI + shadcn/ui | various (^1–^2) | Accessible headless components |
| Forms | React Hook Form | ^7.88.0 | Form state management |
| Validation (frontend) | Zod | ^4.6.5 | Schema validation |
| State management | Zustand | ^5.0.15 | Auth, vehicle context, cart |
| Icons | Lucide React | ^1.47.0 | Icon set |
| Backend framework | ASP.NET Core | 10.0 (net10.0) | REST API, middleware, DI |
| Backend language | C# | 13 (nullable on) | All backend code |
| ORM | Entity Framework Core | 10.0.12 | Database access, migrations |
| Database driver | Npgsql.EF | 10.0.3 | PostgreSQL provider for EF Core |
| Database | PostgreSQL | 16 (Alpine) | Primary data store |
| Authentication | JWT Bearer | 10.0.12 | Stateless token auth |
| Password hashing | BCrypt.Net-Next | 4.2.0 | User password storage |
| Image processing | SixLabors.ImageSharp | 3.1.7 | Server-side image optimization on upload |
| File storage | AWSSDK.S3 | 3.7.414.1 | S3-compatible client for Backblaze B2 |
| Logging | Serilog | 10.0.0 | Structured logging (console sink) |
| API docs | Swashbuckle | 10.2.3 | Swagger UI at /swagger |
| Validation (backend) | FluentValidation | 12.1.1 | DTO validation |
| Backend tests | xUnit | 2.9.3 | Unit test framework |
| Test mocking | Moq | 4.20.72 | Mock dependencies |
| Test assertions | FluentAssertions | 8.11.0 | Expressive assertions |
| E2E tests | Playwright | ^1.63.0 | Browser automation tests |
| Containerisation | Docker + Docker Compose | — | Local PostgreSQL; production deployment |

---

## 4. Repository Structure

```
akinel-yedekparca/
├── apps/
│   ├── web/                      ← Next.js 16 frontend
│   │   ├── src/
│   │   │   ├── app/              ← App Router pages
│   │   │   ├── components/       ← UI components
│   │   │   ├── store/            ← Zustand stores (auth, vehicle, cart)
│   │   │   └── lib/              ← API client, types, utils
│   │   ├── e2e/                  ← Playwright end-to-end tests
│   │   ├── public/               ← Static assets (icons, placeholders)
│   │   ├── next.config.ts        ← Next.js config (standalone, CSP headers)
│   │   └── package.json          ← Frontend dependencies
│   │
│   └── api/
│       ├── Akinel.Api/           ← Controllers, Program.cs, middleware
│       ├── Akinel.Application/   ← DTOs, service interfaces, IPartsCatalogProvider
│       ├── Akinel.Domain/        ← Entities, enums, BaseEntity
│       ├── Akinel.Infrastructure/← EF Core DbContext, services, seeder, B2 storage
│       └── Akinel.Tests/         ← xUnit unit tests
│
├── infra/
│   └── docker-compose.yml        ← PostgreSQL 16 for local development
│
├── docs/
│   ├── ARCHITECTURE.md           ← Superseded by this file
│   ├── DATABASE.md               ← Superseded by this file
│   └── PROJECT_ANALYSIS.md       ← UX/competitor analysis (reference only)
│
├── .env.example                  ← Template for all environment variables
├── CLAUDE.md                     ← Claude Code AI assistant instructions
├── README.md                     ← Quick-start guide
└── PROJECT_DOCUMENTATION.md      ← THIS FILE (single source of truth)
```

**What lives where:**
- Business logic rules → `Akinel.Domain/Entities/`
- Service contracts/DTOs → `Akinel.Application/`
- Database / external service implementations → `Akinel.Infrastructure/`
- HTTP layer (routing, auth, middleware) → `Akinel.Api/`
- All frontend pages → `apps/web/src/app/`
- Shared React components → `apps/web/src/components/`
- API calls from frontend → `apps/web/src/lib/api.ts`
- Frontend TypeScript types → `apps/web/src/lib/types.ts`

---

## 5. How to Run Locally

### Prerequisites
- Node.js v18+
- .NET SDK 10
- Docker & Docker Compose

### Step 1 — Start PostgreSQL

```bash
cd infra
docker compose up -d
```

Database starts at `localhost:5432`. Named volume `postgres_data` persists data across restarts.

### Step 2 — Configure environment variables

Copy `.env.example` to `.env.local` (frontend) and configure `appsettings.json` (backend). See [Section 13](#13-environment-variables) for all variables.

### Step 3 — Start the backend

```bash
cd apps/api/Akinel.Api
dotnet run --launch-profile http
```

- API: http://localhost:5100
- Swagger: http://localhost:5100/swagger
- On first run, EF Core applies all migrations and seeds the database automatically.

### Step 4 — Start the frontend

```bash
cd apps/web
npm run dev
```

- Frontend: http://localhost:3000

### Default admin credentials

| Field | Value |
|---|---|
| Email | admin@akinel.com |
| Password | Admin123! |

---

## 6. Frontend

### Framework & routing

- **Next.js 16.3.6** with App Router (file-system based routing)
- Route groups are used: `(shop)` for storefront, `(auth)` for login/register
- Output mode: `standalone` — produces self-contained Node.js build

### Page inventory

| Route | File | Description |
|---|---|---|
| `/` | `app/page.tsx` | Homepage — hero carousel, categories, business strip |
| `/about` | `app/about/page.tsx` | About page |
| `/contact` | `app/contact/page.tsx` | Contact with map |
| `/(shop)/products` | Product listing — all products with filters |
| `/(shop)/products/[slug]` | Product detail page |
| `/(shop)/search` | Search results |
| `/(shop)/category/[slug]` | Category filtered products |
| `/(shop)/brands` | Brand listing |
| `/(shop)/vehicle` | Vehicle-based parts finder |
| `/(shop)/vin` | VIN decoder |
| `/(shop)/checkout` | Checkout form + legal consent |
| `/(shop)/order-confirmation` | Post-checkout confirmation |
| `/(shop)/belgeler/kvkk` | KVKK application |
| `/(shop)/belgeler/kvkk-aydinlatma-metni` | KVKK disclosure text |
| `/(shop)/belgeler/gizlilik-politikasi` | Privacy policy |
| `/(shop)/belgeler/mesafeli-satis-sozlesmesi` | Distance sales contract |
| `/(shop)/belgeler/on-bilgilendirme-formu` | Pre-information form |
| `/(shop)/belgeler/kullanim-kosullari` | Terms of use |
| `/(auth)/login` | Login page |
| `/(auth)/register` | Registration page |
| `/account` | Customer account dashboard |
| `/account/orders` | Customer order history |
| `/account/orders/[id]` | Customer order detail |
| `/garage` | Saved vehicles (requires login) |
| `/admin` | Admin dashboard |
| `/admin/products` | Product management |
| `/admin/products/[id]` | Product editor (images, OEM, compatibility) |
| `/admin/categories` | Category management |
| `/admin/brands` | Brand management |
| `/admin/stock` | Stock management |
| `/admin/vehicles` | Vehicle catalog editor |
| `/admin/hero` | Homepage hero slide editor |
| `/admin/business` | Business settings editor |
| `/admin/orders` | Order management |
| `/admin/orders/[id]` | Order detail / status update |
| `/admin/customers` | Customer list |
| `/maintenance` | Maintenance/503 page |

### Key components

| Component | Location | Purpose |
|---|---|---|
| `Header` | `components/layout/Header.tsx` | Global nav, cart icon, vehicle chip |
| `Footer` | `components/layout/Footer.tsx` | Footer links |
| `PublicShell` | `components/layout/PublicShell.tsx` | Wrapper layout for public pages |
| `AdminSidebar` | `components/layout/AdminSidebar.tsx` | Admin panel navigation |
| `AnnouncementTicker` | `components/layout/AnnouncementTicker.tsx` | Scrolling announcement banner |
| `WhatsAppButton` | `components/layout/WhatsAppButton.tsx` | Floating WhatsApp CTA |
| `HeroCarousel` | `components/home/HeroCarousel.tsx` | Homepage slideshow |
| `CategoryStrip` | `components/home/CategoryStrip.tsx` | Homepage category grid |
| `BusinessStrip` | `components/home/BusinessStrip.tsx` | Business info strip above categories |
| `VehicleFinder` | `components/vehicle/VehicleFinder.tsx` | 4-step vehicle selector (Make→Engine) |
| `VehicleContextChip` | `components/vehicle/VehicleContextChip.tsx` | Persistent vehicle chip in header |
| `CartDrawer` | `components/cart/CartDrawer.tsx` | Slide-out cart panel |
| `GlobalSearch` | `components/search/GlobalSearch.tsx` | Search bar |
| `ProductCard` | `components/products/ProductCard.tsx` | Product grid card |

### State management (Zustand stores)

| Store | File | Persistence | Purpose |
|---|---|---|---|
| `authStore` | `store/authStore.ts` | localStorage (`akinel-auth`) | User, access token (refresh token in memory only) |
| `vehicleStore` | `store/vehicleStore.ts` | localStorage (`akinel-vehicle-context`) | Selected vehicle context |
| `cartStore` | `store/cartStore.ts` | No local persistence (server-side session) | Cart items, fetch/update via API |

### API client

**File:** `src/lib/api.ts`

- Base URL: `process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5100'`
- All calls go through `request<T>()` which handles JSON parsing and automatic token refresh on 401
- File uploads use `uploadFile<T>()` (multipart form data)
- On unrecoverable 401, redirects to `/login?session=expired`
- Full API namespace: `api.products.*`, `api.vehicles.*`, `api.auth.*`, `api.admin.*`, etc.

### Frontend environment variables

| Variable | Purpose | Required |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | Yes (falls back to `http://localhost:5100`) |

---

## 7. Backend

### Framework & structure

- **ASP.NET Core 10** (`net10.0`)
- Layered architecture: Domain → Application → Infrastructure → API
- No CQRS, no MediatR, no generic repository — practical service layer

### Layer responsibilities

```
Akinel.Domain         → Entities, Enums, BaseEntity (no external dependencies)
Akinel.Application    → Service interfaces, DTOs, IPartsCatalogProvider contract
Akinel.Infrastructure → EF Core DbContext, service implementations, B2StorageService, seeder
Akinel.Api            → Controllers, Program.cs, middleware, DI wiring
```

### Data flow example

```
HTTP Request
    ↓
Controller (Akinel.Api)
    ↓
IProductService (Akinel.Application interface)
    ↓
ProductService : IProductService (Akinel.Infrastructure implementation)
    ↓
AkinelDbContext → EF Core → PostgreSQL
    ↓
Mapped to DTO → JSON response
```

### Controller → responsibility mapping

| Controller | Route prefix | Auth required | Responsibility |
|---|---|---|---|
| `AuthController` | `/api/auth` | No | Login, register, refresh, revoke |
| `ProductsController` | `/api/products` | No | Public product listing, detail, search |
| `VehiclesController` | `/api/vehicles` | No | Make/model/generation/engine hierarchy, VIN decode |
| `BrandsController` | `/api/brands` | No | Public brand list |
| `CategoriesController` | `/api/categories` | No | Public category tree |
| `BasketController` | `/api/basket` | No (session) | Cart CRUD via session cookie |
| `OrdersController` | `/api/orders` | Partial | Checkout (public), order history (user) |
| `GarageController` | `/api/garage` | Yes (Customer/Admin) | Saved vehicles per user |
| `HeroController` | `/api/hero` | No | Public active hero slides |
| `BusinessController` | `/api/business` | No (GET) / Admin (PUT) | Business settings |
| `FilesController` | `/api/files` | No | Presigned B2 file proxy |
| `AdminController` | `/api/admin` | Yes (Admin role) | Full admin CRUD — products, orders, brands, categories, stock, hero, OEM, compatibility |
| `AdminVehiclesController` | `/api/admin/vehicles` | Yes (Admin role) | Full vehicle catalog CRUD |

### Where to look when something breaks

| Problem | Start here |
|---|---|
| Product CRUD | `AdminController` → `ProductService` → `AkinelDbContext.Products` |
| Product not visible in storefront | Check `IsActive`, `Stock.Quantity`, `Category.IsActive`, `Brand.IsActive` |
| Checkout fails | `OrdersController.Checkout` → `OrderService.CreateOrderAsync` → stock validation |
| Vehicle finder empty | `VehiclesController` → `VehicleService` → `VehicleMakes/Models/Generations/Engines` |
| Authentication issues | `AuthController` → `AuthService` → `Users` + `RefreshTokens` tables |
| Image upload fails | `AdminController.UploadProductImage` → `B2StorageService.UploadAsync` → B2 config |
| Hero carousel broken | `HeroController` → `HomepageHeroSlides` table → `HeroCarousel.tsx` |
| Business info wrong | `BusinessController` → `BusinessSettings` + `BusinessWorkingHours` tables |
| OEM search broken | `ProductsController.Search` → `OemNumbers.NormalizedNumber` index |
| Order status wrong | `AdminController.UpdateOrderStatus` → `OrderService.UpdateOrderStatusAsync` |

### Key backend services

| Service | Implementation file | Purpose |
|---|---|---|
| `IAuthService` | `AuthService.cs` | Login, register, JWT generation, refresh token rotation |
| `IProductService` | `ProductService.cs` | Product CRUD, vehicle-based lookup |
| `IVehicleService` | `VehicleService.cs` | Vehicle hierarchy queries, VIN decode |
| `IOrderService` | `OrderService.cs` | Checkout, order history, status transitions |
| `IStorageService` | `B2StorageService.cs` | File upload/delete/presign via Backblaze B2 |
| `IBusinessSettingsService` | `BusinessSettingsService.cs` | Business info read/write |
| `IPartsCatalogProvider` | `NullPartsCatalogProvider.cs` | **Placeholder** — swap for TecDoc/FAPI integration |
| `ISearchService` | `SearchService.cs` | Product search with filters |

### Configuration & middleware (Program.cs)

- JWT Bearer authentication
- Role-based authorization (Customer / Admin)
- IP-based rate limiting: Login 10/min, Register 5/hour
- CORS with credentials (origins from `Cors:AllowedOrigins`)
- Serilog structured logging (console sink)
- Swagger UI (all environments)
- ASP.NET Core Data Protection keys stored in `DataProtectionKeys` table (EF Core persistence)
- Static files served from `wwwroot/` (placeholder images, etc.)
- On startup: `DatabaseInitializer` applies pending migrations and seeds initial data

---

## 8. Database

### Engine & connection

- **PostgreSQL 16** (Alpine in Docker locally)
- **ORM:** Entity Framework Core 10 with Npgsql driver
- **DbContext:** `AkinelDbContext` in `Akinel.Infrastructure/Data/`
- **Connection string location:** `appsettings.json` → `ConnectionStrings:DefaultConnection`

### Entity overview

```
Users ──────────────────────── RefreshTokens (1:N)
  │                            UserVehicles (1:N) ──── VehicleEngines
  │
Orders ────────────────────── OrderItems (1:N)
  │
BasketItems (session-based, UserId optional)

Products ──┬── ProductImages (1:N)
           ├── Stocks (1:1)
           ├── ProductOemNumbers (M:M) ── OemNumbers
           ├── ProductVehicleCompatibilities (M:M) ── VehicleEngines
           ├── Brand (N:1)
           └── Category (N:1)

VehicleMakes ── VehicleModels ── VehicleGenerations ── VehicleEngines

BusinessSettings ── BusinessWorkingHours (1:N)

HomepageHeroSlides (standalone)

DataProtectionKeys (ASP.NET Core internal)
```

### Entity quick reference

| Entity | Key fields | Notes |
|---|---|---|
| `Product` | `Name`, `Slug`, `Price`, `IsActive`, `BrandId`, `CategoryId` | Slug used for URL routing |
| `Stock` | `ProductId` (unique), `Quantity`, `ReservedQuantity`, `MinimumStockLevel` | `AvailableQuantity` = Quantity − ReservedQuantity; `Status` computed |
| `ProductImage` | `ProductId`, `Url`, `IsPrimary`, `SortOrder` | `Url` is presigned B2 URL |
| `OemNumber` | `Number`, `NormalizedNumber` (indexed) | Normalized for case/space-insensitive search |
| `ProductVehicleCompatibility` | `ProductId`, `VehicleEngineId` | M:M junction |
| `VehicleEngine` | `Name`, `EngineCode`, `DisplacementCc`, `PowerKw`, `FuelType` | Leaf of vehicle hierarchy |
| `User` | `Email`, `NormalizedEmail` (unique), `PasswordHash` (BCrypt), `Role` | Roles: Customer=0, Admin=1 |
| `RefreshToken` | `Token`, `ExpiresAt`, `AbsoluteExpiresAt`, `IsRevoked` | Rotation on every refresh |
| `Order` | `OrderNumber` (unique), `Status`, `TotalAmount`, `TermsAccepted`, `ConsentTimestamp` | Legal consent fields required |
| `OrderItem` | `ProductName`, `UnitPrice` (snapshot), `LineTotal` | Snapshots product data at order time |
| `BasketItem` | `SessionId` (indexed), `UserId?`, `ProductId`, `Quantity` | Session-based; no user required |
| `BusinessSettings` | `CompanyName`, `Phone`, `Address`, `GoogleMapsEmbedUrl` | Single row; updated via admin |
| `HomepageHeroSlide` | `ImageUrl`, `Title`, `CtaUrl`, `IsActive`, `DisplayOrder` | Ordered by DisplayOrder |

### Key indexes

- `OemNumbers.NormalizedNumber` — fast OEM cross-reference search
- `Users.NormalizedEmail` — unique, fast login lookup
- `Products.Slug` — unique, URL-based product lookups
- `Orders.OrderNumber` — unique
- `Orders.CustomerEmail`, `Orders.UserId` — order history queries
- `BasketItems.SessionId` — session basket queries (prevents full scan)

### Seeded data (first run)

- **Brands:** Bosch, Valeo, SKF, Delphi, TRW
- **Categories:** 6 top-level + 5 subcategories (automotive parts taxonomy)
- **Vehicles:** BMW, Volkswagen, Ford, Renault — one model/generation/engine each
- **Products:** 3 sample products with stock and vehicle compatibility
- **Admin user:** admin@akinel.com / Admin123!

---

## 9. Database Migrations

### Where migrations live

```
apps/api/Akinel.Infrastructure/Migrations/
```

### Migration history (chronological)

| Migration | Description |
|---|---|
| `20260922163707_InitialCreate` | Full initial schema |
| `20260922172922_AddBusinessSettings` | BusinessSettings + WorkingHours |
| `20260923132917_AddVehicleCatalogFields` | Extra vehicle engine fields |
| `20260923195115_AddBasketItem` | BasketItem entity |
| `20260923200222_AddOrderSystemAndCompareAtPrice` | Orders, OrderItems, CompareAtPrice |
| `20260923203737_AddBasketItemSessionIdIndex` | Index on BasketItem.SessionId |
| `20260923205100_AddPrecisionAndOrderConfig` | Decimal precision, order config |
| `20260923215016_AddProductOptionalFields` | Optional product fields |
| `20260923215021_AddOrderLegalConsent` | Legal consent fields on Order |
| `20260924115420_AddRefreshTokenSessionFields` | AbsoluteExpiresAt, LastUsedAt on RefreshToken |
| `20260924121054_AddProductDiscountPercentage` | DiscountPercentage on Product |
| `20260924130000_ConvertPriceToOriginalPrice` | Price field restructuring |
| `20260929165455_AddHomepageHeroSlides` | HomepageHeroSlide entity |
| `20260930100000_AddBusinessSettingsPhone2` | Second phone field on BusinessSettings |
| `20260930110000_AddAnnouncementAndCategoryImage` | AnnouncementBanner + Category.ImageUrl |
| `20260930141704_AddDataProtectionKeys` | ASP.NET Core data protection key storage |

### Commands

**Create a new migration:**
```bash
cd apps/api/Akinel.Api
dotnet ef migrations add <MigrationName> \
  --project ../Akinel.Infrastructure/Akinel.Infrastructure.csproj \
  --startup-project Akinel.Api.csproj
```

**Apply migrations manually:**
```bash
cd apps/api/Akinel.Api
dotnet ef database update \
  --project ../Akinel.Infrastructure/Akinel.Infrastructure.csproj \
  --startup-project Akinel.Api.csproj
```

**Check migration status:**
```bash
cd apps/api/Akinel.Api
dotnet ef migrations list \
  --project ../Akinel.Infrastructure/Akinel.Infrastructure.csproj \
  --startup-project Akinel.Api.csproj
```

> **Note:** On `dotnet run`, the app automatically calls `DatabaseInitializer` which applies pending migrations and seeds data. Manual migration commands are only needed outside the normal startup flow.

---

## 10. Images & File Storage

> **Critical production note:** All user-uploaded images are stored in **Backblaze B2 object storage**, NOT on the server filesystem. The server filesystem is ephemeral in containerised deployments. Do not change this to local storage without implementing a persistent volume strategy.

### Storage service

- **Implementation:** `B2StorageService : IStorageService` (`Akinel.Infrastructure/Services/B2StorageService.cs`)
- **Protocol:** S3-compatible API via `AWSSDK.S3`
- **Provider:** Backblaze B2
- **Endpoint:** `s3.eu-central-003.backblazeb2.com`
- **Bucket:** `akinel-uploads`
- **Image optimization:** SixLabors.ImageSharp 3.1.7 compresses images before upload

### Upload validation

```
Max file size:    5 MB
Allowed formats:  JPEG, PNG, WebP (verified by magic bytes, not extension)
```

### Product images

| Aspect | Detail |
|---|---|
| Upload endpoint | `POST /api/admin/products/{id}/images` |
| Storage folder in B2 | `products/` |
| Database entity | `ProductImage` (fields: `Url`, `IsPrimary`, `SortOrder`, `AltText`) |
| Public URL | Proxied via `GET /api/files/{*key}` (cached 86400s) or direct CDN URL if `B2:CdnUrl` is configured |
| Primary image | Set via `PUT /api/admin/products/{id}/images/{imageId}/primary` |
| Delete | `DELETE /api/admin/products/{id}/images/{imageId}` — removes from B2 and database |

### Homepage hero slide images

| Aspect | Detail |
|---|---|
| Upload endpoint | `POST /api/admin/hero/slides/{id}/image` |
| Storage folder in B2 | `homepage/` |
| Database entity | `HomepageHeroSlide.ImageUrl` |
| Public retrieval | `GET /api/hero/slides` returns active slides with image URLs |

### Category images

| Aspect | Detail |
|---|---|
| Upload endpoint | `POST /api/admin/categories/{id}/image` |
| Storage folder in B2 | `categories/` (TODO: Verify exact folder name in B2StorageService) |
| Database field | `Category.ImageUrl` |

### Business logo & favicon

| Aspect | Detail |
|---|---|
| Stored in | `BusinessSettings.LogoUrl`, `BusinessSettings.FaviconUrl` |
| Managed via | `PUT /api/business/settings` (admin) |
| TODO | Verify if logo upload goes through B2 or is stored as a URL string only |

### Static / placeholder images

| Aspect | Detail |
|---|---|
| Location | `apps/web/public/` |
| Served by | Next.js static file serving |
| Examples | Placeholder images for products without uploaded images |

### File proxy endpoint

```
GET /api/files/{*key}
```
- Fetches file from B2 using presigned URL
- Caches response for 86400 seconds (24 hours)
- Used when CDN URL is not configured

---

## 11. Domain & DNS

**Domain:** akinelotoyedekparca.com.tr

| Item | Value |
|---|---|
| Frontend URL | https://akinelotoyedekparca.com.tr (TODO: Verify live URL) |
| API URL | https://akinelotoyedekparca-api.railway.app (confirmed from CSP config) |
| SSL/HTTPS | TODO: Verify certificate provider |
| DNS provider | TODO: Verify in DNS provider panel |
| Hosting | Railway.app (confirmed from CSP and connect-src) |
| Reverse proxy | TODO: Verify (Railway may handle this automatically) |

> All DNS/hosting configuration is outside the repository. Verify in the Railway dashboard and DNS provider.

---

## 12. Deployment

### Platform

**Railway.app** is confirmed as the deployment platform (verified in `next.config.ts` CSP headers: `connect-src` includes `akinelotoyedekparca-api.railway.app` and `*.railway.app`).

### Frontend deployment

- Build command: `npm run build` (produces `next build` with `output: standalone`)
- Start command: `node .next/standalone/server.js`
- The standalone output bundles all dependencies — no `node_modules` needed at runtime
- TODO: Verify exact Railway frontend service configuration

### Backend deployment

- Build command: `dotnet publish -c Release`
- Start command: `dotnet Akinel.Api.dll` (or Railway auto-detects Dockerfile if present)
- On startup, automatically applies migrations and seeds data
- TODO: Verify if a Dockerfile is used for backend deployment or Railway auto-detection

### Database

- Local development: PostgreSQL 16 via Docker Compose (named volume `postgres_data`)
- Production: TODO: Verify if Railway managed PostgreSQL or external provider

### Build commands (local verification)

```bash
# Frontend production build
cd apps/web
npm run build

# Backend production build
cd apps/api
dotnet publish -c Release

# Backend unit tests
cd apps/api
dotnet test

# Frontend E2E tests (requires running app)
cd apps/web
npx playwright test
```

### Deployment flow

```
Developer
    │
    ▼
Git push to main branch
    │
    ▼
Railway detects push
    ├──► Frontend build (npm run build → standalone)
    └──► Backend build (dotnet publish)
         │
         ▼
    Migrations auto-apply on startup
         │
         ▼
    Production serving
```

> TODO: Verify exact Railway build/deploy pipeline configuration (services, environment variable injection, branch trigger).

---

## 13. Environment Variables

> **Never commit actual secret values.** This table documents variable names and purposes only.

### Backend variables

| Variable | Purpose | Required | Secret |
|---|---|---|---|
| `ConnectionStrings__DefaultConnection` | PostgreSQL connection string | Yes | Yes |
| `Jwt__Secret` | JWT signing key (32+ chars) | Yes | Yes |
| `Jwt__Issuer` | JWT issuer claim (default: `akinel-api`) | Yes | No |
| `Jwt__Audience` | JWT audience claim (default: `akinel-web`) | Yes | No |
| `Cors__AllowedOrigins` | Comma-separated allowed frontend origins | Yes | No |
| `B2__Endpoint` | Backblaze B2 S3 endpoint | Yes | No |
| `B2__KeyId` | Backblaze B2 key ID | Yes | Yes |
| `B2__ApplicationKey` | Backblaze B2 application key | Yes | Yes |
| `B2__BucketName` | B2 bucket name (`akinel-uploads`) | Yes | No |
| `B2__BucketId` | B2 bucket ID | Yes | No |
| `B2__CdnUrl` | Optional CDN URL for public file access | No | No |
| `ASPNETCORE_ENVIRONMENT` | `Development` or `Production` | Yes | No |
| `SessionSettings__AccessTokenMinutes` | Access token lifetime (default: 15) | No | No |
| `SessionSettings__RefreshTokenDays` | Refresh token lifetime (default: 7) | No | No |
| `SessionSettings__AdminIdleTimeoutMinutes` | Admin idle timeout (default: 30) | No | No |
| `SessionSettings__AdminAbsoluteTimeoutHours` | Admin max session (default: 8) | No | No |

### Frontend variables

| Variable | Purpose | Required | Secret |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | Yes (has fallback) | No |

### Docker Compose variables (local only)

| Variable | Default | Purpose |
|---|---|---|
| `POSTGRES_DB` | `akinel_db` | Database name |
| `POSTGRES_USER` | `akinel_user` | Database user |
| `POSTGRES_PASSWORD` | `akinel_pass` | Database password |
| `POSTGRES_PORT` | `5432` | Host port mapping |

### Where production values are configured

- Railway.app dashboard → Service → Variables panel
- TODO: Verify variable names match Railway's format (Railway uses `__` as section separator for .NET config)

---

## 14. External Services

| Service | Provider | Purpose | Config location | Production-critical |
|---|---|---|---|---|
| Object storage | Backblaze B2 | All uploaded images (products, hero, categories) | `B2:*` in appsettings | **Yes** |
| Hosting | Railway.app | Frontend + backend hosting | Railway dashboard | **Yes** |
| Database | PostgreSQL 16 | Primary data store | `ConnectionStrings:DefaultConnection` | **Yes** |
| Maps | Google Maps | Contact page map embed, about page | `BusinessSettings.GoogleMapsEmbedUrl` | No (degradable) |
| Error tracking | Sentry | Frontend + backend exception capture | `Sentry__Dsn` (backend), `NEXT_PUBLIC_SENTRY_DSN` (frontend) | No (optional) |
| Product analytics | PostHog (EU) | Funnel events, user behaviour | `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | No (optional) |
| VIN decode / parts catalog | `NullPartsCatalogProvider` | **Not yet integrated** — placeholder | `IPartsCatalogProvider` interface | No |
| Email | Not implemented | Order confirmations, notifications | — | Not yet |
| Payment gateway | Not implemented | Online payment processing | — | Not yet |
| SMS / cargo tracking | Not implemented | — | — | Not yet |

---

## 15. Authentication & Session Architecture

### Token lifetimes

| Token | Lifetime | Notes |
|---|---|---|
| Access token (JWT) | 15 minutes | Sent as `Authorization: Bearer` header |
| Refresh token | 7 days (relative) | Stored in database (`RefreshTokens` table) |
| Admin idle timeout | 30 minutes | If no refresh within 30min, admin session expires |
| Admin absolute timeout | 8 hours | Admin cannot refresh past 8h from login regardless of activity |

### Login flow

```
1. POST /api/auth/login {email, password}
       │
       ▼
2. AuthService verifies BCrypt password hash
       │
       ▼
3. Returns: { accessToken (JWT, 15min), refreshToken (opaque string, 7d), user }
       │
       ▼
4. Frontend stores:
   - accessToken → Zustand authStore (partialised to localStorage)
   - refreshToken → Zustand authStore in memory only
   - user → localStorage via Zustand persist
```

### API request flow

```
1. api.ts attaches: Authorization: Bearer <accessToken>
       │
       ▼
2. Backend validates JWT signature, issuer, audience, expiry
       │
       ├── Valid → process request
       │
       └── 401 → frontend calls tryRefresh()
                        │
                        ▼
              POST /api/auth/refresh {refreshToken}
                        │
                        ├── Valid → new accessToken + new refreshToken (rotation)
                        │          old refreshToken marked IsRevoked=true
                        │          retry original request
                        │
                        └── Invalid → clearAuth() + redirect /login?session=expired
```

### Registration

```
POST /api/auth/register {email, password, firstName, lastName}
  └── Rate limit: 5 attempts/hour/IP
  └── Password hashed with BCrypt
  └── Default role: Customer
  └── Returns: same AuthResponse as login
```

### Protected routes (frontend)

- Admin pages (`/admin/*`) check `authStore.user?.role === 'Admin'`
- Account/garage pages check authentication state
- Unauthenticated access redirects to `/login`

### Admin vs customer sessions

- Customers: standard 15min access / 7d refresh
- Admins: same access token, but refresh is blocked after 30min idle or 8h absolute

---

## 16. Product & E-Commerce Logic

### Product rules

- `IsActive = false` → product hidden from all public APIs (still visible in admin)
- `Price` = selling price in TRY
- `CompareAtPrice` = original price (shown crossed-out for discounts)
- `DiscountPercentage` = computed or manually set discount label
- Primary image: first image with `IsPrimary = true`; falls back to first image
- Stock status computed: `AvailableQuantity = Quantity - ReservedQuantity`
  - `AvailableQuantity <= 0` → `OutOfStock`
  - `AvailableQuantity <= MinimumStockLevel` → `LowStock`
  - Otherwise → `InStock`
- Default product listings (public API) return **in-stock products only**

### Cart (BasketItem)

- Session-based via `basket_session` cookie (HttpOnly, 30-day expiry)
- No login required to add items
- `SessionId` indexed for performance
- `UserId` optionally linked at checkout time
- No pre-checkout stock reservation (reservation happens at order creation)
- Quantity validation against available stock on add/update

### Checkout (Order creation)

1. Client sends `CheckoutRequest` (shipping details, payment method, legal consent flags)
2. `OrderService.CreateOrderAsync` runs:
   - Loads basket items with products
   - Validates each product `IsActive` and stock availability
   - Creates `Order` + `OrderItems` (price/name **snapshot** at time of order)
   - Decrements `Stock.Quantity` (not `ReservedQuantity` — direct deduction)
   - Clears basket session
   - Returns `OrderDto` with unique `OrderNumber`
3. `TermsAccepted`, `PrivacyAccepted`, `DistanceSalesAccepted` must all be `true`
4. `ConsentTimestamp` is stored with the order

### Order statuses & transitions

| Status | Code | Description |
|---|---|---|
| Pending | 0 | Just placed, awaiting admin action |
| Confirmed | 1 | Admin confirmed the order |
| Preparing | 2 | Being packed |
| Shipped | 3 | Dispatched to carrier |
| Delivered | 4 | Delivered to customer |
| Cancelled | 5 | Cancelled |

- Status transitions managed via `PUT /api/admin/orders/{id}/status`
- TODO: Stock restoration on cancellation — verify if implemented in `OrderService`

---

## 17. Vehicle Catalog

### Hierarchy

```
VehicleMake (e.g. "BMW")
    └── VehicleModel (e.g. "3 Series")
            └── VehicleGeneration (e.g. "E90 2005-2012", bodyType, yearFrom, yearTo)
                    └── VehicleEngine (e.g. "318i 2.0 143hp", engineCode, displacement, fuel, power)
```

### Product fitment vs vehicle catalog

- The **vehicle catalog** (`VehicleMakes/Models/Generations/Engines`) is the searchable taxonomy.
- **Product fitment** is stored in `ProductVehicleCompatibilities` (M:M: Product ↔ VehicleEngine).
- A product is compatible with a vehicle only if a `ProductVehicleCompatibility` row links them.
- The vehicle catalog data itself does not imply any product compatibility.

### Vehicle Finder flow (frontend)

```
1. User selects Make → GET /api/vehicles/makes
2. User selects Model → GET /api/vehicles/makes/{makeId}/models
3. User selects Generation → GET /api/vehicles/models/{modelId}/generations
4. User selects Engine → GET /api/vehicles/generations/{generationId}/engines
5. vehicleStore saves selected VehicleContext to localStorage
6. GET /api/vehicles/{engineId}/products returns compatible products
```

### VIN decoding

- Endpoint: `POST /api/vehicles/vin-decode`
- Currently delegated to `IPartsCatalogProvider` (NullPartsCatalogProvider = not functional)
- TODO: Implement with a real VIN decode service

### Data source

- Vehicle catalog is manually managed via Admin (`/admin/vehicles`)
- No automatic import from TecDoc or external source currently
- TODO: Verify current record counts in production database

---

## 18. OEM System

### Purpose

OEM (Original Equipment Manufacturer) numbers allow customers to find parts by the part number printed on their existing component.

### Storage

- `OemNumber` entity: `Number` (original), `NormalizedNumber` (uppercase, no spaces, indexed)
- `ProductOemNumber` junction links products to OEM numbers (M:M)

### Normalization

OEM numbers are normalized on input (uppercase, stripped of non-alphanumeric characters) and stored in `NormalizedNumber`. Search queries are normalized the same way before lookup.

### Admin management

- `GET /api/admin/products/{id}/oem` — list OEM numbers for a product
- `POST /api/admin/products/{id}/oem` — add OEM number (number + manufacturer)
- `DELETE /api/admin/products/{id}/oem/{oemId}` — remove

### Public search

- OEM search is included in the general product search (`GET /api/products/search?q=...`)
- The query normalizes the search term and matches against `OemNumbers.NormalizedNumber`

### Where to look if OEM search breaks

`ProductsController.Search` → `SearchService` → EF Core query on `OemNumbers` join → `NormalizedNumber` index

---

## 19. Homepage / Hero / Slideshow

### Entity

`HomepageHeroSlide` fields: `ImageUrl`, `Title`, `Subtitle`, `CtaText`, `CtaUrl`, `DisplayOrder`, `IsActive`

### Admin management

| Action | Endpoint |
|---|---|
| List all slides | `GET /api/admin/hero/slides` |
| Create slide | `POST /api/admin/hero/slides` |
| Update slide metadata | `PUT /api/admin/hero/slides/{id}` |
| Upload slide image | `POST /api/admin/hero/slides/{id}/image` |
| Toggle active/inactive | `PATCH /api/admin/hero/slides/{id}/toggle` |
| Delete slide | `DELETE /api/admin/hero/slides/{id}` |

### Public endpoint

`GET /api/hero/slides` — returns active slides only, ordered by `DisplayOrder`

### Frontend component

`components/home/HeroCarousel.tsx`
- Fetches from `/api/hero/slides` on mount
- Autoplay and transition handled client-side
- Falls back gracefully if no slides are active
- TODO: Verify mobile behavior and image aspect ratio handling

### Where to look if the carousel breaks

1. Check `HomepageHeroSlides` table — `IsActive = true`, `ImageUrl` not null
2. Check `HeroController.GetSlides` endpoint response
3. Check `B2StorageService` — is the image URL accessible?
4. Check `HeroCarousel.tsx` — image container CSS, aspect ratio

---

## 20. Legal Pages

### Routes

| Route | Document |
|---|---|
| `/belgeler/kvkk` | KVKK başvuru formu |
| `/belgeler/kvkk-aydinlatma-metni` | KVKK aydınlatma metni |
| `/belgeler/gizlilik-politikasi` | Gizlilik politikası |
| `/belgeler/mesafeli-satis-sozlesmesi` | Mesafeli satış sözleşmesi |
| `/belgeler/on-bilgilendirme-formu` | Ön bilgilendirme formu |
| `/belgeler/kullanim-kosullari` | Kullanım koşulları |

### Content location

Content is embedded in the page components themselves (`app/(shop)/belgeler/*/page.tsx`). There is no CMS or database storage for legal text.

### Checkout consent

The checkout form requires explicit acceptance of:
- `TermsAccepted` — Kullanım koşulları
- `PrivacyAccepted` — Gizlilik politikası
- `DistanceSalesAccepted` — Mesafeli satış sözleşmesi
- `MarketingConsent` — Optional marketing consent

All three required fields plus `ConsentTimestamp` are stored on the `Order` entity.

### Notes

- Legal pages are set to `noindex` in metadata (search engine exclusion)
- TODO: Legal pages require review by a qualified Turkish legal professional before launch

---

## 21. Testing

### Backend unit tests

```bash
cd apps/api
dotnet test
```

- Framework: xUnit 2.9.3
- Mocking: Moq 4.20.72
- Assertions: FluentAssertions 8.11.0
- Location: `apps/api/Akinel.Tests/`

### Frontend E2E tests (Playwright)

```bash
# Requires running frontend (port 3000) and backend (port 5100)
cd apps/web
npx playwright test

# Run specific test file
npx playwright test e2e/vehicle-catalog.spec.ts

# Run with UI
npx playwright test --ui
```

- Config: `apps/web/playwright.config.ts`
- Browser: Chromium (headless)
- Base URL: http://localhost:3000
- Tests run sequentially (workers: 1)

### E2E test suites

| File | Coverage |
|---|---|
| `e2e/vehicle-catalog.spec.ts` | Admin vehicle hierarchy CRUD |
| `e2e/legal-pages.spec.ts` | Legal pages rendering |
| `e2e/auth-session.spec.ts` | Authentication and session management |
| `e2e/responsive-audit.spec.ts` | Mobile responsive testing |

### Frontend type check & build verification

```bash
cd apps/web
npx tsc --noEmit       # TypeScript type check
npm run build          # Full production build (will fail on type errors)
npm run lint           # ESLint check
```

---

## 22. Common Troubleshooting

### "Admin panel is stuck to the left / layout broken"

- Inspect `AdminSidebar.tsx` for CSS class changes
- Check `app/admin/layout.tsx` for flex/grid layout wrapper
- Check if `PublicShell.tsx` is mistakenly wrapping an admin page

### "Hero image is squeezed or not showing"

- Verify slide has `IsActive = true` in database
- Verify `ImageUrl` is not null and is a valid B2 presigned URL
- Test `GET /api/files/{key}` directly — does it return the image?
- Check B2 credentials — `B2:KeyId`, `B2:ApplicationKey`
- Inspect `HeroCarousel.tsx` image container CSS (aspect ratio, object-fit)

### "Product image upload does not work"

```
Admin UI
    → POST /api/admin/products/{id}/images (multipart)
    → AdminController validates: size ≤ 5MB, magic bytes (JPEG/PNG/WebP)
    → B2StorageService.UploadAsync
    → ImageSharp optimization
    → AWSSDK.S3 upload to bucket akinel-uploads/products/
    → ProductImage record saved (Url = presigned/CDN URL)
    → Returned to frontend
```

Check: B2 config values, bucket permissions, network access to B2 endpoint from server.

### "Product does not appear in storefront"

Check in order:
1. `Product.IsActive = true`
2. `Stock.AvailableQuantity > 0` (or stock filter is disabled in query)
3. `Brand.IsActive = true`
4. `Category.IsActive = true`
5. Product slug matches URL
6. API query params — is a filter excluding it?

### "Vehicle compatibility is missing"

1. Check `ProductVehicleCompatibilities` table — does a row exist for the product + engine?
2. Check `GET /api/admin/products/{id}/compatibility` — is it returned?
3. Verify the engine hierarchy is correct (engine → generation → model → make)
4. Check `GET /api/vehicles/{engineId}/products` — does it include the product?

### "Checkout fails"

1. Check basket has items (`GET /api/basket`)
2. Check all required fields in `CheckoutRequest`
3. Check `TermsAccepted`, `PrivacyAccepted`, `DistanceSalesAccepted` are all `true`
4. Check product `IsActive` and stock availability
5. Check `OrderService.CreateOrderAsync` — transaction wrapping?
6. Check frontend console for validation errors (Zod schema)

### "Login / session expires unexpectedly"

1. Check access token lifetime: 15 minutes
2. Check refresh token is being sent in refresh call
3. For admins: idle timeout 30min, absolute timeout 8h
4. Check `RefreshTokens` table — is token `IsRevoked = true`?
5. Check `POST /api/auth/refresh` response — what error is returned?
6. Check `api.ts` `tryRefresh()` logic and `authStore.refreshToken` is in memory

### "OEM search returns no results"

1. Verify product has OEM numbers linked (`ProductOemNumbers` table)
2. Verify search term normalizes correctly (uppercase, alphanumeric only)
3. Check `OemNumbers.NormalizedNumber` index exists (`20260922163707_InitialCreate`)

### "Business info / contact details are wrong"

- `GET /api/business/settings` — check current values
- Update via `PUT /api/business/settings` (admin token required)
- `BusinessSettings` table has a single row

---

## 23. Security Notes

### Authentication

- Passwords hashed with BCrypt (via BCrypt.Net-Next 4.2.0)
- JWT signed with HMAC-SHA256 (secret key, 32+ chars required)
- Refresh token rotation on every use — stolen tokens are invalidated
- Admin sessions bounded by idle and absolute timeouts

### Authorization

- Role-based: `[Authorize(Roles = "Admin")]` on all admin controllers
- Customer role cannot access any `/api/admin/*` endpoints

### Rate limiting

All limits are configurable via `RateLimiting` section in `appsettings.json` (no redeploy needed when changed via env vars).

| Policy | Default limit | Endpoint |
|---|---|---|
| login | 10/min | POST /api/auth/login |
| register | 5/hour | POST /api/auth/register |
| checkout | 10/hour | POST /api/orders |
| search | 60/min | GET /api/products/search |
| vin | 10/min | POST /api/vehicles/vin-decode |

Returns HTTP 429 on limit exceeded. Violations logged at Warning level with IP and path.

### Upload security

- Max file size: 5 MB enforced server-side
- File type validated via magic bytes (not file extension) — prevents MIME confusion attacks
- Only JPEG, PNG, WebP accepted

### CORS

- Strict origin-based CORS with credentials support
- Configured via `Cors:AllowedOrigins` — must explicitly list allowed origins

### SQL injection

- EF Core with parameterised queries throughout — no raw SQL string interpolation
- No Dapper or raw ADO.NET usage

### Security headers (frontend)

Configured in `next.config.ts` — applied to all responses:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- Content Security Policy (CSP) — restricts script/style/connect sources

### Data protection keys

ASP.NET Core Data Protection keys are persisted in the `DataProtectionKeys` database table (not ephemeral in-memory) — survives container restarts.

### Known limitations

- No CAPTCHA on login/register (rate limiting only)
- No email verification on registration
- Payment processing not implemented — no PCI scope currently
- VIN decode not functional (NullPartsCatalogProvider)

---

## 24. Observability & Feature Flags

### Error tracking (Sentry)

- **Backend:** `builder.WebHost.UseSentry()` in `Program.cs`. Reads `Sentry__Dsn` env var. `SetBeforeSend` strips `Authorization` and `Cookie` headers before sending events. `TracesSampleRate: 0.1` in production.
- **Frontend:** `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` + `instrumentation.ts`. `src/app/error.tsx` and `src/app/global-error.tsx` are error boundaries that capture unhandled exceptions. Disabled in development.
- If `NEXT_PUBLIC_SENTRY_DSN` / `Sentry__Dsn` is not set, Sentry is silently disabled — no runtime error.

### Product analytics (PostHog)

- `PostHogProvider` wraps `app/layout.tsx`. `autocapture: false` — no automatic form/click capture (privacy-safe).
- Typed event helpers in `src/lib/analytics.ts`. All calls are wrapped in try/catch — analytics failure never breaks UI.
- Events tracked: `page_view`, `vehicle_selected`, `product_searched`, `product_viewed`, `add_to_cart`, `checkout_started`, `purchase_completed`.
- If `NEXT_PUBLIC_POSTHOG_KEY` is not set, PostHog initialisation is skipped.

### Feature flags

Config-based — no external platform. Flags live in `appsettings.json` → `Features` section and can be overridden by environment variables (`Features__VinSearch=false`).

| Flag | Default | Effect when disabled |
|---|---|---|
| `VinSearch` | true | Backend returns 503; frontend hides VIN UI |
| `StockNotifications` | true | Hide "Stok bildir" button on product pages |
| `Analytics` | true | PostHog initialisation skipped |
| `MaintenanceMode` | false | Show `/maintenance` page; hide shop |

Public endpoint: `GET /api/features` (no auth, 60s response cache). Frontend reads this and caches for 60s — toggle takes effect within ~1 minute of Railway restart.

### Health checks

| Endpoint | Tag | Purpose |
|---|---|---|
| `GET /health/live` | — | Liveness probe — always 200 if process is up |
| `GET /health/ready` | `ready` | Readiness probe — checks database connectivity |

Use `/health/live` for Railway restart policy, `/health/ready` for load balancer drain.

---

## 25. Current Production Status

### Implemented and functional

- Full product catalog with images, brands, categories
- Vehicle catalog (Make → Model → Generation → Engine)
- Vehicle-based product search and filtering
- OEM number management and search
- JWT authentication with refresh token rotation
- Admin panel: products, categories, brands, stock, vehicles, hero, business settings, orders
- Session-based shopping cart
- Checkout with order creation and legal consent capture
- Customer order history
- Garage (saved vehicles per user)
- Homepage hero carousel (DB-driven, admin-managed)
- Homepage category strip and business strip
- Business settings (contact, hours, map embed)
- Announcement banner (DB-driven)
- Legal pages (6 documents)
- Backblaze B2 image storage with optimization
- Security headers + CSP
- Rate limiting on all public endpoints (auth, search, VIN, checkout)
- Feature flags (config-based kill-switches: VinSearch, StockNotifications, Analytics, MaintenanceMode)
- Health check endpoints (/health/live, /health/ready)
- Sentry error tracking (frontend + backend — needs DSN configured)
- PostHog analytics (needs API key configured)
- Serilog structured logging
- Swagger UI
- Playwright E2E test suite
- xUnit unit tests

### Production-ready (needs configuration)

- Backblaze B2: bucket and keys must be configured in Railway env vars
- CORS: `Cors__AllowedOrigins` must point to production frontend URL
- JWT: `Jwt__Secret` must be a strong secret (32+ chars) — **app refuses to start in non-Development if empty**
- Database: production PostgreSQL connection string
- Sentry (optional): create project → set `Sentry__Dsn` (Railway) + `NEXT_PUBLIC_SENTRY_DSN` (Vercel)
- PostHog (optional): create project at eu.posthog.com → set `NEXT_PUBLIC_POSTHOG_KEY` + `NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com` (Vercel)

### Needs external integration

- **VIN decode:** `NullPartsCatalogProvider` is a placeholder. Requires a TecDoc, HaynesPro, or similar integration to be implemented in `IPartsCatalogProvider`.
- **Email notifications:** No email service configured. Order confirmations, registration emails, and password reset are not sent.
- **Payment gateway:** Online payment not implemented. `PaymentMethod.CreditCard` exists as an enum value but no payment processing occurs. Cash on delivery and bank transfer are the only functional paths.
- **Cargo/shipping tracking:** No carrier integration. Order status is manually updated by admin.

### Needs business information

- Business settings: company name, address, phone, WhatsApp, Google Maps embed URL, working hours
- Hero slides: images and CTA content for homepage carousel
- Product catalog: real products, prices, stock levels
- Vehicle catalog: real vehicle data beyond the 4 seeded makes
- Legal documents: content requires verification against current Turkish law

### Needs legal review

- Mesafeli satış sözleşmesi (Distance Sales Contract)
- Ön bilgilendirme formu (Pre-Information Form)
- KVKK aydınlatma metni (KVKK Disclosure Text)
- Gizlilik politikası (Privacy Policy)
- Kullanım koşulları (Terms of Use)

All legal page content is currently placeholder / template text. A qualified Turkish legal professional must review before launch.

### Future / not started

- Product reviews and ratings
- Wishlist
- Advanced product filtering (price range, attributes)
- SEO: dynamic sitemap for all products (partially started)
- Abandoned cart recovery
- Bulk product import (CSV/Excel)
- Multi-language support
- Cargo cost calculation
- Invoice generation (e-fatura / e-arşiv)
