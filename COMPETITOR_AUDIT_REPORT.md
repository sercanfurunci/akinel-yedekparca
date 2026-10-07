# Akinel Oto Yedek Parça — Competitor Audit Report

**Date:** 2026-10-05
**Analyst:** Claude Sonnet 4.6 (automated audit — codebase review + competitor research)
**Project root:** `/Users/sercanfurunci/Desktop/akinel-yedekparca`
**Competitors audited:** otoparcasan.com, onlineyedekparca.com

---

## 1. Executive Summary

Akinel is a functional automotive spare-parts e-commerce platform built on a modern stack (Next.js 15, ASP.NET Core 10, PostgreSQL). However, compared with the two leading Turkish competitors, Otoparcasan and OnlineYedekParca, Akinel is missing a significant number of conversion-driving, SEO-critical, and discovery-enabling features.

The most critical gaps are:

1. **No "Oto Bakım ve Yağlar" category** — oil and maintenance products are a high-frequency, high-margin segment that both competitors prioritise heavily. Its absence in Akinel's category tree is a direct revenue gap.
2. **No model-level pages** — competitors have deep `/brand/model` URL trees generating thousands of SEO-indexed pages. Akinel only has brand-level pages (`/marka/[slug]`), missing an entire tier of long-tail organic traffic.
3. **No SEO footer link columns** — the industry standard footer contains Popüler Markalar / Popüler Araçlar / Popüler Modeller / Popüler Kategoriler link blocks. These columns contribute directly to crawl depth and PageRank distribution.
4. **Homepage popular-brand cards with model links** — both competitors surface clickable model lists on the homepage. Akinel shows only pill buttons.
5. **No periyodik bakım robotu / maintenance tool** — Otoparcasan's Bakım Robotu is a major differentiator for average-order-value and repeat usage.
6. **VIN search uses NHTSA (US data)** — wholly inadequate for the Turkish market. Turkish vehicles are not in the NHTSA database.
7. **No installment/taksit information** — a fundamental purchase-decision factor in the Turkish e-commerce context.

The 15 capability gaps, their priorities, and exact implementation specs are detailed in Section 13. Section 14 provides a complete proposed homepage and vehicle-discovery structure.

---

## 2. Otoparcasan.com — Deep Audit

### 2.1 Homepage Structure (section by section)

The Otoparcasan homepage is built around a single conversion objective: get the user to select their vehicle and find a part. Every section above the fold serves that goal. Below the fold, the page shifts to SEO content and social proof.

**Section 1 — Sticky top bar**
- Full-width orange bar pinned to top of viewport, persists on scroll.
- Content: "5000 TL VE ÜZERİ ALIŞVERİŞLERİNİZDE KARGO BEDAVA" (free shipping threshold) + phone number + WhatsApp CTA icon.
- Purpose: sets the free-shipping threshold expectation on every page load.

**Section 2 — Header**
- Logo (left) + combined search bar (center) + Garajım (garage) icon + Sepet (cart) + Giriş Yap (login).
- Search bar placeholder: "Marka, Model, Parça veya Şasi No yaz..." — a single input that accepts vehicle name, part name, or VIN. This is a meaningfully broader scope than a pure product search.

**Section 3 — Brand navigation bar**
- Immediately below header: TÜM ARAÇLAR button (orange, full-width clickable) + 13 brand logo icons (Audi, Mercedes-Benz, VW, BMW, Toyota, Hyundai, Ford, Citroën, Opel, Honda, Renault, Fiat, Peugeot, BYD).
- All logos are hyperlinks to brand-specific product listing pages.
- This is the fastest possible path from homepage to brand-filtered product list — one click from any page.

**Section 4 — Vehicle Selector Widget (hero)**
- The dominant visual element: a large card widget with 4 tabs.
  - Tab 1 "Araç Kataloğu" (default): cascading dropdowns — Marka → Seri → Yıl → Model → Vites → Motor → Ek özellik — with a step indicator "1/7". Orange "PARÇA ARA" CTA.
  - Tab 2 "Şasi No ile Ara": single text input for VIN or chassis number.
  - Tab 3 "Garajımdan Seç": user's saved/garage vehicles.
  - Tab 4 "Anlaşmalı Servisler": authorised service center finder.
- The step-counter "1/7" gives users a clear sense of completion progress and reduces abandonment.

**Section 5 — Popular Brands carousel**
- A horizontally-scrolling carousel of large brand cards (BMW, Citroën, Fiat, Ford visible initially; carousel auto-advances through all brands).
- Each card contains: large brand logo + list of 6–8 popular model names as clickable links + a "BMW ÜRÜNLERINI LİSTELE" CTA button.
- Example BMW card links: 3 Serisi, 1 Serisi, 5 Serisi, X3, X5, 4 Serisi, 6 Serisi, X6.
- This is the homepage's most important internal-linking structure: it distributes PageRank from the high-authority homepage to model-level pages.

**Section 6 — Promotional banner row**
- 4 icon+label tiles: Bakım Robotu | Anlaşmalı Servisler | Tüm Kategoriler | Silecek Bulucu.
- Acts as a "tools navigation" section — surfaces the platform's differentiating tools without requiring the user to find them in a menu.

**Section 7 — Installment/shipping banner**
- Full-width banner: "7500TL+ siparişlerde 2 taksit %0 komisyon" / "10000TL+ siparişlerde 3 taksit %0 komisyon".
- Reduces purchase friction for high-value items (e.g., a compressor kit at 4,000 TL becomes much more accessible framed as "2 x 2,000 TL").

**Section 8 — Oil & Maintenance section (tabbed)**
- Tabs: Motor Yağı | Ampul | Oto Bakım | Aksesuar | Akü.
- Active tab (Motor Yağı) shows a grid of oil brand logos: Castrol, Opet, Motul, Firmy, Elf, Total.
- Positions Otoparcasan as the destination for routine maintenance purchases, not just breakdown repairs.

**Section 9 — Best Sellers (En Çok Satılanlar)**
- Standard product grid with "Daha Fazla" pagination link.
- Social proof via popularity signal.

**Section 10 — Social proof bar**
- Text: "159+ Bin Mutlu Müşteri, 276+ Bin Sipariş".
- Auto-scrolling review carousel beneath the stats.

**Section 11 — SEO text block**
- H1: "Oto Yedek Parça" (the primary target keyword, not the brand name).
- Multiple H2 subheadings with keyword-rich copy paragraphs.
- FAQ accordion (8 Q&As) structured for Featured Snippet targeting.
- This section is invisible to most users but is the reason the page ranks for generic queries.

**Section 12 — Trust badges**
- 4 badges in a row: Garanti Belgeli Ürünler | 14 Gün İçinde Kolay İade | 100% Uyumlu Parçalar | Ödeme Koruma Sistemi.

**Section 13 — Footer (6 columns)**
1. Kurumsal Sayfalar (14 links)
2. Hızlı Erişim: Anlaşmalı Servisler, Ürün Kataloğu, Bakım Robotu, Garajım, Kargom Nerede?, Silecek Bulucu, Şasi Sorgulama, Uygulamalar, Blog
3. Popüler Markalar (12: Bosch, Delphi, Depo, Febi Bilstein, Filtron, Gates, Hella, Magneti Marelli, Maher, Mando, Sachs, Valeo)
4. Popüler Araçlar (12 vehicle makes + "Tüm Araçlar" link)
5. Popüler Modeller (12: Audi A3, BMW 3 Serisi, Fiat Egea, Ford Focus, Honda Civic, Hyundai i20, Mercedes C Serisi, Opel Astra, Peugeot 2008, Renault Clio, Toyota Corolla, VW Passat)
6. Popüler Kategoriler (12: Abs Sensörü, Amortisör, Ateşleme Bujisi, Debriyaj Seti, Far Lambası, Fren Disk Ayna, Fren Disk Balata, Hava Filtresi, Klima Kompresörü, Motor Yağı, Polen Filtresi, Triğer Zincir Seti)
- Trust marks: ETBİS, OSS, 256-bit SSL.
- App badges: App Store + Google Play + App Gallery.

---

### 2.2 Vehicle Catalog & Selection Flow

**URL:** `https://otoparcasan.com/arac`

The vehicle catalog page presents the full make list in an alphabetical A-to-Z index (tabbed by initial letter). Each make is displayed as a row containing a coloured logo and the make name, all as clickable links. A search box in the top-right allows filtering by make name.

Total makes: ~50+ (Abarth, Alfa Romeo, Audi, BMW, BYD, Cadillac, Chevrolet, Chrysler, Citroën, Cupra, Dacia, Daihatsu, Dodge, DS, Fiat, Ford, Genesis, Great Wall, Honda, Hyundai, Infiniti, Isuzu, Iveco, Jaguar, Jeep, Kia, Lada, Lancia, Land Rover, Lexus, Lynk & Co, MAN, Maserati, Mazda, Mercedes, MG, Mini, Mitsubishi, Nissan, Opel, Ora, Peugeot, Polestar, Porsche, Renault, and more).

**Selection flow — 7 steps with step counter:**
1. Marka (Make)
2. Seri (Series / Model family — e.g., BMW "3 Serisi")
3. Yıl (Year)
4. Model (Specific body variant)
5. Vites (Transmission: Manuel / Otomatik)
6. Motor (Engine: displacement + power rating, e.g., "2.0d 190hp")
7. Ek özellik (Additional attribute — for edge cases)

The "1/7" step counter persists throughout the widget and reinforces progressive disclosure.

**Akinel current state:** 4-step flow (Make → Model → Generation → Engine). Missing the Seri level and Vites level. Year is surfaced via Generation (e.g., "2019–2023 Sedan") rather than as an explicit year dropdown.

---

### 2.3 Vehicle Brand/Model Presentation

**Brand page URL pattern:** `https://otoparcasan.com/oto-yedek-parca/bmw-yedek-parca`

- Breadcrumb: Anasayfa > Tüm Araçlar > BMW
- Title: "BMW Yedek Parça" (+ product count: "10,000+ ürün listeleniyor")
- Left sidebar filters: Series tabs (1 Serisi, 2 Serisi, 3 Serisi…) + Kategori + Marka + Montaj Yeri + Silecek Uzunluk + Silecek Tip + Fiyat range
- Filter apply button: "Seçimleri Uygula"
- Product grid: 4 columns, sort dropdown (Önerilen, En Düşük Fiyat, En Yüksek Fiyat, Kargo Süresi En Kısa, Kargo Süresi En Geç)
- Product cards: image + brand badge (e.g., MEYA, Kröger) + "UYUMLU MUT" badge (compatibility confirmed) + green SEPETE EKLE button + price in orange

