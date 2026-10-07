# Akinel — Implementation-Focused Architecture Review

**Date:** 2026-10-05
**Based on:** Competitor Audit Report + deep codebase re-inspection
**Status:** Analysis only — no code changes

---

## Codebase Facts That Override the Competitor Report

Before any step analysis, these findings from the codebase directly change some recommendations:

| Discovery | Impact |
|---|---|
| `VehicleMake.LogoUrl` field **already exists** in domain entity | Logo system needs population, not schema design |
| `VehicleEngine.Gearbox` field **already exists** | Transmission is already captured — no 5th selector step needed |
| `VehicleGeneration.YearFrom` / `YearTo` **already exist** | Year data is there, just displayed as range in generation name |
| `AnnouncementBanner` table **already exists** in migrations | AnnouncementBar just needs admin UI and content |
| `AnnouncementTicker` component **already used** in `PublicShell.tsx` | It's wired up — content management may be all that's missing |
| `Category.ParentCategoryId` + `SubCategories` **already support hierarchy** | Oto Bakım can be added as a normal category tree, no schema change needed for hierarchy |
| `Product` has **no `IsVehicleSpecific`** field | Need to decide: add to Category or Product, or use a different approach |
| `Product` has **no `OrderCount`** | Best sellers require either admin curation or a new field + migration |
| `/vehicle` page exists but has **no browse mode** | `/arac` is genuinely missing |
| **No `/arac/[makeSlug]` or `/arac/[makeSlug]/[modelSlug]` pages exist** | Vehicle SEO pages are a clean gap |
| **Sitemap does NOT include** vehicle make/model URLs | Must be added |
| **Category page route** is `/category/[slug]` not `/kategori/[slug]` | There is a discrepancy — both may exist or the sitemap uses the wrong one |
| `VehicleModel.Slug` exists | Ready for model-level URLs without schema change |
| `VehicleMake.Slug` exists | Ready for make-level URLs without schema change |
| **Footer has 4 columns** (Brand, Hızlı Linkler, Müşteri, İletişim) | SEO columns are genuinely missing — needs restructuring |
| `VIN endpoint` POST `/api/vehicles/vin-decode` **already exists** with feature flag | VIN infrastructure exists, only data source is the problem |
| `ExternalId` on Make/Model/Generation/Engine | External catalog integration is planned (TecDoc/FAPI abstraction) |

---

## STEP 1 — Architecture Review Summary

The 4-step vehicle selector (Make → Model → Generation → Engine) is coherent with the entity model. The data needed for a 7-step flow already exists at the engine level — `Gearbox`, `FuelType`, `PowerHp`, `Displacement` are all `VehicleEngine` fields. The Generation already contains `YearFrom`/`YearTo`. The Model already represents the "Series" concept (BMW "3 Serisi" is a Model, not a separate entity).

The compatibility system via `ProductVehicleCompatibility` is correct and should not be touched. Every improvement to vehicle pages can use existing join queries against this table.

The category hierarchy supports 2 levels (parent → child) which is all we need. Adding "Oto Bakım ve Yağlar" is a pure seeder/data operation with one optional schema addition.

The sitemap currently covers products and categories but not vehicle make/model pages — this is the biggest structural SEO gap.

---

## STEP 2 — Recommendation Classification Table

| Recommendation | Keep / Modify / Reject | Reason | Priority |
|---|---|---|---|
| P0-1: Oto Bakım ve Yağlar category tree | **MODIFY** | Drop `IsVehicleSpecific` on Product; add `IsVehicleSpecific bool` on **Category** instead — one migration field vs per-product management | P0 |
| P0-2: Vehicle make + model pages | **KEEP** | Clean gap. URL structure modified (see Step 5) | P0 |
| P0-3: Footer SEO link columns | **KEEP** | But phase it: add Markalar + Kategoriler now; add Araçlar + Modeller after /arac pages exist | P0 / P1 |
| P0-4: Announcement bar | **MODIFY** | `AnnouncementBanner` table and `AnnouncementTicker` component already exist. This is likely an admin content problem, not a dev task. Verify current state before building anything. | P0 |
| P1-1: Vehicle brand logo strip in header | **KEEP** | `VehicleMake.LogoUrl` already exists. Task = populate logos + build strip component + link to /arac pages | P1 |
| P1-2: Popular brand cards with model links | **MODIFY** | Don't hardcode. VehicleModel data exists in DB — fetch dynamically. Homepage brand cards should pull real models, not static ones. | P1 |
| P1-3: VIN fix for Turkish market | **MODIFY** | Phase 1: add Turkish disclaimer + better "no result" UX. Phase 2: WMI→Make mapping using internal data (ExternalId already links makes to external systems). Do NOT build VinWmiMapping table yet — check if ExternalId can serve this purpose. | P1 |
| P1-4: Taksit/installment banner | **MODIFY** | Don't show if no taksit is configured. Add to BusinessSettings as optional field. If empty, banner is hidden. Never show fake taksit information. | P1 |
| P1-5: Oil & Maintenance homepage section | **KEEP** | Depends on P0-1 | P1 |
| P1-6: Best sellers section | **MODIFY** | `Product.OrderCount` doesn't exist. For MVP: add `IsBestSeller bool` to Product (admin-curated, no migration complexity beyond the field). Add OrderCount in Phase 4 when order tracking is mature. | P1 |
| P1-7: SEO text block + FAQ accordion | **KEEP** | Hardcode for now. Add FAQPage JSON-LD. H1 strategy on homepage needs careful review (see Step 8). | P1 |
| P1-8: /arac browse page | **KEEP** | This is the root of the entire vehicle SEO architecture. Must be built as part of P0-2. | P0 |
| P1-9: Social proof stats bar | **MODIFY** | Skip customer/order counts (no real data yet). Use: product count + category count + brand count from existing API. Keep it factual. | P2 |
| P2-1: Product star ratings | **REJECT** | Full review system requires new entity, migration, moderation queue, frontend components. Disproportionate to value at this stage. | Backlog |
| P2-2: Wiper finder | **REJECT** | Needs vehicle-specific data that doesn't exist. Would require manual data entry for every engine. | Backlog |
| P2-3: Maintenance robot | **REJECT** | Same data problem as wiper finder, plus much higher complexity. | Backlog |
| P2-4: Authorised service centers | **REJECT** | Not a product/inventory feature. Separate project. | Backlog |
| P2-5: Fix English URLs | **MODIFY** | `/products/{slug}` → do NOT rename (too many indexed URLs without guaranteed 301s working). `/vehicle` → `/arac` is handled by P0-2/P1-8. `/brands` → `/markalar` with 301 is low risk (low indexed volume). | P2 |

