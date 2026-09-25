'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ProductListItem } from '@/lib/types';
import { formatPrice, stockStatusLabel, stockStatusColor, getImageUrl } from '@/lib/utils';
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
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-all duration-200 hover:border-brand/40 hover:shadow-lg hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-brand/40">
      <Link
        href={`/products/${product.slug}`}
        className="block cursor-pointer"
        aria-label={`${product.brandName} ${product.name} ürününü görüntüle`}
        title={product.name}
      >
        {/* Image area */}
        <div className="relative aspect-square bg-[#F3F4F6] overflow-hidden">
          {resolvedImageUrl ? (
            <img
              src={resolvedImageUrl}
              alt={product.name}
              onError={() => setImgError(true)}
              loading="lazy"
              className="w-full h-full object-contain p-5 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <img
              src="/images/placeholder-product.svg"
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-contain p-5"
            />
          )}
          {product.discountPercentage != null && product.discountPercentage > 0 && (
            <span
              className="absolute top-2.5 left-2.5 bg-brand text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm"
              aria-label={`%${Math.round(product.discountPercentage)} indirim`}
            >
              %{Math.round(product.discountPercentage)} İNDİRİM
            </span>
          )}
          {!inStock && (
            <span
              className="absolute top-2.5 right-2.5 bg-gray-700/85 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm"
              aria-label="Stokta yok"
            >
              STOKTA YOK
            </span>
          )}
        </div>

        <div className="p-4 pb-2">
          {/* Brand name */}
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            {product.brandName}
          </p>

          {/* Product name */}
          <h3 className="font-bold text-sm leading-snug line-clamp-2 mb-1.5 mt-1 min-h-[2.5rem] text-[#111827]">
            {product.name}
          </h3>

          {/* Category */}
          <p className="text-xs text-muted-foreground mb-3 truncate">{product.categoryName}</p>

          {/* Price + Stock */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="min-w-0">
              <span className="font-bold text-lg text-brand tracking-tight">
                {formatPrice(product.salePrice ?? product.price, product.currency)}
              </span>
              {product.salePrice != null && (
                <span className="ml-1.5 text-xs text-muted-foreground line-through">
                  {formatPrice(product.price, product.currency)}
                </span>
              )}
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 uppercase tracking-wide ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
        </div>
      </Link>

      {/* Sepete Ekle */}
      <div className="px-4 pb-4 mt-auto pt-1">
        <AddToCartButton productId={product.id} disabled={!inStock} />
      </div>
    </div>
  );
}
