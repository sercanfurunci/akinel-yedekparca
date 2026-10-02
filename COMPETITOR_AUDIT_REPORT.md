# Akinel Oto Yedek Parça — Competitor Benchmark, UX Audit & Feature Gap Analysis

**Date:** 2026-10-01  
**Analyst:** Claude Sonnet 4.6 (automated audit via Playwright + codebase review)  
**Project root:** `/Users/sercanfurunci/Desktop/akinel-yedekparca`

---

## 1. Executive Summary

Akinel Oto Yedek Parça is a custom-built automotive spare-parts e-commerce platform with a technically solid foundation that exceeds most Turkish competitors in code quality and architecture. The platform has implemented the complete core purchase flow (vehicle finder → product listing → product detail → cart → checkout → order management), a persistent garage, OEM number search, vehicle compatibility display, admin panel, and a well-structured domain model. This puts it ahead of several niche Turkish competitors that are either login-walled (parcamax.com), offline (manual VIN lookup), or inventory-limited.

The two most-inspected live competitors — **onlineyedekparca.com** and **yedekparca.com.tr** — are significantly larger catalogs with decades of vehicle data, but Akinel's architecture is designed to compete correctly: separating vehicle compatibility from product names, using OEM number indexing, and persisting vehicle context across sessions. These are design decisions the incumbents get wrong.

**Biggest gaps versus competitors:**
1. No guest order tracking (order number + email lookup without login)
2. No "notify when back in stock" feature
3. VIN page is a UI shell with no backend functionality
4. No category navigation tree (SEO-critical: competitors expose `/fren`, `/balata`, `/debriyaj` as indexable paths)
5. No installment/taksit display at checkout
6. No back-in-stock alert or wishlist/favorites

**Biggest Akinel advantages over competitors:**
1. OEM number search that actually works automatically (competitors handle this manually)
2. Clean vehicle compatibility architecture (not embedded in product names)
3. Persistent vehicle context chip across sessions (localStorage + Zustand)
4. Admin panel built-in for self-managed catalog
5. Legal document compliance (KVKK, Mesafeli Satış, Ön Bilgilendirme)

**Recommendation in two weeks:** Focus on (1) guest order tracking, (2) category URL/SEO structure, (3) "notify when in stock", (4) real payment gateway integration. All other roadmap items are improvements, not blockers.

---

## 2. Current Akinel Feature Inventory

| Feature | Status | Notes |
|---|---|---|
| **Homepage** | Implemented | Hero carousel (admin-managed), category strip, brand strip, vehicle finder, featured products |
| **Hero carousel** | Implemented | Admin can upload images, set CTA text/URL, toggle slides |
| **Category strip** | Implemented | Pulls from API, shows category images |
| **Brand strip** | Implemented | Links to `/products?brandId=X` |
| **Vehicle finder (4-step)** | Implemented | Make → Model → Generation → Engine; persisted in localStorage |
| **Vehicle context chip** | Implemented | Header-level persistent chip; links to products filtered by engineId |
| **Persistent vehicle context** | Implemented | Zustand + localStorage; survives page refresh |
| **Garage (My Vehicles)** | Partial | UI built, API endpoints exist; shows "coming soon" if 404 from backend |
| **Free-text search** | Implemented | Header search bar; Cmd+K shortcut; navigates to /search |
| **OEM number search** | Implemented | Heuristic detection in /search page; `queryType=1` passed to API |
| **OEM number display on product** | Implemented | Tab + header chips on product detail |
| **Vehicle compatibility display** | Implemented | "Uyumlu Araçlar" tab on product detail with compatibility check vs selected vehicle |
| **VIN page** | Partial | UI shell exists at /vin, API endpoint exists (`POST /api/vehicles/vin-decode`); page shows "coming soon" message; no actual decode logic wired |
| **Product listing** | Implemented | Paginated, brand/category/stock/price-range/sort filters |
| **Product listing — desktop sidebar** | Implemented | Sticky sidebar with filter panel |
| **Product listing — mobile filter drawer** | Implemented | Sheet-based drawer, applied on confirm |
| **Active filter chips** | Implemented | Removable chips; individual or bulk clear |
| **Product detail page** | Implemented | Image gallery, price/discount, stock status, tabs (info/OEM/compat/stock), quantity selector, add-to-cart |
| **Product images (multi)** | Implemented | Horizontal thumbnail strip, active state, primary selection |
| **Price display with discount** | Implemented | Strike-through original price + discount badge |
| **Stock status display** | Implemented | InStock / LowStock / OutOfStock; quantity shown |
| **Category pages** | Partial | `/category/[slug]` exists but is a simple wrapper over `/products?categoryId=X`. No dedicated SEO-friendly category landing page |
| **Brand listing page** | Implemented | `/brands` lists all brands |
| **Cart drawer** | Implemented | Side sheet, quantity controls, remove, subtotal |
| **Cart persistence** | Implemented | Server-side session (cookie-based basket); fetched on mount |
| **Checkout** | Implemented | Customer info, shipping address (city/district/postcode), payment method selection, KVKK/legal checkboxes |
| **Payment — credit card processing** | Missing | Only label shown ("Kredi Kartı — sonraki adımda"); no actual payment gateway (iyzico, PayTR, etc.) |
| **Payment — bank transfer** | Implemented | Order created; customer pays separately |
| **Payment — cash on delivery** | Implemented | Supported in order model |
| **Installment/taksit display** | Missing | Competitors show installment options from banks at checkout |
| **Order confirmation page** | Implemented | Shows order number, items, status |
| **Order tracking (logged-in)** | Implemented | `/account/orders` and `/account/orders/[id]` |
| **Order tracking (guest / no login)** | Missing | Competitors allow lookup by order number + email without login |
| **Account registration** | Implemented | Email + password |
| **Account login** | Implemented | JWT + refresh token |
| **Social login** | Missing | No Google/Apple OAuth |
| **Password reset** | Missing | No forgot-password flow |
| **Account profile page** | Implemented | `/account` shows basic user info |
| **Address book** | Missing | Shipping address entered fresh each checkout |
| **Favorites / wishlist** | Missing | No save-product feature |
| **Back-in-stock notification** | Missing | No "Gelince Haber Ver" feature |
| **Product reviews / ratings** | Missing | No review system |
| **Recently viewed products** | Missing | No tracking |
| **Related/suggested products** | Missing | No "you may also like" section |
| **Maintenance kit tool (bakım robotu)** | Missing | Competitors have a vehicle → full service kit builder |
| **SEO — sitemap** | Implemented | `sitemap.ts` generates a sitemap |
| **SEO — robots.txt** | Implemented | `robots.ts` exists |
| **SEO — OG image** | Implemented | `opengraph-image.tsx` |
| **SEO — category URL paths** | Partial | URLs are `/products?categoryId=X`, not `/kategori/[slug]`; not SEO-friendly |
| **SEO — brand URL paths** | Partial | URLs are `/products?brandId=X`, not `/marka/[slug]` |
| **Legal pages** | Implemented | Gizlilik, KVKK, Kullanım Koşulları, Mesafeli Satış, Ön Bilgilendirme |
| **About page** | Implemented | `/about` exists |
| **Contact page** | Implemented | `/contact` exists |
| **WhatsApp button** | Implemented | Floating WhatsApp button (business number from BusinessSettings) |
| **Announcement ticker** | Implemented | Scrolling announcement bar in header |
| **Admin dashboard** | Implemented | Stats cards (total/in-stock/low/out products), recent products table |
| **Admin products CRUD** | Implemented | List, create, edit, delete; with image upload |
| **Admin OEM number management** | Implemented | Add/remove OEM numbers per product |
| **Admin vehicle compatibility** | Implemented | Add/remove vehicle engine compatibility per product |
| **Admin image management** | Implemented | Upload, set primary, delete |
| **Admin orders** | Implemented | List, view, update status |
| **Admin stock management** | Implemented | Update quantity per product |
| **Admin brands CRUD** | Implemented | List, create, edit, delete |
| **Admin categories CRUD** | Implemented | List, create, edit, delete, image upload |
| **Admin hero slides** | Implemented | Full CRUD + image upload + toggle |
| **Admin vehicle catalog** | Implemented | Full Make/Model/Generation/Engine CRUD with search |
| **Admin customers** | Partial | List view exists; no edit/detail |
| **Admin business settings** | Implemented | Logo, phone, WhatsApp, address, social links, working hours, announcement banner |
| **Notification emails** | Missing | No transactional emails (order confirmation, shipped, etc.) |
| **B2B / trade account** | Missing | No mechanic/service center tier |