---

## STEP 3 — Vehicle Experience Final Recommendation

### Is the 4-step flow better than 7 steps?

**Yes, for Akinel's current catalog.** Here's why:

Otoparcasan's 7 steps solve problems that Akinel's schema already solves differently:

| Otoparcasan step | Akinel equivalent | Gap? |
|---|---|---|
| Step 1: Marka | VehicleMake | None |
| Step 2: Seri | VehicleModel (e.g., "3 Serisi") | None — Model IS the Series |
| Step 3: Yıl | VehicleGeneration.YearFrom/YearTo | Minor — shown as range, not single year |
| Step 4: Model | VehicleGeneration (body type + year) | Minor — body type combined with year |
| Step 5: Vites | VehicleEngine.Gearbox | None — Gearbox field already exists |
| Step 6: Motor | VehicleEngine | None |
| Step 7: Ek özellik | Not needed | Skip |

**Verdict: Keep 4 steps.** The information is already there, just surfaced differently.

### What should actually improve?

**1. Step counter.** Add "1/4 → 2/4 → 3/4 → 4/4" progress indicators. The psychological effect of knowing you're at step 2 of 4 (vs an unknown depth) reduces abandonment. This is pure UI — no backend change.

**2. Year visibility.** Generation names like "G20 2019-2023 Sedan" are cryptic. Reformat the dropdown label to show: `"3. Nesil (2019–2023) · Sedan"` or simply make `YearFrom–YearTo` the primary label and add body type as secondary text. No schema change — just label formatting in the component.

**3. Gearbox in engine label.** VehicleEngine has `Gearbox` and `FuelType`. The engine dropdown currently shows something like "2.0d 190hp". It should show: `"2.0d 190hp · Dizel · Manuel"`. No schema change — just include Gearbox and FuelType in the display label.

**4. Tabs on the vehicle selector widget.** The widget should have 3 tabs:
- **Araç Kataloğu** (default — existing 4-step flow)
- **Şasi No ile Ara** (VIN — existing, but with Turkish disclaimer)
- **Garajımdan Seç** (existing garage — already in Zustand)

This matches Otoparcasan's tab structure. No new functionality required — it's a UX restructure of existing components.

**5. /arac browseable page.** Separate from the selector widget. A full-page catalog of all makes with logos and A-Z navigation. This is for discovery users, not task-focused users. The selector widget is for users who know what they need.

### Should we add a Series step?

No. `VehicleModel` IS the series in Akinel's data model. BMW → 3 Serisi is Make → Model. Adding a "Seri" step would require a new entity and a migration to restructure existing data. The benefit doesn't justify the cost when the outcome is identical.

### Should Transmission be a separate step?

No. `VehicleEngine.Gearbox` already captures this at the engine level. When a user selects an engine, they're inherently selecting a transmission. Separating it would require either duplicating data or restructuring the entity hierarchy.

---

## STEP 4 — Vehicle Brand Logos

### Current state
`VehicleMake.LogoUrl` (string?, nullable) — the field is there. It's almost certainly null for all seeded makes.

### Recommendations

**Storage approach:** Static SVG files at `/public/vehicles/logos/{slug}.svg`. The `LogoUrl` field in the DB stores the path (`/vehicles/logos/bmw.svg`) or can be set to null as a fallback to the convention-based path. This allows:
- Default: system looks for `/vehicles/logos/{make.Slug}.svg`
- Override: admin sets `LogoUrl` to any path/URL

**Should logos be database-driven?** Partially. Use the static convention path as default (`/vehicles/logos/{slug}.svg`). Only use the DB field to override. This means adding 50 SVG files covers all makes without touching the database.

**Should admin be able to upload/change logos?** Yes — a simple logo upload in the vehicle makes admin section (when it exists). For now, logos are static files managed via deployment.

**SVG?** Yes, mandatory. Auto logo SVGs are 2–20 KB each, crisp at all sizes, and cacheable. PNG is a fallback for makes where SVG isn't available.

### Where to source SVGs
Car brand SVG logo packs are freely available (Wikimedia Commons has most automotive logos in SVG format). Curate 15–20 for the most common Turkish-market makes.

### Desktop header sub-navigation
```
[TÜM ARAÇLAR ▾] [BMW logo] [Mercedes logo] [VW logo] [Audi logo] [Toyota logo] [Hyundai logo] [Ford logo] [Fiat logo] [Opel logo] [Renault logo] [Peugeot logo] [Citroën logo]
```
- "TÜM ARAÇLAR" button links to `/arac`
- Each logo links to `/arac/{make-slug}`
- On mobile: horizontal scroll, logos only (no text labels)
- Shows 12–13 makes. If `VehicleMake` table has fewer, show all.

### Homepage brand cards
Each card:
- Large logo (centered, ~80×40px)
- Make name as H3
- 4–5 model names as links to `/arac/{makeSlug}/{modelSlug}`
- CTA: "Tüm {Make} Parçaları" → `/arac/{makeSlug}`

Model list for each card: fetched from API (`/api/vehicles/makes/{makeId}/models`) — shows only models that actually exist in the catalog. Do NOT hardcode model names.

