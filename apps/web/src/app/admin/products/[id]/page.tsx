'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Trash2, Star, Upload, X, Car } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { getImageUrl } from '@/lib/utils';
import type { Product, OemEntry, VehicleCompatibilityEntry, ProductImage, AdminBrand, AdminCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VehicleFinder } from '@/components/search/VehicleFinder';

const selectClass = 'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-colors';

const productSchema = z.object({
  name: z.string().min(1, 'Ürün adı gerekli'),
  brandId: z.string().min(1, 'Marka seçin'),
  categoryId: z.string().min(1, 'Kategori seçin'),
  price: z.number().min(0.01, 'Geçerli fiyat girin'),
  discountPercentage: z.number().min(0).max(99.99).nullable().optional(),
  description: z.string().optional(),
  partNumber: z.string().optional(),
  sku: z.string().optional(),
  isActive: z.boolean(),
  // Optional extra fields
  barcode: z.string().optional(),
  weightKg: z.number().nullable().optional(),
  widthCm: z.number().nullable().optional(),
  lengthCm: z.number().nullable().optional(),
  heightCm: z.number().nullable().optional(),
  warrantyInfo: z.string().optional(),
});
type ProductForm = z.infer<typeof productSchema>;

type Tab = 'info' | 'oem' | 'compat' | 'images';