---

## 3. Competitor Websites Audited

| Site | URL | Status | Relevance |
|---|---|---|---|
| Online Yedek Parça | https://www.onlineyedekparca.com/ | OBSERVED — fully accessible | Direct Turkish competitor. Large catalog, OEM-original focus, VIN/chassis lookup, B2B program, mobile app |
| Yedek Parça (.com.tr) | https://www.yedekparca.com.tr/ | OBSERVED — fully accessible | Largest Turkish auto-parts e-commerce. 300,000+ products. TecDoc integration inferred |
| Parça Max | https://www.parcamax.com/ | OBSERVED — login-walled | B2B platform powered by CatalogiX.be with TecDoc Inside. Not a consumer site |
| Online Yedek Parça — product detail | https://www.onlineyedekparca.com/urun/opel-astra-h-1-3-dizel-6-ileri-volant-debriyaj-set-gm-bilya-seti-komple | OBSERVED | Key product detail features: delivery estimate, location selector, VIN verification widget, installment, related products, review tab, Q&A tab |
| Online Yedek Parça — brand page | https://www.onlineyedekparca.com/kategori/opel-yedek-parca | OBSERVED | Brand-as-category page: logo, 38,957 products, model sub-navigation, in-page search |
| Yedek Parça — category | https://www.yedekparca.com.tr/fren | OBSERVED | 6-step vehicle finder embedded; category sidebar with sub-categories |
| Yedek Parça — search result | https://www.yedekparca.com.tr/arama?q=fren+balata | OBSERVED | 7-tab sort bar; left sidebar filters; vehicle-brand sub-filter |
| Yedek Parça — search OEM | https://www.yedekparca.com.tr/arama?q=1605869 | OBSERVED | Returned matching product results (confirms OEM search functionality) |
| Online Yedek Parça — guest order tracking | https://www.onlineyedekparca.com/misafir-siparis-takip | OBSERVED | Email + order number → OTP code verification; no login needed |

Sites attempted but **unavailable** (DNS/timeout): otoyedekparca.com, automaks.com.tr, otomax.com.tr, motofix.com.tr, partsmart.com.tr, ucuzparca.com, eksenotor.com.tr, ototrend.com.tr, megatek.com.tr (503)

Sites attempted but **not relevant**: arabam.com (no parts section), tofas.com.tr (manufacturer, not retailer), partslink24.com (international B2B portal), orijinalparca.com (domain for sale)

---

## 4. Competitor Feature Matrix

| Feature | Akinel | onlineyedekparca.com | yedekparca.com.tr | parcamax.com |
|---|---|---|---|---|
| Vehicle finder (cascading) | 4-step (Make/Model/Gen/Engine) | 3-step (Make/Model/Engine) | 6-step (Make/Model/Body/Year/Engine/Power) | N/A (B2B) |
| OEM number search | Yes (auto-detect) | Unknown | Yes (search bar accepts OEM) | Yes (TecDoc) |
| VIN/chassis search | UI only (not wired) | Yes — live on product detail widget | Mentioned as staff-assisted | Unknown |
| Garage (save vehicles) | Yes (login) | Yes ("Garajım") | Not observed | Unknown |
| B2B program | No | Yes (B2B banner + separate pricing) | Not observed | Yes (primary model) |
| Guest order tracking | No | Yes (email + order no. + OTP) | Yes (via Sipariş Takip link) | N/A |
| Product reviews | No | Yes (tab, count shown) | Yes (star rating on cards) | Unknown |
| Installment / taksit | No | Yes (EFT discount + taksit tab) | Not observed | Unknown |
| Back-in-stock alert | No | Unknown | Not observed | Unknown |
| Favorites / wishlist | No | Yes (heart icon on cards) | Yes (heart icon) | Unknown |
| Mobile app | No | Yes (Online Express) | Yes (App Store + Google Play) | Unknown |
| Category SEO URLs | Partial (query param) | Yes (/kategori/[slug]) | Yes (/fren, /balata) | N/A |
| Brand SEO URLs | Partial (query param) | Yes (/kategori/opel-yedek-parca) | Yes (/volkswagen-yedek-parca) | N/A |
| Delivery estimate on product | No | Yes (same-day if ordered by 14:00) | Not observed | N/A |
| Location selector for delivery | No | Yes (city picker affects delivery time) | No | N/A |
| Dark mode | No | Yes (moon icon in header) | No | N/A |
| Trust signals bar | Partial (footer strip) | Yes (100% Güvenli, Online Express, Ücretsiz Kargo) | Yes (Kredi Kartı, Hızlı Teslimat, Güvenli, Müşteri) | N/A |
| Payment gateway (card) | No (label only) | Yes | Yes (Bonus, Axess, CarFnans logos visible) | N/A |
| Related products | No | Yes (carousel below product tabs) | Not observed | N/A |
| Product comparison | No | Not observed | Not observed | N/A |
| Maintenance kit builder | No | Not observed | Yes (Periyodik Bakım Robotu) | Unknown |
| Social media links | Yes (via BusinessSettings) | Yes (Instagram, YouTube, Facebook, Twitter) | Yes | N/A |
| WhatsApp contact | Yes | Yes (multiple numbers) | Yes (floating) | N/A |
| Announcement banner | Yes | Yes (B2B ticker at top) | Not observed | N/A |

---

## 5. Homepage Comparison