---

## STEP 5 — Vehicle Model SEO Page Architecture

### URL Decision

**Recommended structure:**
```
/arac                              → All makes browse page
/arac/[makeSlug]                   → Make page  (e.g., /arac/bmw)
/arac/[makeSlug]/[modelSlug]       → Model page (e.g., /arac/bmw/3-serisi)
```

**Why not `/arac/bmw-yedek-parca`?**

Competitor (Otoparcasan) appends `-yedek-parca` to the make slug because their URL IS the keyword. However:
- A URL of `/arac/bmw` with `title = "BMW Yedek Parça | Akinel"` and `h1 = "BMW Yedek Parça"` achieves the same keyword targeting
- The nested model URL `/arac/bmw-yedek-parca/3-serisi` becomes ugly and doesn't nest cleanly
- `/arac/bmw` is cleaner, more maintainable, and the hierarchy is clear
- The SEO keyword goes in the `<title>`, `<h1>`, and `description` — not the URL slug

### Thin/Empty Page Prevention

A make page should only be in the sitemap and fully rendered if:
- The make has at least 1 VehicleModel in the DB
- OR at least 1 product compatible with an engine of this make

A model page should only be indexed if:
- The model has at least 1 VehicleEngine in the DB
- AND at least 1 product in `ProductVehicleCompatibility` for an engine of this model

**Implementation:** In `generateStaticParams`, filter makes/models by actual product counts. In `generateMetadata`, add `robots: { index: false, follow: true }` if `productCount < 3`.

### SEO Metadata for Each Page Type

**Make page (`/arac/bmw`):**
```
title:       "BMW Yedek Parça — Akinel Oto Yedek Parça"
description: "BMW araçlarına uyumlu yedek parçalar. {productCount}+ ürün."
canonical:   /arac/bmw
h1:          "BMW Yedek Parça"
breadcrumb:  Anasayfa › Araçlar › BMW
JSON-LD:     BreadcrumbList + ItemList (products)
sitemap:     priority 0.8, weekly
```

**Model page (`/arac/bmw/3-serisi`):**
```
title:       "BMW 3 Serisi Yedek Parça — Akinel Oto Yedek Parça"
description: "BMW 3 Serisi araçlarınıza uyumlu yedek parçalar. {productCount}+ ürün."
canonical:   /arac/bmw/3-serisi
h1:          "BMW 3 Serisi Yedek Parça"
breadcrumb:  Anasayfa › Araçlar › BMW › BMW 3 Serisi
JSON-LD:     BreadcrumbList
robots:      noindex if productCount < 3
sitemap:     include only if productCount ≥ 3
```

**Browse page (`/arac`):**
```
title:       "Araçlar — Tüm Markalar | Akinel Oto Yedek Parça"
description: "BMW, Mercedes, VW, Audi ve daha fazlası. Aracınızı seçin ve uyumlu parçaları keşfedin."
h1:          "Araç Markaları"
sitemap:     priority 0.8, weekly
```

---

## STEP 6 — Product Compatibility for Model Pages

**No second system. Existing `ProductVehicleCompatibility` is the only source.**

**Query chain for make pages:**
```
Products
  JOIN ProductVehicleCompatibility ON Products.Id = PVC.ProductId
  JOIN VehicleEngines ON PVC.VehicleEngineId = VehicleEngines.Id
  JOIN VehicleGenerations ON VehicleEngines.VehicleGenerationId = VG.Id
  JOIN VehicleModels ON VG.VehicleModelId = VM.Id
  JOIN VehicleMakes ON VM.VehicleMakeId = Make.Id
WHERE Make.Slug = 'bmw'
```

**Query chain for model pages:**
```
... same but:
WHERE VM.Slug = '3-serisi'
```

These are join queries on existing tables. No new entities required. The key is to add **slug-based lookup** endpoints on the backend, since the current API uses `makeId` (Guid), not `makeSlug` (string).

**Recommendation:** Extend `ProductSearchQuery` with `vehicleMakeSlug` and `vehicleModelSlug` optional params. The backend resolves them to IDs internally. Frontend calls `/api/products?vehicleMakeSlug=bmw&page=1&pageSize=24`. This is a single API change with minimal surface area.

---

## STEP 7 — Oto Bakım ve Yağlar Design

### IsVehicleSpecific — the right approach

**Option A (from original report): `Product.IsVehicleSpecific`**
- Pro: Per-product control
- Con: Every product in the category needs this flag set. Admin burden. Risk of products in this category accidentally being flagged as vehicle-specific.

**Option B: `Category.IsVehicleSpecific`**
- Pro: Set once on the category, applies to all products in that tree
- Con: Less granular (but for this use case, less granular is fine)

**Option C: No new field — use empty `ProductVehicleCompatibility` as signal**
- Pro: No schema change
- Con: Ambiguous — an incomplete product with no compatibility entries looks the same as a universal product. Admin workflow becomes "don't add compatibilities" rather than "set a flag", which is error-prone.

**Decision: Option B — `bool IsVehicleSpecific` on `Category`, defaulting to `true`.**

One migration. Set to `false` on "Oto Bakım ve Yağlar" and its children. Category page checks this flag and skips vehicle context filtering when `false`. Clean, minimal, unambiguous.

### MVP Category Structure

```
Oto Bakım ve Yağlar  (IsVehicleSpecific: false)
├── Motor Yağı
├── Antifriz
├── Fren Hidrolik Yağı
├── Şanzıman Yağı
├── Cam Yıkama Suyu
├── Yakıt Katkısı
├── Oto Yıkama Şampuanı
├── Pasta Cila
└── AdBlue
```

9 subcategories. Manageable inventory footprint for launch.

### Future expansion (when inventory grows)

