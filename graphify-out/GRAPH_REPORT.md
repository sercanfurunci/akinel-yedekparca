# Graph Report - akinel-yedekparca  (2026-10-20)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 2410 nodes · 6509 edges · 133 communities (86 shown, 47 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 264 edges (avg confidence: 0.85)
- Token cost: 46,030 input · 1,021 output

## Graph Freshness
- Built from commit: `bd6aa15c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- User Account Settings
- Admin Product Operations
- Category Browse Pages
- Admin Vehicle Management
- Vehicle Data Import Script
- Vehicle API Controller
- Security Audit Validation
- Auth & Product Controllers
- Service Interface Definitions
- Order Management Pages
- Database Context & Basket
- Order DTOs
- OEM & Vehicle Generation
- Email Verify & Category Pages
- Admin API Controller
- Solution Dependencies
- EF Migration Designers
- Product Create Update DTOs
- Bulk Import Parse Helpers
- Static Info Pages
- Homepage & Category Pages
- Admin Request DTOs
- File Upload Controllers
- EF Migration Files
- Import DTOs
- Category Entity
- Admin Banners Import Pages
- Coverage Ledger Validator
- Domain Entities & DbContext
- Product Entity Fields
- Bulk Import Service
- Frontend Dependencies
- Security Audit Test Schema
- Orders Controller & Service
- User Entity Fields
- Frontend Package Config
- Business Settings Entity
- Vehicle Engine Entity
- Business Settings DTOs
- VIN Decode DTOs
- Frontend Instrumentation & Cart
- Business Settings Request
- Product Search Query DTOs
- Base Entity & Hero Slides
- UI Component Config
- Next.js App Config
- Parsed Import Row
- Coverage Ledger Tests
- Import Preview DTOs
- E2E Test Helpers
- Analytics Dashboard Page
- TypeScript Config
- JWT & Session Settings
- Auth & Banner Migrations
- Account & Garage Pages
- Coverage Validation Utilities
- Launch Settings Config
- Vehicle & Seed Migrations
- B2 Storage Service
- Feature Flags Service
- Email Service
- Import History DTOs
- VIN Decode Result
- Import Log Entity
- Order Item Entity
- Stock Entity & Status
- Analytics DTOs & Service
- Legal & Banner Migrations
- JSON Structure Validator
- ASP.NET Program Bootstrap
- Refresh Token Entity
- Frontend Dev Dependencies
- Dialog UI Component
- VIN Decoder Service
- Business Working Hours
- User Vehicle Entity
- Discount & Snapshot Migrations
- Select UI Component
- Basket Controller
- Brand Entity
- Product Vehicle Compatibility
- Analytics PostHog Service
- PWA Manifest
- Account Controller & DTOs
- Stock Notification Entity
- OpenGraph Image
- Sitemap Generator
- Business Settings Controller
- Working Hour DTOs
- Import Row Status Enum
- Search Service
- Bulk Import Unit Tests
- NPM Scripts
- Product Detail Page
- FAQ Page
- Feature Flags Client
- Business Settings Migration
- Basket Migration
- Order System Migration
- Basket Index Migration
- Product Optional Fields Migration
- Price Conversion Migration
- Homepage Hero Slides Migration
- Data Protection Keys Migration
- Stock Notification Migration
- Import Log Migration
- Vehicle Model Image Migration
- Category Description Migration
- Vehicle Make Popular Migration
- Category Seed Migration
- Category Cleanup Migration
- Vehicle Generation Image Migration
- Vehicle Engine Variants Migration
- User Address Fields Migration
- Business Settings Service
- ESLint Configuration
- Badge UI Component
- Vercel Deployment Config
- Application Layer Placeholder
- Domain Layer Placeholder
- Auth Layout Page
- Privacy Policy Page
- Terms of Use Page
- KVKK Disclosure Page
- Legal Documents Layout
- Distance Sales Contract Page
- Pre-Information Form Page
- Brands Layout Page
- Category Redirect Page
- Products Layout Page
- Search Layout Page
- PostCSS Configuration

## God Nodes (most connected - your core abstractions)
1. `AkinelDbContext` - 81 edges
2. `next` - 79 edges
3. `react` - 66 edges
4. `lucide-react` - 62 edges
5. `Akinel.Infrastructure.Migrations` - 61 edges
6. `Button()` - 57 edges
7. `useAuthStore` - 55 edges
8. `Akinel.Infrastructure.Data` - 55 edges
9. `Akinel.Domain.Entities` - 49 edges
10. `AdminController` - 48 edges

## Surprising Connections (you probably didn't know these)
- `MakeCard` --references--> `VehicleMake`  [EXTRACTED]
  apps/web/src/components/home/PopularVehicleMakes.tsx → apps/web/src/lib/types.ts
- `DialogFooter()` --calls--> `Button()`  [EXTRACTED]
  apps/web/src/components/ui/dialog.tsx → apps/web/src/components/ui/button.tsx
- `unit()` --calls--> `canonicalCoverageId()`  [EXTRACTED]
  .agents/skills/security-audit/validate-coverage-ledger.test.cjs → .agents/skills/security-audit/validate-coverage-ledger.cjs
- `Header()` --calls--> `User`  [EXTRACTED]
  apps/web/src/components/layout/Header.tsx → apps/web/src/lib/types.ts
- `AuthStore` --references--> `User`  [EXTRACTED]
  apps/web/src/store/authStore.ts → apps/web/src/lib/types.ts

## Import Cycles
- None detected.

## Communities (133 total, 47 thin omitted)

### Community 0 - "User Account Settings"
Cohesion: 0.07
Nodes (68): AccountSettingsPage(), ErrorBanner(), PasswordForm, passwordSchema, ProfileForm, profileSchema, SuccessBanner(), AdminBrandsPage() (+60 more)

### Community 1 - "Admin Product Operations"
Cohesion: 0.08
Nodes (13): AddCompatibilityRequest, CreateCategoryRequest, UpdateCategoryRequest, AdminVehiclesController, CreateVariantRequest, CreateVehicleEngineRequest, CreateVehicleGenerationRequest, CreateVehicleMakeRequest (+5 more)

### Community 2 - "Category Browse Pages"
Cohesion: 0.08
Nodes (52): MaintenancePage(), maintenanceParts, previewFeatures, BrandsPage(), CategoryContent(), CategoryPage(), sortOptions, sortToParams() (+44 more)

### Community 3 - "Admin Vehicle Management"
Cohesion: 0.05
Nodes (58): TreeNode, ProductForm, productSchema, Tab, AdminVehiclesPage(), Breadcrumb, ConfirmDelete(), Level (+50 more)

### Community 4 - "Vehicle Data Import Script"
Cohesion: 0.06
Nodes (27): apply_turkey_filter(), build_catalog(), extract_base_model_name(), extract_body_type(), find_source_a_engine(), fix_encoding_artifacts(), import_to_db(), load_source_a() (+19 more)

### Community 5 - "Vehicle API Controller"
Cohesion: 0.09
Nodes (16): VehiclesController, IPartsCatalogProvider, VehicleContextDto, VehicleEngineDto, VehicleEngineVariantDto, VehicleGenerationDto, VehicleMakeDto, VehicleModelDto (+8 more)

### Community 6 - "Security Audit Validation"
Cohesion: 0.08
Nodes (45): canonicalKey(), append(), encode(), codePointLength(), collect(), collectDataLimitErrors(), collectFindingSemanticErrors(), collectSchemaErrors() (+37 more)

### Community 7 - "Auth & Product Controllers"
Cohesion: 0.10
Nodes (12): AuthController, ProductsController, AuthResponse, ForgotPasswordRequest, LoginRequest, RefreshTokenRequest, RegisterRequest, ResetPasswordRequest (+4 more)

### Community 8 - "Service Interface Definitions"
Cohesion: 0.09
Nodes (5): Akinel.Application.Configuration, Akinel.Infrastructure.Services, Akinel.Application.DTOs, Akinel.Application.Contracts, Akinel.Application.Services

### Community 9 - "Order Management Pages"
Cohesion: 0.09
Nodes (37): OrderDetailPage(), paymentLabels, StatusBadge(), statusConfig, OrdersPage(), StatusBadge(), statusConfig, AdminOrderDetailPage() (+29 more)

### Community 10 - "Database Context & Basket"
Cohesion: 0.05
Nodes (37): BasketItem, Product, ProductId, Quantity, SessionId, UserId, HomepageBanner, ImageUrl (+29 more)

### Community 11 - "Order DTOs"
Cohesion: 0.05
Nodes (38): CheckoutRequest, UpdateOrderStatusRequest, Order, ConsentTimestamp, CustomerEmail, CustomerName, CustomerPhone, DistanceSalesAccepted (+30 more)

### Community 12 - "OEM & Vehicle Generation"
Cohesion: 0.06
Nodes (33): OemNumber, Manufacturer, NormalizedNumber, Number, Products, VehicleGeneration, BodyType, Engines (+25 more)

### Community 13 - "Email Verify & Category Pages"
Cohesion: 0.09
Nodes (30): VerifyEmailContent(), VerifyEmailPage(), BrandPageContent(), fetchBrand(), generateMetadata(), MarkaPage(), Props, fetchCategory() (+22 more)

### Community 14 - "Admin API Controller"
Cohesion: 0.09
Nodes (9): AdminAnalyticsController, AdminController, BrandsController, CategoriesController, FeaturesController, FilesController, HeroController, HomeController (+1 more)

### Community 15 - "Solution Dependencies"
Cohesion: 0.07
Nodes (37): Akinel.Api, net10.0, Microsoft.AspNetCore.Authentication.JwtBearer (10.0.12), Microsoft.AspNetCore.DataProtection.EntityFrameworkCore (10.0.12), Microsoft.EntityFrameworkCore.Design (10.0.12), Akinel.Application, Akinel.Domain, Akinel.Infrastructure (+29 more)

### Community 17 - "Product Create Update DTOs"
Cohesion: 0.13
Nodes (11): PaginatedResult, HasNextPage, HasPreviousPage, TotalPages, CreateProductRequest, ProductDto, ProductImageDto, ProductListItemDto (+3 more)

### Community 19 - "Static Info Pages"
Cohesion: 0.08
Nodes (21): features, metadata, AdminLayout(), ContactPage(), DAY_NAMES, getBusinessSettings(), metadata, AdminSidebar() (+13 more)

### Community 20 - "Homepage & Category Pages"
Cohesion: 0.12
Nodes (30): HomePage(), trustItems, CategoryWithChildren, YedekParcalarPage(), BusinessStrip(), CategoryStrip(), Props, FeaturedCategoryCards() (+22 more)

### Community 21 - "Admin Request DTOs"
Cohesion: 0.11
Nodes (10): AddOemRequest, CreateBrandRequest, CreateHeroSlideRequest, UpdateBrandRequest, UpdateHeroSlideRequest, UpdateStockRequest, UpdateBasketItemRequest, NotifyStockRequest (+2 more)

### Community 22 - "File Upload Controllers"
Cohesion: 0.16
Nodes (3): AdminImportController, IBulkImportService, IStorageService

### Community 24 - "Import DTOs"
Cohesion: 0.07
Nodes (24): CachedImportData, AllowOverwriteWithEmpty, ImportType, Rows, ImportCommitRequest, Corrections, PreviewToken, ImportResultDto (+16 more)

### Community 25 - "Category Entity"
Cohesion: 0.08
Nodes (22): Category, BannerImageUrl, Description, ImageUrl, IsActive, IsHomepageFeatured, Name, ParentCategory (+14 more)

### Community 26 - "Admin Banners Import Pages"
Cohesion: 0.12
Nodes (24): AdminBannersPage(), TABS, downloadErrorsCsv(), EditRowModal(), FileDropZone(), ImportPage(), ImportStatusBadge(), importTypeName() (+16 more)

### Community 27 - "Coverage Ledger Validator"
Cohesion: 0.12
Nodes (25): ATTEMPT_FIELDS, ATTEMPT_STATUSES, createErrorList(), escapeUnsafeDiagnosticCharacters(), fs, hasValidUnicodeScalarValues(), hasVisibleProse(), path (+17 more)

### Community 28 - "Domain Entities & DbContext"
Cohesion: 0.17
Nodes (4): Akinel.Domain.Enums, Akinel.Infrastructure.Data.Configurations, Akinel.Domain.Common, Akinel.Domain.Entities

### Community 29 - "Product Entity Fields"
Cohesion: 0.08
Nodes (26): Product, Barcode, Brand, BrandId, Category, CategoryId, CompareAtPrice, Currency (+18 more)

### Community 30 - "Bulk Import Service"
Cohesion: 0.19
Nodes (3): BulkImportService, ExistingProduct, RawRow

### Community 31 - "Frontend Dependencies"
Cohesion: 0.07
Nodes (27): dependencies, @base-ui/react, class-variance-authority, clsx, cn, @hookform/resolvers, lucide-react, next (+19 more)

### Community 32 - "Security Audit Test Schema"
Cohesion: 0.11
Nodes (19): LIMITS, assert, confirmed(), errorsFor(), evidence(), fs, {
  LIMITS,
  collect,
  collectSchemaErrors,
  validateDocument,
}, needsValidation() (+11 more)

### Community 33 - "Orders Controller & Service"
Cohesion: 0.17
Nodes (6): OrdersController, OrderDto, OrderItemDto, OrderSummaryDto, IOrderService, OrderService

### Community 34 - "User Entity Fields"
Cohesion: 0.08
Nodes (24): User, AddressLine, City, District, Email, EmailVerificationToken, EmailVerificationTokenExpiry, FirstName (+16 more)

### Community 35 - "Frontend Package Config"
Cohesion: 0.08
Nodes (25): browserslist, name, private, version, clsx, next-themes, playwright, @radix-ui/react-checkbox (+17 more)

### Community 36 - "Business Settings Entity"
Cohesion: 0.08
Nodes (24): BusinessSettings, Address, AnnouncementBanner, City, CompanyName, Country, Description, District (+16 more)

### Community 37 - "Vehicle Engine Entity"
Cohesion: 0.08
Nodes (24): VehicleEngine, Displacement, DisplacementCc, Drivetrain, EngineCode, ExternalId, FuelType, Gearbox (+16 more)

### Community 38 - "Business Settings DTOs"
Cohesion: 0.09
Nodes (23): BusinessSettingsDto, Address, AnnouncementBanner, City, CompanyName, Country, Description, District (+15 more)

### Community 39 - "VIN Decode DTOs"
Cohesion: 0.09
Nodes (22): InternalVehicleMatchDto, EngineDisplay, EngineId, GenerationDisplay, GenerationId, MakeDisplay, ModelDisplay, VinDecodeDto (+14 more)

### Community 40 - "Frontend Instrumentation & Cart"
Cohesion: 0.16
Nodes (13): fuelTypeToTurkish(), PageState, validateVin(), VinLookupPage(), Props, GlobalSearchProps, SuggestResult, analytics (+5 more)

### Community 41 - "Business Settings Request"
Cohesion: 0.09
Nodes (22): UpdateBusinessSettingsRequest, Address, AnnouncementBanner, City, CompanyName, Country, Description, District (+14 more)

### Community 42 - "Product Search Query DTOs"
Cohesion: 0.10
Nodes (21): ProductSearchQuery, BrandId, CategoryId, InactiveOnly, IncludeInactive, InStockOnly, MaxPrice, MinPrice (+13 more)

### Community 43 - "Base Entity & Hero Slides"
Cohesion: 0.09
Nodes (19): BaseEntity, CreatedAt, Id, UpdatedAt, HomepageHeroSlide, CtaText, CtaUrl, DisplayOrder (+11 more)

### Community 44 - "UI Component Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 45 - "Next.js App Config"
Cohesion: 0.13
Nodes (13): register(), nextConfig, securityHeaders, buildStructuredData(), DAY_NAMES, fetchBusinessSettings(), metadata, RootLayout() (+5 more)

### Community 46 - "Parsed Import Row"
Cohesion: 0.10
Nodes (21): ParsedImportRow, AllowOverwriteWithEmpty, Barcode, BrandId, BrandName, CategoryId, CategoryName, Description (+13 more)

### Community 47 - "Coverage Ledger Tests"
Cohesion: 0.11
Nodes (14): LIMITS, archivedAttempt(), assert, fs, {
  LIMITS,
  canonicalCoverageId,
  encodeCanonicalRef,
  isSafeAgentId,
  isSafeRelativePath,
  preflightJsonText,
  validateDocument,
}, localCheck(), os, path (+6 more)

### Community 48 - "Import Preview DTOs"
Cohesion: 0.11
Nodes (19): ImportPreviewResponseDto, Duplicate, Error, New, PreviewToken, Rows, Total, Unchanged (+11 more)

### Community 49 - "E2E Test Helpers"
Cohesion: 0.19
Nodes (13): ADMIN_EMAIL, ADMIN_PASSWORD, API_URL, apiCleanupTestHierarchy(), BASE_URL, confirmDelete(), getAdminToken(), login() (+5 more)

### Community 50 - "Analytics Dashboard Page"
Cohesion: 0.16
Nodes (18): AnalyticsPage(), AnalyticsResponse, BarChart(), DbMetrics, fmt(), FunnelChart(), FunnelStep, KpiCard() (+10 more)

### Community 51 - "TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 52 - "JWT & Session Settings"
Cohesion: 0.12
Nodes (10): JwtSettings, Audience, Issuer, Secret, SessionSettings, AccessTokenMinutes, AdminAbsoluteTimeoutHours, AdminIdleTimeoutMinutes (+2 more)

### Community 53 - "Auth & Banner Migrations"
Cohesion: 0.15
Nodes (4): InitialCreate, AddRefreshTokenSessionFields, AddHomepageBanners, AddEmailVerification

### Community 54 - "Account & Garage Pages"
Cohesion: 0.22
Nodes (10): AccountPage(), GaragePage(), UserVehicle, Card(), CardContent(), CardHeader(), CardTitle(), UserVehicle (+2 more)

### Community 55 - "Coverage Validation Utilities"
Cohesion: 0.33
Nodes (16): canonicalCoverageId(), collectUnitErrors(), encodeCanonicalRef(), hasOwn(), hasValidSemanticFields(), isCanonicalRef(), isObject(), isOwnedArtifactPath() (+8 more)

### Community 56 - "Launch Settings Config"
Cohesion: 0.13
Nodes (15): ASPNETCORE_ENVIRONMENT, applicationUrl, commandName, dotnetRunMessages, environmentVariables, launchBrowser, applicationUrl, commandName (+7 more)

### Community 57 - "Vehicle & Seed Migrations"
Cohesion: 0.16
Nodes (4): AddVehicleCatalogFields, AddPrecisionAndOrderConfig, AddPerformanceIndexes, SeedBrandData

### Community 59 - "Feature Flags Service"
Cohesion: 0.18
Nodes (8): FeatureFlags, Analytics, MaintenanceMode, StockNotifications, VinSearch, FeatureFlagsDto, IFeatureFlagService, FeatureFlagService

### Community 60 - "Email Service"
Cohesion: 0.18
Nodes (6): ResendSettings, ApiKey, FromEmail, FromName, WebsiteUrl, EmailService

### Community 61 - "Import History DTOs"
Cohesion: 0.14
Nodes (14): ImportHistoryItemDto, AdminEmail, Created, CreatedAt, DurationSeconds, Failed, FileName, Id (+6 more)

### Community 62 - "VIN Decode Result"
Cohesion: 0.14
Nodes (14): VinDecodeResult, BodyStyle, Country, Displacement, EngineCode, FuelType, IsPartial, Make (+6 more)

### Community 63 - "Import Log Entity"
Cohesion: 0.14
Nodes (13): ImportLog, AdminEmail, Created, DurationSeconds, ErrorSummary, Failed, FileName, ImportType (+5 more)

### Community 64 - "Order Item Entity"
Cohesion: 0.15
Nodes (12): OrderItem, LineTotal, Order, OrderId, ProductBrand, ProductId, ProductImageUrl, ProductName (+4 more)

### Community 65 - "Stock Entity & Status"
Cohesion: 0.14
Nodes (13): Stock, AvailableQuantity, MinimumStockLevel, Product, ProductId, Quantity, ReservedQuantity, Status (+5 more)

### Community 66 - "Analytics DTOs & Service"
Cohesion: 0.31
Nodes (9): AnalyticsResponseDto, DbMetricsDto, FunnelStepDto, OrderStatusCountDto, PostHogMetricsDto, RecentOrderDto, SearchTypeDto, TopProductDto (+1 more)

### Community 67 - "Legal & Banner Migrations"
Cohesion: 0.17
Nodes (3): AddOrderLegalConsent, AddBusinessSettingsPhone2, AddAnnouncementAndCategoryImage

### Community 68 - "JSON Structure Validator"
Cohesion: 0.40
Nodes (11): JsonStructureError, preflightJsonText(), beginContainer(), beginString(), beginValue(), closeContainer(), countValue(), currentContainer() (+3 more)

### Community 70 - "Refresh Token Entity"
Cohesion: 0.18
Nodes (10): RefreshToken, AbsoluteExpiresAt, ExpiresAt, IsRevoked, LastUsedAt, ReplacedByToken, RevokedAt, Token (+2 more)

### Community 71 - "Frontend Dev Dependencies"
Cohesion: 0.18
Nodes (11): devDependencies, eslint, eslint-config-next, playwright, @playwright/test, tailwindcss, @tailwindcss/postcss, @types/node (+3 more)

### Community 72 - "Dialog UI Component"
Cohesion: 0.22
Nodes (4): DialogContent(), DialogFooter(), DialogOverlay(), DialogPortal()

### Community 74 - "Business Working Hours"
Cohesion: 0.22
Nodes (8): BusinessWorkingHour, BusinessSettings, BusinessSettingsId, CloseTime, DayOfWeek, IsOpen, OpenTime, BusinessWorkingHourConfiguration

### Community 75 - "User Vehicle Entity"
Cohesion: 0.20
Nodes (9): UserVehicle, IsDefault, LicensePlate, Nickname, User, UserId, VehicleEngine, VehicleEngineId (+1 more)

### Community 77 - "Select UI Component"
Cohesion: 0.24
Nodes (3): SelectContent(), SelectScrollDownButton(), SelectScrollUpButton()

### Community 79 - "Brand Entity"
Cohesion: 0.25
Nodes (7): Brand, IsActive, LogoUrl, Name, Products, Slug, BrandConfiguration

### Community 80 - "Product Vehicle Compatibility"
Cohesion: 0.25
Nodes (7): ProductVehicleCompatibility, Notes, Product, ProductId, VehicleEngine, VehicleEngineId, ProductVehicleCompatibilityConfiguration

### Community 82 - "PWA Manifest"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 83 - "Account Controller & DTOs"
Cohesion: 0.32
Nodes (5): AccountController, CurrentUserId, ChangePasswordRequest, ProfileDto, UpdateProfileRequest

### Community 84 - "Stock Notification Entity"
Cohesion: 0.29
Nodes (6): StockNotification, Email, NotifiedAt, Product, ProductId, StockNotificationConfiguration

### Community 85 - "OpenGraph Image"
Cohesion: 0.25
Nodes (4): alt, contentType, runtime, size

### Community 86 - "Sitemap Generator"
Cohesion: 0.33
Nodes (6): BrandSlugItem, CategorySlugItem, fetchAllProductSlugs(), ProductSlugItem, revalidate, sitemap()

### Community 88 - "Working Hour DTOs"
Cohesion: 0.33
Nodes (5): BusinessWorkingHourDto, CloseTime, DayOfWeek, IsOpen, OpenTime

### Community 89 - "Import Row Status Enum"
Cohesion: 0.33
Nodes (6): ImportRowStatus, Duplicate, Error, New, Unchanged, Update

### Community 92 - "NPM Scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 93 - "Product Detail Page"
Cohesion: 0.80
Nodes (4): absoluteImageUrl(), fetchProduct(), generateMetadata(), ProductDetailPage()

### Community 94 - "FAQ Page"
Cohesion: 0.40
Nodes (3): faqs, jsonLd, metadata

### Community 115 - "ESLint Configuration"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 116 - "Badge UI Component"
Cohesion: 0.67
Nodes (3): Badge(), badgeVariants, class-variance-authority

### Community 117 - "Vercel Deployment Config"
Cohesion: 0.50
Nodes (3): buildCommand, framework, outputDirectory

## Knowledge Gaps
- **528 isolated node(s):** `CurrentUserId`, `Product`, `ProductId`, `Quantity`, `SessionId` (+523 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 937 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **47 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Static Info Pages` to `User Account Settings`, `Category Redirect Page`, `Category Browse Pages`, `Admin Vehicle Management`, `Products Layout Page`, `Search Layout Page`, `Order Management Pages`, `Email Verify & Category Pages`, `Homepage & Category Pages`, `Admin Banners Import Pages`, `Frontend Package Config`, `Frontend Instrumentation & Cart`, `Next.js App Config`, `Account & Garage Pages`, `OpenGraph Image`, `Sitemap Generator`, `Product Detail Page`, `FAQ Page`, `Auth Layout Page`, `Privacy Policy Page`, `Terms of Use Page`, `KVKK Disclosure Page`, `Legal Documents Layout`, `Distance Sales Contract Page`, `Pre-Information Form Page`, `Brands Layout Page`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **What connects `CurrentUserId`, `Product`, `ProductId` to the rest of the system?**
  _528 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `User Account Settings` be split into smaller, more focused modules?**
  _Cohesion score 0.0735444330949949 - nodes in this community are weakly interconnected._
