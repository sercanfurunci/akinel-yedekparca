import posthog from 'posthog-js';

export const isPostHogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST
);

const capture = (event: string, properties?: Record<string, unknown>) => {
  if (typeof window === 'undefined' || !isPostHogConfigured) return;
  posthog.capture(event, properties);
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

  productSearched: (searchType: 'text' | 'oem' | 'vehicle', query?: string) =>
    capture('product_searched', { search_type: searchType, ...(query ? { query } : {}) }),

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

  vehicleSavedToGarage: () => capture('vehicle_saved_to_garage'),

  // ── VIN search ────────────────────────────────────────────────────────────
  vinSearchStarted: () => capture('vin_search_started'),

  // found: true = VIN resolved to a vehicle, false = not found
  // Intentionally NOT sending the raw VIN — privacy
  vinSearchCompleted: (found: boolean) =>
    capture('vin_search_completed', { found }),

  // ── Cart ─────────────────────────────────────────────────────────────────
  addToCart: (productId: string, quantity: number) =>
    capture('add_to_cart', {
      product_id: productId,
      quantity,
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
  loginCompleted: () => capture('login_completed'),
  signupStarted: () => capture('signup_started'),
  signupCompleted: () => capture('signup_completed'),

  // ── Product availability ─────────────────────────────────────────────────
  stockNotificationRequested: (productId: string) =>
    capture('stock_notification_requested', { product_id: productId }),
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
 * Core discovery, cart, checkout, and authentication events are wired at their
 * respective action handlers. Product, category, and brand view events remain
 * intentionally uninstrumented because they would fire on page load.
 */
