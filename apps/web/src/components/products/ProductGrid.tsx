import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from '@/components/shared/Skeletons';
import type { ProductListItem } from '@/lib/types';

interface ProductGridProps {
  products: ProductListItem[];
  loading?: boolean;
  skeletonCount?: number;
}

export function ProductGrid({ products, loading = false, skeletonCount = 8 }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {loading
        ? Array.from({ length: skeletonCount }).map((_, i) => <ProductCardSkeleton key={i} />)
        : products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}