```
Oto Bakım ve Yağlar
├── (all MVP above)
├── Yağ Katkısı
├── Direksiyon Yağı
├── Akü ve Şarj
├── Ampul ve Aydınlatma
├── Lastik Onarım
└── Oto Temizlik
    ├── İç Temizlik
    ├── Dış Yıkama
    └── Cam Bakım
```

### Universal product behavior

Products in `IsVehicleSpecific: false` categories:
- Show on category pages without vehicle context requirement
- Show in search results regardless of active vehicle context
- On the homepage oil section, shown unconditionally (no Garaj check)
- In the product page, don't show "Bu araçla uyumlu" banner — show "Tüm araçlarla uyumludur" or nothing

---

## STEP 8 — Homepage Redesign Recommendation

**1. AnnouncementTicker** — Already exists in `PublicShell.tsx`. CHECK: what content is currently displayed? If empty, just add content via admin. Do NOT rebuild this component.

**2. Header** — Keep. Minor: Add "Tüm Araçlar" link to the desktop nav bar pointing to `/arac`.

**3. VehicleBrandStrip** — ADD between header and page content. Shows vehicle make logos. Appears on all shop pages (not admin).

**4. Hero Section** — REDESIGN.
- Current: Full-width carousel with search overlay
- Proposed: Two-column layout:
  - Left (60%): Existing HeroCarousel (keep admin-managed slides)
  - Right (40%): Vehicle Selector Card with tabs (Araç Kataloğu | Şasi No | Garajım)
- On mobile: Stacked. Selector card first (above fold), carousel below.

**5. BusinessStrip** — KEEP. Move to directly below hero. Trust signals early = good.

**6. PopularBrandCards** — ADD. Replace pill-button Popular Brands section.
- Horizontal scrolling carousel of 8–10 make cards
- Each card: logo + 4 model links + "Tüm {Make} Parçaları" CTA
- Data: fetched from API (real makes + real models from catalog)

**7. CategoryStrip** — KEEP. Add "Oto Bakım ve Yağlar" chip once P0-1 is done.

**8. OilMaintenanceSection** — ADD (after Phase 3).
- Tabs: Motor Yağı | Antifriz | Oto Bakım
- Motor Yağı tab: oil brand logos linking to brand-filtered category page

**9. Featured Products / Best Sellers** — MODIFY.
- Replace standalone "Featured Products" with a tabbed section: "Öne Çıkanlar" | "En Çok Satılanlar"
- "En Çok Satılanlar" tab: admin-marked products (`IsBestSeller = true`) for MVP

**10. Akinel Introduction** — REMOVE (or significantly shrink).
- Replace with SEO text block at the bottom

**11. Vehicle Finder Section** (standalone) — REMOVE from its current position.
- Vehicle selector moves into Hero (Step 4 above)
- Garage context shown in header chip (already implemented)

**12. SocialProofBar** — ADD (simple version).
- Use real numbers from API: product count + category count + brand count
- Example: "500+ Ürün | 8 Kategori | 30+ Marka | Türkiye Geneli Kargo"
- DO NOT show fake customer/order counts

**13. SEO Text + FAQ** — ADD at bottom.
- H1: "Oto Yedek Parça" (primary SEO keyword, not brand name)
- 3–4 H2 paragraphs + FAQ accordion (8 Q&As) + FAQPage JSON-LD

### Final homepage section order

```
1.  AnnouncementTicker       [already exists — add content]
2.  Header                   [keep — add /arac nav link]
3.  VehicleBrandStrip        [NEW]
4.  Hero (carousel + vehicle selector tabs)  [REDESIGN]
5.  BusinessStrip            [KEEP — move up from position 2]
6.  PopularBrandCards        [NEW — replaces pill buttons]
7.  CategoryStrip            [KEEP — add Oto Bakım chip in Phase 3]
8.  OilMaintenanceSection    [NEW — Phase 3]
9.  Featured + Best Sellers  [MODIFY — tabbed, Phase 4]
10. SocialProofBar           [NEW — real counts only, Phase 4]
11. SEO Text + FAQ           [NEW — Phase 4]
12. Footer                   [EXTEND]
```

**Removed:** Standalone Vehicle Finder section, Akinel Introduction (full-length version), Popular Brands pill buttons.

---

## STEP 9 — Category Architecture

### Current categories (from seeder)
1. Fren Sistemi
2. Debriyaj
3. Filtreler
4. Süspansiyon
5. Elektrik Sistemi
6. Soğutma Sistemi

These 6 categories cover the most common breakdown repair parts. They are correct for the existing inventory. Don't rename or reorganize them.

### Recommended MVP category tree

```
Fren Sistemi          (existing)
  └── Fren Balataları, Fren Diskleri, ABS Sensörleri, Kaliper, El Freni
Debriyaj              (existing)
  └── Debriyaj Seti, Debriyaj Balatası, Volan
Filtreler             (existing)
  └── Yağ Filtresi, Hava Filtresi, Polen Filtresi, Yakıt Filtresi
Süspansiyon           (existing)
  └── Amortisör, Rot Başı, Rotil, Salıncak, Yay
Elektrik Sistemi      (existing)
  └── Akü, Far Lambası, Stop Lambası, Ateşleme Bobini, Bujiler
Soğutma Sistemi       (existing)
  └── Klima Kompresörü, Su Radyatörü, Termostat
Oto Bakım ve Yağlar   (NEW — IsVehicleSpecific: false)
  └── Motor Yağı, Antifriz, Fren Hidrolik Yağı, Şanzıman Yağı,
      Cam Yıkama Suyu, Yakıt Katkısı, Oto Yıkama Şampuanı, Pasta Cila, AdBlue
```

Total: 7 top-level. Clean, manageable, honest about inventory.

### Future expansion (trigger: new product type arrives)
- Motor ve Yakıt (buji, triger, turbo, oksijen sensörü)
- Şanzıman ve Diferansiyel
- Kaporta (when bodywork stocked)
- Aksesuar (when accessories stocked)

