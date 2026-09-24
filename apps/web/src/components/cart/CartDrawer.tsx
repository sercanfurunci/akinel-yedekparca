'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingCart, Package } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, getImageUrl } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function CartDrawer() {
  const { items, subTotal, totalItems, isOpen, closeCart, updateItem, removeItem, isLoading } = useCartStore();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) closeCart(); }}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-4 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart size={20} />
            Sepetim
            {totalItems > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-brand-foreground text-xs font-bold">
                {totalItems}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <ShoppingCart size={48} className="text-muted-foreground/30" strokeWidth={1} />
            <div>
              <p className="font-medium">Sepetiniz boş</p>
              <p className="text-sm text-muted-foreground mt-1">Ürün eklemek için alışverişe başlayın.</p>
            </div>
            <Link
              href="/products"
              onClick={closeCart}
              className="inline-flex items-center justify-center rounded-lg bg-brand text-brand-foreground hover:bg-brand/90 h-9 px-4 text-sm font-medium transition-colors"
            >
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto">
              <ul className="divide-y">
                {items.map((item) => {
                  const imgUrl = getImageUrl(item.imageUrl);
                  return (
                    <li key={item.productId} className="flex gap-3 p-4">
                      {/* Image */}
                      <Link href={`/products/${item.slug}`} onClick={closeCart} className="shrink-0">
                        <div className="w-16 h-16 rounded-lg border bg-muted overflow-hidden flex items-center justify-center">
                          {imgUrl ? (
                            <img src={imgUrl} alt={item.productName} className="w-full h-full object-contain p-1" />
                          ) : (
                            <Package size={24} className="text-muted-foreground/30" strokeWidth={1} />
                          )}
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground truncate">{item.brandName}</p>
                        <Link href={`/products/${item.slug}`} onClick={closeCart}>
                          <p className="text-sm font-medium leading-snug line-clamp-2 hover:text-brand transition-colors">
                            {item.productName}
                          </p>
                        </Link>
                        <p className="text-sm font-bold text-brand mt-1">
                          {formatPrice(item.price, item.currency)}
                        </p>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateItem(item.productId, item.quantity - 1)}
                            disabled={isLoading || item.quantity <= 1}
                            className="flex h-6 w-6 items-center justify-center rounded border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Azalt"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateItem(item.productId, item.quantity + 1)}
                            disabled={isLoading}
                            className="flex h-6 w-6 items-center justify-center rounded border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Artır"
                          >
                            <Plus size={12} />
                          </button>
                          <span className="text-xs text-muted-foreground ml-1">
                            = {formatPrice(item.lineTotal, item.currency)}
                          </span>
                          <button
                            onClick={() => removeItem(item.productId)}
                            disabled={isLoading}
                            className="ml-auto text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
                            aria-label="Kaldır"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Footer */}
            <div className="border-t p-4 space-y-4">
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-medium">Ara Toplam</span>
                <span className="font-bold text-lg text-brand">{formatPrice(subTotal, 'TRY')}</span>
              </div>
              <Link href="/checkout" onClick={closeCart} className="block">
                <Button
                  className="w-full bg-brand text-brand-foreground hover:bg-brand/90 h-11"
                  disabled={isLoading}
                >
                  Ödemeye Geç
                </Button>
              </Link>
              <button
                onClick={closeCart}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                Alışverişe Devam Et
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
