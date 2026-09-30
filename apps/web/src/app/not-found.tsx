import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <p className="text-7xl font-extrabold text-brand mb-4">404</p>
      <h1 className="text-2xl font-bold mb-2">Sayfa bulunamadı</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">
        Aradığınız sayfa mevcut değil veya taşınmış olabilir.
      </p>
      <Link href="/" className={cn(buttonVariants({ variant: 'default' }))}>
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