---

## STEP 10 — Footer Design

### Current state
4 columns: Brand description | Hızlı Linkler | Müşteri | İletişim

### Proposed 6-column structure

**Column 1: Kurumsal**
- Hakkımızda (`/about`)
- İletişim (`/contact`)
- Gizlilik Politikası (`/belgeler/gizlilik-politikasi`)
- KVKK (`/belgeler/kvkk`)
- Kullanım Şartları (`/belgeler/kullanim-sartlari`)
- Kargo ve İade (`/belgeler/kargo-ve-iade`)
- SSS (`/sss`)

**Column 2: Hızlı Erişim**
- Tüm Ürünler (`/products`)
- Araç Kataloğu (`/arac`)
- OEM Numara ile Ara (current OEM search page)
- Garajım (`/garage`)
- Şasi No ile Ara (`/vin`)
- Tüm Markalar (`/brands`)

**Column 3: Popüler Araçlar** ← Add AFTER Phase 2
- BMW → `/arac/bmw`
- Mercedes-Benz → `/arac/mercedes-benz`
- Volkswagen → `/arac/volkswagen`
- Audi → `/arac/audi`
- Toyota → `/arac/toyota`
- Hyundai → `/arac/hyundai`
- Ford → `/arac/ford`
- Fiat → `/arac/fiat`
- Opel → `/arac/opel`
- Renault → `/arac/renault`
- Peugeot → `/arac/peugeot`
- Citroën → `/arac/citroen`
- Tüm Araçlar → `/arac`

**Column 4: Popüler Modeller** ← Add AFTER Phase 2
- BMW 3 Serisi → `/arac/bmw/3-serisi`
- Fiat Egea → `/arac/fiat/egea`
- Ford Focus → `/arac/ford/focus`
- Hyundai i20 → `/arac/hyundai/i20`
- Mercedes C Serisi → `/arac/mercedes-benz/c-serisi`
- Opel Astra → `/arac/opel/astra`
- Peugeot 2008 → `/arac/peugeot/2008`
- Renault Clio → `/arac/renault/clio`
- Toyota Corolla → `/arac/toyota/corolla`
- VW Passat → `/arac/volkswagen/passat`
- Audi A3 → `/arac/audi/a3`
- Honda Civic → `/arac/honda/civic`

**Column 5: Popüler Markalar** (parts brands — static)
- Links to `/marka/{slug}` for brands that actually exist in DB
- Bosch, Valeo, SKF, TRW, NGK, Gates, Hella, Sachs, Filtron, Magneti Marelli, Delphi, Febi Bilstein

**Column 6: Popüler Kategoriler** (static)
- Links to `/kategori/{slug}` for existing categories
- Fren Balatası, Fren Diski, ABS Sensörü, Amortisör, Hava Filtresi, Yağ Filtresi, Motor Yağı (Phase 3), Debriyaj Seti, Far Lambası, Polen Filtresi, Bujiler, Antifriz (Phase 3)

### Phasing
- **Phase 1 footer:** 4 columns (Kurumsal + Hızlı Erişim + Popüler Markalar + Popüler Kategoriler)
- **Phase 2 footer:** Add Popüler Araçlar + Popüler Modeller columns (6 total)

Do NOT link to vehicle pages before Phase 2 builds them.

---

## STEP 11 — VIN / Şasi Audit

### What it currently does
1. User enters 17-char VIN on `/vin` page
2. Validates format (regex: no I, O, Q; exactly 17 chars)
3. Calls POST `/api/vehicles/vin-decode` (feature-flagged: "VinSearch")
4. Calls NHTSA vPIC API (US government database)
5. Returns make/model/year if found, tries to match against internal `VehicleEngine` catalog
6. Shows `internalVehicle` (exact match) or `possibleMatches` (array of catalog candidates)

### Can it reliably support Turkish-market vehicles?

**No.** For Turkish market vehicles:
- European imports (VW, BMW, Mercedes): WMI exists in vPIC but results are incomplete
- Turkish-assembled vehicles (Fiat/Tofaş in Bursa, Renault/Oyak, Ford Otosan in Kocaeli): WMIs may not be in vPIC or return incomplete data
- Korean imports (Hyundai, Kia): Partially covered

**Conclusion: Current NHTSA integration is unreliable for ~60% of Turkish-market vehicles.**

### Phase 1 — Immediate (frontend only, no backend work)

1. Add disclaimer above the VIN input: `"Şasi numarası çözümleme özelliği Türkiye araç veritabanı ile geliştirilmektedir. Türkiye'ye özgü araçlarda sonuç bulunamayabilir."`
2. When result is "not found": show `"Aracınız bulunamadı. Araç kataloğunu kullanarak aracınızı seçebilirsiniz."` with link to `/arac`
3. Move VIN INTO the vehicle selector widget as tab 2 (Şasi No ile Ara). The dedicated `/vin` page stays but primary access becomes the widget tab.

### Phase 2 — Internal WMI lookup (no external API, no new DB table)

The first 3 characters of any VIN (WMI) reliably identify the manufacturer. This is globally standardized.

Minimum viable improvement:
- Hardcoded `WmiToMakeSlug` dictionary in backend service (not a DB table): `{ "WBA": "bmw", "WDB": "mercedes-benz", "WVW": "volkswagen", "WAU": "audi", "ZFA": "fiat", "VF1": "renault", "WF0": "ford", "W0L": "opel", ... }`
- Extract year from VIN position 10 using standard year-code table
- Look up matching VehicleGenerations using make + year overlap
- Return `possibleMatches` from internal catalog — no NHTSA call needed

This is ~50 lines of code + a static dictionary, not a new DB table.

### Critical UX rule
**Never claim VIN = exact compatible parts.** If VIN resolution succeeds, say: `"Araç bilgileri bulundu. Lütfen bilgileri doğrulayın."` Resolution accuracy ≠ parts compatibility accuracy.

