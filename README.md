# Akinel Yedek Parça

Automotive spare parts e-commerce platform with vehicle compatibility search, OEM number lookup, and VIN decoding.

## Prerequisites

- Node.js v18+
- .NET SDK 10
- Docker & Docker Compose

## Quick Start

### 1. Start PostgreSQL

```bash
cd infra
docker compose up -d
```

### 2. Run Backend

```bash
cd apps/api/Akinel.Api
dotnet run
```

The API will apply migrations and seed the database on first run.

### 3. Run Frontend

```bash
cd apps/web
npm run dev
```

## URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5100 |
| Swagger UI | http://localhost:5100/swagger |

## Default Admin Credentials

- Email: `admin@akinel.com`
- Password: `Admin123!`

## Project Structure

```
akinel-yedekparca/
├── apps/
│   ├── web/          ← Next.js 15 frontend
│   └── api/          ← ASP.NET Core 10 backend
│       ├── Akinel.Api
│       ├── Akinel.Application
│       ├── Akinel.Domain
│       ├── Akinel.Infrastructure
│       └── Akinel.Tests
├── infra/
│   └── docker-compose.yml
└── docs/
    ├── ARCHITECTURE.md
    ├── DATABASE.md
    └── PROJECT_ANALYSIS.md
```

## Key Features

- Vehicle-based parts search (Make → Model → Generation → Engine)
- OEM number cross-reference search
- VIN decoding (via pluggable catalog provider)
- JWT authentication with refresh token rotation
- Admin panel for products, categories, brands, vehicles, stock
- Seed data: 5 brands, 11 categories, 4 vehicle makes/models/generations/engines, 3 products

## Running Tests

```bash
cd apps/api
dotnet test
```

## Creating New EF Migrations

```bash
cd apps/api/Akinel.Api
dotnet ef migrations add <MigrationName> \
  --project ../Akinel.Infrastructure/Akinel.Infrastructure.csproj \
  --startup-project Akinel.Api.csproj
```
