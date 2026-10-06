'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, ImagePlus, Loader2, ChevronDown, ChevronRight, FolderOpen, Folder } from 'lucide-react';
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

interface TreeNode {
  cat: AdminCategory;
  level: 0 | 1 | 2;
  children: TreeNode[];
}

function buildTree(categories: AdminCategory[]): TreeNode[] {
  const roots = categories
    .filter((c) => !c.parentCategoryId)
    .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));

  return roots.map((root) => {
    const intermediates = categories
      .filter((c) => c.parentCategoryId === root.id)
      .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));

    return {
      cat: root,
      level: 0,
      children: intermediates.map((mid) => {
        const leaves = categories
          .filter((c) => c.parentCategoryId === mid.id)
          .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
        return {
          cat: mid,
          level: 1,
          children: leaves.map((leaf) => ({ cat: leaf, level: 2, children: [] })),
        };
      }),
    };
  });
}

function flattenVisible(tree: TreeNode[], expanded: Set<string>): { cat: AdminCategory; level: 0 | 1 | 2; hasChildren: boolean }[] {
  const result: { cat: AdminCategory; level: 0 | 1 | 2; hasChildren: boolean }[] = [];
  for (const node of tree) {
    result.push({ cat: node.cat, level: node.level, hasChildren: node.children.length > 0 });
    if (expanded.has(node.cat.id)) {
      for (const child of node.children) {
        result.push({ cat: child.cat, level: child.level, hasChildren: child.children.length > 0 });
        if (expanded.has(child.cat.id)) {
          for (const leaf of child.children) {
            result.push({ cat: leaf.cat, level: leaf.level, hasChildren: false });
          }
        }
      }
    }
  }
  return result;
}