### Phase 3 — TecDoc/EU data source
Depends on budget and licensing. Significant infrastructure investment. Plan for it but don't scope it now.

---

## STEP 12 — Overengineering Check

| Proposed change | Is it necessary? | Verdict |
|---|---|---|
| `Category.IsVehicleSpecific` | Yes — cleanest way to handle universal products | **ADD** — one migration field |
| `Product.IsVehicleSpecific` | No — Category-level is sufficient | **SKIP** |
| `Product.IsBestSeller` | Yes — needed for best sellers section. Simpler than OrderCount. | **ADD** — one migration field |
| `Product.OrderCount` | No — premature, need real orders first | **DEFER** to Phase 4+ |
| New vehicle/make product endpoints | Yes — slug-based API params are genuinely missing | **ADD** — extend `ProductSearchQuery` |
| `VinWmiMapping` DB table | No — hardcoded dictionary in service is sufficient | **SKIP** — use static dictionary |
| `ProductReview` entity | No — disproportionate complexity | **REJECT** |
| `WiperSize` entity | No — no data to populate it | **REJECT** |
| `MaintenanceSchedule` entity | No — requires extensive data curation first | **REJECT** |
| `ServiceCenter` entity | No — separate concern | **REJECT** |
| New `GET /api/stats/social-proof` endpoint | Overkill | **MODIFY** — use existing endpoint totalCounts |
| `AnnouncementBanner` content management | Already exists in DB — check admin panel | **VERIFY** before building |

---

## STEP 13 — Final Implementation Plan

### Phase 1 — Homepage + Vehicle Discovery UX
*Goal: Get the homepage to feel like a complete automotive platform without needing vehicle SEO pages yet.*

| Task | Estimated |
|---|---|
| Verify/activate AnnouncementTicker content | 0.5 days |
| VehicleBrandStrip — new component, SVG logos, interim links to `/vehicle?make=slug` | 1.5 days |
| Hero redesign — tabbed vehicle selector card alongside carousel | 2 days |
| VehicleFinder improvements — step counter, year range + gearbox in labels | 0.5 days |
| PopularBrandCards — dynamic API data, replaces pill buttons | 1.5 days |
| Footer Phase 1 — 4 columns (Kurumsal, Hızlı Erişim, Markalar, Kategoriler) | 1 day |
| VIN disclaimer + improved "not found" state | 0.5 days |

**Phase 1 total: ~7.5 days**

---

### Phase 2 — Vehicle SEO Architecture
*Goal: Create the make/model URL tree, update sitemap, add footer vehicle columns.*

| Task | Estimated |
|---|---|
| `/arac` browse page — all makes, logos, A-Z | 1 day |
| `/arac/[makeSlug]` make pages — static gen, products, metadata, JSON-LD | 2 days |
| `/arac/[makeSlug]/[modelSlug]` model pages | 1.5 days |
| Backend: extend `ProductSearchQuery` with `vehicleMakeSlug` + `vehicleModelSlug` | 1 day |
| Backend: `GET /api/vehicles/makes/{slug}` + slug-based model endpoint | 0.5 days |
| Sitemap update — add make + model URLs, filter by product count | 0.5 days |
| Footer Phase 2 — add Popüler Araçlar + Popüler Modeller columns | 0.5 days |
| VehicleBrandStrip update — point to real `/arac/[makeSlug]` pages | 0.25 days |

**Phase 2 total: ~7.25 days**

---

### Phase 3 — Oto Bakım ve Yağlar
*Goal: Add the maintenance/oil category and surface it on homepage.*

| Task | Estimated |
|---|---|
| `Category.IsVehicleSpecific` migration | 0.5 days |
| Database seeder — add Oto Bakım parent + 9 child categories | 0.5 days |
| Admin product form — hide vehicle compatibility when `IsVehicleSpecific = false` | 1 day |
| Category page — skip `vehicleEngineId` filter when `IsVehicleSpecific = false` | 0.5 days |
| CategoryStrip — add Oto Bakım chip | 0.25 days |
| OilMaintenanceSection — homepage tabbed section (Motor Yağı, Antifriz, Oto Bakım) | 1.5 days |

**Phase 3 total: ~4.25 days**

---

### Phase 4 — Conversion + SEO Content
*Goal: Increase AOV, add missing UX elements, improve SEO text.*

| Task | Estimated |
|---|---|
| `Product.IsBestSeller` migration | 0.5 days |
| Best Sellers + Featured Products tabbed section | 1 day |
| Taksit banner — only if payment provider confirmed; admin-configurable | 1 day |
| SEO text block + FAQ accordion + FAQPage JSON-LD | 1 day |
| SocialProofBar — product + brand + category counts from existing API | 0.5 days |
| VIN Phase 2 — WMI dictionary lookup, remove NHTSA dependency | 1 day |
| `/brands` → `/markalar` 301 redirect in `next.config.js` | 0.25 days |

**Phase 4 total: ~5.25 days**

---

### Phase 5 — Advanced Tools
*Defer until inventory data and customer base are larger.*

- VIN Phase 3 (TecDoc integration) — significant licensing cost
- Wiper finder — needs per-engine wiper size data
- Maintenance robot — needs per-engine maintenance schedule data
- Service centers — separate project
- Product reviews — full moderation system
- B2B portal — separate project
- Mobile app — separate project

---

## Final Output — Sections A through H

---

### A. DO NOW (Phase 1)

1. **Verify AnnouncementTicker** — check if `AnnouncementBanner` is wired to admin panel. If yes, just add content. If not, add the admin form field.
2. **VehicleBrandStrip** — new component, SVG logos, links to `/vehicle?make={slug}` as interim
3. **Hero redesign** — tabbed vehicle selector card next to carousel; step counter on VehicleFinder
4. **VehicleFinder label improvements** — year range and gearbox in dropdown labels (no backend change)
5. **PopularBrandCards** — dynamic, from API; replaces pill buttons
6. **Footer Phase 1** — 4 columns, add Popüler Markalar + Kategoriler
7. **VIN disclaimer** — add Turkish market warning and better "not found" UX

