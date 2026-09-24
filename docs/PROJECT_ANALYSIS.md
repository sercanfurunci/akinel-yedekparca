# PROJECT_ANALYSIS.md
## Akinel Yedek Parça — UX & Architecture Analysis

---

## 1. REFERENCE WEBSITE ANALYSIS (yedekparca.com.tr)

### 1.1 Header / Navigation Structure

**Top Bar (utility bar):**
- Phone number, email address
- Language selector (Türkçe), Currency selector (TRY)
- Links: Sipariş Takip | Yardım | İletişim

**Main Header:**
- Logo (left)
- 6-step cascading vehicle-finder dropdowns as primary search (center/full-width)
  - Marka → Model → Kasa → Yıl → Motor → KW/Güç
  - "Parça Ara" CTA button
- Favorites icon + cart icon (right)

**No persistent top-level navigation menu** — all navigation is done through:
- The vehicle finder
- Homepage section links
- Footer links
- Category/brand pages reached from homepage tiles

---

### 1.2 Main Search Experience

The primary search is the **6-step vehicle finder** embedded in the hero section on the homepage. It is a cascading dependent-dropdown chain:

1. Marka (Brand: VW, BMW, etc.)
2. Model (Golf, 3 Series, etc.)
3. Kasa (Body type: sedan, hatchback, estate)
4. Yıl (Year range)
5. Motor (Engine displacement: 1.6, 2.0 TDI, etc.)
6. KW/Güç (Power output in KW)

There is **no freetext search bar** prominently visible. Products are found primarily through this structured vehicle selection.

---

### 1.3 OEM / Part-Number Search Flow

- OEM numbers are mentioned in product descriptions ("OEM NO:" field on product detail)
- No dedicated OEM search UI visible on the front-end
- VIN/chassis search is described textually but handled **by staff manually** — there is a note on product pages: *"Ürünü satın almadan önce 17 haneli şase numarası ile sorgulama yaptırınız"*
- Chassis number query is a staff-assisted offline/phone process, not an automated front-end feature

---

### 1.4 Vehicle / Part Finder Flow

**Primary path:** Homepage → 6 dropdowns (Marka/Model/Kasa/Yıl/Motor/KW) → category listing filtered by vehicle

**Periyodik Bakım Robotu (Maintenance Robot):**
- Separate tool page (`/periyodik-bakim-robotu-yp`)
- Same 6-step vehicle selector
- Outputs: matching maintenance parts (air filter, oil filter, pollen filter, fuel filter + brake pads)

**Vehicle data hierarchy:** Marka → Model → Kasa → Yıl → Motor → KW

---

### 1.5 Category Structure

**Top-level categories (visible on homepage):**
- Fren (Fren Diski, Balata, Fren Pabuçlu Balata, ABS Sensörü, Kampana, etc.)
- Süspansiyon (Salıncak, etc.)
- Debriyaj (Debriyaj Seti, etc.)
- Soğutma
- Elektrik (Far, Stop Lambası, etc.)
- Yakıt
- Motor
- Şanzıman / Diferansiyel
- Kaporta
- Bakım (Filtreler, Yağlar)

**Popular Categories featured on homepage:**
Balata, Fren Diski, Debriyaj Seti, Triger Seti, Salıncak, Stop Lambası

**Category URL pattern:** `/balata`, `/fren-diski`, `/fren` (parent)

---

### 1.6 Brand Navigation

**Vehicle brands (featured prominently, 12 tiles in 2 rows):**
VW, BMW, Opel, Mercedes, Peugeot, Ford, Citroen, Honda, Hyundai, Renault, Skoda, Toyota

URL pattern: `/volkswagen-yedek-parca`, `/bmw-yedek-parca`