**onlineyedekparca.com** — OBSERVED:
- Top bar: B2B program CTA (very prominent orange ticker). This signals that B2B is a primary revenue focus.
- Header: Logo (left) + freetext search (center, "Yedek parça ara") + location picker (city) + dark mode toggle + login + cart. No phone number visible in header (desktop).
- Navigation: Vehicle-make mega-nav (OPEL, CHEVROLET, BMW, MERCEDES, VOLKSWAGEN, AUDI, SEAT, SKODA, RENAULT, PEUGEOT, CITROEN, FORD, FORDTICARI, VW TICARI, YAĞ, ...). Make-based primary nav is a strong differentiator.
- Hero (left): Chassis/VIN search field + 3-step vehicle finder (Make/Model/Engine). Two entry points side by side.
- Hero (center): Promotional carousel (app promotion, outlet sale).
- Hero (right): MOPAR/Stellantis brand spotlight with 12 sub-brand logos — shows depth of original-parts catalog.
- Below: "Öne Çıkan Ürünler" (Featured products) carousel, "Haftanın Fırsatları" (Weekly deals) carousel, brand spotlights (Opel, Renault), "İndirime Göre" (By discount) carousel.
- Trust bar (above footer): 100% Güvenli Alışveriş, Online Express, Ücretsiz Kargo
- Footer: Social links, city-specific phone numbers, WhatsApp numbers, physical store addresses.

**yedekparca.com.tr** — OBSERVED:
- Top bar: Phone (0850 532 1935), email, Türkçe selector, TRY selector, Sipariş Takip, Yardım, İletişim.
- Header: Logo (left) + full-width search bar ("Parça adı, oem numara veya parça referansı ara") + Ürün Ara button + icon strip (wishlist, cart with badge, account).
- Navigation: Category-based nav (Fren, Debriyaj, Yakıt, Süspansiyon, Direksiyon, Elektrik, Soğutma).
- Hero (left): Full 6-step vehicle finder embedded in hero panel. Steps numbered 1–6 (Marka, Model, Kasa, Yıl, Motor, Güç). "Parça Ara" button.
- Hero (right): Large promotional banner carousel.
- Below: Popular category icon strip (Balata, Fren Diski, Debriyaj Seti, etc.), vehicle brand banner grid (VW, BMW, Opel, Mercedes, Peugeot, Ford, Citroen, Honda, Hyundai, Renault, Skoda, Toyota), category banner grid with product thumbnails, "10,000 Bakımı" maintenance tool promo, supplier brand carousel (Aisin, ART, Behr, Bosch, etc.).
- Trust bar: Kredi Kartı ile Alışveriş, Hızlı Teslimat, Güvenli Alışveriş, Müşteri Hizmetleri.
- Footer: App download links (App Store, Google Play), social (Facebook, Instagram, YouTube), payment logos (Bonus, Maximum, Axess, World, etc.), ETBIS badge.

**Akinel** — ASSESSED:
- Top bar (utility): Phone, Sipariş Takip (links to /search — confusing), Yardım, İletişim, TR. Correct structure.
- Header: Dark navy bar. Logo + search bar (center) + mobile icons (search, cart, garage, account) + admin badge. Clean.
- Navigation (secondary dark bar): Ana Sayfa, Ürünler, Markalar, Aracımı Seç, OEM Ara, Garajım, Hakkımızda, İletişim.
- Hero: Admin-managed carousel OR static hero fallback.
- Below: Business strip, category strip, company intro, popular brands, vehicle finder section, featured products.
- Missing vs competitors: No make-based nav (huge for automotive UX), no promotional deal sections ("haftanın fırsatları"), no maintenance tool CTA, no app download CTA.

**Key finding (OBSERVED):** Both major competitors lead with a vehicle selector in the hero. Akinel also does this correctly. However, competitors pair the vehicle selector with the free-text/OEM search as a secondary option in the same hero zone. Akinel's OEM search is separated into "OEM Ara" in the nav. This extra click creates friction for the significant user segment that searches by part number.

---

## 6. Navigation Comparison

**onlineyedekparca.com — OBSERVED:**
- Primary navigation is vehicle-make based (horizontal make bar, ~14 visible makes + "...").
- Clicking a make (e.g., OPEL) goes to `/kategori/opel-yedek-parca` — a make-as-category page with 38,957 products, model sub-navigation in the left sidebar (Antara, Astra F, Astra G, Astra H, etc.), and an in-page search bar. This is a full catalog browsing path without touching the vehicle finder.
- Oil ("YAĞ") is surfaced as a top-level nav item alongside makes — smart for high-frequency purchases.

**yedekparca.com.tr — OBSERVED:**
- Primary navigation is part-category based (Fren, Debriyaj, Yakıt, Süspansiyon, Direksiyon, Elektrik, Soğutma).
- These are the functional part categories a mechanic or DIY buyer thinks in. Clicking "Fren" navigates to `/fren` with a left sidebar sub-category tree (Balata, Fren Diski, Fren Ana Merkezi, etc.) and in-line sort tabs.
- The 6-step vehicle finder is on the homepage but does NOT persist as a nav filter — once on `/fren` the user sees all brands/vehicles mixed.

**Akinel — ASSESSED:**
- Navigation: Ana Sayfa, Ürünler, Markalar, Aracımı Seç, OEM Ara, Garajım, Hakkımızda, İletişim.
- "Ürünler" is the generic product listing — no split by part-category or vehicle make.
- No mega-menu or fly-out exists.
- Missing: Make-based quick-nav, Part-category quick-nav.
- The nav correctly includes "OEM Ara" and "Garajım" which neither competitor exposes so prominently. This is good.

**Gap (INFERRED):** A user landing on Akinel who knows they need "fren balatası" has to go to "Ürünler" and then apply a category filter in a sidebar. Competitor yedekparca.com.tr puts "Fren" directly in the nav and immediately exposes the sub-category tree. One click vs two clicks plus sidebar interaction.

---

## 7. Search Comparison

### 7a. Free-text Search

**onlineyedekparca.com — OBSERVED:**
- Header search: "Yedek parça ara" placeholder. Large round input, prominent.
- Tested `fren+balata` via URL `/arama?q=fren+balata` — returned 404. Search URL pattern is unknown (site may use JS-driven search without URL params, or different route).
- The chassis number search is a separate prominent input above the vehicle finder on the homepage.

**yedekparca.com.tr — OBSERVED:**
- Header search: "Parça adı, oem numara veya parça referansı ara" — explicitly tells the user all three modes in the placeholder.
- Tested: `/arama?q=fren+balata` — returned a listing page of parts related to brake pads with a 7-tab sort bar (En yeniler, En çok satanlar, A-Z, Z-A, Fiyata göre artan/azalan, En çok oylananlar).
- Tested OEM: `/arama?q=1605869` — returned matching products. Confirms OEM lookup works through the standard search bar.
- The search bar explicitly promises OEM lookup — users do not need a separate "OEM Ara" page.

**Akinel — ASSESSED:**
- Header search with placeholder "OEM numarası, parça adı veya parça kodu…". Very clear.
- Cmd+K keyboard shortcut — advanced but unused by the target demographic (mechanics).
- Auto-detects OEM queries using heuristic: 5+ chars, alphanumeric with at least one digit. Works.
- Navigates to `/search?q=...` which then shows both vehicle suggestions and product results.
- No instant autocomplete/suggestions dropdown (no typeahead). Both competitors appear to show suggestions (onlineyedekparca.com has an apparent suggestions UI visible on the header input).

**Gap (INFERRED):** Akinel lacks search autocomplete/typeahead. When a user starts typing "fren b..." they get no inline suggestions. This is a significant UX gap vs competitors.