**Model page URL pattern:** `https://otoparcasan.com/oto-yedek-parca/bmw_3-serisi`

- Same layout as brand page but pre-filtered to the selected model.
- This means every model gets its own indexable URL — a major SEO multiplier.

---

### 2.4 Category Architecture

Top-level: 9 categories (URL root: `https://otoparcasan.com/yedek-parcalar`)

1. **Fren ve Debriyaj** — 38 subcategories
   - Fren: Abs Sensörü, Fren Disk Ayna, Fren Disk Balata, El Fren, Fren Ana Merkez, Fren Hortumuları, Kaliperler, Fren Tablası, Kampana (28 items)
   - Debriyaj: Debriyaj Balatası, Debriyaj Baskı, Debriyaj Çatali, Debriyaj Merkezi, Debriyaj Müjürü, Debriyaj Seti, Debriyaj Teli, Volan, Volan Dişlisi (10 items)
2. **Motor ve Yakıt** — Motor Takuzu, Triger Kayış Seti, Turbo Şarj, Hava Dedektörü, Oksijen Sensörü
3. **Süspansiyon ve Direksiyon** — Amortisör, Rotil, Rot Başı, Salıncak, Direksiyon Pompası
4. **Elektrik ve Aydınlatma** — Akü, Ateşleme Bobini, Far Lambası, Stop Lambası
5. **Kaporta ve Trim** — Dikiz Aynası, Tampon, Çamurluk
6. **Şanzıman ve Diferansiyel** — Şanzıman Takuzu, Diferansiyel Seti, Vites Teli
7. **Soğutma ve Filtreler** — Klima Kompresörü, Su Radyatörü, Hava Filtresi, Yağ Filtresi
8. **Aksesuar ve Tuning** — Telefon Tutacağı, Araç İçi Kamera, Akü Kablosu
9. **Oto Bakım ve Yağlar** — 50+ Oto Bakım subcategories + 5 oil types (see Section 2.5)

URL pattern for category: `https://otoparcasan.com/yedek-parcalar/fren-ve-debriyaj`
URL pattern for subcategory: `https://otoparcasan.com/yedek-parcalar/oto-bakim-ve-yaglar/motor-yagi`

---

### 2.5 Oto Bakım ve Yağlar

This category is the most important gap for Akinel to fill. It is broken into two sub-branches:

**Oto Bakım (50+ SKU types):**
Ad Blue, Akışmetre Sprey, Antifriz, Araç Temizlik Fırçası, Araç Temizlik Süngeri, Buğu Önleyici, Buz Giderici, Buz Kazıyıcı, Cam Çekeceği, Cam Yıkama Şampuanı, Cam Yıkama Suyu, Çatlak Tıkayıcı, Cıvata Sabitleyi, El Temizleyici, Eldiven, Enjektör Temizleyici, Eter Sprey, Etiket Sökücü, Fren Balata Temizleyici, Genel Temizlik Ürünleri, Jant Parlatıcı, Kaçak Tespit, Karbüratör Temizleyici, Koku Giderici, Kontak Temizleyici, Lastik Parlattıcı, Lastik Tamir Kiti, Motor Temizleyici, Oto Bakım Setleri, Oto Koltuk Temizleyici, Oto Temizlik Bezi, Oto Yıkama Şampuanı, Pas Sökücü, Pasta Cila, Radyatör Temizleyici, Rötuş Boya, Silikon Yağlayıcı, Sıvı Conta, Spray Boya, Yakıt Katkısı, Yağ Katkısı, Yağmur Kaydırıcı, Zift Temizleyici, Zincir Yağlayıcı (and more).

**Yağlar (5 types):**
- Direksiyon Yağı
- Fren Hidrolik Yağı
- Gres Yağı
- Motor Yağı
- Şanzıman Yağı

**Brands stocked (as shown in homepage Oil section):** Castrol, Opet, Motul, Elf, Total, Firmy.

Maintenance and oil products share two characteristics that make them uniquely valuable: (a) they are purchased frequently (every 10,000–15,000 km), creating a repeat-customer habit; and (b) they are not vehicle-specific in the way a brake caliper is, meaning they can be sold without a vehicle-selection step, reducing cart abandonment.

---

### 2.6 Brand & Model SEO Architecture

Otoparcasan operates a two-tier URL architecture below the brand root:

- **Tier 1 (make):** `/oto-yedek-parca/bmw-yedek-parca` — targets keyword "BMW yedek parça"
- **Tier 2 (model):** `/oto-yedek-parca/bmw_3-serisi` — targets keyword "BMW 3 Serisi yedek parça"

Each tier-2 page is indexed independently. For a brand like BMW with 20+ models, this generates 20+ indexed URLs all targeting high-intent long-tail queries.

The naming convention for Tier 1 is `{make-slug}-yedek-parca`. This is not accidental — the term "yedek parça" is appended to the slug, making the URL itself a ranking signal for "BMW yedek parça".

The footer section "Popüler Modeller" contains 12 model-level links, ensuring these model pages receive homepage PageRank.

---

### 2.7 VIN / Chassis Search

On Otoparcasan, VIN/Chassis search is a **tab** within the vehicle selector widget, not a separate page. It is labelled "Şasi No ile Ara" and accepts a free-text input. The feature is available from the homepage without navigation.

The integration is UI-level: the user enters a VIN prefix or full VIN, and the platform resolves it against their internal vehicle catalog. The underlying data source is not disclosed.

**Key design observation:** VIN search is positioned as an alternative to the 7-step dropdown flow, not a primary feature. This correctly sets user expectations — VIN lookup is for users who have the number in hand; dropdown selection is for everyone else.

---

### 2.8 Product Pages & UX

- Product cards show: part image, brand badge (aftermarket brand name), "UYUMLU MUT" (compatibility verified) badge, SEPETE EKLE button (green), price (orange).
- Brand logos on product cards are distinct from vehicle make logos — they show the aftermarket parts brand (Bosch, Valeo, Hella, etc.).
- Sort options on listing pages: Önerilen, En Düşük Fiyat, En Yüksek Fiyat, Kargo Süresi En Kısa, Kargo Süresi En Geç.
- Filter sidebar on brand/model pages: Series tabs + Kategori + Marka (parts brand) + Montaj Yeri + Fiyat range.
- No star ratings visible on product cards on Otoparcasan (unlike OnlineYedekParca).

---

### 2.9 Visual UX Analysis

- **Colour system:** Orange as the primary action colour (CTAs, prices, brand bar buttons). White and light grey for backgrounds. Dark grey for body text.
- **Typography:** Clear hierarchy — large serif headings for section titles, sans-serif for everything else.
- **Icon language:** Brand logos are consistently sized and placed on white pill-shaped containers with a slight drop shadow.
- **Mobile:** Brand navigation bar collapses to a horizontal scroll. Vehicle selector widget stacks vertically. Carousel becomes swipeable.
- **Trust signals placement:** Trust badge row appears BELOW the product grid sections, not in the header — the assumption is that product quality and availability are the primary trust builders; badges reinforce rather than lead.

---

## 3. OnlineYedekParca.com — Audit

### 3.1 Homepage & Structure

OnlineYedekParca takes a different strategic position from Otoparcasan: it is more B2B-oriented, more brand-focused (the top navigation IS the brand list), and places VIN search as the primary search method.

**Homepage section order:**

1. **Top announcement bar** — B2B account application link ("Başvuru yap").
2. **Header** — Logo + search bar + location selector + dark/light mode toggle + Giriş Yap + Sepetim + gift box icon (promotions).
3. **Top navigation bar** — Horizontal tab-style nav listing brand names directly: OPEL | CHEVROLET | BMW | MERCEDES-BENZ | VOLKSWAGEN | AUDI | SEAT | SKODA | RENAULT | PEUGEOT | CITROËN | FORD | FORD TİCARİ | VW TİCARİ | YAĞ. This navigation replaces a traditional category menu with direct brand access — a stronger signal that the brand (vehicle make) is the primary browse axis.
4. **Hero area (3 panels side-by-side):**
   - Panel 1: VIN/Şasi widget ("Şasi numarası ile ara") as primary search + Marka/Model/Motor dropdowns as secondary.
   - Panel 2: "BÜYÜK OUTLET İNDİRİMLERİ" promotional banner.
   - Panel 3: "Online Express" app-based delivery pilot information.
