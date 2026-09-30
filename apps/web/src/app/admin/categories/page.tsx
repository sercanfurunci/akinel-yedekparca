'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, ImagePlus, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { AdminCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TableSkeleton } from '@/components/shared/Skeletons';
import { getImageUrl } from '@/lib/utils';
import { toast } from '@/components/ui/toast';

const selectClass = 'flex h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-colors';

export default function AdminCategoriesPage() {
  const { accessToken } = useAuthStore();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [savedId, setSavedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategories = () => {
    if (!accessToken) return;
    setLoading(true);
    api.admin.categories.list(accessToken)
      .then((data) => setCategories(data as AdminCategory[]))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, [accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const rootCategories = categories.filter((c) => !c.parentCategoryId);

  const openAdd = () => {
    setEditing(null);
    setSavedId(null);
    setName('');
    setParentId('');
    setSortOrder(0);
    setIsActive(true);
    setImageUrl('');
    setError('');
    setFormOpen(true);
  };

  const openEdit = (cat: AdminCategory) => {
    setEditing(cat);
    setSavedId(cat.id);
    setName(cat.name);
    setParentId(cat.parentCategoryId ?? '');
    setSortOrder(cat.sortOrder);
    setIsActive(cat.isActive);
    setImageUrl(cat.imageUrl ?? '');
    setError('');
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!accessToken || !name.trim()) { setError('Kategori adı gerekli'); return; }
    setSaving(true);
    setError('');
    try {
      let result: AdminCategory;
      if (editing) {
        result = await api.admin.categories.update(editing.id, {
          name: name.trim(),
          parentCategoryId: parentId || null,
          isActive,
          sortOrder,
          imageUrl: imageUrl || null,
        }, accessToken) as AdminCategory;
      } else {
        result = await api.admin.categories.create({
          name: name.trim(),
          parentCategoryId: parentId || null,
          sortOrder,
          imageUrl: imageUrl || null,
        }, accessToken) as AdminCategory;
        setSavedId(result.id);
      }
      fetchCategories();
      toast.add({ title: 'Kaydedildi', description: `Kategori başarıyla ${editing ? 'güncellendi' : 'oluşturuldu'}.`, type: 'success' });
    } catch {
      setError('Kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!accessToken || !savedId) return;
    setUploading(true);
    try {
      const res = await api.admin.categories.uploadImage(savedId, file, accessToken) as { imageUrl: string };
      setImageUrl(res.imageUrl);
      fetchCategories();
      toast.add({ title: 'Fotoğraf yüklendi', description: 'Kategori fotoğrafı başarıyla güncellendi.', type: 'success' });
    } catch {
      setError('Fotoğraf yüklenemedi.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!accessToken) return;
    try {
      await api.admin.categories.delete(id, accessToken);
      setCategories((prev) => prev.map((c) => c.id === id ? { ...c, isActive: false } : c));
    } catch {
      // ignore
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kategoriler</h1>
        <Button onClick={openAdd} className="bg-brand text-brand-foreground hover:bg-brand/90">
          <Plus size={16} className="mr-2" />
          Kategori Ekle
        </Button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={6} cols={4} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Kategori Adı</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Üst Kategori</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Sıra</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Durum</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">Kategori bulunamadı</td>
                  </tr>
                ) : (
                  categories.map((c) => {
                    const parent = c.parentCategoryId
                      ? categories.find((p) => p.id === c.parentCategoryId)
                      : null;
                    return (
                      <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 font-medium">
                          <div className="flex items-center gap-2">
                            {c.imageUrl
                              ? <img src={getImageUrl(c.imageUrl) ?? ''} alt="" className="h-7 w-7 rounded object-cover shrink-0" />
                              : <div className="h-7 w-7 rounded bg-muted shrink-0" />
                            }
                            <span>
                              {c.parentCategoryId && <span className="text-muted-foreground mr-1">↳</span>}
                              {c.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">
                          {parent?.name ?? '—'}
                        </td>
                        <td className="py-3 px-4 text-center text-muted-foreground">{c.sortOrder}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {c.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(c)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-muted transition-colors"
                              aria-label="Düzenle"
                            >
                              <Pencil size={14} />
                            </button>
                            {c.isActive && (
                              <button
                                onClick={() => setDeleteId(c.id)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-destructive/10 text-destructive transition-colors"
                                aria-label="Deaktif Et"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
              <h2 className="font-semibold">{editing ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}</h2>
              <button onClick={() => setFormOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <Label>Kategori Adı</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="ör: Fren Sistemi" />
              </div>
              <div className="space-y-1">
                <Label>Üst Kategori (opsiyonel)</Label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className={`${selectClass} w-full`}
                >
                  <option value="">Yok (Ana Kategori)</option>
                  {rootCategories
                    .filter((c) => !editing || c.id !== editing.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Sıra (küçük = önce)</Label>
                <Input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              {/* Image upload */}
              <div className="space-y-2">
                <Label>Kategori Fotoğrafı</Label>
                {!savedId && (
                  <p className="text-xs text-muted-foreground">Önce kaydet, sonra fotoğraf yükleyebilirsiniz.</p>
                )}
                {imageUrl && (
                  <div className="rounded-lg overflow-hidden border h-28 bg-muted">
                    <img src={getImageUrl(imageUrl) ?? ''} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                {savedId && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      style={{ display: 'none' }}
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        e.target.value = '';
                        handleImageUpload(file);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full gap-2"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                      {uploading ? 'Yükleniyor...' : imageUrl ? 'Fotoğrafı Değiştir' : 'Fotoğraf Yükle'}
                    </Button>
                  </>
                )}
              </div>

              {editing && (
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="catActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
                  <Label htmlFor="catActive">Aktif</Label>
                </div>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90" disabled={saving || uploading}>
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
                <Button variant="outline" onClick={() => setFormOpen(false)}>
                  {savedId ? 'Kapat' : 'İptal'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="font-semibold">Kategoriyi Deaktif Et</h2>
            <p className="text-sm text-muted-foreground">Bu kategori deaktif edilecek ve artık sitede görünmeyecek.</p>
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