**OEM/Supplier brands (carousel — 29 brands):**
Aisin, ART, Behr, Blueprint, Bosch, Braxis, BSG, Dayco, Delphi, Denso, Depo, Elring, Febi Bilstein, Ferodo, Gates, GSP, Hengst, Lemförder, LUK, Mann Filter, Monroe, Pierburg, Sachs, Swag, Teknorot, Textar, TRW, Valeo, VDO, Victor Reinz

URL pattern: `/bosch`, `/trw`

---

### 1.7 Product Listing Cards

Each card contains:
- Product image (large, linked to detail)
- Product title — **vehicle info embedded in name** (e.g., "BMW F20 Kasa 116d Arka Fren Balatası")
- Category tag + Brand tag (as links)
- Price: shown as two values (original / discounted) — **BUT prices appear empty/hidden on load** (likely AJAX)
- Stock status: "Sepete Ekle" button OR "Stokta Yok" badge
- No rating/review count on card
- No thumbnail hover second image

**Pagination:** URL param `?pageing=N` — up to 385 pages for "Balata" category

**Sorting options:** en-yeniler (newest), fiyat (price) — via URL params

**Filters:**
- Left sidebar: Category tree, Brand checkboxes
- "Sadece stoktakileri göster" (stock filter)
- "Ücretsiz Kargo" (free shipping filter)
- "Seçimleri Temizle" link

---

### 1.8 Product Detail Page

**Layout:**
- Breadcrumb: Home > Parent Category > Sub-category
- Left: Product image + thumbnail gallery
- Right: Product name (H1), attribute list (OEM NO, YILLAR, GARANTİ)
- Stock status: "Çok yakında stoklarımızda olacaktır" for out-of-stock
- Action buttons: Favorilerime Ekle, Tavsiye Et, Değerlendirme Yaz, Karşılaştır, **Gelince Haber Ver**, Telefonla Sipariş, Ürün Önerileri
- Brand logo shown
- "Garajım" feature (save vehicle to garage)

**Tabs:**
1. Ürün Açıklaması — generic boilerplate text, not product-specific
2. Uyumlu Araçlar — vehicle compatibility list
3. Taksit Seçenekleri — installment options
4. Yorumlar — reviews
5. Garanti ve Teslimat — warranty & delivery
6. Soru-Cevap — Q&A

**Below fold:** Related products slider with discounted pricing visible

---

### 1.9 Vehicle Compatibility Presentation

- Compatibility is **primarily encoded in product names** (e.g., "Renault Symbol 1.4 Benzinli 2007-2012 Arası Ön Fren Balatası")
- "Uyumlu Araçlar" tab on detail page shows structured table (not visible in this crawl)
- No inline compatibility badge on listing cards
- Important warning: "17 haneli şase numarası ile sorgulama yaptırınız" — compatibility is uncertain without VIN

---

### 1.10 Stock Availability Presentation

- Listing card: "Stokta Yok" badge (link styled) vs "Sepete Ekle" button
- Detail page: "Çok yakında stoklarımızda olacaktır" message for OOS
- "Gelince Haber Ver" (Notify when available) CTA
- Filter: "Sadece stoktakileri göster"
- **No live stock count** shown anywhere

---

### 1.11 Price Presentation

- Two prices shown: original → discounted (e.g., "943,95 TL" → "755,16 TL")
- **Prices hidden on category listing** (empty on page load, likely AJAX)
- Currency: TRY
- No bulk pricing, no B2B tiering visible
- Installment options on product detail (tab)

---

### 1.12 Cart Flow

- Cart icon in header with item count badge
- Separate cart page (`/sepet`)
- Empty cart state minimal
- No guest checkout visible from analysis

---

### 1.13 Account / Login Flow

- `/hesabim` redirects to `/uye-giris`
- Login: Email + Password form
- "Şifremi Unuttum" → `/uye-giris?sayfa=sifre`
- "Üye Ol" → `/uye-ol`
- No social login (Google, Facebook)
- No indication of order history, saved vehicles, address book from login page
- Sipariş Takip available without login via top bar link

---

### 1.14 Mobile Responsive Behavior

