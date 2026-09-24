'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle2, ShoppingBag, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const { user } = useAuthStore();

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg text-center">
      <div className="flex items-center justify-center mb-6">
        <CheckCircle2 size={64} className="text-green-500" strokeWidth={1.5} />
      </div>

      <h1 className="text-3xl font-bold mb-3">Siparişiniz Alındı!</h1>
      <p className="text-muted-foreground mb-6">
        Siparişiniz başarıyla oluşturuldu. En kısa sürede işleme alınacak ve size bilgi verilecektir.
      </p>

      {orderNumber && (
        <div className="rounded-xl border bg-muted/30 p-6 mb-8 space-y-2">
          <p className="text-sm text-muted-foreground">Sipariş Numaranız</p>
          <p className="text-2xl font-bold font-mono text-brand">{orderNumber}</p>
          <p className="text-xs text-muted-foreground">Bu numarayı sipariş takibinde kullanabilirsiniz.</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {user && (
          <Link href="/account/orders">
            <Button className="w-full sm:w-auto gap-2 bg-brand text-brand-foreground hover:bg-brand/90">
              <ShoppingBag size={16} />
              Siparişlerime Git
            </Button>
          </Link>
        )}
        <Link href="/">
          <Button variant="outline" className="w-full sm:w-auto gap-2">
            <Home size={16} />
            Ana Sayfaya Dön
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 max-w-lg text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-16 w-16 rounded-full bg-muted mx-auto" />
          <div className="h-8 bg-muted rounded mx-auto w-48" />
          <div className="h-4 bg-muted rounded mx-auto w-64" />
        </div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}