export default function AdminCategoriesPage() {
  const { accessToken } = useAuthStore();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isHomepageFeatured, setIsHomepageFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [savedId, setSavedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategories = () => {
    if (!accessToken) return;
    setLoading(true);
    api.admin.categories.list(accessToken)
      .then((data) => {
        const cats = data as AdminCategory[];
        setCategories(cats);
        // Auto-expand root categories on first load
        setExpanded((prev) => {
          if (prev.size > 0) return prev;
          const roots = new Set(cats.filter((c) => !c.parentCategoryId).map((c) => c.id));
          return roots;
        });
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, [accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const tree = buildTree(categories);
  const rows = flattenVisible(tree, expanded);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openAdd = () => {
    setEditing(null);
    setSavedId(null);
    setName('');
    setParentId('');
    setSortOrder(0);
    setIsActive(true);
    setIsHomepageFeatured(false);
    setImageUrl('');
    setBannerImageUrl('');
    setDescription('');
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
    setIsHomepageFeatured(cat.isHomepageFeatured ?? false);
    setImageUrl(cat.imageUrl ?? '');
    setBannerImageUrl(cat.bannerImageUrl ?? '');
    setDescription(cat.description ?? '');
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
          isHomepageFeatured,
          description: description || null,
        }, accessToken) as AdminCategory;
      } else {
        result = await api.admin.categories.create({
          name: name.trim(),
          parentCategoryId: parentId || null,
          sortOrder,
          imageUrl: imageUrl || null,
          isHomepageFeatured,
          description: description || null,
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
      toast.add({ title: 'İkon yüklendi', description: 'Kategori ikonu başarıyla güncellendi.', type: 'success' });
    } catch {
      setError('Fotoğraf yüklenemedi.');
    } finally {
      setUploading(false);
    }
  };

  const handleBannerUpload = async (file: File) => {
    if (!accessToken || !savedId) return;
    setBannerUploading(true);
    try {
      const res = await api.admin.categories.uploadBanner(savedId, file, accessToken) as { bannerImageUrl: string };
      setBannerImageUrl(res.bannerImageUrl);
      fetchCategories();
      toast.add({ title: 'Banner yüklendi', description: 'Kategori banner görseli başarıyla güncellendi.', type: 'success' });
    } catch {
      setError('Banner yüklenemedi.');
    } finally {
      setBannerUploading(false);
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

  // Build grouped options for parent dropdown
  const rootCats = categories.filter((c) => !c.parentCategoryId && (!editing || c.id !== editing.id));
  const midCats = (rootId: string) => categories.filter(
    (c) => c.parentCategoryId === rootId && (!editing || c.id !== editing.id)
  );

  const levelStyles = {
    0: { row: 'bg-brand/5', indent: 'pl-3', text: 'font-bold text-[#111827]', icon: 'text-brand' },
    1: { row: 'bg-white', indent: 'pl-8', text: 'font-semibold text-[#374151]', icon: 'text-gray-400' },
    2: { row: 'bg-white', indent: 'pl-14', text: 'font-normal text-[#6B7280]', icon: 'text-gray-300' },
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
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Kategori</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Sıra</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">Durum</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-muted-foreground">Kategori bulunamadı</td>
                  </tr>
                ) : (
                  rows.map(({ cat, level, hasChildren }) => {
                    const s = levelStyles[level];
                    const isExpanded = expanded.has(cat.id);
                    return (
                      <tr key={cat.id} className={`border-b last:border-0 hover:bg-brand/5 transition-colors ${s.row}`}>
                        <td className={`py-2.5 px-4 ${s.indent}`}>
                          <div className="flex items-center gap-2">
                            {hasChildren ? (
                              <button
                                onClick={() => toggleExpand(cat.id)}
                                className="shrink-0 text-muted-foreground hover:text-brand transition-colors"
                              >
                                {isExpanded
                                  ? <ChevronDown size={15} />
                                  : <ChevronRight size={15} />
                                }
                              </button>
                            ) : (
                              <span className="w-[15px] shrink-0" />
                            )}
                            {cat.imageUrl
                              ? <img src={getImageUrl(cat.imageUrl) ?? ''} alt="" className="h-6 w-6 rounded object-cover shrink-0" />
                              : level === 0
                                ? <FolderOpen size={15} className={`shrink-0 ${s.icon}`} />
                                : level === 1
                                  ? <Folder size={14} className={`shrink-0 ${s.icon}`} />
                                  : <span className="w-[14px] shrink-0 text-center text-gray-300 text-xs">·</span>
                            }
                            <span className={s.text}>{cat.name}</span>
                            {cat.description && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 font-medium shrink-0">Açıklama</span>
                            )}
                            {level === 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium shrink-0">
                                {categories.filter((c) => c.parentCategoryId === cat.id).length} grup
                              </span>
                            )}
                            {level === 1 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium shrink-0">
                                {categories.filter((c) => c.parentCategoryId === cat.id).length} ürün tipi
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-center text-muted-foreground text-xs">{cat.sortOrder}</td>
                        <td className="py-2.5 px-4 text-center hidden sm:table-cell">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {cat.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(cat)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-muted transition-colors"
                              aria-label="Düzenle"
                            >
                              <Pencil size={13} />
                            </button>
                            {cat.isActive && (
                              <button
                                onClick={() => setDeleteId(cat.id)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-destructive/10 text-destructive transition-colors"
                                aria-label="Deaktif Et"
                              >
                                <Trash2 size={13} />
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
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold">{editing ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}</h2>
              <button onClick={() => setFormOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Kapat">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <Label>Kategori Adı</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="ör: Fren Balatası" />
              </div>

              <div className="space-y-1">
                <Label>Üst Kategori</Label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className={`${selectClass} w-full`}
                >
                  <option value="">— Ana Kategori (1. seviye) —</option>
                  {rootCats.map((root) => (
                    <optgroup key={root.id} label={`📁 ${root.name}`}>
                      <option value={root.id}>↳ {root.name} (grup ekle)</option>
                      {midCats(root.id).map((mid) => (
                        <option key={mid.id} value={mid.id}>
                          &nbsp;&nbsp;&nbsp;↳↳ {mid.name} (ürün tipi ekle)
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">Ana Kategori = 9 ana başlık · Grup = Fren/Debriyaj gibi · Ürün tipi = yaprak düğüm</p>
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

              {/* Icon upload */}
              <div className="space-y-2">
                <Label>Kategori İkonu</Label>
                {!savedId && (
                  <p className="text-xs text-muted-foreground">Önce kaydet, sonra fotoğraf yükleyebilirsiniz.</p>
                )}
                {imageUrl && (
                  <div className="rounded-lg overflow-hidden border h-20 w-20 bg-muted">
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
                    <Button type="button" variant="outline" size="sm" className="gap-2" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                      {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                      {uploading ? 'Yükleniyor...' : imageUrl ? 'İkonu Değiştir' : 'İkon Yükle'}
                    </Button>
                  </>
                )}
              </div>

              {/* Banner upload */}
              <div className="space-y-2">
                <Label>Banner Görseli (sayfanın altı için)</Label>
                {!savedId && (
                  <p className="text-xs text-muted-foreground">Önce kaydet, sonra banner yükleyebilirsiniz.</p>
                )}
                {bannerImageUrl && (
                  <div className="rounded-lg overflow-hidden border h-32 bg-muted">
                    <img src={getImageUrl(bannerImageUrl) ?? ''} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                {savedId && (
                  <>
                    <input
                      ref={bannerFileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      style={{ display: 'none' }}
                      disabled={bannerUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        e.target.value = '';
                        handleBannerUpload(file);
                      }}
                    />
                    <Button type="button" variant="outline" size="sm" className="gap-2" disabled={bannerUploading} onClick={() => bannerFileInputRef.current?.click()}>
                      {bannerUploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                      {bannerUploading ? 'Yükleniyor...' : bannerImageUrl ? 'Banneri Değiştir' : 'Banner Yükle'}
                    </Button>
                  </>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <Label>Açıklama (HTML destekler)</Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Kategori hakkında açıklama... <strong>kalın</strong> gibi HTML kullanabilirsiniz."
                  rows={5}
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-colors resize-y"
                />
                <p className="text-xs text-muted-foreground">Kategori sayfasının altında görünür.</p>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="catFeatured" checked={isHomepageFeatured} onChange={(e) => setIsHomepageFeatured(e.target.checked)} className="rounded" />
                <Label htmlFor="catFeatured">Anasayfada göster</Label>
              </div>

              {editing && (
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="catActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
                  <Label htmlFor="catActive">Aktif</Label>
                </div>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90" disabled={saving || uploading || bannerUploading}>
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