- Site uses a responsive layout but appears to be desktop-first
- Vehicle finder dropdowns in a horizontal row — likely stacks on mobile
- No evidence of a hamburger menu or mobile nav — navigation is sparse
- WhatsApp floating button present (bottom corner)

---

### 1.15 Footer Structure

**Trust bar (above footer):**
- Kredi Kartı ile Alışveriş | Hızlı Teslimat | Güvenli Alışveriş | Müşteri Hizmetleri (0850 532 1935)

**Main footer (two-column):**
- Company/category links
- Payment methods, SSL certificate, ETBIS badge
- Social: Facebook, Instagram

**Bottom bar:**
- SSL copyright notice + year

---

### 1.16 Filters and Sorting

**Category listing filters:**
- Category tree (left sidebar, collapsible sub-categories)
- Brand (left sidebar checkboxes)
- Stock: "Sadece stoktakileri göster"
- Shipping: "Ücretsiz Kargo"

**Sorting (URL params):**
- `siralama=en-yeniler` (newest)
- `fiyat=hepsi` (price: all)

**Missing:** Price range filter, year filter, engine filter on listing pages (vehicle selection must be done at search time)

---

### 1.17 URL / Routing Patterns

```
/                               Homepage
/[category-slug]                Category listing (e.g., /balata, /fren-diski)
/[parent-category]              Parent category (e.g., /fren, /suspansiyon)
/[brand]-yedek-parca            Vehicle brand page (e.g., /volkswagen-yedek-parca)
/[supplier-brand]               Supplier brand page (e.g., /bosch, /trw)
/[product-slug]                 Product detail page
/sepet                          Cart
/uye-giris                      Login
/uye-ol                         Register
/hesabim                        My Account (redirects to login)
/hesabim/favori-listem          Favorites
/siparis-takip-sID0             Order tracking
/periyodik-bakim-robotu-yp      Maintenance robot tool
/iletisim-sID0                  Contact
/yardim                         Help

Pagination: ?fiyat=hepsi&siralama=en-yeniler&pageing=1&list=0&k=&pageing=N
```

---

### 1.18 Vehicle Selection Hierarchy

```
Marka (Brand)
  └─ Model
       └─ Kasa (Body type: sedan, hatchback, SW, SUV)
            └─ Yıl (Production year)
                 └─ Motor (Engine: 1.4 Benzinli, 2.0 TDI, etc.)
                      └─ KW/Güç (Power output)
```

6 levels required to uniquely identify a vehicle variant.

---

### 1.19 VIN / Chassis Number Flow

- Mentioned in product descriptions as important pre-purchase step
- 17-digit VIN/chassis number
- Process is **staff-assisted**: customer provides VIN, staff confirms compatible parts
- No automated VIN decoder on the website front-end
- No self-service VIN lookup tool visible

---

### 1.20 UX Patterns That Should Be Improved

1. **Prices hidden on listing page** — forces clicks to see price, frustrating comparison
2. **No freetext / OEM search bar** prominently placed — must know vehicle hierarchy
3. **Product names are overloaded** — vehicle data crammed into product title is unscalable
4. **No vehicle filter on listing pages** — once on a category page, no way to filter by "my car"
5. **Generic product descriptions** — boilerplate text, no real specs, dimensions, OEM numbers
6. **VIN/chassis lookup is manual/staff-only** — huge competitive gap for automation
7. **No saved vehicle ("Garajım")** prominently integrated into search flow
8. **Breadcrumb doesn't reflect vehicle context** — loses vehicle selection when browsing
9. **Stale/OOS products listed** — "Stokta Yok" products shown by default, cluttering listings
10. **No review count on listing cards** — poor social proof
11. **Footer trust bar is all-caps, visually heavy** — dated aesthetic
12. **No mobile hamburger menu** — navigation sparse but desktop-centric layout
13. **WhatsApp button overlaps content** — intrusive fixed button
14. **Login has no social auth** — friction for new users
15. **No multi-image gallery properly visible** — single product image
16. **No structured OEM cross-reference search** — lost revenue from mechanics/B2B customers
17. **Category sidebar doesn't persist vehicle context** — after selecting a vehicle, browsing categories loses that selection

