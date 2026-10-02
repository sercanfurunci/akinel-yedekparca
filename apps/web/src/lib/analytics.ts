import posthog from 'posthog-js';

// Safe wrapper: swallows errors so analytics never breaks the UI
const capture = (event: string, properties?: Record<string, unknown>) => {
  if (typeof window === 'undefined') return;
  try {
    posthog.capture(event, properties);
  } catch {
    // Analytics must never break the app
  }
};

export const analytics = {
  // ── Product discovery ────────────────────────────────────────────────────
  productViewed: (product: {
    id: string;
    name: string;
    brand: string;
    category: string;
    price: number;
  }) =>
    capture('product_viewed', {
      product_id: product.id,
      product_name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
    }),

  productSearched: (
    query: string,
    resultCount: number,
    searchType: 'text' | 'oem' | 'vehicle'
  ) =>
    capture('product_searched', {
      query,
      result_count: resultCount,
      search_type: searchType,
    }),

  categoryViewed: (category: string, productCount?: number) =>
    capture('category_viewed', { category, product_count: productCount }),

  brandViewed: (brand: string) => capture('brand_viewed', { brand }),

  // ── Vehicle selection ────────────────────────────────────────────────────
  vehicleSelected: (vehicle: {
    make: string;
    model: string;
    generation: string;
    engine: string;
  }) =>
    capture('vehicle_selected', {
      vehicle_make: vehicle.make,
      vehicle_model: vehicle.model,
      vehicle_generation: vehicle.generation,
      vehicle_engine: vehicle.engine,
    }),

  // ── VIN search ────────────────────────────────────────────────────────────
  vinSearchStarted: () => capture('vin_search_started'),

  // found: true = VIN resolved to a vehicle, false = not found
  // Intentionally NOT sending the raw VIN — privacy
  vinSearchCompleted: (found: boolean) =>
    capture('vin_search_completed', { found }),

  // ── Cart ─────────────────────────────────────────────────────────────────
  addToCart: (product: {
    id: string;
    name: string;
    brand: string;
    quantity: number;
    price: number;
  }) =>
    capture('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      brand: product.brand,
      quantity: product.quantity,
      price: product.price,
    }),

  // ── Checkout funnel ───────────────────────────────────────────────────────
  checkoutStarted: (itemCount: number, totalAmount: number) =>
    capture('checkout_started', {
      item_count: itemCount,
      total_amount: totalAmount,
    }),

  purchaseCompleted: (orderNumber: string, itemCount: number, totalAmount: number) =>
    capture('purchase_completed', {
      order_number: orderNumber,
      item_count: itemCount,
      total_amount: totalAmount,
    }),

  // ── Auth ──────────────────────────────────────────────────────────────────
  signupStarted: () => capture('signup_started'),
  signupCompleted: () => capture('signup_completed'),
};

/*
 * FUNNEL this enables in PostHog:
 *
 * Acquisition funnel:
 *   page_view → product_searched / vehicle_selected / category_viewed
 *   → product_viewed → add_to_cart → checkout_started → purchase_completed
 *
 * Vehicle discovery funnel:
 *   vehicle_selected → product_viewed → add_to_cart → purchase_completed
 *
 * VIN funnel:
 *   vin_search_started → vin_search_completed (found=true) → product_viewed
 *
 * Events NOT yet implemented (require code changes in listed components):
 *   - product_viewed: add to apps/web/src/app/(shop)/products/[slug]/page.tsx
 *   - add_to_cart: add to apps/web/src/components/cart/AddToCartButton.tsx (or cartStore)
 *   - vehicle_selected: add to apps/web/src/components/vehicle/VehicleFinder.tsx
 *   - vin_search_started/completed: add to apps/web/src/app/(shop)/vin/page.tsx
 *   - category_viewed: add to apps/web/src/app/(shop)/category/[slug]/page.tsx
 *   - brand_viewed: add to apps/web/src/app/(shop)/brands/[slug]/page.tsx (if exists)
 *   - signup_started/completed: add to apps/web/src/app/(auth)/register/page.tsx
 *   checkout_started and purchase_completed are wired below in their pages.
 */
