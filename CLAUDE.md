# Akinel Yedek Parça — CLAUDE.md

## Project Overview
Automotive spare-parts e-commerce platform.

## Tech Stack
- **Frontend**: Next.js 15, TypeScript (strict), App Router, Tailwind CSS, shadcn/ui, Zustand, React Hook Form + Zod
- **Backend**: ASP.NET Core 10, EF Core + PostgreSQL, JWT auth
- **Infra**: Docker Compose (PostgreSQL 16)

## How to Run

### 1. Start PostgreSQL
```bash
cd infra && docker compose up -d
```

### 2. Start Backend (API port: 5100)
```bash
cd apps/api/Akinel.Api
dotnet run --launch-profile http
# http://localhost:5100  |  http://localhost:5100/swagger
```

### 3. Start Frontend
```bash
cd apps/web && npm run dev
# http://localhost:3000
```

### Default Admin
- Email: admin@akinel.com  |  Password: Admin123!

## Directory Structure
```
apps/api/Akinel.Api/          Controllers, Program.cs, JWT config
apps/api/Akinel.Application/  DTOs, service interfaces, IPartsCatalogProvider
apps/api/Akinel.Domain/       Entities, enums, BaseEntity
apps/api/Akinel.Infrastructure/ EF Core, services, seeder, NullPartsCatalogProvider
apps/web/src/app/             Next.js App Router pages
apps/web/src/components/      UI components
apps/web/src/store/           Zustand stores (vehicle context, auth)
apps/web/src/lib/             API client, types, utils
infra/                        docker-compose.yml
docs/                         Architecture, DB schema, project analysis
```

## Key Design Decisions

**Product names never contain vehicle info** — compatibility stored in `ProductVehicleCompatibility` (many-to-many with `VehicleEngine`).

**Persistent vehicle context** — `vehicleStore.ts` (Zustand + localStorage persist). `VehicleContextChip` shown in header globally.

**External catalog abstraction** — `IPartsCatalogProvider` abstracts TecDoc/FAPI/any provider. Current: `NullPartsCatalogProvider`. Swap by implementing the interface and registering in `DependencyInjection.cs`.

**OEM search** — `OemNumber.NormalizedNumber` (indexed) for fast part-number lookup. Products linked via `ProductOemNumber` junction.

**Stock** — `StockStatus` computed from `Quantity - ReservedQuantity` vs `MinimumStockLevel`. Default listings: in-stock only.

**Auth** — JWT (60min) + Refresh Token (7d). Roles: Customer, Admin. Admin routes protected in both frontend layout and backend controllers.

## API Endpoints
```
GET  /api/vehicles/makes
GET  /api/vehicles/makes/{id}/models
GET  /api/vehicles/models/{id}/generations
GET  /api/vehicles/generations/{id}/engines
GET  /api/vehicles/context/{engineId}
GET  /api/vehicles/{engineId}/products
POST /api/vehicles/vin-decode
GET  /api/products?[query params]
GET  /api/products/{slug}
GET  /api/products/search
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
POST /api/auth/revoke
```

## Conventions
- TypeScript strict, no `any`
- C# nullable reference types on
- DTOs for all API responses — never expose EF entities
- async/await + CancellationToken everywhere
- No CQRS, no MediatR, no generic repository — practical layered architecture