---

## 2. FEATURES TO REPRODUCE (CONCEPTUALLY)

| Feature | Rationale |
|---|---|
| 6-step cascading vehicle finder | Core domain requirement; must be at homepage hero |
| Vehicle brand grid | Quick entry point for brand-loyal customers |
| Supplier/OEM brand carousel | Trust signal + alternative navigation path |
| Popular category tiles | Fast navigation for repeat buyers |
| Category listing with left sidebar | Familiar e-commerce pattern for parts |
| Stock status on listing cards | Critical for parts — customer must know before clicking |
| "Uyumlu Araçlar" tab on product detail | Core trust/compatibility feature |
| "Gelince Haber Ver" (back-in-stock) | Retains demand signal for OOS items |
| Periyodik Bakım / Maintenance kit tool | High-value feature — single vehicle selection → full service kit |
| OEM number display on product detail | Professional/mechanic trust signal |
| Installment options | Turkey market standard |
| WhatsApp contact | Turkey market standard — keep but improve placement |
| Order tracking without login | Important for guest buyers |
| Trust signals bar | Security, speed, customer service social proof |
| Breadcrumb navigation | Category context for users and SEO |
| "Garajım" (My Garage) | Save vehicle for repeat purchases — improve and surface prominently |

---

## 3. FEATURES TO IMPROVE

| Reference Feature | Improvement |
|---|---|
| Prices hidden on listing | Show prices immediately, prominently |
| No freetext search | Add a prominent dual-mode search: freetext OR OEM number |
| Product names carry all vehicle info | Separate vehicle compatibility from product name |
| VIN lookup is manual | Build automated VIN decoder → show compatible parts |
| Generic product descriptions | Structured specs: dimensions, OEM numbers, weight, material, compatibility list |
| No review count on cards | Show star rating + review count on listing cards |
| No vehicle filter on listing pages | After vehicle selection, persist it as a filter chip on all category/listing pages |
| OOS products listed by default | Filter OOS by default; show them as a separate "Coming Soon" section |
| Basic login (no social) | Add Google/Apple social login, optional guest checkout |
| Single product image | Multi-image gallery with zoom, 360 view option |
| Sparse mobile navigation | Full mobile-first nav with hamburger menu + bottom tab bar |
| Manual OEM cross-reference | Searchable OEM/part-number lookup with cross-references |
| No price range filter | Add price slider filter on listing pages |
| WhatsApp overlaps content | Keep but use a non-blocking placement or reveal-on-scroll |
| B2B not addressed | Add B2B / mechanic account tier with bulk pricing |
| No recently viewed | Add recently viewed products / search history |
| Weak homepage hero | Richer hero with featured deals, seasonal promotions |

---

## 4. FEATURES TO NOT COPY

- Generic boilerplate product descriptions
- All-caps font-heavy trust bar aesthetic
- Overcrowded URL with redundant query string params
- Manual/staff-only VIN lookup process
- Encoding vehicle compatibility inside product name strings
- Showing hundreds of OOS products without filtering
- "sID0" suffix on URLs (internal routing artifact leaking to public URL)
- Long SEO text blocks on homepage (low-quality SEO padding)
- Proprietary branding, logo, images, color scheme

---

## 5. PROPOSED INFORMATION ARCHITECTURE — AKINEL YEDEK PARÇA

