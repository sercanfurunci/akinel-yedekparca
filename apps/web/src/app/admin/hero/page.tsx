'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Eye, EyeOff, ImagePlus, GripVertical, X, Upload } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { AdminHeroSlide } from '@/lib/types';
import { getImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

function CardUploadButton({ slideId, isUploading, hasImage, onUpload }: {
  slideId: string;
  isUploading: boolean;
  hasImage: boolean;
  onUpload: (slideId: string, file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        style={{ display: 'none' }}
        disabled={isUploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          e.target.value = '';
          onUpload(slideId, file);
        }}
      />
      <button
        type="button"
        title={hasImage ? 'Görseli değiştir' : 'Görsel yükle'}
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-brand hover:text-brand transition-colors',
          isUploading && 'opacity-50 pointer-events-none'
        )}
      >
        <ImagePlus size={14} />
      </button>
    </>
  );
}

const slideSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  ctaText: z.string().optional(),
  ctaUrl: z.string().optional(),
  displayOrder: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});
type SlideFormData = z.infer<typeof slideSchema>;

export default function AdminHeroPage() {
  const { accessToken } = useAuthStore();
  const [slides, setSlides] = useState<AdminHeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState<AdminHeroSlide | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formFile, setFormFile] = useState<File | null>(null);
  const [formFilePreview, setFormFilePreview] = useState<string | null>(null);
  const formFileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SlideFormData>({
    resolver: zodResolver(slideSchema) as never,
    defaultValues: { displayOrder: 0, isActive: true },
  });

  const token = accessToken ?? '';

  const fetchSlides = async () => {
    try {
      const data = await api.admin.hero.list(token);
      setSlides(data as AdminHeroSlide[]);
      setError(null);
    } catch {
      setError('Slaytlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlides(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const clearFormFile = () => {
    setFormFile(null);
    if (formFilePreview) URL.revokeObjectURL(formFilePreview);
    setFormFilePreview(null);
    if (formFileInputRef.current) formFileInputRef.current.value = '';
  };

  const openCreate = () => {
    setEditingSlide(null);
    reset({ title: '', subtitle: '', ctaText: '', ctaUrl: '', displayOrder: slides.length, isActive: true });
    clearFormFile();
    setShowForm(true);
    setError(null);
  };

  const openEdit = (slide: AdminHeroSlide) => {
    setEditingSlide(slide);
    reset({
      title: slide.title ?? '',
      subtitle: slide.subtitle ?? '',
      ctaText: slide.ctaText ?? '',
      ctaUrl: slide.ctaUrl ?? '',
      displayOrder: slide.displayOrder,
      isActive: slide.isActive,
    });
    clearFormFile();
    setShowForm(true);
    setError(null);
  };

  const onSubmit = async (data: SlideFormData) => {
    setSaving(true);
    setError(null);
    try {
      let slideId: string;
      if (editingSlide) {
        await api.admin.hero.update(editingSlide.id, data, token);
        slideId = editingSlide.id;
        setSuccessMsg('Slayt güncellendi.');
      } else {
        const created = await api.admin.hero.create(data, token) as AdminHeroSlide;
        slideId = created.id;
        setSuccessMsg('Slayt oluşturuldu.');
      }

      if (formFile) {
        setUploadingId(slideId);
        try {
          await api.admin.hero.uploadImage(slideId, formFile, token);
          setSuccessMsg(editingSlide ? 'Slayt ve görsel güncellendi.' : 'Slayt oluşturuldu ve görsel yüklendi.');
        } catch {
          setError('Slayt kaydedildi ancak görsel yüklenemedi.');
        } finally {
          setUploadingId(null);
        }
      }

      setShowForm(false);
      clearFormFile();
      fetchSlides();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bir hata oluştu.');
    } finally {
      setSaving(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleToggle = async (slide: AdminHeroSlide) => {
    try {
      await api.admin.hero.toggle(slide.id, token);
      fetchSlides();
    } catch {
      setError('Durum değiştirilemedi.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu slaytı silmek istediğinizden emin misiniz?')) return;
    setDeletingId(id);
    try {
      await api.admin.hero.delete(id, token);
      setSlides((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setError('Slayt silinemedi.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCardFileChange = async (slideId: string, file: File) => {
    setUploadingId(slideId);
    setError(null);
    try {
      await api.admin.hero.uploadImage(slideId, file, token);
      setSuccessMsg('Görsel güncellendi.');
      fetchSlides();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Görsel yüklenemedi.');
    } finally {
      setUploadingId(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleFormFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (formFilePreview) URL.revokeObjectURL(formFilePreview);
    setFormFile(file);
    setFormFilePreview(URL.createObjectURL(file));
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#111827]">Ana Sayfa Görselleri</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Hero bölümünde görünecek slaytları yönetin.</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus size={15} /> Yeni Slayt
        </Button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <X size={14} className="shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <X size={14} />
          </button>
        </div>
      )}
      {successMsg && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {successMsg}
        </div>
      )}

      {showForm && (
        <div className="mb-6 rounded-xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#111827]">{editingSlide ? 'Slaytı Düzenle' : 'Yeni Slayt Ekle'}</h2>
            <button onClick={() => { setShowForm(false); clearFormFile(); }} className="text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Single hidden input — ref.click() called from buttons */}
            <input
              ref={formFileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              style={{ display: 'none' }}
              onChange={handleFormFileChange}
            />

            <div className="space-y-1.5">
              <Label>Fotoğraf</Label>
              {formFilePreview ? (
                <div className="relative w-full h-44 rounded-lg overflow-hidden border border-border bg-[#F3F4F6]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={formFilePreview} alt="Önizleme" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={clearFormFile}
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                  >
                    <X size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => formFileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-lg bg-black/50 px-3 py-1.5 text-xs text-white hover:bg-black/70"
                  >
                    <Upload size={12} /> Değiştir
                  </button>
                </div>
              ) : editingSlide?.imageUrl ? (
                <div className="relative w-full h-44 rounded-lg overflow-hidden border border-border bg-[#F3F4F6]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getImageUrl(editingSlide.imageUrl) ?? ''} alt="Mevcut görsel" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => formFileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-lg bg-black/50 px-3 py-1.5 text-xs text-white hover:bg-black/70"
                  >
                    <Upload size={12} /> Değiştir
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => formFileInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-[#F3F4F6]/50 py-10 text-muted-foreground hover:border-brand hover:text-brand transition-colors"
                >
                  <ImagePlus size={32} />
                  <span className="text-sm font-medium">Fotoğraf seç veya buraya sürükle</span>
                  <span className="text-xs">JPG, PNG veya WebP — önerilen 1920×640 px</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="title">Başlık <span className="text-muted-foreground font-normal">(opsiyonel)</span></Label>
                <Input id="title" {...register('title')} placeholder="Aracınız için doğru parçayı bulun" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="subtitle">Alt başlık <span className="text-muted-foreground font-normal">(opsiyonel)</span></Label>
                <Input id="subtitle" {...register('subtitle')} placeholder="Kısa açıklama metni..." />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ctaText">Buton metni <span className="text-muted-foreground font-normal">(opsiyonel)</span></Label>
                <Input id="ctaText" {...register('ctaText')} placeholder="Ürünleri İncele" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ctaUrl">Buton bağlantısı <span className="text-muted-foreground font-normal">(opsiyonel)</span></Label>
                <Input id="ctaUrl" {...register('ctaUrl')} placeholder="/products" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="displayOrder">Sıra</Label>
                <Input id="displayOrder" type="number" min={0} {...register('displayOrder')} />
                {errors.displayOrder && <p className="text-xs text-red-600">{errors.displayOrder.message}</p>}
              </div>
              <div className="flex items-center gap-3 pt-5">
                <input type="checkbox" id="isActive" {...register('isActive')} className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand" />
                <Label htmlFor="isActive" className="cursor-pointer">Aktif</Label>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={saving} size="sm">
                {saving ? 'Kaydediliyor...' : editingSlide ? 'Güncelle' : 'Oluştur'}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => { setShowForm(false); clearFormFile(); }}>
                İptal
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-[#F3F4F6] animate-pulse" />
          ))}
        </div>
      ) : slides.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white py-16 text-center">
          <ImagePlus size={32} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">Henüz slayt eklenmemiş.</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Yeni bir slayt ekleyerek başlayın.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={openCreate}>
            <Plus size={14} className="mr-1.5" /> Slayt Ekle
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide) => {
            const imgUrl = getImageUrl(slide.imageUrl);
            const isUploading = uploadingId === slide.id;
            const isDeleting = deletingId === slide.id;
            return (
              <div
                key={slide.id}
                className={cn(
                  'flex gap-4 rounded-xl border bg-white p-4 shadow-sm transition-opacity',
                  !slide.isActive && 'opacity-60',
                  isDeleting && 'opacity-40 pointer-events-none'
                )}
              >
                <div className="hidden md:flex items-center text-muted-foreground/30">
                  <GripVertical size={18} />
                </div>

                <div className="relative shrink-0 w-24 h-16 md:w-32 md:h-20 rounded-lg overflow-hidden bg-[#F3F4F6] border border-border">
                  {imgUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={imgUrl} alt={slide.title ?? 'Slayt görseli'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImagePlus size={20} className="text-muted-foreground/30" />
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                      <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-[#111827] truncate">
                      {slide.title || <span className="text-muted-foreground font-normal italic">Başlık yok</span>}
                    </p>
                    <span className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0',
                      slide.isActive
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                    )}>
                      {slide.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                  {slide.subtitle && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{slide.subtitle}</p>
                  )}
                  {slide.ctaText && (
                    <p className="text-xs text-brand mt-0.5">CTA: {slide.ctaText}</p>
                  )}
                  <p className="text-xs text-muted-foreground/60 mt-1">Sıra: {slide.displayOrder}</p>
                </div>

                <div className="flex flex-col md:flex-row items-end md:items-center gap-1.5 shrink-0">
                  <CardUploadButton
                    slideId={slide.id}
                    isUploading={isUploading}
                    hasImage={!!slide.imageUrl}
                    onUpload={handleCardFileChange}
                  />
                  <button
                    onClick={() => openEdit(slide)}
                    title="Düzenle"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleToggle(slide)}
                    title={slide.isActive ? 'Pasif yap' : 'Aktif yap'}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-amber-400 hover:text-amber-600 transition-colors"
                  >
                    {slide.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
                    disabled={isDeleting}
                    title="Sil"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        Önerilen görsel boyutu: 1920×640 px veya geniş yatay (16:9) format. Desteklenen formatlar: JPG, PNG, WebP.
      </p>
    </div>
  );
}