5. **Öne Çıkan Ürünler (Featured Products):** 5-column product grid with star ratings, prices, SEPETE EKLE.
6. **Haftanın Fırsatları (Week's Deals):** Similar 5-column grid with strikethrough prices.
7. **Brand promotional banners:** "Opel marka yedek parçalar stoklarda!", "Aracınızı Garaja Kaydet Kazan!", "Renault marka ürünler çok yakında!"
8. **İndirime Göre (By Discount):** Products sorted by discount percentage.
9. **Trust section:** %100 Güvenli Alışveriş | Online Express | Ücretsiz Kargo (2,500 TL üzeri).
10. **Footer:** Logo + nav links + brand links in columns.

---

### 3.2 Vehicle Selection

OnlineYedekParca uses a 3-step dropdown flow: Marka → Model → Motor. This is significantly simpler than Otoparcasan's 7-step flow and Akinel's 4-step flow. It prioritises speed over precision.

The dropdown is embedded in the hero panel alongside the VIN widget, meaning the two methods (VIN and manual selection) are presented simultaneously at equal visual weight.

---

### 3.3 VIN / Chassis Search

VIN search on OnlineYedekParca is **front-and-center in Panel 1 of the hero** — it is the most prominent feature on the homepage. The heading "Şasi numarası ile ara" is the largest text in the panel. The input + "Ara" button is the dominant interactive element.

This positions VIN lookup as a first-class feature, likely because their B2B customers (garages, workshops) have vehicles on the lift with VIN in hand and need fast lookup.

---

### 3.4 Category & Brand Architecture

**Brand navigation:** The top nav bar IS the brand list. Clicking "BMW" loads `/marka/bmw`.

**Brand page (`/marka/bmw`):**
- Left sidebar filter chips: "Seçimlerin" area showing the active filter (BMW chip) + "Tüm Seçimleri Kaldır".
- Category filter includes: OUTLET, SMART, YAĞ, OPEL, CHEVROLET, BMW, MERCEDES-BENZ, VOLKSWAGEN (brands are treated as a category filter on their own).
- Popular filters: Fırsat Grubu, Ücretsiz Kargo, Hediyelik Ürünler, En Yeniler.
- Price range: 0–250 TL | 250–500 TL | 500–1000 TL | 1000–2500 TL | 2500–10000 TL.
- 4-column product grid with product names that include vehicle compatibility inline (e.g., "Opel Astra J 1.3 D Direksiyon Rotili").
- Star ratings visible on product cards.

**Important naming difference:** Product names on OnlineYedekParca embed vehicle make/model (e.g., "Opel Astra J 1.3 D..."). This is counter to Akinel's design principle ("product names never contain vehicle info"). The Akinel approach is architecturally cleaner but the OnlineYedekParca approach makes product names more scannable in a vehicle-filtered list.

---

### 3.5 Key Differentiators

1. **B2B portal** — Header link to B2B application. B2B users likely get different pricing tiers.
2. **YAĞ as a top-nav item** — Oil is treated as a peer category to vehicle makes in the navigation, underscoring its commercial importance.
3. **Online Express** — App-based same-day or rapid delivery in pilot regions. Significant logistics differentiator.
4. **VIN search as primary** — Positions the platform as a professional/garage tool rather than a consumer platform.
5. **Star ratings on product cards** — Provides a trust signal at the browse stage, before the product page.
6. **Price comparison context** — Products show "Havale fiyatı" (bank transfer price) vs card price, a transparency signal common in Turkish e-commerce.
7. **Outlet category** — Dedicated clearance section visible in category filters.
8. **Dark/light mode toggle** — A minor but notable UI sophistication.

---

## 4. Akinel Current-State Audit

### 4.1 Homepage

**File:** `apps/web/src/app/page.tsx`
**Component files:** `apps/web/src/components/home/HeroCarousel.tsx`, `BusinessStrip.tsx`, `CategoryStrip.tsx`

Current homepage sections (top to bottom):

1. **Hero Carousel** — Admin-managed slides with search bar. CTAs: "Aracımı Seç" and "OEM ile Ara".
2. **Business Strip** — 4 trust signals (currently static, managed via admin panel at `/admin/business`).
3. **Category Strip** — Horizontally scrollable category chips.
4. **Akinel Introduction** — Text content + trust items.
5. **Popular Brands** — Pill-style text buttons (not cards, no model links).
6. **Vehicle Finder Section** — Shows vehicle selector if no vehicle selected; shows selected vehicle chip if one is active.
7. **Featured Products** — 6–8 in-stock products.

**Missing vs competitors:**
- No brand navigation bar in header (no brand logos as one-click links).
- No popular brand cards with model lists.
- No oil/maintenance tabbed section.
- No best-sellers section.
- No social proof numbers (customer count, order count).
- No promotional tool tiles (Bakım Robotu, Silecek Bulucu equivalents).
- No installment/taksit banner.
- No FAQ/SEO text block.

---

### 4.2 Vehicle Catalog

**File:** `apps/web/src/app/(shop)/vehicle/page.tsx`
**Flow:** Make → Model → Generation (year range + body type) → Engine (4 steps)

The Generation step is Akinel's unique design: instead of a bare year dropdown, it groups year ranges with body types (e.g., "2019–2023 Sedan"). This is more informative than a raw year dropdown but may confuse users expecting a year field.

**Browse mode gap:** The `/vehicle` page only shows the selection widget — there is no browseable catalog mode for users who want to explore all makes. Competitors both have an `/arac`-style page listing all makes with logos.

---

### 4.3 Brand & Category Pages

**Brand page:** `apps/web/src/app/(shop)/marka/[slug]/page.tsx` — `/marka/{slug}` (e.g., `/marka/bosch`)
**Category page:** `apps/web/src/app/(shop)/kategori/[slug]/page.tsx` — `/kategori/{slug}`

Both pages have:
- Correct Turkish URLs (marka, kategori) — good.
- Metadata (title, description, canonical) — good.
- JSON-LD breadcrumb — good.

**Missing:**
- No model-level pages (no `/arac/[make-slug]/[model-slug]` equivalent).
- Brand pages for parts brands (Bosch, Valeo) rather than vehicle makes — while valid, this misses the primary browse axis (vehicle make → compatible parts).
- No series/model filter tabs on brand pages.

---

### 4.4 SEO State

- Sitemap: `apps/web/src/app/sitemap.ts` — generates 3,618+ URLs.
- Robots.txt: present.
- OG tags: implemented.
- JSON-LD: AutoPartsStore + Product + BreadcrumbList schemas on relevant pages.
- H1 on homepage: brand name rather than generic keyword "Oto Yedek Parça" (competitors use generic H1 to target generic queries).
- No FAQ schema on homepage.
- No "Popüler Markalar / Araçlar / Modeller / Kategoriler" footer link columns — these are some of the most important internal links on competitor sites.

---

### 4.5 Known Gaps (as catalogued from codebase review)

1. No "Oto Bakım ve Yağlar" category.
2. No popular brand cards with model links on homepage.
3. No maintenance robot / periyodik bakım tool.
4. No installment/taksit information.
5. No wiper finder (Silecek Bulucu).
6. No authorised service centers (Anlaşmalı Servisler).
7. No footer SEO link columns (Popüler Markalar / Araçlar / Modeller / Kategoriler).
8. No brand logos in header nav.
9. No model-level pages.
10. VIN uses NHTSA (US-only data) — not Turkish market data.
11. No product reviews/ratings.
12. No B2B section.
13. No oil brand showcase on homepage.
14. No best-sellers section.
15. Vehicle catalog page (`/vehicle`) has no browse/discover mode.

---

## 5. Vehicle Catalog Comparison

| Dimension | Otoparcasan | OnlineYedekParca | Akinel (current) |
|---|---|---|---|
| Selection steps | 7 (Make → Series → Year → Model → Transmission → Engine → Extra) | 3 (Make → Model → Engine) | 4 (Make → Model → Generation → Engine) |
| Step counter | Yes ("1/7") | No | No |
| Series level | Yes (BMW "3 Serisi" is a separate step) | No | No (generation groups models) |
| Year as explicit step | Yes | Implicit via Model | Via Generation (year range) |
| Transmission step | Yes | No | No |
| Browse all makes page | Yes (`/arac`) | Not observed | Limited (`/vehicle` selection-only) |
| Make count | 50+ | ~13 in top nav (focused) | Seeded: not published |
| Saved vehicles (Garaj) | Yes (tab in widget) | Yes ("Garaja Kaydet" CTA) | Yes (Zustand + localStorage) |
| VIN in selector | Yes (separate tab) | Yes (primary hero panel) | Yes but NHTSA only |
| Alphabetical index | Yes (A-Z tabs on `/arac`) | Not observed | No |

---

## 6. Category Architecture Comparison

| Level | Otoparcasan | OnlineYedekParca | Akinel (current) |
|---|---|---|---|
| Top-level count | 9 | Not fully mapped | 6 |
| Has Oto Bakım? | Yes (50+ subcategories) | Yes (YAĞ in nav) | No |
| Has Yağlar? | Yes (5 types) | Yes (YAĞ as top-nav) | No |
| Has Aksesuar? | Yes | Not observed | No |
| Has Kaporta? | Yes | Not observed | No |
| Subcategory depth | 3 (Category / Subcategory / Sub-subcategory) | 2 | 2 |
| URL depth | `/yedek-parcalar/{cat}/{subcat}` | Not observed | `/kategori/{slug}` (flat) |
| Category in footer | Yes (12 popular categories) | Partial | No |

---

## 7. Oil & Maintenance Category Proposal

This is the highest-priority missing category for Akinel. The following structure should be added to the database seed and category tree.

**Proposed top-level category:**
- **Slug:** `oto-bakim-ve-yagllar`
- **Display name:** "Oto Bakım ve Yağlar"
- **Description:** "Motor yağları, bakım ürünleri ve araç temizlik malzemeleri"

**Proposed subcategories (minimum viable set for launch):**

| Slug | Display Name | Notes |
|---|---|---|
| `motor-yagi` | Motor Yağı | Castrol, Opel, Motul, Elf, Total |
| `antifriz` | Antifriz | Seasonal + year-round |
| `fren-hidrolik-yagi` | Fren Hidrolik Yağı | DOT 4 / DOT 5 |
| `sanziman-yagi` | Şanzıman Yağı | Manual + automatic |
| `direksiyon-yagi` | Direksiyon Yağı | |
| `cam-yikama-suyu` | Cam Yıkama Suyu | |
| `yakut-katkisi` | Yakıt Katkısı | |
| `yag-katkisi` | Yağ Katkısı | |
| `oto-yikama-sampuani` | Oto Yıkama Şampuanı | |
| `pasta-cila` | Pasta Cila | |
| `ad-blue` | Ad Blue | Diesel vehicles |

**Key characteristic of this category:** Products do NOT need `ProductVehicleCompatibility` entries. Motor oil, car shampoo, and fuel additive are universal. This means they can be listed without a vehicle context, reducing friction significantly.

**Database impact:**
- Add `Category` records in `apps/api/Akinel.Infrastructure/Data/DatabaseSeeder.cs` for the above slugs.
- Products in this category: set `IsVehicleSpecific = false` (requires new field on `Product` entity, or simply leave `ProductVehicleCompatibility` empty and show them on all vehicle pages).
- Homepage oil section: no vehicle context required — show these products unconditionally.

**Brands to seed (parts brands for this category):**
- Castrol, Opel (branded oil), Motul, Elf, Total, Mobil, Shell, BP, Bosch (wiper fluid + additives).

---

## 8. VIN / Chassis Search Comparison

| Dimension | Otoparcasan | OnlineYedekParca | Akinel (current) |
|---|---|---|---|
| Placement | Tab in homepage widget | Panel 1 hero (primary) | Separate page `/vin` |
| Data source | Internal Turkish vehicle DB | Internal Turkish vehicle DB | NHTSA vPIC (US only) |
| Usefulness for TR | High | High | Very low — US data does not cover Turkish market vehicles |
| Navigation required | Zero (on homepage) | Zero (on homepage) | Must navigate to `/vin` |
| Label used | "Şasi No ile Ara" | "Şasi numarası ile ara" | "VIN ile Ara" |

**Critical issue:** The NHTSA vPIC API used by Akinel (`apps/web/src/app/(shop)/vin/page.tsx`) is the US National Highway Traffic Safety Administration's database. VINs for vehicles registered and sold in Turkey (Turkish-assembled or European-import vehicles) are often not in the NHTSA database, or return incomplete data. This makes the current VIN feature effectively non-functional for the target market.

**Recommended fix:** Replace NHTSA with one of:
1. A Turkish-specific VIN decoder (TecDoc, Eurotax/Schwacke, or TÜVTÜRK if an API is available).
2. A partial VIN prefix lookup against the internal `VehicleEngine` / `VehicleGeneration` catalog (the first 9–11 characters of a VIN encode make, model, year, and engine).
3. An internal VIN→vehicle mapping table populated from Turkish vehicle registration data.

Until a Turkish data source is available, the VIN tab should be hidden or labelled "Yakında" (Coming Soon) rather than surfacing broken results.

---

## 9. Brand & Model SEO Architecture

### Current Akinel URL structure

| Page type | URL | Example |
|---|---|---|
| Parts brand | `/marka/{slug}` | `/marka/bosch` |
| Category | `/kategori/{slug}` | `/kategori/fren-sistemi` |
| Product | `/products/{slug}` | `/products/bosch-fren-balatasi-abc123` |
| Vehicle selection | `/vehicle` | `/vehicle` |
| VIN | `/vin` | `/vin` |
| Brands list | `/brands` | `/brands` |

**Problems:**
1. `/products/{slug}` and `/vehicle` and `/brands` are English URLs — inconsistent with Turkish `/marka` and `/kategori`. Suggest renaming to `/urunler/{slug}`, `/arac`, `/markalar`.
2. Brand pages (`/marka/bosch`) list parts-manufacturer brands, not vehicle makes. There are no vehicle-make pages (e.g., no `/arac/bmw` equivalent).
3. No model-level pages at all.

### Proposed URL structure (competitor-aligned)

| Page type | Proposed URL | Example | Target keyword |
|---|---|---|---|
| Vehicle makes list | `/arac` | `/arac` | "oto yedek parça araç seç" |
| Vehicle make page | `/arac/{make-slug}-yedek-parca` | `/arac/bmw-yedek-parca` | "BMW yedek parça" |
| Vehicle model page | `/arac/{make-slug}/{model-slug}` | `/arac/bmw/3-serisi` | "BMW 3 Serisi yedek parça" |
| Parts brand | `/marka/{slug}` | `/marka/bosch` | "Bosch yedek parça" (keep) |
| Category | `/kategori/{slug}` | `/kategori/fren-sistemi` | "fren sistemi parça" (keep) |
| Product | `/urun/{slug}` | `/urun/bosch-fren-balatasi` | product name query |

**SEO value of vehicle model pages:** A Turkish automotive e-commerce site with 50 vehicle makes × average 15 models = 750 model-level pages. Each page targets a specific "[Make] [Model] yedek parça" keyword. These are high-commercial-intent queries with clear buyer intent. The homepage and footer link to the top 12 models, passing PageRank to the most important ones.

---

## 10. Homepage UX Comparison (section by section)

| Position | Otoparcasan | OnlineYedekParca | Akinel (current) | Akinel (proposed) |
|---|---|---|---|---|
| 1 | Sticky free-shipping bar | B2B announcement bar | (none) | Sticky announcement bar (free shipping threshold + phone + WhatsApp) |
| 2 | Header: Logo + search + Garajım + Sepet | Header: Logo + search + location + Sepet | Header: Logo + search + Garaj + Sepet | No change needed |
| 3 | Brand logo nav bar (13 logos) | Brand tab nav (13 brands) | (none) | Brand logo strip in header/sub-header |
| 4 | Vehicle selector widget (4 tabs) | Hero: VIN widget + dropdown (3 panels) | Hero carousel with search | Hero carousel + vehicle selector card (tabs: Araç Kataloğu | Şasi No) |
| 5 | Popular brands carousel (cards + model lists) | Öne Çıkan Ürünler grid | BusinessStrip (trust) | Popular brand cards carousel with model links |
| 6 | Promotional tool tiles | Haftanın Fırsatları | CategoryStrip | CategoryStrip (keep) |
| 7 | Installment/taksit banner | Brand promotional banners | Akinel Introduction text | Taksit/shipping info banner |
| 8 | Oil & Maintenance tabbed section | İndirime Göre products | Popular Brands (pills) | Oil & Maintenance section (Motor Yağı | Antifriz tabs) |
| 9 | Best Sellers grid | Trust section | Vehicle Finder | Best Sellers / Featured Products |
| 10 | Social proof stats + reviews | Footer | Featured Products | Social proof bar |
| 11 | SEO text + FAQ accordion | — | — | SEO text block + FAQ accordion |
| 12 | Trust badges | — | — | Trust badges row |
| 13 | Footer (6 columns) | — | Footer (minimal) | Footer (6 columns with SEO links) |

---

## 11. Mobile UX Comparison

| Feature | Otoparcasan | OnlineYedekParca | Akinel (current) |
|---|---|---|---|
| Brand nav bar mobile | Horizontal scroll | Horizontal scroll tabs | Not present |
| Vehicle selector mobile | Stacked dropdowns, full-width | Stacked, Panel 1 only shown | Modal/sheet drawer |
| Product grid mobile | 2 columns | 2 columns | 2 columns |
| Header search mobile | Full-width with vehicle context | Full-width | Full-width |
| Popular brands carousel mobile | Swipeable | Not observed | Horizontal pill scroll |
| Footer mobile | Collapsed accordions | Not observed | Likely collapsed |
| CTA button size | 48px+ tap targets (orange) | 48px+ tap targets | Verify tap targets meet 44px minimum |
| WhatsApp button | Present (sticky) | Not observed | Present (`WhatsAppButton.tsx`) |

`apps/web/src/components/layout/WhatsAppButton.tsx` — already exists, good.
`apps/web/src/components/layout/MobileNav.tsx` — already exists; ensure it surfaces Brand logos and vehicle selector prominently.

---

## 12. Feature Gap Matrix

| Feature | Otoparcasan | OnlineYedekParca | Akinel | Priority |
|---|---|---|---|---|
| Oto Bakım & Yağlar category | Yes | Yes (YAĞ nav) | **No** | P0 |
| Vehicle model pages (SEO) | Yes | Partial | **No** | P0 |
| Footer SEO link columns | Yes | Partial | **No** | P0 |
| Announcement bar (shipping/phone) | Yes | Yes | **No** | P0 |
| Brand logo navigation strip | Yes (13 logos) | Yes (tab nav) | **No** | P1 |
| Popular brand cards with model links | Yes (carousel) | No | **No** | P1 |
| VIN search — Turkish data | Yes | Yes | **Broken (NHTSA)** | P1 |
| Installment/taksit information | Yes | Partial | **No** | P1 |
| Maintenance robot (Bakım Robotu) | Yes | No | **No** | P1 |
| Best sellers section | Yes | Yes | **No** | P1 |
| Homepage SEO text + FAQ accordion | Yes | No | **No** | P1 |
| Oil brand showcase section | Yes | No | **No** | P1 |
| Vehicle make browse page (/arac) | Yes | Limited | **Limited** | P1 |
| Product star ratings | No | Yes | **No** | P2 |
| Wiper finder (Silecek Bulucu) | Yes | No | **No** | P2 |
| Authorised service centers | Yes | No | **No** | P2 |
| B2B portal | No | Yes | **No** | P2 |
| Mobile app | Yes | Yes | **No** | P2 |
| Dark/light mode | No | Yes | **No** | P2 |
| Outlet/clearance section | No | Yes | **No** | P2 |
| Social proof stats display | Yes | No | **No** | P1 |

---

## 13. Recommended Akinel Changes

### P0 — Must Have (Critical)

---

#### P0-1: Add "Oto Bakım ve Yağlar" Category Tree

**Current Akinel state:** The seeded category tree in `apps/api/Akinel.Infrastructure/Data/DatabaseSeeder.cs` contains 6 top-level categories (Fren Sistemi, Debriyaj, Filtreler, Süspansiyon, Elektrik Sistemi, Soğutma Sistemi). There is no maintenance or oil category.

**Competitor reference:** Otoparcasan `/yedek-parcalar/oto-bakim-ve-yaglar` — 50+ subcategories. OnlineYedekParca — "YAĞ" as top-nav item.

**Why it matters:** Oil and maintenance products are the highest-frequency purchase category in automotive. They drive repeat visits and repeat orders. They also do not require vehicle-compatibility matching, reducing the purchase path friction.

**Exact proposed change:**
1. In `DatabaseSeeder.cs`, add a new top-level `Category` with:
   - `Name = "Oto Bakım ve Yağlar"`
   - `Slug = "oto-bakim-ve-yagllar"` (note: match Turkish orthography carefully)
   - `Description = "Motor yağları, antifriz, cam yıkama suyu ve araç bakım ürünleri"`
2. Add child categories: Motor Yağı, Antifriz, Fren Hidrolik Yağı, Şanzıman Yağı, Direksiyon Yağı, Cam Yıkama Suyu, Yakıt Katkısı, Yağ Katkısı, Oto Yıkama Şampuanı, Pasta Cila, Ad Blue.
3. Add brands: Castrol, Motul, Elf, Total, Mobil, Shell (if not already seeded).
4. On `Product` entity (`apps/api/Akinel.Domain/Entities/Product.cs`), consider adding `bool IsVehicleSpecific = true` as a flag. Products in Oto Bakım category set this to false. This flag controls whether the product appears in vehicle-specific filtered results vs universal results.
5. On the category landing page (`/kategori/oto-bakim-ve-yagllar`), do NOT require vehicle context — show all products in this category unconditionally.

**Frontend impact:**
- `apps/web/src/components/home/CategoryStrip.tsx` — ensure the new category appears in the horizontal chip strip.
- Add an "Oil & Maintenance" tabbed section to the homepage (see P1-5 below).
- Category page `apps/web/src/app/(shop)/kategori/[slug]/page.tsx` — handle `IsVehicleSpecific = false` case to suppress vehicle context requirement.

**Backend/database impact:**
- `DatabaseSeeder.cs` — add seed data.
- New migration for `IsVehicleSpecific` flag on `Product` if using that approach.
- Product API endpoint `GET /api/products` — when `categorySlug` is an oil/maintenance slug, bypass vehicle-filter requirement.

**Admin panel impact:**
- Admin can create products in these categories without requiring vehicle compatibility entries.
- Admin product form `apps/web/src/app/admin/` should show/hide the vehicle compatibility section based on `IsVehicleSpecific`.

**SEO impact:**
- New indexable URL: `/kategori/oto-bakim-ve-yagllar` — targets "motor yağı", "antifriz" queries.
- 11 new subcategory URLs each targeting a specific product type keyword.
- Homepage section linking to these subcategories adds PageRank flow.

**Complexity estimate:** Medium. Database schema change (optional `IsVehicleSpecific` field) + seeder update + category page conditional logic. No new pages needed — existing `/kategori/[slug]` handles it.

**Dependencies:** None. Can be implemented independently.

---

#### P0-2: Add Vehicle Model Pages with Correct SEO URLs

**Current Akinel state:** No vehicle make or model pages exist. The only vehicle-adjacent page is `/vehicle` (selection-only, not a browseable catalog page). Brand pages (`/marka/[slug]`) list parts brands (Bosch, Valeo), not vehicle makes.

**Competitor reference:** Otoparcasan `/oto-yedek-parca/bmw-yedek-parca` (make) and `/oto-yedek-parca/bmw_3-serisi` (model). Every model has its own indexed URL.

**Why it matters:** "BMW 3 Serisi yedek parça" is a high-volume, high-intent search query. Without a page targeting this keyword, Akinel cannot rank for it. With model pages for 50 makes × 15 models = 750 pages, Akinel captures a large segment of long-tail organic traffic.

**Exact proposed change:**

Create two new Next.js route segments:

1. **Vehicle make page:** `apps/web/src/app/(shop)/arac/[makeSlug]/page.tsx`
   - URL: `/arac/{make-slug}-yedek-parca` (e.g., `/arac/bmw-yedek-parca`)
   - Alternatively, keep the path segment clean: `/arac/[makeSlug]` resolves to slug "bmw", but `generateMetadata` generates title "BMW Yedek Parça".
   - Content: make logo + product count + series filter tabs + product grid (products compatible with any vehicle of this make) + left sidebar filters (Kategori, Fiyat, Marka).
   - `generateMetadata`: `title: "${make.name} Yedek Parça | Akinel"`, `description: "${make.name} araçlarına uyumlu yedek parçalar..."`
   - JSON-LD: BreadcrumbList (Anasayfa > Araçlar > BMW).

2. **Vehicle model page:** `apps/web/src/app/(shop)/arac/[makeSlug]/[modelSlug]/page.tsx`
   - URL: `/arac/bmw/3-serisi` (e.g.)
   - Content: make logo + model name + product count + engine variant filter + product grid (products compatible with this model) + sidebar filters.
   - `generateMetadata`: `title: "BMW 3 Serisi Yedek Parça | Akinel"`.
   - JSON-LD: BreadcrumbList (Anasayfa > Araçlar > BMW > BMW 3 Serisi).

3. **Vehicle makes list page:** `apps/web/src/app/(shop)/arac/page.tsx`
   - URL: `/arac`
   - Content: A-Z indexed grid of all vehicle makes with logos and names as links to make pages.

**API changes required:**
- New endpoint: `GET /api/vehicles/makes/{makeSlug}/products?page=&pageSize=&categorySlug=&brandSlug=` — returns products compatible with any engine of this make.
- New endpoint: `GET /api/vehicles/models/{modelSlug}/products?page=&pageSize=` — returns products compatible with any engine of this model.
- These can be implemented in `apps/api/Akinel.Api/Controllers/VehiclesController.cs`.

**Frontend impact:**
- New route group at `apps/web/src/app/(shop)/arac/`.
- `generateStaticParams` for make pages from API.
- `generateStaticParams` for model pages from API.
- Add to sitemap in `apps/web/src/app/sitemap.ts`.

**Backend/database impact:**
- New query in vehicle service: fetch all products where `ProductVehicleCompatibility.VehicleEngine.VehicleGeneration.VehicleModel.VehicleMake.Slug = makeSlug`.
- No schema change needed — data already exists.

**Admin panel impact:** None — make/model pages are auto-generated from the vehicle catalog.

**SEO impact:** High. 750+ new indexed pages, each targeting a specific "[Make] [Model] yedek parça" keyword. These pages are also linked from the homepage brand cards and footer SEO columns.

**Complexity estimate:** Medium-High. New API endpoints + new page components + sitemap update + SEO metadata generation.

**Dependencies:** P0-3 (footer links) and P1-2 (brand cards) both link to these pages — implement P0-2 first.

---

#### P0-3: Add SEO Footer Link Columns

**Current Akinel state:** `apps/web/src/components/layout/Footer.tsx` exists but does not contain Popüler Markalar / Popüler Araçlar / Popüler Modeller / Popüler Kategoriler columns.

**Competitor reference:** Otoparcasan footer — 6 columns. Columns 3–6 contain exactly: Popüler Markalar (12 parts brands), Popüler Araçlar (12 vehicle makes), Popüler Modeller (12 models), Popüler Kategoriler (12 categories).

**Why it matters:** The footer appears on every page of the site. Links in the footer pass PageRank from every page to the linked pages. 12 popular model links in the footer mean those 12 model pages receive homepage-level link equity from every product page, category page, and brand page on the site. This is one of the highest-ROI SEO changes possible.

**Exact proposed change:**
Edit `apps/web/src/components/layout/Footer.tsx`. Add 4 new link-column sections:

```
Column: Popüler Araçlar
Links (12 vehicle makes → /arac/{slug}-yedek-parca):
BMW, Mercedes-Benz, Volkswagen, Audi, Toyota, Hyundai, Ford, Fiat, Opel, Renault, Peugeot, Citroën
+ "Tüm Araçlar" → /arac

Column: Popüler Modeller
Links (12 vehicle models → /arac/{make-slug}/{model-slug}):
BMW 3 Serisi, Fiat Egea, Ford Focus, Honda Civic, Hyundai i20,
Mercedes C Serisi, Opel Astra, Peugeot 2008, Renault Clio, Toyota Corolla, VW Passat, Audi A3

Column: Popüler Markalar (parts brands)
Links (12 parts brands → /marka/{slug}):
Bosch, Valeo, SKF, Delphi, TRW, Febi Bilstein, Gates, Hella, Sachs, Filtron, Magneti Marelli, NGK

Column: Popüler Kategoriler
Links (12 categories → /kategori/{slug}):
Fren Balatası, Fren Diski, ABS Sensörü, Amortisör, Hava Filtresi, Yağ Filtresi,
Motor Yağı, Debriyaj Seti, Far Lambası, Ateşleme Bujisi, Polen Filtresi, Akü
```

**Frontend impact:** `apps/web/src/components/layout/Footer.tsx` — add 4 columns. Data should be hardcoded (static links, not API-fetched) to avoid slowing down page render. Use `next/link` for all links.

**Backend/database impact:** None.

**Admin panel impact:** None initially. Optionally add an admin UI to manage footer links later.

**SEO impact:** Very high. Every page now links to 12 vehicle make pages, 12 model pages, 12 parts brand pages, and 12 category pages. This dramatically improves crawl coverage and PageRank distribution.

**Complexity estimate:** Low. Static HTML/TSX changes to Footer.tsx. No API calls.

**Dependencies:** P0-2 (vehicle model pages must exist before linking to them).

---

#### P0-4: Add Sticky Announcement Bar

**Current Akinel state:** No announcement bar exists. The free-shipping threshold and phone number are not surface-level visible.

**Competitor reference:** Otoparcasan — full-width orange sticky bar: free shipping threshold + phone + WhatsApp.

**Why it matters:** The free shipping threshold is one of the most powerful average-order-value levers in e-commerce. If the threshold is 500 TL and a user's cart is at 350 TL, surfacing "150 TL daha ekleyin, kargo bedava!" increases AOV measurably. The bar must be sticky (scroll-persistent) to remain visible throughout browsing.

**Exact proposed change:**
Create `apps/web/src/components/layout/AnnouncementBar.tsx` (note: this file already exists as listed — verify its current content and extend it if needed). The bar should:
- Span 100% width.
- Background: brand primary colour (orange or Akinel's primary).
- Content: free shipping threshold message (e.g., "500 TL üzeri siparişlerde KARGO BEDAVA") + phone number + WhatsApp icon linking to `https://wa.me/{number}`.
- Position: `sticky top-0 z-50` (above the header).
- Dismissible: optional close button that sets a session cookie/localStorage flag.
- Admin-managed: the message text and threshold should be editable from the admin panel.

**Frontend impact:**
- Add `<AnnouncementBar />` to `apps/web/src/app/layout.tsx` (root layout) above the `<Header />`.
- If admin-managed: fetch announcement bar content from API or from admin-managed `BusinessStrip` settings.

**Backend/database impact:** Optional. If admin-managed, add an `AnnouncementBar` settings object to the site settings table. Otherwise, hardcode the threshold.

**Admin panel impact:** Add an "Announcement Bar" settings section in the admin dashboard.

**SEO impact:** Minimal (bar content is not crawled as page content).

**Complexity estimate:** Low. Primarily a UI component.

**Dependencies:** None.

---

### P1 — Strongly Recommended

---

#### P1-1: Add Brand Logo Navigation Strip

**Current Akinel state:** No brand logo strip in header. The header (`apps/web/src/components/layout/Header.tsx`) has navigation links but no visual brand-logo one-click navigation.

**Competitor reference:** Otoparcasan — horizontal strip immediately below header with "TÜM ARAÇLAR" button + 13 brand logos (clickable, each → brand page).

**Why it matters:** Brand logos provide visual recognition shortcuts that text links do not. A user looking for BMW parts will see the BMW roundel and click immediately — no reading required. This reduces the average number of taps/clicks to reach vehicle-filtered products from homepage.

**Exact proposed change:**
Create `apps/web/src/components/layout/VehicleBrandStrip.tsx`:
- Full-width horizontal strip.
- First item: "TÜM ARAÇLAR" pill button → `/arac`.
- Followed by: 12–13 vehicle make logos (BMW, Mercedes-Benz, VW, Audi, Toyota, Hyundai, Ford, Fiat, Opel, Renault, Peugeot, Citroën) with clickable logo images → `/arac/{make-slug}-yedek-parca`.
- On mobile: horizontally scrollable (overflow-x: auto, no scrollbar visible).
- Brand logos: SVG files (serve from `/public/brand-logos/{make-slug}.svg`).

**Frontend impact:**
- Add `<VehicleBrandStrip />` to `apps/web/src/app/layout.tsx` (site-wide) below `<Header />`.
- Or add it only to the shop layout if admin pages should not show it.

**Backend/database impact:** None. Logo assets are static files.

**Admin panel impact:** Optionally allow admin to configure which makes appear in the strip.

**SEO impact:** The strip adds 12+ internal links to make pages on every page of the site, reinforcing crawlability and PageRank flow.

**Complexity estimate:** Low.

**Dependencies:** P0-2 (vehicle make pages must exist).

---

#### P1-2: Add Popular Brand Cards with Model Links (Homepage)

**Current Akinel state:** `apps/web/src/app/page.tsx` — Popular Brands section shows pill-style text buttons only. No cards, no model links.

**Competitor reference:** Otoparcasan homepage Section 5 — horizontally scrolling carousel of brand cards. Each card: large brand logo + 6–8 model names as links + "BMW ÜRÜNLERINI LİSTELE" CTA.

**Why it matters:** A user who owns a BMW 3 Serisi can click directly to that model's page from the homepage without going through the 4-step vehicle selector. This is a significant reduction in friction. The model links also serve as internal links passing homepage PageRank to model pages.

**Exact proposed change:**
Replace the pill-button Popular Brands section in `apps/web/src/app/page.tsx` with a `<PopularBrandCards />` component (create `apps/web/src/components/home/PopularBrandCards.tsx`):

Component structure:
```
<PopularBrandCards>
  <BrandCard make="BMW" logo="/brand-logos/bmw.svg" href="/arac/bmw-yedek-parca">
    models={["3 Serisi", "1 Serisi", "5 Serisi", "X3", "X5", "X6"]}
    modelsBaseHref="/arac/bmw"
    ctaLabel="BMW Ürünlerini Listele"
  />
  <BrandCard make="Mercedes-Benz" ... />
  ... (8–10 brands)
</PopularBrandCards>
```

Carousel behaviour: horizontal auto-advancing carousel on desktop (shows 4 cards), swipeable on mobile (shows 1.5 cards to hint scroll).

**Frontend impact:** New `PopularBrandCards.tsx` component + update `page.tsx` to use it.

**Backend/database impact:** Model list data can be hardcoded (static, updated via seeder or admin) or fetched from `GET /api/vehicles/makes?popular=true` + `GET /api/vehicles/makes/{id}/models?popular=true`. Start hardcoded to reduce complexity.

**Admin panel impact:** Optionally allow admin to configure which models appear per brand.

**SEO impact:** 60–80 new internal links from homepage to model pages. High PageRank value for targeted model pages.

**Complexity estimate:** Low-Medium.

**Dependencies:** P0-2 (vehicle model pages).

---

#### P1-3: Fix VIN Search for Turkish Market

**Current Akinel state:** `apps/web/src/app/(shop)/vin/page.tsx` uses the NHTSA vPIC API. This is a US government database that does not reliably contain Turkish market VINs.

**Competitor reference:** Otoparcasan and OnlineYedekParca both use internal Turkish vehicle databases for VIN resolution.

**Why it matters:** A VIN feature that returns no results (or wrong results) for Turkish vehicles damages trust and is worse than no feature at all. Users who try it once and get no results will not try again.

**Exact proposed change — Phase 1 (immediate):**
- Add a banner/notice on the `/vin` page: "VIN ile araç sorgulama özelliğimiz yakında Türkiye araç veritabanı ile güncellenecektir."
- If no result is found from NHTSA, do not show an error — show: "Aracınızı bulamadık. Lütfen araç seçim aracını kullanın." with a link to `/vehicle`.
- Consider hiding the VIN tab from the homepage widget until the data source is fixed.

**Exact proposed change — Phase 2 (proper fix):**
- In `apps/api/Akinel.Api/Controllers/VehiclesController.cs`, add `POST /api/vehicles/vin-decode` endpoint (already exists per CLAUDE.md — verify implementation).
- Replace the NHTSA call with a lookup against the internal `VehicleGeneration` table using VIN World Manufacturer Identifier (WMI — first 3 chars) and Vehicle Descriptor Section (VDS — chars 4–9).
- Maintain a `VinWmiMapping` table: `WMI VARCHAR(3)` → `VehicleMakeId`. Seed with common Turkish-market WMIs (BMW: WBA/WBS, Mercedes: WDB/WDD, Toyota: SB1/NMT, Ford: WF0, VW: WVW, Audi: WAU, Fiat: ZFA, Renault: VF1, Opel: W0L, Hyundai: KMHC, Kia: KNAGC).
- VDS decode: chars 4–6 typically identify model line. Maintain `VinVdsMapping` table: `VDS CHAR(3)` → `VehicleModelId`. This requires manual curation but covers the most common 100–200 model/year combinations.
- Model year from VIN position 10: standard VIN year code table (A=1980, B=1981... K=2019, L=2020, M=2021, N=2022, P=2023, R=2024, S=2025, T=2026).

**Backend/database impact:**
- New entity `VinWmiMapping` in `apps/api/Akinel.Domain/Entities/`.
- EF Core configuration + migration.
- Seed data for 15–20 WMIs covering Turkish market top makes.

**Admin panel impact:** Add a "VIN WMI Mappings" admin page to manage make-level WMI codes.

**SEO impact:** The `/vin` page gains value and can be indexed as a useful tool.

**Complexity estimate:** Medium (Phase 1: Low; Phase 2: Medium-High).

**Dependencies:** None for Phase 1. Vehicle make/model data quality for Phase 2.

---

#### P1-4: Add Installment / Taksit Information

**Current Akinel state:** No installment information anywhere on the site.

**Competitor reference:** Otoparcasan homepage Section 7 — "7500TL+ siparişlerde 2 taksit %0 komisyon" / "10000TL+ siparişlerde 3 taksit %0 komisyon".

**Why it matters:** In Turkey, installment payment (taksit) is a critical purchase decision factor for items over ~1,500 TL. A compressor kit at 8,000 TL becomes much more accessible framed as "4 x 2,000 TL". Without surfacing this, Akinel loses conversions on high-value orders.

**Exact proposed change:**
1. Add a taksit banner component (`apps/web/src/components/home/TaksitBanner.tsx`) between the CategoryStrip and the Akinel Introduction section in `page.tsx`.
2. Content: full-width gradient banner with 2 columns — "X TL üzeri 2 taksit %0 komisyon" + "Y TL üzeri 3 taksit %0 komisyon". Use the actual thresholds supported by the payment provider.
3. On product pages (`apps/web/src/app/(shop)/products/[slug]/page.tsx`): show inline taksit breakdown below the price — "veya 3 x {price/3} TL" when price exceeds the threshold.
4. Admin-managed: add installment threshold settings to admin panel.

**Frontend impact:** New `TaksitBanner.tsx` component + product page price section update.

**Backend/database impact:** Minimal. Store installment thresholds as site settings.

**Admin panel impact:** Add installment threshold settings in admin → Settings.

**SEO impact:** None directly. Improves conversion rate.

**Complexity estimate:** Low.

**Dependencies:** None.

---

#### P1-5: Add Oil & Maintenance Homepage Section

**Current Akinel state:** No oil or maintenance section on homepage.

**Competitor reference:** Otoparcasan homepage Section 8 — tabbed section: Motor Yağı | Ampul | Oto Bakım | Aksesuar | Akü. Active tab shows grid of oil brand logos.

**Why it matters:** Surfacing oil products on the homepage immediately communicates that Akinel is a full-service automotive store, not just a parts-on-demand site. It also generates cross-sell revenue from users who came for a specific part and also need an oil change.

**Exact proposed change:**
Create `apps/web/src/components/home/OilMaintenanceSection.tsx`:
- Tabs: Motor Yağı | Antifriz | Oto Bakım | Aksesuar
- Active tab (Motor Yağı) shows: brand logo grid (Castrol, Motul, Elf, Total, Mobil, Shell) — each logo links to `/marka/{brand-slug}?category=motor-yagi`.
- Other tabs show relevant product grids or subcategory cards.
- Place in homepage between the CategoryStrip and Featured Products sections.

**Frontend impact:** New component + update `page.tsx`.

**Backend/database impact:** Requires P0-1 (oil categories and products seeded).

**Admin panel impact:** None initially.

**SEO impact:** Adds keyword-rich content area for oil-related terms on the homepage.

**Complexity estimate:** Low (once P0-1 is done).

**Dependencies:** P0-1 (oil category).

---

#### P1-6: Add Best Sellers / Popular Products Section

**Current Akinel state:** Homepage shows "Featured Products" (admin-selected). No algorithmically-ranked popular/best-seller section.

**Competitor reference:** Otoparcasan Section 9 "En Çok Satılanlar", OnlineYedekParca "Öne Çıkan Ürünler" and "Haftanın Fırsatları".

**Why it matters:** Best-seller rankings serve as social proof ("other people buy this") and reduce decision fatigue. They also surface the highest-conversion-rate products prominently.

**Exact proposed change:**
1. Add `PopularScore INT` or use `OrderCount INT` on the `Product` entity, updated by a background job (or simply updated when orders are placed).
2. New API endpoint: `GET /api/products/popular?count=8` — returns products ordered by `OrderCount DESC` (or a composite score).
3. Add `<BestSellersSection />` component to homepage in `apps/web/src/app/page.tsx`.

**Frontend impact:** New component + homepage update.

**Backend/database impact:** `OrderCount` tracking on Product (increment via order-placed event). New API endpoint in `ProductsController.cs`.

**Admin panel impact:** Optionally allow admin to override best-seller ranking for merchandising purposes.

**SEO impact:** None directly. Improves engagement metrics (time on site, pages per session).

**Complexity estimate:** Medium (order count tracking + new endpoint + component).

**Dependencies:** None.

---

#### P1-7: Add Homepage SEO Text Block + FAQ Accordion

**Current Akinel state:** No SEO text block or FAQ on homepage.

**Competitor reference:** Otoparcasan homepage Section 11 — H1 "Oto Yedek Parça" + multiple H2 keyword-rich paragraphs + FAQ accordion (8 Q&As). The H1 is the generic primary keyword, not the brand name.

**Why it matters:** Generic keyword queries ("oto yedek parça", "online yedek parça") are the highest-volume queries in this sector. Without an H1 targeting these keywords on the homepage, Akinel cannot rank for them. The FAQ accordion targets Featured Snippet positions for "question-based" queries.

**Exact proposed change:**
1. Add an SEO text section at the bottom of `apps/web/src/app/page.tsx` (below all product/conversion sections, above the footer).
2. Structure:
   ```html
   <h1>Oto Yedek Parça</h1>
   <h2>Online Araç Yedek Parça Alışverişi</h2>
   <p>Aracınıza uyumlu yedek parçaları Akinel'de bulun...</p>
   <h2>Güvenli ve Hızlı Teslimat</h2>
   <p>...</p>
   <h2>Sık Sorulan Sorular</h2>
   <FAQ items={faqItems} />
   ```
3. FAQ items (seed with 8 Q&As): "Siparişim ne zaman kargoya verilir?", "Parçam araçıma uyumlu mu?", "İade koşulları nelerdir?", "Kredi kartıyla taksit yapabilir miyim?", etc.
4. Add `FAQPage` JSON-LD schema for the FAQ items.

**Frontend impact:** New `SeoTextBlock.tsx` and `FaqAccordion.tsx` components + page.tsx update.

**Backend/database impact:** None if hardcoded. Optionally admin-managed via a CMS-style text block.

**Admin panel impact:** Optionally add "Homepage SEO Content" text editor in admin panel.

**SEO impact:** High. Enables ranking for generic head terms. FAQ schema targets rich result/Featured Snippet positions.

**Complexity estimate:** Low (if hardcoded). Medium (if admin-managed).

**Dependencies:** None.

---

#### P1-8: Add Vehicle Makes Browse Page (/arac)

**Current Akinel state:** `/vehicle` page exists but only shows the selection widget — no browseable catalog of all makes.

**Competitor reference:** Otoparcasan `/arac` — full A-Z indexed grid of 50+ makes with logos.

**Why it matters:** Users who are browsing (not ready to commit to a specific vehicle) need a discovery page. "/arac" also becomes an indexed page that can rank for "araç yedek parça" queries and serves as the top of the vehicle-based navigation hierarchy.

**Exact proposed change:**
Create `apps/web/src/app/(shop)/arac/page.tsx` (this is also the parent directory for P0-2 make/model pages):
- Title: "Araçlar — Akinel Oto Yedek Parça"
- Content: A-Z tab navigation + make logo grid. Each make logo links to `/arac/{make-slug}-yedek-parca`.
- Fetch makes from `GET /api/vehicles/makes` (already exists).
- Add alphabetical index tabs (A, B, C… Z) that scroll to the corresponding section.
- Add a search input that filters makes client-side.

**Frontend impact:** New `apps/web/src/app/(shop)/arac/page.tsx`.

**Backend/database impact:** None — existing `GET /api/vehicles/makes` endpoint serves the data.

**Admin panel impact:** None.

**SEO impact:** New indexable page targeting "araç yedek parça" + all make names. Each make name on this page is an anchor text internal link.

**Complexity estimate:** Low.

**Dependencies:** P0-2 (make pages for links to point to).

---

#### P1-9: Add Social Proof Stats Bar

**Current Akinel state:** No social proof numbers on the site.

**Competitor reference:** Otoparcasan Section 10 — "159+ Bin Mutlu Müşteri, 276+ Bin Sipariş" with a review carousel.

**Why it matters:** Social proof reduces purchase hesitation, especially for first-time customers evaluating an unknown brand. Concrete numbers ("276,000 orders") are more persuasive than generic trust statements.

**Exact proposed change:**
Create `apps/web/src/components/home/SocialProofBar.tsx`:
- 3 stat tiles: "X+ Mutlu Müşteri" | "Y+ Sipariş Tamamlandı" | "Z+ Ürün Çeşidi"
- Pull actual counts from API: `GET /api/stats/social-proof` → `{ customerCount, orderCount, productCount }`.
- If counts are low (early stage), show category/brand counts instead ("500+ Ürün, 5 Popüler Marka, Türkiye Geneli Kargo").
- Animated number counter on scroll-into-view.

**Frontend impact:** New component + page.tsx update.

**Backend/database impact:** New `GET /api/stats/social-proof` endpoint in `StatsController.cs` — simple `COUNT` queries on customers, orders, products.

**Admin panel impact:** None.

**SEO impact:** None directly.

**Complexity estimate:** Low-Medium.

**Dependencies:** None.

---

### P2 — Nice to Have

---

#### P2-1: Product Star Ratings

**Current Akinel state:** No rating system.

**Competitor reference:** OnlineYedekParca — star ratings on product cards and product pages.

**Exact proposed change:**
Add `ProductReview` entity: `ProductId`, `CustomerId`, `Rating (1-5)`, `Comment TEXT`, `CreatedAt`, `IsApproved BOOL`. Add `AverageRating DECIMAL` and `ReviewCount INT` as computed/cached fields on `Product`. Display stars on product cards and product pages. Admin approval queue for reviews.

**Complexity estimate:** High. Requires new entity, migration, API endpoints (submit review, list reviews, admin approve), frontend components.

**Dependencies:** Order system (only allow reviews from users who purchased the product).

---

#### P2-2: Wiper Finder Tool (Silecek Bulucu)

**Current Akinel state:** Not present.

**Competitor reference:** Otoparcasan — "Silecek Bulucu" promo tile on homepage, links to a tool that finds correct wiper blade sizes for a selected vehicle.

**Exact proposed change:**
Add a `WiperSize` table: `VehicleEngineId`, `DriverSideMm INT`, `PassengerSideMm INT`, `RearMm INT?`. Create a tool page at `/silecek-bulucu` that uses the standard vehicle selector (Make → Model → Generation → Engine) and outputs the correct wiper sizes, with links to matching wiper products.

**Complexity estimate:** Medium. Requires data entry (wiper sizes per vehicle).

**Dependencies:** P0-2 (vehicle catalog pages).

---

#### P2-3: Maintenance Schedule Tool (Bakım Robotu)

**Current Akinel state:** Not present.

**Competitor reference:** Otoparcasan `/periyodik-bakim-robotu` — "1,124,712 parts checked, 7/24". Select vehicle → robot finds all periodic maintenance parts → add to cart.

**Exact proposed change:**
Add a `MaintenanceSchedule` entity: `VehicleEngineId`, `Interval (km or months)`, `CategoryId` (e.g., oil filter every 15,000 km), `Notes`. Create a tool page at `/bakim-robotu`. Vehicle selection → query maintenance schedules → display list of recommended parts → bulk "add all to cart" CTA.

This is a major AOV driver — a single maintenance session could add 5–10 SKUs to cart simultaneously.

**Complexity estimate:** High. Requires extensive data entry for maintenance schedules per vehicle + cart integration.

**Dependencies:** P0-1 (oil/filter categories), vehicle catalog completeness.

---

#### P2-4: Authorised Service Centers (Anlaşmalı Servisler)

**Current Akinel state:** Not present.

**Competitor reference:** Otoparcasan — "Anlaşmalı Servisler" tab in vehicle selector and link in footer.

**Exact proposed change:**
Add a `ServiceCenter` entity: `Name`, `Address`, `City`, `Phone`, `Lat`, `Lng`, `MakeSpecializations[]`. Create a `/anlasmali-servisler` page with a map and list. Admin can add/edit service centers.

**Complexity estimate:** Medium. Requires Google Maps API or Mapbox integration.

**Dependencies:** None.

---

#### P2-5: Fix English URLs

**Current Akinel state:** Product URLs use `/products/{slug}` (English). Vehicle selection page is `/vehicle`. Brands list is `/brands`.

**Proposed change:**
- Rename `/products/{slug}` → `/urun/{slug}` (Turkish: ürün = product).
- Rename `/vehicle` → `/arac` (already proposed as P1-8 browse page; the selection widget can live at `/arac` too).
- Rename `/brands` → `/markalar`.
- Add 301 redirects from old URLs (important: do not break existing indexed URLs).

**Complexity estimate:** Low (rename routes + add redirects in `next.config.js`).

**Dependencies:** P0-2 and P1-8 create the new `/arac` route structure.

---

## 14. Recommended Akinel Homepage & Vehicle Discovery Structure

This section specifies the exact proposed homepage layout and vehicle discovery architecture as a developer-ready specification.

### 14.1 Homepage — Proposed Section Order

```
┌─────────────────────────────────────────────────────────────┐
│ 1. AnnouncementBar (sticky, z-50)                           │
│    "500 TL üzeri siparişlerde KARGO BEDAVA | ☎ 0850 XXX XX │
│     XX | WhatsApp"                                          │
│    File: apps/web/src/components/layout/AnnouncementBar.tsx │
├─────────────────────────────────────────────────────────────┤
│ 2. Header                                                   │
│    Logo | Search (vehicle + part) | Garajım | Sepet | Giriş│
│    File: apps/web/src/components/layout/Header.tsx          │
├─────────────────────────────────────────────────────────────┤
│ 3. VehicleBrandStrip                                        │
│    [TÜM ARAÇLAR] [BMW] [Mercedes] [VW] [Audi] [Toyota] ... │
│    File: NEW apps/web/src/components/layout/               │
│         VehicleBrandStrip.tsx                               │
├─────────────────────────────────────────────────────────────┤
│ 4. Hero Section                                             │
│    Left: HeroCarousel (existing, keep)                      │
│    Right: Vehicle Selector Card (tabs)                      │
│      Tab 1: Araç Kataloğu (Make→Model→Gen→Engine dropdown) │
│      Tab 2: Şasi No ile Ara (VIN input — Phase 1: disabled) │
│      Tab 3: Garajımdan Seç                                  │
│    Files: existing HeroCarousel.tsx + vehicle selector      │
├─────────────────────────────────────────────────────────────┤
│ 5. BusinessStrip (existing — keep)                          │
│    4 trust signals                                          │
│    File: apps/web/src/components/home/BusinessStrip.tsx     │
├─────────────────────────────────────────────────────────────┤
│ 6. PopularBrandCards carousel (NEW)                         │
│    [BMW card: logo + 3 Serisi, 1 Serisi, X3...] [Fiat...]  │
│    File: NEW apps/web/src/components/home/                  │
│         PopularBrandCards.tsx                               │
├─────────────────────────────────────────────────────────────┤
│ 7. CategoryStrip (existing — keep, add Oto Bakım chip)      │
│    File: apps/web/src/components/home/CategoryStrip.tsx     │
├─────────────────────────────────────────────────────────────┤
│ 8. TaksitBanner (NEW)                                       │
│    "X TL üzeri 2 taksit %0 | Y TL üzeri 3 taksit %0"      │
│    File: NEW apps/web/src/components/home/TaksitBanner.tsx  │
├─────────────────────────────────────────────────────────────┤
│ 9. OilMaintenanceSection (NEW)                              │
│    Tabs: Motor Yağı | Antifriz | Oto Bakım | Aksesuar       │
│    Active: brand logo grid (Castrol, Motul, Elf, Total...)  │
│    File: NEW apps/web/src/components/home/                  │
│         OilMaintenanceSection.tsx                           │
├─────────────────────────────────────────────────────────────┤
│ 10. BestSellersSection (NEW)                                │
│     "En Çok Satılanlar" — product grid (8 items)            │
│     File: NEW apps/web/src/components/home/                 │
│          BestSellersSection.tsx                             │
├─────────────────────────────────────────────────────────────┤
│ 11. FeaturedProducts (existing — keep)                      │
│     Admin-curated products                                  │
├─────────────────────────────────────────────────────────────┤
│ 12. SocialProofBar (NEW)                                    │
│     "X+ Mutlu Müşteri | Y+ Sipariş | Z+ Ürün"              │
│     File: NEW apps/web/src/components/home/                 │
│          SocialProofBar.tsx                                 │
├─────────────────────────────────────────────────────────────┤
│ 13. SeoTextBlock + FaqAccordion (NEW)                       │
│     H1: "Oto Yedek Parça"                                   │
│     H2s: keyword-rich copy + FAQ (8 Q&As)                   │
│     FAQPage JSON-LD                                         │
│     File: NEW apps/web/src/components/home/SeoTextBlock.tsx │
├─────────────────────────────────────────────────────────────┤
│ 14. Footer (EXTEND existing)                                │
│     Add 4 SEO columns (see P0-3)                           │
│     File: apps/web/src/components/layout/Footer.tsx         │
└─────────────────────────────────────────────────────────────┘
```

### 14.2 Vehicle Discovery Architecture — URL Tree

```
/arac                                    → Makes browse page (A-Z, logos)
  /arac/bmw-yedek-parca                  → BMW make page (products + series filter)
    /arac/bmw/3-serisi                   → BMW 3 Serisi model page
    /arac/bmw/1-serisi                   → BMW 1 Serisi model page
    /arac/bmw/5-serisi                   → BMW 5 Serisi model page
    /arac/bmw/x3                         → BMW X3 model page
  /arac/mercedes-benz-yedek-parca        → Mercedes-Benz make page
    /arac/mercedes-benz/c-serisi         → Mercedes C Serisi model page
    /arac/mercedes-benz/e-serisi         → Mercedes E Serisi model page
  /arac/volkswagen-yedek-parca           → VW make page
  /arac/toyota-yedek-parca              → Toyota make page
  ... (all makes)
```

Each make page and model page is statically generated at build time via `generateStaticParams`.

### 14.3 Category Architecture — Proposed Full Tree

```
/kategori
  /kategori/fren-sistemi                 → (existing) Fren Sistemi
    /kategori/fren-balatasi              → (existing)
    /kategori/fren-diski                 → (existing)
    /kategori/abs-sensorleri             → (existing)
  /kategori/debriyaj                     → (existing)
  /kategori/filtreler                    → (existing)
    /kategori/yag-filtresi               → (existing)
    /kategori/hava-filtresi              → (existing)
  /kategori/suspansiyon                  → (existing)
  /kategori/elektrik-sistemi             → (existing)
  /kategori/sogutma-sistemi              → (existing)
  /kategori/oto-bakim-ve-yagllar         → (NEW — P0-1)
    /kategori/motor-yagi                 → (NEW)
    /kategori/antifriz                   → (NEW)
    /kategori/fren-hidrolik-yagi         → (NEW)
    /kategori/sanziman-yagi              → (NEW)
    /kategori/cam-yikama-suyu            → (NEW)
    /kategori/yakut-katkisi              → (NEW)
    /kategori/oto-yikama-sampuani        → (NEW)
    /kategori/pasta-cila                 → (NEW)
    /kategori/ad-blue                    → (NEW)
```

Note: The current URL scheme uses flat slugs (`/kategori/fren-balatasi`) rather than nested (`/kategori/fren-sistemi/fren-balatasi`). This is acceptable for SEO as long as the parent-child relationship is expressed via breadcrumbs and JSON-LD BreadcrumbList.

### 14.4 Footer — Proposed Column Structure

```
Column 1: Kurumsal          Column 2: Hızlı Erişim
  Hakkımızda                  Araç Kataloğu (/arac)
  İletişim                    Tüm Kategoriler (/kategori)
  Gizlilik Politikası         Garaja Ekle (/garage)
  Kullanım Şartları           VIN Sorgulama (/vin)
  İptal ve İade               Bakım Robotu (/bakim-robotu)*
  Kargo Bilgisi               Silecek Bulucu (/silecek-bulucu)*
  SSS                         Blog (/blog)*

Column 3: Popüler Araçlar   Column 4: Popüler Modeller
  BMW                         BMW 3 Serisi
  Mercedes-Benz               Fiat Egea
  Volkswagen                  Ford Focus
  Audi                        Honda Civic
  Toyota                      Hyundai i20
  Hyundai                     Mercedes C Serisi
  Ford                        Opel Astra
  Fiat                        Peugeot 2008
  Opel                        Renault Clio
  Renault                     Toyota Corolla
  Peugeot                     VW Passat
  Citroën                     Audi A3
  Tüm Araçlar →

Column 5: Popüler Markalar  Column 6: Popüler Kategoriler
  Bosch                       Fren Balatası
  Valeo                       Fren Diski
  SKF                         ABS Sensörü
  Delphi                      Amortisör
  TRW                         Hava Filtresi
  Febi Bilstein               Yağ Filtresi
  Gates                       Motor Yağı
  Hella                       Debriyaj Seti
  Sachs                       Far Lambası
  Filtron                     Ateşleme Bujisi
  Magneti Marelli             Polen Filtresi
  NGK                         Akü

* = Future features; link to "Yakında" page until implemented
```

### 14.5 New API Endpoints Required

| Endpoint | Purpose | Priority |
|---|---|---|
| `GET /api/vehicles/makes/{makeSlug}/products` | Products for all engines of a make | P0-2 |
| `GET /api/vehicles/models/{modelSlug}/products` | Products for all engines of a model | P0-2 |
| `GET /api/vehicles/makes/{makeSlug}/models` | Models for a make (already exists as `makes/{id}/models` — add slug variant) | P0-2 |
| `GET /api/products/popular` | Best-selling products | P1-6 |
| `GET /api/stats/social-proof` | Customer/order/product counts | P1-9 |
| `POST /api/vehicles/vin-decode` | VIN → vehicle (already exists — fix data source) | P1-3 |

### 14.6 New Database Entities Required

| Entity | Purpose | Priority |
|---|---|---|
| `Category.IsVehicleSpecific` (new field) | Flag maintenance/oil categories as not requiring vehicle context | P0-1 |
| `VinWmiMapping` | WMI prefix → VehicleMakeId for VIN decode | P1-3 |
| `Product.OrderCount` (new field) | Track popularity for best-sellers endpoint | P1-6 |
| `ProductReview` | Customer ratings and reviews | P2-1 |
| `WiperSize` | Wiper blade sizes per vehicle | P2-2 |
| `MaintenanceSchedule` | Periodic maintenance items per vehicle | P2-3 |
| `ServiceCenter` | Authorised repair centers | P2-4 |

### 14.7 Implementation Order

Given the dependencies between features, the recommended implementation sequence is:

**Sprint 1 (P0 — can be parallelised across developers):**
- P0-4: Announcement bar (1 day, no dependencies)
- P0-3: Footer SEO columns (1 day, can stub /arac links with coming-soon redirect)
- P0-1: Oto Bakım ve Yağlar category + seeder (2 days)

**Sprint 2:**
- P0-2: Vehicle make + model pages (3–4 days, unblocks P1-1, P1-2)
- P1-4: Taksit banner (0.5 days)
- P1-7: SEO text + FAQ accordion (1 day)

**Sprint 3:**
- P1-1: VehicleBrandStrip (1 day, needs P0-2)
- P1-2: PopularBrandCards (2 days, needs P0-2)
- P1-8: /arac browse page (1 day, needs P0-2)
- P1-3 Phase 1: VIN fix (disable broken feature, 0.5 days)

**Sprint 4:**
- P1-5: Oil & Maintenance homepage section (1 day, needs P0-1)
- P1-6: Best sellers (2 days)
- P1-9: Social proof bar (1 day)
- P2-5: Fix English URLs with redirects (1 day)

**Sprint 5 (P2):**
- P2-1: Product ratings
- P2-2: Wiper finder
- P2-3: Maintenance robot
- P2-4: Service centers

---

*Report generated: 2026-10-05. Based on codebase analysis of `/Users/sercanfurunci/Desktop/akinel-yedekparca` and competitor research on otoparcasan.com and onlineyedekparca.com.*