```
AKINEL YEDEK PARÇA
├── Public Site
│   ├── Homepage
│   │   ├── Hero: Vehicle Finder (6-step) + OEM/Part-Number search toggle
│   │   ├── My Garage quick-select (if logged in)
│   │   ├── Popular Categories (icon grid)
│   │   ├── Vehicle Brand Grid
│   │   ├── Supplier Brand Carousel
│   │   ├── Featured / On Sale Products
│   │   ├── Maintenance Kit Tool promo
│   │   └── Trust signals
│   │
│   ├── Search & Discovery
│   │   ├── Vehicle-based search results
│   │   │   └── [Marka/Model/Kasa/Yıl/Motor/KW] + [Category]
│   │   ├── Text/OEM search results
│   │   └── Advanced filters (price, brand, stock, free shipping)
│   │
│   ├── Categories
│   │   ├── /kategori/[slug]           Top-level category
│   │   ├── /kategori/[parent]/[child]  Sub-category
│   │   └── Each category page has vehicle-context filter
│   │
│   ├── Brands
│   │   ├── /marka/[arac-markasi]      Vehicle brand page (VW, BMW...)
│   │   └── /uretici/[supplier-brand]  Supplier brand page (Bosch, TRW...)
│   │
│   ├── Products
│   │   └── /parca/[slug]              Product detail
│   │
│   ├── Tools
│   │   ├── /arac-sec                  Vehicle finder / My Garage
│   │   ├── /bakim-robotu              Maintenance kit builder
│   │   ├── /sase-sorgula              VIN/Chassis lookup (automated)
│   │   └── /oem-ara                   OEM/part-number cross-reference
│   │
│   ├── Account
│   │   ├── /giris                     Login
│   │   ├── /kayit                     Register
│   │   ├── /hesabim                   Dashboard
│   │   ├── /hesabim/garajim           My Garage (saved vehicles)
│   │   ├── /hesabim/siparislerim      Orders
│   │   ├── /hesabim/favoriler         Favorites / Wishlist
│   │   ├── /hesabim/adreslerim        Addresses
│   │   └── /hesabim/ayarlar           Account settings
│   │
│   ├── Cart & Checkout
│   │   ├── /sepet                     Cart
│   │   └── /odeme                     Checkout (guest or member)
│   │
│   ├── Support
│   │   ├── /siparis-takip             Order tracking (no login required)
│   │   ├── /iletisim                  Contact
│   │   ├── /yardim                    Help / FAQ
│   │   └── /hakkimizda                About us
│   │
│   └── Static
│       ├── /gizlilik                  Privacy policy
│       ├── /kullanim-kosullari        Terms of use
│       └── /iade-politikasi           Return policy
│
└── Admin Panel
    ├── /admin/dashboard
    ├── /admin/products
    ├── /admin/categories
    ├── /admin/vehicles          Vehicle database management
    ├── /admin/orders
    ├── /admin/customers
    ├── /admin/stock
    ├── /admin/brands
    └── /admin/settings
```

---

## 6. PROPOSED CUSTOMER JOURNEY

### Journey A: "I know my car, need a specific part"
1. Land on homepage
2. Use 6-step vehicle finder (Marka → Model → Kasa → Yıl → Motor → KW)
3. Browse filtered category (e.g., Fren → Balata)
4. See in-stock products with visible prices
5. Click product → view compatibility confirmation, OEM number, specs
6. Add to cart → guest checkout or login
7. Pay → receive confirmation → track order

### Journey B: "I have an OEM / part number"
1. Land on homepage
2. Switch to OEM/part-number search mode
3. Enter part number → see matching products + compatible vehicles
4. Add to cart → checkout

### Journey C: "It's service time, I need a full maintenance kit"
1. Land on homepage
2. Click "Bakım Robotu" or navigate to /bakim-robotu
3. Select vehicle (6 steps or from Garajım if logged in)
4. See full maintenance bundle: oil filter, air filter, pollen filter, fuel filter, brake pads
5. Add all to cart as a bundle
6. Checkout

### Journey D: "Returning customer, same car"
1. Login
2. Dashboard shows "Garajım" → select saved vehicle
3. Browse categories — all filtered for that vehicle automatically
4. Quick reorder or discover new needed parts
5. Checkout

