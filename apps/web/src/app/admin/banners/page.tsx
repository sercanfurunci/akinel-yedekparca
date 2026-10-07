'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Trash2, Upload, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { AdminHomepageBanner } from '@/lib/types';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'motor-yagi', label: 'Motor Yağı' },
  { id: 'ampul', label: 'Ampul' },
  { id: 'oto-bakim', label: 'Oto Bakım' },
  { id: 'aksesuar', label: 'Aksesuar' },
  { id: 'aku', label: 'Akü' },
] as const;

export default function AdminBannersPage() {
  const { accessToken } = useAuthStore();
  const [banners, setBanners] = useState<AdminHomepageBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const token = accessToken ?? '';

  const fetchBanners = async () => {
    try {
      const data = await api.admin.homepageBanners.list(token);
      setBanners(data as AdminHomepageBanner[]);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const bannerByKey = Object.fromEntries(banners.map((b) => [b.sectionKey, b]));

  const handleUpload = async (sectionKey: string, file: File) => {
    setUploadingKey(sectionKey);
    try {
      await api.admin.homepageBanners.uploadImage(sectionKey, file);
      await fetchBanners();
      toast.add({ title: 'Yüklendi', description: 'Banner görseli güncellendi.', type: 'success' });
    } catch (err) {
      toast.add({ title: 'Hata', description: err instanceof Error ? err.message : 'Görsel yüklenemedi.', type: 'error' });
    } finally {
      setUploadingKey(null);
    }
  };

  const handleDelete = async (sectionKey: string) => {
    if (!confirm('Bu banner görselini silmek istediğinizden emin misiniz?')) return;
    setDeletingKey(sectionKey);
    try {
      await api.admin.homepageBanners.deleteImage(sectionKey, token);
      await fetchBanners();
      toast.add({ title: 'Silindi', description: 'Banner görseli kaldırıldı.', type: 'success' });
    } catch (err) {
      toast.add({ title: 'Hata', description: err instanceof Error ? err.message : 'Görsel silinemedi.', type: 'error' });
    } finally {
      setDeletingKey(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#111827]">Kategori Bannerları</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Ana sayfadaki &quot;Kategoriye Göre Alışveriş&quot; bölümünün sol banner görsellerini yönetin.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TABS.map((t) => (
            <div key={t.id} className="h-52 rounded-xl bg-[#F3F4F6] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TABS.map((tab) => {
            const existing = bannerByKey[tab.id];
            const isUploading = uploadingKey === tab.id;
            const isDeleting = deletingKey === tab.id;

            return (
              <div key={tab.id} className={cn('rounded-xl border border-border bg-white shadow-sm overflow-hidden', (isUploading || isDeleting) && 'opacity-60 pointer-events-none')}>
                {/* Image area */}
                <div className="relative w-full h-40 bg-[#F3F4F6]">
                  {existing?.imageUrl ? (
                    <>
                      <Image
                        src={existing.imageUrl}
                        alt={tab.label}
                        fill
                        className="object-cover"
                        sizes="320px"
                      />
                      {(isUploading || isDeleting) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <div className="h-6 w-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground/40">
                      <ImagePlus size={32} />
                      <span className="text-xs">Görsel yüklenmemiş</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <span className="text-sm font-semibold text-[#111827]">{tab.label}</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      ref={(el) => { fileInputRefs.current[tab.id] = el; }}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        e.target.value = '';
                        handleUpload(tab.id, file);
                      }}
                    />
                    <button
                      type="button"
                      title={existing?.imageUrl ? 'Görseli değiştir' : 'Görsel yükle'}
                      onClick={() => fileInputRefs.current[tab.id]?.click()}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-brand hover:text-brand transition-colors"
                    >
                      <Upload size={14} />
                    </button>
                    {existing?.imageUrl && (
                      <button
                        type="button"
                        title="Görseli sil"
                        onClick={() => handleDelete(tab.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        Önerilen görsel boyutu: 220×300 px, dikey format. Görsel üzerine gradient yoğunlaştırıcı eklenir. Desteklenen formatlar: JPG, PNG, WebP.
      </p>
    </div>
  );
}
