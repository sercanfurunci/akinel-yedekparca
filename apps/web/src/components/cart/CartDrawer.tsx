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
            <ShoppingCart size={48} className="text-muted-foreground/30" strokeWidth={1} aria-hidden="true" />
            <div>
              <p className="font-medium">Sepetiniz boş</p>
              <p className="text-sm text-muted-foreground mt-1">Ürün eklemek için alışverişe başlayın.</p>
            </div>
            <Link
              href="/products"
              onClick={closeCart}
              className="inline-flex items-center justify-center rounded-lg bg-brand text-brand-foreground hover:bg-brand/90 active:scale-[0.98] h-10 px-5 text-sm font-semibold transition-all cursor-pointer"
            >
              Ürünlere Göz At
            </Link>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto">
              <ul className="divide-y" aria-label="Sepet ürünleri">
                {items.map((item) => {
                  const imgUrl = getImageUrl(item.imageUrl);
                  return (
                    <li key={item.productId} className="flex gap-3 p-4">
                      {/* Image */}
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeCart}
                        className="shrink-0 cursor-pointer"
                        aria-label={`${item.productName} ürününe git`}
                      >
                        <div className="w-16 h-16 rounded-lg border bg-muted overflow-hidden flex items-center justify-center hover:border-brand/40 transition-colors">
                          {imgUrl ? (
                            <img src={imgUrl} alt={item.productName} className="w-full h-full object-contain p-1" />
                          ) : (
                            <Package size={24} className="text-muted-foreground/30" strokeWidth={1} aria-hidden="true" />
                          )}
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground truncate">{item.brandName}</p>
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="cursor-pointer"
                        >
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
                            type="button"
                            onClick={() => updateItem(item.productId, item.quantity - 1)}
                            disabled={isLoading || item.quantity <= 1}
                            className="flex h-7 w-7 items-center justify-center rounded border hover:bg-muted active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            aria-label={`${item.productName} adedini azalt`}
                            title="Azalt"
                          >
                            <Minus size={12} aria-hidden="true" />
                          </button>
                          <span
                            className="text-sm font-medium w-6 text-center"
                            aria-label={`Adet: ${item.quantity}`}
                            aria-live="polite"
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateItem(item.productId, item.quantity + 1)}
                            disabled={isLoading}
                            className="flex h-7 w-7 items-center justify-center rounded border hover:bg-muted active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            aria-label={`${item.productName} adedini artır`}
                            title="Artır"
                          >
                            <Plus size={12} aria-hidden="true" />
                          </button>
                          <span className="text-xs text-muted-foreground ml-1">
                            = {formatPrice(item.lineTotal, item.currency)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId)}
                            disabled={isLoading}
                            className="ml-auto text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded p-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            aria-label={`${item.productName} ürününü sepetten kaldır`}
                            title="Ürünü kaldır"
                          >
                            <Trash2 size={14} aria-hidden="true" />
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
                <span
                  className="font-bold text-lg text-brand"
                  aria-label={`Toplam tutar: ${formatPrice(subTotal, 'TRY')}`}
                >
                  {formatPrice(subTotal, 'TRY')}
                </span>
              </div>
              <Link href="/checkout" onClick={closeCart} className="block cursor-pointer">
                <Button
                  className="w-full bg-brand text-brand-foreground hover:bg-brand/90 active:scale-[0.99] h-11 cursor-pointer disabled:cursor-not-allowed"
                  disabled={isLoading}
                  aria-label="Ödeme sayfasına geç"
                >
                  Ödemeye Geç
                </Button>
              </Link>
              <button
                type="button"
                onClick={closeCart}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-1 cursor-pointer"
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