- **Why does `AkinelDbContext` connect `Database Context & Basket` to `Admin Product Operations`, `Vehicle API Controller`, `Auth & Product Controllers`, `Order DTOs`, `OEM & Vehicle Generation`, `Admin API Controller`, `Product Create Update DTOs`, `Category Entity`, `Domain Entities & DbContext`, `Product Entity Fields`, `Bulk Import Service`, `Orders Controller & Service`, `User Entity Fields`, `Business Settings Entity`, `Vehicle Engine Entity`, `Base Entity & Hero Slides`, `JWT & Session Settings`, `Import Log Entity`, `Order Item Entity`, `Stock Entity & Status`, `Refresh Token Entity`, `Business Working Hours`, `User Vehicle Entity`, `Basket Controller`, `Brand Entity`, `Product Vehicle Compatibility`, `Analytics PostHog Service`, `Account Controller & DTOs`, `Stock Notification Entity`, `Search Service`, `Business Settings Service`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Should `Admin Product Operations` be split into smaller, more focused modules?**
  _Cohesion score 0.08450704225352113 - nodes in this community are weakly interconnected._
- **Why does `Product` connect `Product Entity Fields` to `Stock Entity & Status`, `Admin Product Operations`, `Database Context & Basket`, `Base Entity & Hero Slides`, `OEM & Vehicle Generation`, `Brand Entity`, `Product Vehicle Compatibility`, `Product Create Update DTOs`, `Stock Notification Entity`, `Import DTOs`, `Category Entity`, `Domain Entities & DbContext`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Should `Category Browse Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.084472049689441 - nodes in this community are weakly interconnected._