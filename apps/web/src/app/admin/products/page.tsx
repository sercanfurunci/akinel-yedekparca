'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { ProductListItem, PaginatedResult, AdminBrand, AdminCategory } from '@/lib/types';
import { stockStatusLabel, stockStatusColor, formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TableSkeleton } from '@/components/shared/Skeletons';

const productSchema = z.object({
  name: z.string().min(1, 'Ürün adı gerekli'),
  brandId: z.string().min(1, 'Marka seçin'),
  categoryId: z.string().min(1, 'Kategori seçin'),
  price: z.number().min(0.01, 'Geçerli fiyat girin'),
  discountPercentage: z.number().min(0, 'Negatif olamaz').max(99.99, '%100 veya üzeri geçersiz').optional(),
  description: z.string().optional(),
  partNumber: z.string().optional(),
  sku: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

const stockFilterOptions = [
  { value: '', label: 'Tüm Stok' },
  { value: 'InStock', label: 'Stokta' },
  { value: 'LowStock', label: 'Az Stok' },
  { value: 'OutOfStock', label: 'Tükendi' },
];

const selectClass = 'flex h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-colors';

export default function AdminProductsPage() {
  const { accessToken } = useAuthStore();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema) as never,
    defaultValues: { name: '', brandId: '', categoryId: '', price: 0, discountPercentage: undefined, description: '', partNumber: '', sku: '' },
  });

  const watchPrice = useWatch({ control, name: 'price' });
  const watchDiscount = useWatch({ control, name: 'discountPercentage' });

  const previewSalePrice = (() => {
    const dp = Number(watchDiscount);
    const p = Number(watchPrice);
    if (!dp || dp <= 0 || dp >= 100 || !p || p <= 0) return null;
    return Math.round(p * (1 - dp / 100) * 100) / 100;
  })();

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([
      api.admin.brands.list(accessToken),
      api.admin.categories.list(accessToken),
    ]).then(([b, c]) => {
      setBrands((b as AdminBrand[]).filter((x) => x.isActive));
      setCategories((c as AdminCategory[]).filter((x) => x.isActive));
    }).catch(() => {});
  }, [accessToken]);

  const fetchProducts = useCallback(() => {
    if (!accessToken) return;
    setLoading(true);
    const params: Record<string, string> = { pageSize: '100', page: '1' };
    if (searchQuery) params.query = searchQuery;
    api.admin.products.list(params, accessToken)
      .then((data) => {
        const result = data as PaginatedResult<ProductListItem>;
        setProducts(result.items ?? []);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [searchQuery, accessToken]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filteredProducts = products.filter((p) => {
    if (stockFilter && p.stockStatus !== stockFilter) return false;
    if (brandFilter && p.brandId !== brandFilter) return false;
    if (categoryFilter && p.categoryId !== categoryFilter) return false;
    return true;
  });

  const openAddForm = () => {
    setError('');
    reset({ name: '', brandId: '', categoryId: '', price: 0, discountPercentage: undefined, description: '', partNumber: '', sku: '' });
    setFormOpen(true);
  };

  const onSubmit = async (data: ProductForm): Promise<void> => {
    if (!accessToken) return;
    setSaving(true);
    setError('');
    try {
      const dp = data.discountPercentage && data.discountPercentage > 0 ? data.discountPercentage : null;
      await api.admin.products.create({
        name: data.name,
        description: data.description || null,
        brandId: data.brandId,
        categoryId: data.categoryId,
        partNumber: data.partNumber || null,
        sku: data.sku || null,
        price: data.price,
        discountPercentage: dp,
        currency: 'TRY',
      }, accessToken);
      setFormOpen(false);
      fetchProducts();
    } catch {
      setError('Ürün kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!accessToken) return;
    try {
      await api.admin.products.delete(id, accessToken);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // ignore
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Ürünler</h1>
        <Button onClick={openAddForm} className="bg-brand text-brand-foreground hover:bg-brand/90">
          <Plus size={16} className="mr-2" />
          Ürün Ekle
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative w-full sm:w-60">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Ürün adı ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className={selectClass}>
          <option value="">Tüm Markalar</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={selectClass}>
          <option value="">Tüm Kategoriler</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className={selectClass}>
          {stockFilterOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={8} cols={5} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ürün Adı</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Marka</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Kategori</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Fiyat</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Stok</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">Ürün bulunamadı</td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-medium">
                        <Link href={`/admin/products/${p.id}`} className="hover:text-brand hover:underline line-clamp-1">
                          {p.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{p.brandName}</td>
                      <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">{p.categoryName}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        <div className="flex flex-col items-end">
                          <span>{formatPrice(p.price, p.currency)}</span>
                          {p.discountPercentage && p.discountPercentage > 0 && (
                            <span className="text-xs text-red-500 font-medium">%{Math.round(p.discountPercentage)} indirim</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stockStatusColor(p.stockStatus)}`}>
                          {stockStatusLabel(p.stockStatus)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/products/${p.id}`} className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-muted transition-colors" aria-label="Düzenle">
                            <Pencil size={14} />
                          </Link>
                          <button onClick={() => setDeleteId(p.id)} className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-destructive/10 text-destructive transition-colors" aria-label="Sil">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create product modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
              <h2 className="font-semibold">Yeni Ürün Ekle</h2>
              <button onClick={() => setFormOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Ürün Adı</Label>
                <Input id="name" {...register('name')} placeholder="Ürün adı girin" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="brandId">Marka</Label>
                  <select id="brandId" {...register('brandId')} className={`${selectClass} w-full`}>
                    <option value="">Marka seçin</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  {errors.brandId && <p className="text-xs text-destructive">{errors.brandId.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="categoryId">Kategori</Label>
                  <select id="categoryId" {...register('categoryId')} className={`${selectClass} w-full`}>
                    <option value="">Kategori seçin</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="price">Normal Fiyat (TRY)</Label>
                  <Input id="price" type="number" step="0.01" {...register('price', { valueAsNumber: true })} placeholder="0.00" />
                  {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="discountPercentage">İndirim Oranı (%)</Label>
                  <Input id="discountPercentage" type="number" step="0.01" min="0" max="99.99"
                    {...register('discountPercentage', { setValueAs: (v) => v === '' || v === null ? undefined : parseFloat(v) })}
                    placeholder="Opsiyonel" />
                  {errors.discountPercentage && <p className="text-xs text-destructive">{errors.discountPercentage.message}</p>}
                </div>
              </div>

              {/* Discount preview */}
              {previewSalePrice !== null && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm">
                  <p className="text-xs text-muted-foreground mb-1">Müşteri şunu görür</p>
                  <p>
                    <span className="line-through text-muted-foreground">{Number(watchPrice).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                    {' → '}
                    <span className="font-bold text-brand">{previewSalePrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                    {' '}
                    <span className="text-red-500 font-medium">%{Math.round(Number(watchDiscount))} indirim</span>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="partNumber">Parça No</Label>
                  <Input id="partNumber" {...register('partNumber')} placeholder="Opsiyonel" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" {...register('sku')} placeholder="Opsiyonel" />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="description">Açıklama</Label>
                <textarea
                  id="description"
                  {...register('description')}
                  rows={3}
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
                  placeholder="Ürün açıklaması..."
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90" disabled={saving}>
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>İptal</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="font-semibold">Ürünü Sil</h2>
            <p className="text-sm text-muted-foreground">Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
            <div className="flex gap-3">
              <Button variant="destructive" className="flex-1" onClick={() => handleDelete(deleteId)}>Sil</Button>
              <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>İptal</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