---

### B. DO LATER (Phase 2–4)

- `/arac` browse page + make pages + model pages (Phase 2)
- Backend `vehicleMakeSlug`/`vehicleModelSlug` query params (Phase 2)
- Sitemap vehicle URLs (Phase 2)
- Footer Phase 2 — add vehicle/model columns (Phase 2)
- Oto Bakım ve Yağlar category + admin form update + homepage section (Phase 3)
- Best sellers (`IsBestSeller` flag), SEO text block, FAQ accordion (Phase 4)
- Taksit banner only when payment provider confirmed (Phase 4)
- VIN Phase 2 WMI dictionary (Phase 4)

---

### C. DO NOT BUILD

- `Product.IsVehicleSpecific` — use `Category.IsVehicleSpecific` instead
- `VinWmiMapping` database table — use static dictionary in service
- `Product.OrderCount` — defer until real orders; use `IsBestSeller` admin flag for MVP
- `GET /api/stats/social-proof` endpoint — derive counts from existing endpoints
- Product star ratings — disproportionate complexity at this stage
- Wiper finder — no data
- Maintenance robot — no data
- Service centers — separate concern
- B2B portal — separate concern
- Dark/light mode — not in brand priorities

---

### D. FINAL HOMEPAGE STRUCTURE

```
┌─────────────────────────────────────────────────────────────┐
│ 1.  AnnouncementTicker   sticky z-60, free shipping + phone  │
├─────────────────────────────────────────────────────────────┤
│ 2.  Header               logo + search + garage + cart       │
├─────────────────────────────────────────────────────────────┤
│ 3.  VehicleBrandStrip    TÜM ARAÇLAR + 12 make logos        │
├─────────────────────────────────────────────────────────────┤
│ 4.  Hero                 carousel (60%) + selector card (40%)│
│                          [Araç Kataloğu|Şasi No|Garajım]    │
├─────────────────────────────────────────────────────────────┤
│ 5.  BusinessStrip        4 trust signals                     │
├─────────────────────────────────────────────────────────────┤
│ 6.  PopularBrandCards    8-10 make cards with model links    │
├─────────────────────────────────────────────────────────────┤
│ 7.  CategoryStrip        chips + Oto Bakım (Phase 3)         │
├─────────────────────────────────────────────────────────────┤
│ 8.  OilMaintenanceSection  [Phase 3]                         │
│                          Motor Yağı | Antifriz | Oto Bakım  │
├─────────────────────────────────────────────────────────────┤
│ 9.  Featured + BestSellers  [Phase 4] tabbed                 │
│                          Öne Çıkanlar | En Çok Satılanlar   │
├─────────────────────────────────────────────────────────────┤
│ 10. SocialProofBar       [Phase 4] real counts only          │
├─────────────────────────────────────────────────────────────┤
│ 11. SEO Text + FAQ       [Phase 4] H1: Oto Yedek Parça       │
├─────────────────────────────────────────────────────────────┤
│ 12. Footer               Phase 1: 4 cols → Phase 2: 6 cols   │
└─────────────────────────────────────────────────────────────┘
```

**Removed from current homepage:**
- Standalone Vehicle Finder section (moved into Hero tab)
- Akinel Introduction full section (replaced by SEO text block at bottom)
- Popular Brands pill buttons (replaced by PopularBrandCards)

---

### E. FINAL VEHICLE STRUCTURE

**URLs:**
```
/arac                             All makes browse (A-Z, logos, search)
/arac/bmw                         BMW make page
/arac/bmw/3-serisi                BMW 3 Serisi model page
/arac/mercedes-benz               Mercedes-Benz make page
/arac/mercedes-benz/c-serisi      Mercedes C Serisi model page
/arac/[makeSlug]                  Pattern for all makes
/arac/[makeSlug]/[modelSlug]      Pattern for all models
```

**Navigation entry points:**
- VehicleBrandStrip (every page) → `/arac/[makeSlug]`
- Footer Popüler Araçlar (every page) → `/arac/[makeSlug]`
- Footer Popüler Modeller (every page) → `/arac/[makeSlug]/[modelSlug]`
- Hero vehicle selector → redirects to `/products?vehicleEngineId=...` after all 4 steps
- PopularBrandCards → model links on homepage

**Vehicle selection flow (4 steps — display improvements only):**
```
Step 1/4: Marka     → select make (show logo)
Step 2/4: Model     → select model
Step 3/4: Nesil     → select generation  ("2019–2023 · Sedan" format)
Step 4/4: Motor     → select engine      ("2.0d 190hp · Dizel · Manuel" format)
→ "Parçaları Göster" → /products?vehicleEngineId={id}
→ "Garaja Kaydet"   → saves to Zustand
```

**Thin page prevention:**
- `generateStaticParams`: only makes/models with ≥1 compatible product
- `robots: noindex` if `productCount < 3`
- Sitemap: include only pages with `productCount ≥ 3`

**Compatibility:**
- Make page: products via `ProductVehicleCompatibility` → engine → generation → model → make chain
- Model page: same chain, filtered to model
- No new compatibility system — existing join table only

---

### F. FINAL CATEGORY STRUCTURE

**MVP (implement in Phase 3):**
```
Fren Sistemi           (existing)
Debriyaj               (existing)
Filtreler              (existing)
Süspansiyon            (existing)
Elektrik Sistemi       (existing)
Soğutma Sistemi        (existing)
Oto Bakım ve Yağlar    (NEW, IsVehicleSpecific: false)
  ├── Motor Yağı
  ├── Antifriz
  ├── Fren Hidrolik Yağı
  ├── Şanzıman Yağı
  ├── Cam Yıkama Suyu
  ├── Yakıt Katkısı
  ├── Oto Yıkama Şampuanı
  ├── Pasta Cila
  └── AdBlue
```