export default function AdminProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { accessToken } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [tab, setTab] = useState<Tab>('info');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // OEM state
  const [oems, setOems] = useState<OemEntry[]>([]);
  const [oemInput, setOemInput] = useState('');
  const [oemMfr, setOemMfr] = useState('');
  const [oemSaving, setOemSaving] = useState(false);

  // Compatibility state
  const [compat, setCompat] = useState<VehicleCompatibilityEntry[]>([]);
  const [showVehicleFinder, setShowVehicleFinder] = useState(false);

  // Images state
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema) as never,
    defaultValues: { name: '', brandId: '', categoryId: '', price: 0, discountPercentage: null, description: '', partNumber: '', sku: '', isActive: true, barcode: '', weightKg: null, widthCm: null, lengthCm: null, heightCm: null, warrantyInfo: '' },
  });

  const watchedPrice = useWatch({ control, name: 'price' });
  const watchedDiscount = useWatch({ control, name: 'discountPercentage' });
  const previewSalePrice =
    watchedPrice > 0 && watchedDiscount != null && watchedDiscount > 0 && watchedDiscount < 100
      ? Math.round(watchedPrice * (1 - watchedDiscount / 100) * 100) / 100
      : null;

  const loadProduct = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await api.admin.products.getById(id, accessToken) as Product;
      setProduct(data);
      const dp = data.discountPercentage ?? null;
      reset({
        name: data.name,
        brandId: data.brandId ?? '',
        categoryId: data.categoryId ?? '',
        price: data.price,
        discountPercentage: dp,
        description: data.description ?? '',
        partNumber: data.partNumber ?? '',
        sku: (data as Product & { sku?: string }).sku ?? '',
        isActive: (data as Product & { isActive?: boolean }).isActive ?? true,
        barcode: data.barcode ?? '',
        weightKg: data.weightKg ?? null,
        widthCm: data.widthCm ?? null,
        lengthCm: data.lengthCm ?? null,
        heightCm: data.heightCm ?? null,
        warrantyInfo: data.warrantyInfo ?? '',
      });
    } catch {
      // product not found
    } finally {
      setLoading(false);
    }
  }, [id, accessToken, reset]);

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([
      api.admin.brands.list(accessToken),
      api.admin.categories.list(accessToken),
    ]).then(([b, c]) => {
      setBrands((b as AdminBrand[]).filter(x => x.isActive));
      setCategories((c as AdminCategory[]).filter(x => x.isActive));
    }).catch(() => {});
    loadProduct();
  }, [accessToken, loadProduct]);

  useEffect(() => {
    if (!accessToken || !id) return;
    if (tab === 'oem') {
      api.admin.products.getOem(id, accessToken).then(d => setOems(d as OemEntry[])).catch(() => {});
    }
    if (tab === 'compat') {
      api.admin.products.getCompatibility(id, accessToken).then(d => setCompat(d as VehicleCompatibilityEntry[])).catch(() => {});
    }
    if (tab === 'images') {
      api.admin.products.getImages(id, accessToken).then(d => setImages(d as ProductImage[])).catch(() => {});
    }
  }, [tab, id, accessToken]);

  const onSubmit = async (data: ProductForm): Promise<void> => {
    if (!accessToken) return;
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const dp = data.discountPercentage && data.discountPercentage > 0 ? data.discountPercentage : null;
      await api.admin.products.update(id, {
        name: data.name,
        description: data.description || null,
        brandId: data.brandId,
        categoryId: data.categoryId,
        partNumber: data.partNumber || null,
        sku: data.sku || null,
        price: data.price,
        discountPercentage: dp,
        isActive: data.isActive,
        barcode: data.barcode || null,
        weightKg: data.weightKg || null,
        widthCm: data.widthCm || null,
        lengthCm: data.lengthCm || null,
        heightCm: data.heightCm || null,
        warrantyInfo: data.warrantyInfo || null,
      }, accessToken);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError('Kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  const addOem = async () => {
    if (!accessToken || !oemInput.trim()) return;
    setOemSaving(true);
    try {
      const entry = await api.admin.products.addOem(id, { number: oemInput.trim(), manufacturer: oemMfr.trim() || undefined }, accessToken) as OemEntry;
      setOems(prev => [...prev, entry]);
      setOemInput('');
      setOemMfr('');
    } catch { /* ignore */ }
    setOemSaving(false);
  };

  const removeOem = async (oemId: string) => {
    if (!accessToken) return;
    try {
      await api.admin.products.removeOem(id, oemId, accessToken);
      setOems(prev => prev.filter(o => o.id !== oemId));
    } catch { /* ignore */ }
  };

  const addCompatibility = async (engineId: string) => {
    if (!accessToken) return;
    try {
      const entry = await api.admin.products.addCompatibility(id, { vehicleEngineId: engineId }, accessToken) as VehicleCompatibilityEntry;
      setCompat(prev => [...prev, entry]);
      setShowVehicleFinder(false);
    } catch { /* ignore */ }
  };

  const removeCompatibility = async (engineId: string) => {
    if (!accessToken) return;
    try {
      await api.admin.products.removeCompatibility(id, engineId, accessToken);
      setCompat(prev => prev.filter(c => c.engineId !== engineId));
    } catch { /* ignore */ }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;
    setUploading(true);
    try {
      const img = await api.admin.products.uploadImage(id, file, accessToken) as ProductImage;
      setImages(prev => [...prev, img]);
    } catch { /* ignore */ }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const setPrimary = async (imageId: string) => {
    if (!accessToken) return;
    try {
      await api.admin.products.setPrimaryImage(id, imageId, accessToken);
      setImages(prev => prev.map(i => ({ ...i, isPrimary: i.id === imageId })));
    } catch { /* ignore */ }
  };

  const deleteImage = async (imageId: string) => {
    if (!accessToken) return;
    try {
      await api.admin.products.deleteImage(id, imageId, accessToken);
      setImages(prev => prev.filter(i => i.id !== imageId));
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Ürün bulunamadı.</p>
        <Link href="/admin/products" className="text-brand hover:underline mt-2 inline-block">Ürünlere Dön</Link>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'info', label: 'Temel Bilgiler' },
    { key: 'oem', label: 'OEM Numaraları' },
    { key: 'compat', label: 'Araç Uyumluluğu' },
    { key: 'images', label: 'Görseller' },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-muted transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold leading-tight">{product.name}</h1>
          <p className="text-sm text-muted-foreground">{product.brandName} · {product.categoryName}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.key
                ? 'border-brand text-brand'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Temel Bilgiler ─────────────────────── */}
      {tab === 'info' && (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-6">
          {/* Ürün Adı — full width */}
          <div className="space-y-1">
            <Label htmlFor="name">Ürün Adı</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* Marka & Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="brandId">Marka</Label>
              <select id="brandId" {...register('brandId')} className={selectClass}>
                <option value="">Marka seçin</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              {errors.brandId && <p className="text-xs text-destructive">{errors.brandId.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="categoryId">Kategori</Label>
              <select id="categoryId" {...register('categoryId')} className={selectClass}>
                <option value="">Kategori seçin</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
            </div>
          </div>

          {/* Fiyat + İndirim */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="price">Normal Fiyat (TRY)</Label>
              <Input id="price" type="number" step="0.01" {...register('price', { valueAsNumber: true })} />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="discountPercentage">İndirim Oranı (%)</Label>
              <Input
                id="discountPercentage"
                type="number"
                step="0.01"
                min="0"
                max="99.99"
                placeholder="ör: 40"
                {...register('discountPercentage', { setValueAs: (v) => v === '' || v === null ? null : parseFloat(v) })}
              />
              <p className="text-xs text-muted-foreground">İsteğe bağlı. Satış fiyatı otomatik hesaplanır.</p>
              {errors.discountPercentage && <p className="text-xs text-destructive">0–99.99 arası olmalı</p>}
            </div>
          </div>

          {previewSalePrice != null && (
            <div className="flex items-center gap-4 rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30 px-4 py-3 text-sm">
              <div>
                <span className="text-muted-foreground">Normal fiyat: </span>
                <span className="line-through text-muted-foreground font-medium">{watchedPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TRY</span>
              </div>
              <div>
                <span className="text-muted-foreground">Satış fiyatı: </span>
                <span className="font-semibold text-green-700 dark:text-green-400">{previewSalePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TRY</span>
              </div>
              <div className="ml-auto">
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">%{Math.round(Number(watchedDiscount))} indirim</span>
              </div>
            </div>
          )}

          {/* Parça No, SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="partNumber">Parça No</Label>
              <Input id="partNumber" {...register('partNumber')} placeholder="Opsiyonel" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" {...register('sku')} placeholder="Opsiyonel" />
            </div>
          </div>

          {/* Açıklama */}
          <div className="space-y-1">
            <Label htmlFor="description">Açıklama</Label>
            <textarea
              id="description"
              {...register('description')}
              rows={5}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
            />
          </div>

          {/* Ek Bilgiler */}
          <details className="border rounded-lg">
            <summary className="px-4 py-3 font-medium text-sm cursor-pointer select-none hover:bg-muted/40 transition-colors">
              Ek Bilgiler <span className="text-muted-foreground font-normal">(İsteğe bağlı)</span>
            </summary>
            <div className="px-4 pb-4 pt-2 space-y-4 border-t">
              {/* Barkod */}
              <div className="space-y-1">
                <Label htmlFor="barcode">Barkod / EAN <span className="text-muted-foreground font-normal text-xs">(İsteğe bağlı)</span></Label>
                <Input id="barcode" {...register('barcode')} placeholder="ör: 8699000123456" />
              </div>

              {/* Ağırlık */}
              <div className="space-y-1">
                <Label htmlFor="weightKg">Ağırlık (kg) <span className="text-muted-foreground font-normal text-xs">(İsteğe bağlı)</span></Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="weightKg"
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="ör: 0.85"
                    {...register('weightKg', { setValueAs: (v) => v === '' || v === null ? null : parseFloat(v) })}
                    className="max-w-[160px]"
                  />
                  <span className="text-sm text-muted-foreground">kg</span>
                </div>
              </div>

              {/* Boyutlar */}
              <div className="space-y-1">
                <Label>Boyutlar (cm) <span className="text-muted-foreground font-normal text-xs">(İsteğe bağlı)</span></Label>
                <div className="flex items-center gap-2 flex-wrap">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Genişlik"
                    {...register('widthCm', { setValueAs: (v) => v === '' || v === null ? null : parseFloat(v) })}
                    className="w-28"
                  />
                  <span className="text-sm text-muted-foreground">×</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Uzunluk"
                    {...register('lengthCm', { setValueAs: (v) => v === '' || v === null ? null : parseFloat(v) })}
                    className="w-28"
                  />
                  <span className="text-sm text-muted-foreground">×</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Yükseklik"
                    {...register('heightCm', { setValueAs: (v) => v === '' || v === null ? null : parseFloat(v) })}
                    className="w-28"
                  />
                  <span className="text-sm text-muted-foreground">cm</span>
                </div>
                <p className="text-xs text-muted-foreground">Genişlik × Uzunluk × Yükseklik</p>
              </div>

              {/* Garanti */}
              <div className="space-y-1">
                <Label htmlFor="warrantyInfo">Garanti Bilgisi <span className="text-muted-foreground font-normal text-xs">(İsteğe bağlı)</span></Label>
                <Input id="warrantyInfo" {...register('warrantyInfo')} placeholder="ör: 2 Yıl Üretici Garantisi" />
              </div>
            </div>
          </details>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" id="isActive" {...register('isActive')} className="rounded" />
              <Label htmlFor="isActive" className="cursor-pointer">Aktif</Label>
            </label>

            <div className="flex items-center gap-3">
              {saveError && <p className="text-sm text-destructive">{saveError}</p>}
              {saveSuccess && <p className="text-sm text-green-600">Kaydedildi.</p>}
              <Button type="submit" className="bg-brand text-brand-foreground hover:bg-brand/90" disabled={saving}>
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* ── TAB: OEM Numaraları ─────────────────────── */}
      {tab === 'oem' && (
        <div className="max-w-xl space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="OEM numarası (ör: 1J0698151B)"
              value={oemInput}
              onChange={e => setOemInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addOem())}
              className="flex-1"
            />
            <Input
              placeholder="Üretici (opsiyonel)"
              value={oemMfr}
              onChange={e => setOemMfr(e.target.value)}
              className="w-36"
            />
            <Button onClick={addOem} disabled={oemSaving || !oemInput.trim()} className="bg-brand text-brand-foreground hover:bg-brand/90 shrink-0">
              <Plus size={16} />
            </Button>
          </div>
          {oems.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Henüz OEM numarası eklenmemiş.</p>
          ) : (
            <div className="divide-y border rounded-xl overflow-hidden">
              {oems.map(o => (
                <div key={o.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="font-mono font-medium text-sm">{o.number}</span>
                    {o.manufacturer && <span className="ml-3 text-xs text-muted-foreground">{o.manufacturer}</span>}
                  </div>
                  <button onClick={() => removeOem(o.id)} className="text-destructive hover:bg-destructive/10 rounded p-1 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Araç Uyumluluğu ───────────────────── */}
      {tab === 'compat' && (
        <div className="max-w-2xl space-y-4">
          <Button
            onClick={() => setShowVehicleFinder(v => !v)}
            variant="outline"
            className="gap-2"
          >
            <Car size={15} />
            {showVehicleFinder ? 'Gizle' : 'Araç Ekle'}
          </Button>

          {showVehicleFinder && (
            <div className="border rounded-xl p-4 bg-muted/20">
              <VehicleFinder
                onVehicleSelected={(ctx) => addCompatibility(ctx.engineId)}
              />
            </div>
          )}

          {compat.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Henüz araç uyumluluğu eklenmemiş.</p>
          ) : (
            <div className="divide-y border rounded-xl overflow-hidden">
              {compat.map(c => (
                <div key={c.engineId} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="text-sm font-medium">{c.displayLabel}</span>
                    {c.notes && <span className="ml-3 text-xs text-muted-foreground">{c.notes}</span>}
                  </div>
                  <button onClick={() => removeCompatibility(c.engineId)} className="text-destructive hover:bg-destructive/10 rounded p-1 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Görseller ─────────────────────────── */}
      {tab === 'images' && (
        <div className="max-w-2xl space-y-4">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gap-2"
            >
              <Upload size={15} />
              {uploading ? 'Yükleniyor...' : 'Görsel Yükle'}
            </Button>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG veya WebP. Maks 10MB.</p>
          </div>

          {images.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Henüz görsel eklenmemiş.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map(img => (
                <div key={img.id} className={`relative group rounded-xl overflow-hidden border-2 ${img.isPrimary ? 'border-brand' : 'border-transparent'}`}>
                  <img
                    src={getImageUrl(img.url)!}
                    alt={img.altText ?? ''}
                    className="w-full aspect-square object-contain bg-muted p-2"
                  />
                  {img.isPrimary && (
                    <div className="absolute top-1 left-1 bg-brand text-brand-foreground text-[10px] font-medium px-1.5 py-0.5 rounded">
                      Ana
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!img.isPrimary && (
                      <button
                        onClick={() => setPrimary(img.id)}
                        className="bg-white text-foreground rounded p-1.5 hover:bg-brand hover:text-brand-foreground transition-colors"
                        title="Ana görsel yap"
                      >
                        <Star size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteImage(img.id)}
                      className="bg-white text-destructive rounded p-1.5 hover:bg-destructive hover:text-white transition-colors"
                      title="Sil"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
