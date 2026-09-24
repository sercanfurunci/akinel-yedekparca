'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { AdminCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TableSkeleton } from '@/components/shared/Skeletons';

const selectClass = 'flex h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-colors';

export default function AdminCategoriesPage() {
  const { accessToken } = useAuthStore();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

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
    setName('');
    setParentId('');
    setSortOrder(0);
    setIsActive(true);
    setError('');
    setFormOpen(true);
  };

  const openEdit = (cat: AdminCategory) => {
    setEditing(cat);
    setName(cat.name);
    setParentId(cat.parentCategoryId ?? '');
    setSortOrder(cat.sortOrder);
    setIsActive(cat.isActive);
    setError('');
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!accessToken || !name.trim()) { setError('Kategori adı gerekli'); return; }
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await api.admin.categories.update(editing.id, {
          name: name.trim(),
          parentCategoryId: parentId || null,
          isActive,
          sortOrder,
        }, accessToken);
      } else {
        await api.admin.categories.create({
          name: name.trim(),
          parentCategoryId: parentId || null,
          sortOrder,
        }, accessToken);
      }
      setFormOpen(false);
      fetchCategories();
    } catch {
      setError('Kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
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
                          {c.parentCategoryId && <span className="text-muted-foreground mr-2">↳</span>}
                          {c.name}
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
              {editing && (
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="catActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
                  <Label htmlFor="catActive">Aktif</Label>
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