### Journey E: "I don't know what my car needs — VIN lookup"
1. Find VIN plate (ruhsat / ön cam)
2. Enter 17-character VIN on /sase-sorgula
3. System decodes vehicle and shows exact compatible parts
4. Browse + add to cart

---

## 7. PROPOSED ADMIN JOURNEY

### Daily Operations
1. Login → dashboard overview (orders, low stock, revenue)
2. Process new orders (pick, pack, ship — update tracking)
3. Review low-stock alerts → trigger supplier orders
4. Update product prices (bulk import from supplier price lists)

### Product Management
1. Add new product → upload images, set OEM numbers
2. Link product to vehicle compatibility (many-to-many via vehicle database)
3. Set category, supplier brand, price, stock level
4. Publish

### Vehicle Database Management
1. Add new vehicle make/model/trim to database
2. Map vehicle variants to compatible parts
3. Keep year ranges current with new model releases

### Promotions
1. Create discount campaigns (% off, category deals)
2. Feature products on homepage
3. Manage seasonal maintenance kits

---

## 8. PROPOSED PAGE LIST

| Page | URL | Priority |
|---|---|---|
| Homepage | / | P0 |
| Category listing | /kategori/[slug] | P0 |
| Sub-category listing | /kategori/[parent]/[child] | P0 |
| Product detail | /parca/[slug] | P0 |
| Search results | /ara?q=... or /ara?arac=... | P0 |
| Cart | /sepet | P0 |
| Checkout | /odeme | P0 |
| Login | /giris | P0 |
| Register | /kayit | P0 |
| Vehicle brand page | /marka/[slug] | P1 |
| Supplier brand page | /uretici/[slug] | P1 |
| Maintenance kit tool | /bakim-robotu | P1 |
| VIN/Chassis lookup | /sase-sorgula | P1 |
| OEM search | /oem-ara | P1 |
| My Account dashboard | /hesabim | P1 |
| My Garage | /hesabim/garajim | P1 |
| Orders | /hesabim/siparislerim | P1 |
| Order detail | /hesabim/siparislerim/[id] | P1 |
| Favorites | /hesabim/favoriler | P1 |
| Addresses | /hesabim/adreslerim | P2 |
| Order tracking (guest) | /siparis-takip | P1 |
| Contact | /iletisim | P2 |
| Help / FAQ | /yardim | P2 |
| About | /hakkimizda | P3 |
| Privacy policy | /gizlilik | P2 |
| Terms | /kullanim-kosullari | P2 |
| Return policy | /iade-politikasi | P2 |
| Admin dashboard | /admin | P0 |
| Admin products | /admin/urunler | P0 |
| Admin orders | /admin/siparisler | P0 |
| Admin vehicles | /admin/araclar | P0 |
| Admin stock | /admin/stok | P1 |
| Admin customers | /admin/musteriler | P1 |
| Admin categories | /admin/kategoriler | P1 |

---

## 9. PROPOSED NAVIGATION STRUCTURE

### Desktop Header

```
[Logo]   [Vehicle Finder: Marka | Model | Kasa | Yıl | Motor | KW | 🔍 Ara]
         [↕ OEM/Parça No. ile ara toggle]

[Kategoriler ▾] [Araç Markaları ▾] [Üretici Markalar ▾] [Bakım Robotu] [Fırsatlar]
                                                                [🔍][♡][🛒2][👤]
```

**Kategoriler mega-menu:**
```
Fren             | Süspansiyon    | Debriyaj        | Motor & Yakıt
• Balata         | • Amortisör    | • Debriyaj Seti | • Hava Filtresi
• Fren Diski     | • Salıncak     | • Baskı Plakası | • Yağ Filtresi
• Kampana        | • Rot Başı     | • Triger Seti   | • Ateşleme
• ABS Sensörü    | • Viraj Demiri | ...             | ...

Elektrik         | Soğutma        | Kaporta         | Bakım Ürünleri
• Far            | • Radyatör     | • Ayna          | • Motor Yağı
• Stop Lambası   | • Su Pompası   | • Tampon        | • Antifriz
• Marş           | • Termostat    | • Cam           | • Fren Hidroliği
...              | ...            | ...             | ...
```