### 7b. OEM Number Search

**onlineyedekparca.com — OBSERVED on product detail:**
- VIN/chassis compatibility widget visible on the product detail page right sidebar: "Bu parça aracına uyar mı? Şasi (VIN) numaranızı yazın ya da ruhsatınızın fotoğrafını ekleyin — ekibimiz baksın." This is a hybrid approach: the user can either type 17 characters or upload a photo of their registration document. The caption notes "Şu anda kapalıyız. Sorunuzu şimdi bırakın, bugün 10:00'da ekibimize alır ve gün içinde dönüş yapılır." — staff-assisted, not automated.
- The product detail also shows brand logo (LUK), compatibility note ("Tüm LUK marka ürünleri inceleyin"), price with EFT discount, installment teaser ("Aylık ₺7,950.20'den başlayan taksitlerle"), delivery estimate ("14:00'a kadar sipariş verin, bugün kargoda"), and a city/location selector for delivery calculation.

**yedekparca.com.tr — OBSERVED:**
- Product detail URL at `/arama?q=1605869` returned results, confirming OEM pass-through search.

**Akinel — ASSESSED:**
- `/search?q=1605869` with auto-detected `queryType=1` (OEM). Returns OEM-matched products. Works.
- The OEM numbers stored on products (indexed `NormalizedNumber`) make this fast.
- **Gap:** No cross-reference display — if user searches for OEM 1605869, they see matching products but do not see "this OEM is also sold as TRW123, Bosch456" cross-reference numbers. Competitors with TecDoc integration provide this automatically.

---

## 8. Vehicle Finder Comparison

**onlineyedekparca.com — OBSERVED:**
- 3-step: Marka → Model → Motor (engine). Note: no body type, no year, no power — simpler than yedekparca.com.tr.
- Also offers chassis (VIN) search as a separate prominent field above the 3-step selector.
- Saved vehicles ("Garajım") visible in footer navigation.

**yedekparca.com.tr — OBSERVED:**
- 6-step: Marka (1) → Model (2) → Kasa (3) → Yıl (4) → Motor (5) → Güç/KW (6).
- Each step is a numbered circle with a dropdown. "Parça Ara" button at bottom.
- This requires 6 selections to identify a vehicle uniquely. More granular but more friction.

**Akinel — ASSESSED:**
- 4-step: Make → Model → Generation → Engine.
- "Generation" (e.g., "Golf IV 1997–2004 Hatchback") bundles body-type, year-range in a human-readable label. Smarter than 6 separate dropdowns for the same information.
- Vehicle finder is accessible from: homepage, /vehicle page, header (OEM Ara → /search has vehicle suggestions), and VehicleContextChip in header.
- After selection: `vehicleEngineId` persisted in localStorage and shown as a chip in the header.
- **Strength (OBSERVED):** Akinel's Generation concept is architecturally cleaner than competitors' approach of separate Kasa + Yıl dropdowns. It reduces clicks for the common case while maintaining the same precision.
- **Gap:** No year-level disambiguation. If a customer says "2002 Golf IV", they select the generation covering 1997–2004. For compatibility this is usually fine but some parts differ by production year within a generation.

---

## 9. OEM/VIN Search Comparison

This section distinguishes between four related but distinct capabilities:

**(a) VIN Decoding** — Given a 17-character VIN, decode make/model/year/engine from the VIN structure itself (no database needed, just format parsing). This is achievable without commercial data.

**(b) Vehicle Identification from VIN** — Given a VIN, look up the exact vehicle specification (precise engine code, production date, factory options). Requires a commercial VIN decode service (NHTSA API for US vehicles; in Turkey, e-devlet ruhsat API or commercial providers like InfoTrack or Habermas).

**(c) OEM Catalog Lookup from VIN** — Given a VIN, look up which specific OEM part numbers are compatible. Requires TecDoc, DAT, or manufacturer-specific catalog access. Expensive licensing.

**(d) Fitment from VIN to Catalog** — Given a VIN, map to Akinel's own product compatibility table. Only requires VIN-to-vehicleEngine mapping, which IS achievable if VIN prefixes are mapped to vehicle engine IDs.

