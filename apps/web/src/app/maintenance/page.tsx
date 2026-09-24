'use client';

import { Clock, Cog, Calendar, ShoppingCart, BookOpen } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

const previewFeatures = [
  {
    icon: Cog,
    title: 'Otomatik Parça Tespiti',
    description: 'Aracınız ve kilometre bilginize göre bakım gerektiren parçalar otomatik tespit edilir.',
  },
  {
    icon: Calendar,
    title: 'Bakım Takvimi',
    description: 'Son bakım tarihinize göre bir sonraki bakım tarihini takip edin.',
  },
  {
    icon: ShoppingCart,
    title: 'Toplu Sepete Ekle',
    description: 'Bakım için gereken tüm parçaları tek tıkla sepetinize ekleyin.',
  },
  {
    icon: BookOpen,
    title: 'Araç Geçmişi',
    description: 'Daha önce yapılan bakımları kayıt altına alın ve takip edin.',
  },
];

const maintenanceParts = [
  { name: 'Yağ Filtresi', interval: '10.000 km' },
  { name: 'Hava Filtresi', interval: '20.000 km' },
  { name: 'Polen Filtresi', interval: '20.000 km' },
  { name: 'Yakıt Filtresi', interval: '30.000 km' },
  { name: 'Fren Balatası', interval: '30.000–50.000 km' },
];

export default function MaintenancePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Periyodik Bakım' }]} />

      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Periyodik Bakım</h1>
        <p className="text-muted-foreground mb-8">
          Aracınızın bakım ihtiyaçlarını tek ekranda takip edin.
        </p>

        {/* Coming soon banner */}
        <div className="flex items-start gap-3 bg-brand-muted border border-brand/20 rounded-xl p-5 mb-10">
          <Clock size={20} className="text-brand mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-brand mb-1">Yakında aktif olacak</p>
            <p className="text-sm text-muted-foreground">
              Periyodik bakım modülü şu anda geliştirme aşamasındadır. Çok yakında tüm kullanıcılarımıza
              sunulacaktır.
            </p>
          </div>
        </div>

        {/* Preview UI — disabled */}
        <div className="bg-card border rounded-xl p-6 mb-8 opacity-60 pointer-events-none select-none">
          <h2 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wide">Önizleme</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Araç Seçin</label>
              <div className="h-10 rounded-lg border bg-muted" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Kilometre</label>
              <div className="h-10 rounded-lg border bg-muted" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Son Bakım Tarihi</label>
              <div className="h-10 rounded-lg border bg-muted" />
            </div>
          </div>

          <h3 className="text-sm font-medium mb-3">Önerilen Parçalar</h3>
          <div className="space-y-2">
            {maintenanceParts.map((part) => (
              <div key={part.name} className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
                <span className="text-sm font-medium">{part.name}</span>
                <span className="text-xs text-muted-foreground">{part.interval}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature cards */}
        <h2 className="text-xl font-bold mb-5">Ne Sunacağız?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {previewFeatures.map(({ icon: Icon, title, description }) => (
            <div key={title} className="bg-card border rounded-xl p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-muted text-brand mb-4">
                <Icon size={20} />
              </div>
              <h3 className="font-semibold mb-2 text-sm">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