### Mobile Navigation

- Bottom tab bar: Ana Sayfa | Kategoriler | Ara | Sepet | Hesabım
- Hamburger for full category tree
- Persistent vehicle selection chip at top (after vehicle is selected)

---

## 10. PROPOSED PRODUCT SEARCH ARCHITECTURE

### Search Modes

**Mode 1: Vehicle-Based Search (Primary)**
- Input: 6-step cascading selectors (Marka → Model → Kasa → Yıl → Motor → KW)
- Output: All compatible parts for that vehicle, browsable by category
- Vehicle selection persists as a filter chip across all pages until cleared
- Vehicle saved to "Garajım" on login

**Mode 2: Text / OEM Number Search (Secondary)**
- Input: Free text OR OEM/part number (e.g., "0986424706", "Bosch balata Golf", "fren balatası")
- Output: Matching products + cross-reference suggestions
- Auto-suggest: part names, OEM numbers, vehicle-part combinations

**Mode 3: VIN/Chassis Lookup**
- Input: 17-character VIN
- Output: Vehicle identified → all compatible parts
- API-powered decoder (TecDoc, Auto-cat, or similar)

**Mode 4: Maintenance Kit Builder**
- Input: Vehicle selection (or from Garajım)
- Output: Curated maintenance bundle (filters + oil + pads)
- One-click "Add all to cart"

### Search Infrastructure Considerations

**Product Data Model:**
```
Product
├── id, slug, name (generic: "Arka Fren Balatası")
├── sku, oem_numbers[] (cross-references)
├── supplier_brand_id
├── category_id
├── price, stock_quantity
├── images[]
├── specifications (JSON: material, dimensions, etc.)
└── compatible_vehicles[] → VehicleVariant (many-to-many)

VehicleVariant
├── make → model → body_type → year_from → year_to → engine → kw
└── tecdoc_ktypnr (TecDoc key type number for cross-reference)
```

**Filtering on listing pages:**
- By vehicle (persisted from search or Garajım)
- By supplier brand (checkboxes)
- By price range (slider)
- By stock: In Stock / All
- By shipping: Free shipping
- By OEM brand (original / aftermarket)

**Sorting options:**
- Relevance (default when vehicle-filtered)
- Price: Low → High / High → Low
- Newest
- Best sellers
- Top rated

---

## 11. DESIGN DIRECTION FOR AKINEL YEDEK PARÇA

### Design Principles
- **Mobile-first** — most Turkish auto parts buyers use mobile
- **Speed** — parts buyers are task-focused; minimize friction
- **Trust** — professional, clean aesthetic conveys reliability
- **Clarity** — prices always visible, stock always clear, compatibility always confirmed

### Visual Identity Direction (do not copy reference)
- Color: Dark navy/anthracite as primary + orange/amber as accent (automotive premium feel)
- Typography: Clean sans-serif (e.g., Inter or Geist)
- Card design: Minimal, white cards with clear hierarchy
- Icons: Outline style, consistent
- Product images: White/light grey background, consistent framing

### Key UX Improvements vs. Reference
1. Show prices on listing cards (no AJAX hide)
2. Persistent vehicle context chip after search
3. Structured product data (not embedded in title)
4. Instant OEM search alongside vehicle search
5. Automated VIN lookup
6. Clean mobile navigation with bottom tabs
7. Review count visible on listing cards
8. Bundle/kit purchasing for maintenance
9. B2B / mechanic account type
10. Recently viewed products

---

*Analysis date: 2026-09-22*
*Reference: yedekparca.com.tr (analyzed for UX/IA reference only — no code, branding or content copied)*
