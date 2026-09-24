'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ProductListItem } from '@/lib/types';
import { formatPrice, stockStatusLabel, stockStatusColor, getImageUrl } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { AddToCartButton } from '@/components/cart/AddToCartButton';

interface Props {
  product: ProductListItem;
}

export function ProductCard({ product }: Props) {
  const [imgError, setImgError] = useState(false);
  const statusLabel = stockStatusLabel(product.stockStatus);
  const statusColor = stockStatusColor(product.stockStatus);
  const inStock = (product.stockStatus as unknown as number) === 2 || product.stockStatus === 'InStock' || product.stockStatus === 'LowStock' || (product.stockStatus as unknown as number) === 1;

  const resolvedImageUrl = imgError ? null : getImageUrl(product.primaryImageUrl);

  return (
    <Card className="group hover:shadow-md hover:border-brand/40 transition-all duration-200 overflow-hidden flex flex-col">
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image area */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {resolvedImageUrl ? (
            <img
              src={resolvedImageUrl}
              alt={product.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <img
              src="/images/placeholder-product.svg"
              alt={product.name}
              className="w-full h-full object-contain p-4"
            />
          )}
          {product.discountPercentage != null && product.discountPercentage > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
              %{Math.round(product.discountPercentage)} indirim
            </span>
          )}
        </div>

        <CardContent className="p-3 pb-2">
          {/* Brand name */}
          <div className="mb-0.5">
            <p className="text-xs text-muted-foreground truncate">{product.brandName}</p>
          </div>

          {/* Product name */}
          <h3 className="font-medium text-sm leading-snug line-clamp-2 mb-1.5 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Category */}
          <p className="text-xs text-muted-foreground mb-2.5 truncate">{product.categoryName}</p>

          {/* Price + Stock */}
          <div className="flex items-center justify-between gap-1">
            <div>
              <span className="font-bold text-base text-brand">
                {formatPrice(product.salePrice ?? product.price, product.currency)}
              </span>
              {product.salePrice != null && (
                <span className="ml-1.5 text-xs text-muted-foreground line-through">
                  {formatPrice(product.price, product.currency)}
                </span>
              )}
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
        </CardContent>
      </Link>

      {/* Sepete Ekle */}
      <div className="px-3 pb-3 mt-auto">
        <AddToCartButton productId={product.id} disabled={!inStock} />
      </div>
    </Card>
  );
}