**Future (add only when inventory exists):**
```
Motor ve Yakıt         (future)
Şanzıman               (future)
Kaporta ve Trim        (future — only when bodywork stocked)
Aksesuar               (future — only when accessories stocked)
```

Do NOT add Otoparcasan's 50+ Oto Bakım subcategories. 9 is the MVP.

---

### G. DATABASE / API CHANGES

Only genuinely necessary changes:

| Change | Type | Phase | Notes |
|---|---|---|---|
| `Category.IsVehicleSpecific bool` (default: true) | DB migration | 3 | One field on Category entity |
| `Product.IsBestSeller bool` (default: false) | DB migration | 4 | Admin-managed via product edit |
| `ProductSearchQuery.vehicleMakeSlug string?` | API query param | 2 | Extend existing query model |
| `ProductSearchQuery.vehicleModelSlug string?` | API query param | 2 | Extend existing query model |
| `GET /api/vehicles/makes/{slug}` | New endpoint | 2 | Returns make + model list |
| `GET /api/vehicles/makes/{slug}/models` | New endpoint (slug variant) | 2 | Slug-based version of existing Guid endpoint |
| Oto Bakım category seeder data | DB seeder | 3 | No migration needed for seeder |

**Total new migrations: 2**
**Total new API endpoints: 2**
**Total modified API endpoints: 1** (ProductSearchQuery params)

Everything else uses existing infrastructure.

---

### H. FILES TO CHANGE

**Phase 1:**

| File | Change |
|---|---|
| `apps/web/src/components/layout/PublicShell.tsx` | Add `<VehicleBrandStrip />` below `<Header />` |
| `apps/web/src/components/layout/VehicleBrandStrip.tsx` | **CREATE** new component |
| `apps/web/src/app/page.tsx` | Remove standalone VehicleFinder; replace pill brands with `<PopularBrandCards />`; redesign hero layout |
| `apps/web/src/components/home/PopularBrandCards.tsx` | **CREATE** new component |
| `apps/web/src/components/search/VehicleFinder.tsx` | Add step counter; improve generation + engine label formatting |
| `apps/web/src/components/layout/Footer.tsx` | Reorganize to 4 columns (Phase 1) |
| `apps/web/src/app/(shop)/vin/page.tsx` | Add Turkish disclaimer; improve "not found" state |
| `public/vehicles/logos/*.svg` | **ADD** 12–15 SVG logo files |

**Phase 2:**

| File | Change |
|---|---|
| `apps/web/src/app/(shop)/arac/page.tsx` | **CREATE** all makes browse |
| `apps/web/src/app/(shop)/arac/[makeSlug]/page.tsx` | **CREATE** make page |
| `apps/web/src/app/(shop)/arac/[makeSlug]/[modelSlug]/page.tsx` | **CREATE** model page |
| `apps/web/src/app/sitemap.ts` | Add make + model URL generation, filter by product count |
| `apps/web/src/components/layout/Footer.tsx` | Add 2 more columns (Phase 2) |
| `apps/api/Akinel.Api/Controllers/VehiclesController.cs` | Add `GET /api/vehicles/makes/{slug}` + slug-based model endpoint |
| `apps/api/Akinel.Application/DTOs/ProductSearchQuery.cs` | Add `vehicleMakeSlug` + `vehicleModelSlug` params |
| `apps/api/Akinel.Infrastructure/` (product service) | Resolve new slug params to IDs in product query |

**Phase 3:**

| File | Change |
|---|---|
| `apps/api/Akinel.Domain/Entities/Category.cs` | Add `IsVehicleSpecific bool` |
| `apps/api/Akinel.Infrastructure/Data/Migrations/` | **CREATE** migration for `IsVehicleSpecific` |
| `apps/api/Akinel.Infrastructure/Data/DatabaseSeeder.cs` | Add Oto Bakım category tree (9 entries) |
| `apps/web/src/app/admin/products/` (create + edit forms) | Hide vehicle compatibility section when `category.IsVehicleSpecific == false` |
| `apps/web/src/app/(shop)/category/[slug]/page.tsx` (or `/kategori/[slug]`) | Skip `vehicleEngineId` filter when `category.IsVehicleSpecific == false` |
| `apps/web/src/components/home/CategoryStrip.tsx` | Add Oto Bakım chip |
| `apps/web/src/components/home/OilMaintenanceSection.tsx` | **CREATE** tabbed oil/maintenance section |
| `apps/web/src/app/page.tsx` | Add `<OilMaintenanceSection />` |

**Phase 4:**

| File | Change |
|---|---|
| `apps/api/Akinel.Domain/Entities/Product.cs` | Add `IsBestSeller bool` |
| `apps/api/Akinel.Infrastructure/Data/Migrations/` | **CREATE** migration for `IsBestSeller` |
| `apps/web/src/components/home/BestSellersSection.tsx` | **CREATE** |
| `apps/web/src/components/home/TaksitBanner.tsx` | **CREATE** (only if taksit configured) |
| `apps/web/src/components/home/SeoTextBlock.tsx` | **CREATE** |
| `apps/web/src/components/home/FaqAccordion.tsx` | **CREATE** |
| `apps/web/src/app/page.tsx` | Integrate all Phase 4 sections |
| `apps/web/src/app/(shop)/vin/page.tsx` | Phase 2 WMI dictionary lookup, remove NHTSA dependency |
| `apps/api/Akinel.Api/Controllers/VehiclesController.cs` | Add WMI dictionary lookup logic |
| `apps/web/next.config.js` | Add 301 redirect `/brands` → `/markalar` |

---

*This document supersedes the original COMPETITOR_AUDIT_REPORT.md for implementation purposes.*
*No code has been modified. Awaiting implementation approval.*
