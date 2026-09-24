# Architecture

## Overview

Akinel Yedek Parça is a full-stack automotive spare parts e-commerce platform using a clean architecture approach.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Zustand |
| Backend | ASP.NET Core 10, C# |
| Database | PostgreSQL 16 |
| ORM | Entity Framework Core 10 + Npgsql |
| Auth | JWT Bearer tokens + Refresh tokens |
| Containerization | Docker + Docker Compose |

## Project Structure

```
akinel-yedekparca/
├── apps/
│   ├── web/          ← Next.js frontend (port 3000)
│   └── api/          ← ASP.NET Core backend (port 5000)
│       ├── Akinel.Api            ← Controllers, Program.cs
│       ├── Akinel.Application    ← DTOs, Service interfaces, Contracts
│       ├── Akinel.Domain         ← Entities, Enums
│       ├── Akinel.Infrastructure ← EF Core, Service implementations
│       └── Akinel.Tests          ← Unit tests
├── infra/
│   └── docker-compose.yml
└── docs/
```

## Backend Layers

- **Domain**: Pure entities with no dependencies
- **Application**: Service interfaces, DTOs, contracts (IPartsCatalogProvider)
- **Infrastructure**: EF Core DbContext, service implementations, external catalog provider
- **API**: ASP.NET Core controllers, middleware, DI registration

## Key Design Decisions

1. **Vehicle hierarchy**: Make → Model → Generation → Engine. Products link to specific engines for precise compatibility.
2. **OEM number search**: Normalized OEM numbers allow cross-reference searches.
3. **Null catalog provider**: `NullPartsCatalogProvider` is a placeholder for future TecDoc/HaynesPro integration.
4. **Soft deletes**: Products use `IsActive` flag instead of hard deletes.
5. **Stock as separate entity**: Stock is 1:1 with Product for clear separation of inventory concerns.
