export type StockStatus = 'OutOfStock' | 'LowStock' | 'InStock';

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  price: number;
  discountPercentage?: number;
  salePrice?: number;
  currency: string;
  stockStatus: StockStatus;
  primaryImageUrl?: string;
}

export interface Product extends ProductListItem {
  description?: string;
  partNumber?: string;
  sku?: string;
  isActive: boolean;
  availableQuantity: number;
  oemNumbers: string[];
  barcode?: string;
  weightKg?: number;
  widthCm?: number;
  lengthCm?: number;
  heightCm?: number;
  warrantyInfo?: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Preparing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentMethod = 'CreditCard' | 'BankTransfer' | 'CashOnDelivery';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productBrand?: string;
  productImageUrl?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingDistrict: string;
  shippingPostalCode: string;
  shippingNotes: string;
  subTotal: number;
  shippingCost: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  isPaid: boolean;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  itemCount: number;
  createdAt: string;
}

export interface CheckoutRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingDistrict: string;
  shippingPostalCode?: string;
  shippingNotes?: string;
  paymentMethod: number; // 0=CreditCard, 1=BankTransfer, 2=CashOnDelivery
  termsAccepted: boolean;
  privacyAccepted: boolean;
  distanceSalesAccepted: boolean;
  marketingConsent: boolean;
}

export interface OemEntry {
  id: string;
  number: string;
  manufacturer?: string;
}

export interface VehicleCompatibilityEntry {
  engineId: string;
  displayLabel: string;
  notes?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface VehicleMake { id: string; name: string; slug: string; logoUrl?: string; }
export interface VehicleModel { id: string; name: string; slug: string; vehicleMakeId: string; }
export interface VehicleGeneration { id: string; name: string; slug: string; vehicleModelId: string; yearFrom?: number; yearTo?: number; bodyType?: string; }
export interface VehicleEngine { id: string; name: string; vehicleGenerationId: string; displacement?: string; fuelType?: string; powerKw?: number; powerHp?: number; yearFrom?: number; yearTo?: number; engineCode?: string; }
export interface VehicleContext { engineId: string; makeName: string; modelName: string; generationName: string; engineName: string; displayLabel: string; }

export interface User { id: string; email: string; firstName: string; lastName: string; role: string; }
export interface AuthResponse { accessToken: string; refreshToken: string; expiresAt: string; user: User; }

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentCategoryId?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface AdminBrand extends Brand {
  isActive: boolean;
}

export interface AdminCategory extends Category {
  isActive: boolean;
  sortOrder: number;
}

export interface BusinessWorkingHour {
  dayOfWeek: number;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface BusinessSettings {
  id: string;
  companyName: string;
  shortDescription?: string;
  description?: string;
  logoUrl?: string;
  phone?: string;
  whatsApp?: string;
  email?: string;
  address?: string;
  district?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  googleMapsUrl?: string;
  googleMapsEmbedUrl?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  linkedInUrl?: string;
  workingHours: BusinessWorkingHour[];
}

// ── Admin Vehicle Catalog Types ──────────────────────────────────────────────

export interface VehicleMakeAdmin {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  modelCount: number;
}

export interface VehicleModelAdmin {
  id: string;
  name: string;
  vehicleMakeId: string;
  generationCount: number;
}

export interface VehicleGenerationAdmin {
  id: string;
  name: string;
  yearFrom?: number;
  yearTo?: number;
  bodyType?: string;
  engineCount: number;
}

export interface VehicleEngineAdmin {
  id: string;
  name: string;
  fuelType?: string;
  powerHp?: number;
  powerKw?: number;
  displacementCc?: number;
  displacement?: string;
  gearbox?: string;
  drivetrain?: string;
  engineCode?: string;
  yearFrom?: number;
  yearTo?: number;
  compatCount: number;
}

export interface AdminVehicleMakesResult {
  items: VehicleMakeAdmin[];
  total: number;
  page: number;
  pageSize: number;
}

export interface VehicleSearchResult {
  makes: Array<{ id: string; name: string; type: string }>;
  models: Array<{ id: string; name: string; makeName: string; makeId: string; type: string }>;
  engines: Array<{ id: string; name: string; path: string; makeId: string; type: string }>;
}

export interface CreateGenerationData {
  name: string;
  bodyType?: string;
  yearFrom?: number;
  yearTo?: number;
}

export interface CreateEngineData {
  name: string;
  fuelType?: string;
  powerHp?: number;
  displacementCc?: number;
  displacement?: string;
  gearbox?: string;
  drivetrain?: string;
  engineCode?: string;
  yearFrom?: number;
  yearTo?: number;
}

export interface ProductSearchQuery {
  query?: string;
  queryType?: 'FreeText' | 'OemNumber' | 'PartNumber' | 'Brand';
  categoryId?: string;
  brandId?: string;
  vehicleEngineId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: string;
  sortDescending?: boolean;
  page?: number;
  pageSize?: number;
}