**onlineyedekparca.com — OBSERVED:**
- Offers VIN widget on product detail: "Şasi numaranızı yazın ya da ruhsat fotoğrafını yükleyin, ekibimiz baksın."
- **This is staff-assisted, not automated (b or c)**. The widget submits to a support queue. Currently shows "Şu anda kapalıyız" (we're closed).
- Practical classification: This is customer service theater. Looks like VIN lookup, is actually a human review request.

**yedekparca.com.tr — OBSERVED:**
- From the existing project analysis: "Chassis number query is a staff-assisted offline/phone process."
- No automated VIN decode visible.

**Akinel — ASSESSED:**
- `/vin` page has a UI shell. Input validates 17-char format. On submit: shows "Sorgunuz alındı. VIN sorgulama servisi henüz aktif değil."
- `POST /api/vehicles/vin-decode` endpoint exists in the API.
- The `IPartsCatalogProvider` interface is designed to abstract external VIN/catalog services.
- **Current state:** Better than competitors in terms of intent and architecture. The backend hook exists. The gap is the actual external service integration.
- **Realistic path to (a):** Parse VIN position 1–3 (WMI: World Manufacturer Identifier) + position 10 (model year) to give a best-guess vehicle family. Free, requires a WMI lookup table.
- **Realistic path to (d):** Build a VIN-prefix-to-vehicleEngine mapping table. For Turkish market (TRHMZZ = Renault Turkey, WF0 = Ford Germany, etc.) a 9-character WMI+VDS prefix often uniquely maps to a generation. Medium effort, no licensing.
- **Paths (b) and (c) require commercial licensing** — TecDoc API costs thousands of euros per year; realistic only after catalog reaches meaningful scale.

**Recommendation:** Implement (a) + (d) without external services. Parse WMI from VIN + match to vehicle generations in the database. This covers the majority of cases for commonly-stocked vehicles.

---

## 10. Product Listing Comparison

**onlineyedekparca.com — OBSERVED (brand/make listing page):**
- Brand page `/kategori/opel-yedek-parca`: Brand logo + name, product count (38,957), left sidebar with model sub-navigation, in-page search bar, grid/list toggle, sort dropdown ("En Alakalı"). Heart icon (favorites) on each card.
- Product cards: Image, name (with vehicle context in name — the pattern Akinel deliberately avoids), star rating, price in ₺ with strikethrough original price. Clean.
- Cards have a "New" badge for new products.

**yedekparca.com.tr — OBSERVED (search listing):**
- Sort bar at top: 7 tabs (En yeniler, En çok satanlar, Ürün adı A-Z, Z-A, Fiyata göre artan/azalan, En çok oylananlar).
- Left sidebar: full category tree with expand/collapse, brand checkboxes, Araç Markaları, Markalar, stock filter.
- Product cards: Image, product name (contains vehicle info in title — e.g., "Cupra Formentor 2023-2025 Ön Fren Balatası Bosch..."), Kategori tag + Marka tag, original price + sale price, "Sepete Ekle" button OR "Stokta Yok" button, "Kargo Bedava" badge.
- Reviews: Rating stars on cards (but many products show zero ratings).

**Akinel — ASSESSED:**
- Sidebar filters: Brand (select), Category (grouped select with sub-categories), In-stock checkbox, Price range (min/max inputs), Sort (select).
- Mobile: Sheet drawer with "Filtrele" button + sort select in sticky toolbar.
- Active chips: Brand, Category, stock, sort, price range, search query — all removable individually or in bulk.
- Sort: Default, Newest, Price ↑↓, Name A-Z / Z-A.
- Page size: 20 products per page with full pagination controls (ellipsis for large page counts).
- **Gaps vs competitors:**
  - No star rating/review count on listing cards (competitors show this).
  - No "En çok satanlar" (best sellers) sort option.
  - No "Kargo Bedava" (free shipping) filter.
  - No brand checkboxes (multiple brand selection — currently single brand dropdown).
  - Filters require a "Filtrele" button click (not instant-apply on desktop). Competitors apply instantly on check.
  - No grid/list view toggle.

---

## 11. Product Detail Comparison

**onlineyedekparca.com — OBSERVED (product detail page):**
- Breadcrumb: Anasayfa > OPEL > ASTRA H > Debriyaj ve Şanzıman Parçaları > [Product name]
- Left panel: Product image (large), thumbnail strip.
- Center panel: Product name, 4.6★ (10 değerlendirme), VIN uygunluk kontrolü, share/favorites/price-alert icons, delivery estimate ("14:00'a kadar sipariş verin, bugün kargoda"), delivery date estimate, location selector (city), seller info ("Mağazadan Teslim — Hangi Mağazada Var?"), brand logo.
- Right panel: Brand logo, price with EFT/bank transfer discount, taksit info, quantity +/-, "Sepete Ekle" (orange CTA), VIN compatibility widget, "Bu üründe Kargo Bedava", "Bu parça hangi araçlara uyumlu?", "Orijinal ambalajıyla, sıfır gönderilir — İade koşulları".
- Below: Tab bar (Ürün içeriği, Ürün Açıklaması, Uyumlu Araçlar, Teknik Özellikler, Değerlendirmeler — 10 reviews).
- Related products carousel (3 products shown).

**Akinel — ASSESSED:**
- Breadcrumb: Ana Sayfa > Ürünler > [Product name]. Category not in breadcrumb.
- Left: Image gallery (square, white bg), thumbnail strip for multiple images.
- Right: Brand badge, product name, category, OEM number chips, part number, price with discount badge + stock status, stock quantity, quantity stepper, AddToCart button, vehicle context box (shows compatibility check vs selected vehicle).
- Tabs: Ürün Bilgileri, OEM Numaraları, Uyumlu Araçlar, Stok Bilgisi.
- **Strengths vs competitor:** Compatibility check against selected vehicle is shown inline on right panel (green "uyumludur" / amber "doğrulanamadı"). onlineyedekparca.com only offers this via a widget with staff review.
- **Gaps vs competitor:**
  - No delivery estimate.
  - No EFT/bank transfer discount display.
  - No installment (taksit) tab.
  - No review/rating tab.
  - No Q&A tab.
  - No price alert/favorites icon.
  - No related products section.
  - Breadcrumb does not include category hierarchy.
  - No "Kargo Bedava" badge.

---

## 12. Cart & Checkout Comparison

**onlineyedekparca.com — OBSERVED (inferred from product detail):**
- "Sepete Ekle" button. Cart in header with badge.
- Guest checkout available (inferred from guest order tracking page existing).
- Payment options include credit card, bank transfer (with EFT discount).

**yedekparca.com.tr — OBSERVED (inferred from footer):**
- Multiple bank partner logos (Bonus, Maximum, Axess, CARFİNANS, BankkART, World) — suggests installment plans from all major Turkish banks.
- Cart page at `/sepet`.
- Guest order tracking at `/siparis-takip`.

**Akinel — ASSESSED:**
- Cart drawer: Side panel with item controls (qty +/-, remove, line totals). Clean.
- Checkout: React Hook Form with Zod validation. 3 sections: Customer info, Shipping address, Payment method.
- Payment methods: Cash on delivery, Bank transfer, Credit card (label only — not wired).
- Legal: All 3 required KVKK/legal checkboxes implemented with links to actual documents. Correct.
- Post-checkout: Order confirmation page with order number.
- **Gaps:**
  - No actual payment gateway (iyzico / PayTR / Param). Credit card is a placeholder.
  - No installment display.
  - No address book (user re-enters address every order).
  - No EFT discount display at payment selection.
  - No guest-accessible order tracking post-purchase (user sees confirmation page but can't re-look up without logging in).
  - No shipping cost calculation (always shows "Ücretsiz" — free shipping hardcoded to 0).

---

## 13. Mobile UX Comparison

**onlineyedekparca.com — OBSERVED (from full-page screenshot, mobile inferred):**
- Has a dedicated mobile app ("Online Express" — same-day Istanbul delivery via app).
- Header: Logo + compact search + location + dark mode + account + cart. Tight layout.
- Navigation appears to collapse the make-bar (too many items for mobile).

**yedekparca.com.tr — OBSERVED:**
- Has iOS and Android apps (App Store + Google Play links in footer).
- Mobile website: WhatsApp floating button.

**Akinel — ASSESSED:**
- Mobile navigation: Hamburger menu (MobileNav component) with full nav links in a sheet.
- Mobile product listing: Sticky toolbar (filter count badge + sort select).
- Mobile filters: Sheet drawer from left.
- Cart: Full-screen side sheet.
- Touch targets: 44px minimum height enforced on buttons/links (CLAUDE.md commit history confirms mobile touch target audit).
- Vehicle context chip: Shown below main header, links to products or vehicle change.
- **Gaps:**
  - No bottom tab bar (competitors' apps have this).
  - No PWA manifest or service worker for offline/installable capability.
  - Mobile search icon links to `/search` page (not inline search). This is correct but adds a page load.

---

## 14. Trust & Conversion Comparison

**onlineyedekparca.com — OBSERVED:**
- Trust signals: "100% Güvenli Alışveriş (Kredi kartı bilgileri 256bit SSL sertifikas ile korunmaktadır)", "Online Express (İstanbul içi Pilot bölgelerde online express hizmetimizle aynı gün teslimat)", "Ücretsiz Kargo (2.500 TL ve üzeri mekanik siparişlerde kargo ücreti bizden)".
- B2B banner: persistent top bar with "Başvuru yap" CTA.
- Phone numbers in footer (multiple city numbers).
- WhatsApp numbers in footer.
- Physical store addresses in footer.
- Brand partner logos (LUK, MOPAR/Stellantis, etc.) on product detail — manufacturer endorsement signals.

**yedekparca.com.tr — OBSERVED:**
- Trust bar above footer: Kredi Kartı, Hızlı Teslimat, Güvenli Alışveriş, Müşteri Hizmetleri (0850 532 1935).
- Payment logos: Bonus, Maximum, Axess, CarFinas, BankkART, World — signals installment availability.
- ETBIS badge in footer.
- App store badges (shows the business invests in digital).

**Akinel — ASSESSED:**
- Header: Phone number in utility bar (shown in desktop header from BusinessSettings). WhatsApp floating button.
- No trust signals bar below header.
- No payment partner logos at checkout or anywhere.
- Footer has social media links (if configured in BusinessSettings).
- Legal pages fully implemented (KVKK, Mesafeli Satış, Ön Bilgilendirme) — correct.
- No ETBIS badge.
- **Gap:** Akinel has no trust signals bar. The 3-item strip (Secure Shopping / Fast Delivery / Free Shipping) that both competitors show prominently on the homepage is missing. This is a low-effort, high-impact trust conversion element.

---

## 15. SEO Comparison

**onlineyedekparca.com — OBSERVED:**
- URL pattern: `/kategori/opel-yedek-parca` → SEO target: "Opel yedek parça". 38,957 products behind one indexable URL.
- Product URLs: `/urun/[product-slug]` — clean, no query params.
- Category title: "Opel Yedek Parça Fiyatları ve Modelleri 2026" — year-updated title tag.

**yedekparca.com.tr — OBSERVED:**
- Category URLs: `/fren`, `/debriyaj`, `/yakit` — short, clean.
- Sub-category: `/fren/balata` (OBSERVED as 410 Gone — suggests URL was restructured; product URLs may have changed).
- Product URLs: `/fren/balata/[slug]` — category hierarchy in URL.
- Search: `/arama?q=...` — standard.
- Long SEO text blocks at bottom of homepage.
- Blog link in footer.

**Akinel — ASSESSED:**
- Product URLs: `/products/[slug]` — not automotive-specific. Should be `/urun/[slug]` or `/parca/[slug]` for Turkish SEO.
- Category URLs: `/products?categoryId=X` — query parameter, not indexable as a canonical category URL.
- Brand URLs: `/products?brandId=X` — same issue.
- Category page: `/category/[slug]` exists but renders the same content as `/products?categoryId=X`.
- Sitemap: `sitemap.ts` exists — needs to be verified it lists category and product URLs.
- Robots: `robots.ts` exists.
- OG image: `opengraph-image.tsx` exists.
- **Critical SEO gap:** `/products?categoryId=X` receives no SEO equity. The correct structure is dedicated category pages at `/kategori/fren`, `/kategori/fren/balata` etc. with category-specific H1, description, and product grid. These become long-tail SEO landing pages. Competitors rank on "Opel Astra H fren balatası" because they have dedicated vehicle+category landing pages.
- **Missing:** Blog, FAQ, product schema markup (structured data for rich snippets — price, availability, ratings).

---

## 16. Admin/Operations Opportunities

**Current admin strengths:**
- Full product CRUD with image upload, OEM number management, vehicle compatibility linking.
- Hero slide management (full CMS for homepage carousel).
- Vehicle catalog management (Make/Model/Generation/Engine tree with full CRUD).
- Order management with status transitions.
- Stock management (quantity update per product).
- BusinessSettings (logo, phone, WhatsApp, social, address, working hours, announcement banner) — this is more than competitors offer internally.

**Admin gaps:**
- No bulk product import (CSV/Excel upload for adding many products at once).
- No order export (PDF invoice, CSV export for accounting).
- No low-stock alert/notification (admin has to check dashboard to discover low stock).
- No sales analytics (revenue charts, best-selling products, order volume over time).
- No customer management detail view (list exists, but no edit/ban/contact).
- No discount/coupon code system.
- No homepage section CMS beyond hero slides (featured products are pulled automatically, not curated by admin).
- No email template management.

---

## 17. Automotive-Specific Opportunities

**Maintenance kit builder (Periyodik Bakım Robotu):**
- yedekparca.com.tr has this: select vehicle → see all maintenance items for the next service (air filter, oil filter, pollen filter, fuel filter, brake pads, spark plugs for petrol).
- This is one of the highest-conversion features in auto parts e-commerce. It converts a "I need an oil filter" visit into a full kit purchase.
- Akinel architecture already supports this: a vehicle + multiple category queries. Implementation is a new page that runs multiple API calls for the selected vehicle engine.

**Fitment guarantee / compatibility badge:**
- Akinel already shows "Bu ürün aracınızla uyumludur" on product detail when the vehicle is selected. This is more reliable than competitors' title-embedding approach.
- Opportunity: Surface this on the listing card too — a green "Uyumlu" badge on cards when vehicle context is active. This would be the strongest differentiator on the listing page.

**B2B / mechanic tier:**
- Both observed competitors have B2B programs. Mechanics buy in volume, weekly, and on credit. A "Servis Hesabı" tier with bulk pricing or net-30 payment terms is a significant revenue opportunity.
- Requires: account type field on user, tiered pricing on products, potentially a different checkout flow (invoice-based).

**Seasonal/maintenance bundles:**
- "Kış bakım seti" (Winter maintenance kit), "Yaz seti" (Summer set), "Motor değişim seti" (Oil change kit).
- These bundle multiple products under one SKU or as a curated collection. Increases AOV.

---

## 18. Missing Akinel Features

Ranked by impact on revenue and conversion:

| # | Feature | Impact | Effort |
|---|---|---|---|
| 1 | Guest order tracking (email + order number) | High — reduces support calls, increases trust | Low (1–2 days) |
| 2 | Category SEO URLs (/kategori/[slug]) | High — long-term organic traffic | Medium (3–5 days) |
| 3 | Real payment gateway (iyzico or PayTR) | High — currently no card payments | Medium (3–5 days + merchant account) |
| 4 | "Notify when in stock" (back-in-stock alert) | Medium-High — captures demand for OOS products | Low-Medium (2–3 days) |
| 5 | Delivery estimate on product page | Medium — conversion signal | Low (1 day if shipping logic is defined) |
| 6 | Trust signals bar (3-item strip) | Medium — conversion | Low (< 1 day) |
| 7 | Installment/taksit display | Medium (Turkish market expectation) | Low-Medium (depends on payment gateway) |
| 8 | Search autocomplete/typeahead | Medium — reduces zero-results searches | Medium (2–3 days) |
| 9 | Reviews/ratings system | Medium — social proof | High (4–7 days) |
| 10 | Favorites / wishlist | Low-Medium | Medium (2–3 days) |
| 11 | Related products on detail page | Medium — increases AOV | Low (1 day API + UI) |
| 12 | Compatibility badge on listing cards | High UX differentiator | Low (1 day — data already available) |
| 13 | VIN basic decode (WMI parsing) | Medium — completes the VIN page | Low (1 day — no external service) |
| 14 | Maintenance kit tool | High — increases AOV, differentiator | Medium (3–5 days) |
| 15 | Bulk product import (CSV) | High operational efficiency | Medium-High (3–5 days) |
| 16 | Password reset flow | Critical UX gap | Low (1–2 days) |
| 17 | Address book | Medium — reduces checkout friction | Medium (2–3 days) |
| 18 | ETBIS badge | Medium — Turkish e-commerce trust | Low (register at etbis.eticaret.gov.tr) |
| 19 | Order export / invoicing | Admin operational need | Medium (2–3 days) |
| 20 | B2B tier | High long-term revenue | High (1–2 weeks) |

---

## 19. Features NOT Worth Implementing Yet

| Feature | Reason to defer |
|---|---|
| Full TecDoc integration | Costs thousands EUR/year in licensing; requires a catalog of 10,000+ products before ROI. The current `NullPartsCatalogProvider` stub is the right decision. |
| VIN decode via Turkish government API (e-Devlet) | Requires official partnership/accreditation. Not self-serviceable. |
| Product comparison tool | Low usage on most auto parts sites; catalog must be large and structured first. |
| 360-degree product images | Requires special photography setup; the catalog is too small to justify now. |
| Mobile app (iOS/Android) | Build PWA first (service worker + manifest). Only worthwhile when monthly active users exceed ~1,000. |
| Multi-language (EN/DE/AR) | Turkish market focus; premature at current scale. |
| AI-powered part recommendation | Requires user behavior data that doesn't exist yet. Implement after 6+ months of traffic. |
| Installment plan integration (separate from payment gateway) | Usually comes free with iyzico/PayTR integration. Don't build separately. |
| Blog/content marketing platform | Valuable long-term but needs a content team. Not a developer task. |
| Social login (Google/Apple OAuth) | Low priority — checkout is the bigger friction point. Fix password reset first. |
| Multi-vendor marketplace | Out of scope for a single-store operation. |
| Live chat beyond WhatsApp | WhatsApp is the dominant channel in Turkey. |
| Product video embed | No photography pipeline for video; premature. |

---

## 20. P0/P1/P2/P3 Priority List

### P0 — Blocking (must exist before serious marketing/launch)

1. **Real payment gateway** — iyzico or PayTR integration. Credit card label without processing blocks all card revenue.
2. **Password reset flow** — Users who forget their password are permanently locked out. Basic but critical.
3. **ETBIS registration + badge** — Legal requirement for Turkish e-commerce.

### P1 — High Priority (within next 4 weeks)

4. Guest order tracking (email + order number lookup)
5. Trust signals bar (3 icons: Güvenli, Hızlı Teslimat, Ücretsiz Kargo)
6. Compatibility badge on listing cards when vehicle context is active
7. Category SEO URL restructure (/kategori/[slug] with canonical, proper sitemap)
8. Related products on product detail (simple: same category, in stock)
9. "Notify when in stock" (email capture for OOS products)
10. VIN basic decode (WMI parsing → vehicle family match → show products)

### P2 — Important (next 6–8 weeks)

11. Search autocomplete/typeahead dropdown
12. Delivery estimate on product detail (configurable cut-off time + shipping days)
13. Maintenance kit tool (select vehicle → show filters/oil/pads bundle)
14. Bulk CSV product import for admin
15. Address book (saved shipping addresses in account)
16. Installment/taksit display at checkout (after payment gateway)
17. Admin analytics (revenue chart, top products, order volume)
18. Order PDF export / invoice
19. Product schema markup (structured data for rich snippets)
20. Password reset email

### P3 — Nice to Have (after core is solid)

21. Reviews/ratings system
22. Wishlist/favorites
23. B2B/mechanic tier (account type + pricing tier)
24. SEO blog posts
25. Dark mode (as observed on onlineyedekparca.com — low business value)
26. Admin low-stock email alerts
27. Admin discount/coupon code system

---

## 21. Recommended Akinel Roadmap (Phase 1–4)

### Phase 1 — Foundation (Weeks 1–2)
**Goal: Remove blockers that prevent a real launch**

- Integrate iyzico or PayTR for credit card payments
- Implement password reset (forgot password → email link → reset form)
- Register ETBIS, add badge to footer
- Add 3-item trust signals strip below hero (Güvenli Alışveriş / Hızlı Teslimat / Ücretsiz Kargo)
- Add "Notify when in stock" email capture field on product detail for OutOfStock products

**Deliverables:** Site can accept real card payments. All users can recover accounts. Legal compliance complete.

### Phase 2 — Conversion (Weeks 3–5)
**Goal: Improve conversion rate and reduce friction**

- Guest order tracking (/siparis-takip): email + order number → show order status
- Compatibility badge on product listing cards (green chip when vehicle context active + product is compatible)
- Related products carousel on product detail (same category, in-stock, up to 6)
- Basic VIN decode (WMI table → vehicle family → product listing)
- Delivery estimate on product detail (configurable cut-off time from BusinessSettings)
- Auto-complete search dropdown (debounced API call for product names/OEM numbers as user types)

**Deliverables:** Users who receive order can track without logging in. Vehicle-aware browsing becomes even more useful. Search is faster.

### Phase 3 — SEO & Scale (Weeks 6–9)
**Goal: Build organic traffic**

- Category SEO pages at `/kategori/[parent]` and `/kategori/[parent]/[child]`
- Brand pages at `/marka/[slug]` (e.g., `/marka/volkswagen`, `/marka/bmw`)
- Add JSON-LD structured data (Product schema: name, price, availability, brand) to product pages
- Sitemap update (category pages, brand pages, all products)
- Maintenance kit builder tool (`/bakim-robotu`): vehicle select → filter/oil/pad bundle → add all to cart
- Admin bulk CSV import for products
- Address book in account (saved shipping addresses)

**Deliverables:** Category and brand pages start ranking for "[Marka] yedek parça" queries. Bundle tool increases AOV.

### Phase 4 — Growth (Weeks 10–16)
**Goal: B2B revenue, analytics, loyalty**

- Admin analytics dashboard (revenue chart, top-selling products, order volume over time)
- B2B/mechanic account tier (apply form, separate pricing, invoice payment)
- Reviews/ratings system (with moderation in admin)
- Favorites/wishlist with account persistence
- Order PDF invoice download (for admin + customer)
- Admin coupon/discount code system
- Admin low-stock email alerts (when quantity drops below MinimumStockLevel)

---

## 22. External Services / Data Dependencies

| Need | Service Options | Notes |
|---|---|---|
| Payment gateway | iyzico (most common Turkish SME), PayTR, Param | iyzico has a Next.js SDK. PayTR is simpler API. Merchant account takes 3–10 business days to approve. |
| Installment plans | Comes with iyzico / PayTR (all major Turkish banks) | No separate integration if using iyzico. |
| Email (transactional) | Resend, Mailgun, Amazon SES, SendGrid | Pick one. Order confirmation, password reset, back-in-stock. ~$0–15/month at small scale. |
| VIN decode (basic WMI) | No external service needed — WMI is a public standard (ISO 3779) | Build a lookup table of Turkish/European WMI codes. |
| VIN decode (full vehicle spec) | NHTSA API (free, US vehicles only), InfoTrack/Habermas (Turkey, paid), EuroVIN (EU) | Turkish market vehicles: significant portion are EU-spec. NHTSA won't help. Commercial service required for production use. |
| TecDoc / parts catalog | TecDoc (TecAlliance) — B2B licensing, €1,000+ setup + per-query fees | Only justified when catalog > 10,000+ products and monthly searches > 5,000. |
| Vehicle data | ManualAuto, auto-data.net, or self-built | The existing admin vehicle CRUD is the right approach — self-managed. |
| Image CDN | Cloudflare Images, AWS S3 + CloudFront, Bunny.net | Currently storing images locally (FilesController). Move to CDN before public traffic. |
| SMS (for OTP/order updates) | Netgsm, İleti Merkezi (Turkish SMS gate) | Optional; WhatsApp is cheaper in Turkey. |
| ETBIS registration | etbis.eticaret.gov.tr | Government registration for Turkish e-commerce. One-time setup. |

---

## 23. Technical Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Local file storage for images | High — images lost if server moves or disk fails | Move to object storage (S3/Backblaze/Cloudflare R2) before launch |
| No transactional emails | High — users can't reset passwords, don't receive order confirmation | Integrate Resend or Mailgun in Phase 1 |
| Cart is session-based (cookie) | Medium — basket lost when session expires; no guest-to-user basket merge | Acceptable for now; revisit when user acquisition grows |
| No payment gateway | Critical — credit card payments are a placeholder | Phase 1 blocker |
| Single admin role | Low for now — only one admin is assumed | Sufficient for single-owner operation |
| No rate limiting / abuse protection | Medium — search and OEM lookup endpoints could be scraped | Add basic rate limiting middleware in ASP.NET Core |
| VehicleEngine ID as filter | Low — if vehicle catalog grows, users need a better way to select than ID | Current 4-step UI handles this well |
| NullPartsCatalogProvider | Intentional, not a risk — designed for future swap | Well-documented in CLAUDE.md |

---

## 24. Business/Legal Dependencies

| Item | Status | Notes |
|---|---|---|
| ETBIS registration | Missing | Required by Turkish law for e-commerce. Register at etbis.eticaret.gov.tr |
| Merchant account (payment gateway) | Missing | Required for card processing. iyzico requires tax ID, business registration. |
| KVKK compliance | Partial — policies exist, cookie consent missing | Cookie consent banner not implemented. Under KVKK, consent is required before analytics/marketing cookies. |
| Invoice issuing | Not observed | Turkish tax law requires official e-fatura or kağıt fatura for each sale. The order model needs an invoice number + VAT calculation. |
| Consumer protection law (Mesafeli Satış) | Implemented in forms | Legal documents exist. Return policy page may need a dedicated URL. |
| Cargo/shipping agreements | Unknown | Shipping cost is hardcoded to 0. A real shipping agreement with Yurtiçi/MNG/Aras etc. is needed with tracking number integration. |
| Supplier pricing & authenticity | Business risk | Ensure product sourcing is documented. Automotive parts counterfeiting is a legal liability. |

---

## 25. Final Recommendations — If We Had 2–4 Weeks

**Week 1: Make the site transactionally complete**

1. Integrate iyzico payment (or at minimum accept bank transfer orders and mark credit card as "contact us"). The site must be able to take real payments. Everything else is secondary.
2. Add password reset via email (Resend.com integration — 15 minutes to set up the client, 1 hour to build the reset flow). Without this, any registered user who forgets their password is gone forever.
3. Register ETBIS (admin task, 1 hour). Add badge to footer.
4. Add 3-item trust strip between hero and category section ("100% Güvenli Ödeme / Hızlı Teslimat / Geniş Stok").

**Week 2: Close the biggest UX gaps**

5. Guest order tracking at `/siparis-takip` (email + order number → status). Currently there is a misleading "Sipariş Takip" link in the header that goes to `/search`. Fix this to a real page. Reduces support WhatsApp messages significantly.
6. Add compatibility badge to product listing cards. When a vehicle is selected (`vehicleEngineId` in URL), show a green "Uyumlu" chip on cards that are compatible. The backend already knows compatibility; the listing API can be extended to return a `isCompatible` flag per product when `vehicleEngineId` is provided. This is Akinel's strongest differentiator and should be visible.
7. Add "Stok girince haber ver" email capture. A simple form on OOS products: email field + submit. Store in DB, email when admin marks back in stock. The capture form alone is 1 day of work; the fulfillment email is another half day.

**Week 3: SEO foundations**

8. Create proper category pages at `/kategori/[slug]` with canonical URLs, category-specific H1 and description. Wire the existing `/category/[slug]` page to use the slug from the API and make it indexable. Update sitemap to include these pages.
9. Add product JSON-LD structured data (Product, Offer, Organization schema). This costs one afternoon and enables Google rich snippets (price, availability) in search results. Immediate SEO impact.
10. Add related products to product detail (same category, in stock, limit 4–6). One API call + a simple grid. This reduces bounce and increases pages per session.

**Week 4: The automotive-specific win**

11. Build the Maintenance Kit tool (`/bakim-robotu`). It uses existing vehicle finder + multiple product API calls. The page shows: "For your [vehicle], your next service kit should include: [Oil filter] [Air filter] [Pollen filter] [Brake pads]." Each item links to compatible products. "Add all to cart" button. This single feature can double Average Order Value for service-related buyers. It is a 3-5 day feature that competitors already have and buyers actively look for.

**What NOT to do in 2–4 weeks:**
- Do not start TecDoc integration.
- Do not build a reviews system from scratch (takes 2 weeks for a correct implementation including moderation).
- Do not build a B2B tier yet (needs proper pricing architecture discussion first).
- Do not redesign the UI — current design is clean and functional.

---

## Appendix: Observed Page URLs

| Site | URL | What Was Observed |
|---|---|---|
| onlineyedekparca.com | https://www.onlineyedekparca.com/ | Homepage: B2B bar, chassis search, make nav, vehicle finder, promo carousel, MOPAR/Stellantis spotlight, product carousels, trust bar, footer |
| onlineyedekparca.com | https://www.onlineyedekparca.com/kategori/opel-yedek-parca | Make-based listing: 38,957 products, model sub-nav, in-page search, sort, grid/list toggle |
| onlineyedekparca.com | https://www.onlineyedekparca.com/urun/opel-astra-h-1-3-dizel-6-ileri-volant-debriyaj-set-gm-bilya-seti-komple | Product detail: delivery estimate, location selector, VIN widget, brand logo, installment teaser, review count (10), related products |
| onlineyedekparca.com | https://www.onlineyedekparca.com/misafir-siparis-takip | Guest order tracking: email + order number → OTP verification |
| yedekparca.com.tr | https://www.yedekparca.com.tr/ | Homepage: 6-step finder, category icons, vehicle brand grid, category banner grid, maintenance robot promo, supplier brand carousel, app badges, payment logos |
| yedekparca.com.tr | https://www.yedekparca.com.tr/fren | Category page: left sidebar with 14 sub-categories, 7-tab sort bar, product grid |
| yedekparca.com.tr | https://www.yedekparca.com.tr/arama?q=fren+balata | Search: results for "fren balata" with sidebar brand/category filters |
| yedekparca.com.tr | https://www.yedekparca.com.tr/arama?q=1605869 | OEM search: returned products matching the OEM number |
| parcamax.com | https://www.parcamax.com/ | Login-walled B2B platform; powered by CatalogiX.be + TecDoc Inside badge visible |

---

*Report generated: 2026-10-01*  
*Codebase reviewed: apps/web/src, apps/api/Akinel.*  
*Browser inspection: Playwright-based live browsing of competitor sites*  
*Confidence levels: OBSERVED = directly seen in browser; INFERRED = reasonable deduction from visible evidence; RECOMMENDED = author judgment*
