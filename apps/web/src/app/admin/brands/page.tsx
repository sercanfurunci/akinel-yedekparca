'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { AdminBrand } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TableSkeleton } from '@/components/shared/Skeletons';

export default function AdminBrandsPage() {
  const { accessToken } = useAuthStore();
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBrand | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchBrands = () => {
    if (!accessToken) return;
    setLoading(true);
    api.admin.brands.list(accessToken)
      .then((data) => setBrands(data as AdminBrand[]))
      .catch(() => setBrands([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBrands(); }, [accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditing(null);
    setName('');
    setLogoUrl('');
    setIsActive(true);
    setError('');
    setFormOpen(true);
  };

  const openEdit = (brand: AdminBrand) => {
    setEditing(brand);
    setName(brand.name);
    setLogoUrl(brand.logoUrl ?? '');
    setIsActive(brand.isActive);
    setError('');
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!accessToken || !name.trim()) { setError('Marka adı gerekli'); return; }
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await api.admin.brands.update(editing.id, { name: name.trim(), logoUrl: logoUrl.trim() || null, isActive }, accessToken);
      } else {
        await api.admin.brands.create({ name: name.trim(), logoUrl: logoUrl.trim() || null }, accessToken);
      }
      setFormOpen(false);
      fetchBrands();
    } catch {
      setError('Kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!accessToken) return;
    try {
      await api.admin.brands.delete(id, accessToken);
      setBrands((prev) => prev.map((b) => b.id === id ? { ...b, isActive: false } : b));
    } catch {
      // ignore
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Markalar</h1>
        <Button onClick={openAdd} className="bg-brand text-brand-foreground hover:bg-brand/90">
          <Plus size={16} className="mr-2" />
          Marka Ekle
        </Button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={5} cols={4} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Marka Adı</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Slug</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Durum</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {brands.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-muted-foreground">Marka bulunamadı</td>
                  </tr>
                ) : (
                  brands.map((b) => (
                    <tr key={b.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-medium">{b.name}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs hidden md:table-cell">{b.slug}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {b.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(b)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-muted transition-colors"
                            aria-label="Düzenle"
                          >
                            <Pencil size={14} />
                          </button>
                          {b.isActive && (
                            <button
                              onClick={() => setDeleteId(b.id)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-destructive/10 text-destructive transition-colors"
                              aria-label="Deaktif Et"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
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

      {/* Form modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold">{editing ? 'Markayı Düzenle' : 'Yeni Marka Ekle'}</h2>
              <button onClick={() => setFormOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <Label>Marka Adı</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="ör: Bosch" />
              </div>
              <div className="space-y-1">
                <Label>Logo URL (opsiyonel)</Label>
                <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
              </div>
              {editing && (
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="brandActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
                  <Label htmlFor="brandActive">Aktif</Label>
                </div>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90" disabled={saving}>
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
                <Button variant="outline" onClick={() => setFormOpen(false)}>İptal</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="font-semibold">Markayı Deaktif Et</h2>
            <p className="text-sm text-muted-foreground">Bu marka deaktif edilecek ve artık sitede görünmeyecek.</p>
            <div className="flex gap-3">
              <Button variant="destructive" className="flex-1" onClick={() => handleDelete(deleteId)}>Deaktif Et</Button>
              <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>İptal</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
