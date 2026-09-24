# Database Schema

## Database: PostgreSQL 16

## Core Tables

### Products & Catalog
| Table | Description |
|-------|-------------|
| `Brands` | Product brands (Bosch, Valeo, etc.) |
| `Categories` | Hierarchical product categories (self-referencing) |
| `Products` | Main product catalog |
| `ProductImages` | Multiple images per product |
| `Stocks` | 1:1 inventory per product |
| `OemNumbers` | OEM part numbers with normalization |
| `ProductOemNumbers` | Many-to-many: Products ↔ OEM numbers |

### Vehicle Hierarchy
| Table | Description |
|-------|-------------|
| `VehicleMakes` | Car manufacturers (BMW, VW, etc.) |
| `VehicleModels` | Models per make |
| `VehicleGenerations` | Generations per model with year range |
| `VehicleEngines` | Engine variants per generation |
| `ProductVehicleCompatibilities` | Many-to-many: Products ↔ Engines |

### Users & Auth
| Table | Description |
|-------|-------------|
| `Users` | Customer and admin accounts |
| `RefreshTokens` | JWT refresh token rotation |
| `UserVehicles` | Saved vehicles per user |

## Key Indexes

- `Products.Slug` — unique, for URL-based lookups
- `Products.PartNumber` — for part number search
- `OemNumbers.NormalizedNumber` — for OEM cross-reference search
- `Users.NormalizedEmail` — unique, for login

## Seeded Data

On first run, the seeder creates:
- 5 brands: Bosch, Valeo, SKF, Delphi, TRW
- 6 top-level categories + 5 subcategories
- 4 vehicle makes: BMW, Volkswagen, Ford, Renault
- 4 models, 4 generations, 4 engines
- 3 sample products with stock and vehicle compatibility
- Admin user: admin@akinel.com / Admin123!
