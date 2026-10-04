'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { BusinessSettings } from '@/lib/types';
import { toast } from '@/components/ui/toast';

const DAY_NAMES = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

const phoneRegex = /^(\+90|0)(5[0-9]{9})$/;

const schema = z.object({
  companyName: z.string().min(1, 'Şirket adı zorunludur'),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  phone: z.string().regex(phoneRegex, 'Geçerli bir numara girin (örn: +905xxxxxxxxx veya 05xxxxxxxxx)').or(z.literal('')).optional(),
  phone2: z.string().regex(phoneRegex, 'Geçerli bir numara girin (örn: +905xxxxxxxxx veya 05xxxxxxxxx)').or(z.literal('')).optional(),
  whatsApp: z.string().regex(/^905[0-9]{9}$/, 'Boşluksuz, 905 ile başlamalı (örn: 905xxxxxxxxx)').or(z.literal('')).optional(),
  email: z.string().email('Geçerli bir e-posta girin (örn: info@sirket.com)').or(z.literal('')).optional(),
  address: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  googleMapsUrl: z.string().optional(),
  googleMapsEmbedUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  linkedInUrl: z.string().optional(),
  announcementBanner: z.string().optional(),
  workingHours: z.array(z.object({
    dayOfWeek: z.number(),
    isOpen: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
  })),
});

type FormValues = z.infer<typeof schema>;

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function AdminBusinessPage() {
  const { accessToken } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { workingHours: Array.from({ length: 7 }, (_, i) => ({ dayOfWeek: i, isOpen: i > 0 && i < 7, openTime: '09:00', closeTime: '19:00' })) },
  });

  const { fields } = useFieldArray({ control, name: 'workingHours' });

  useEffect(() => {
    api.business.settings()
      .then((data) => {
        const biz = data as BusinessSettings;
        reset({
          companyName: biz.companyName,
          shortDescription: biz.shortDescription ?? '',
          description: biz.description ?? '',
          phone: biz.phone ?? '',
          phone2: biz.phone2 ?? '',
          whatsApp: biz.whatsApp ?? '',
          email: biz.email ?? '',
          address: biz.address ?? '',
          district: biz.district ?? '',
          city: biz.city ?? '',
          country: biz.country ?? '',
          postalCode: biz.postalCode ?? '',
          googleMapsUrl: biz.googleMapsUrl ?? '',
          googleMapsEmbedUrl: biz.googleMapsEmbedUrl ?? '',
          websiteUrl: biz.websiteUrl ?? '',
          instagramUrl: biz.instagramUrl ?? '',
          facebookUrl: biz.facebookUrl ?? '',
          linkedInUrl: biz.linkedInUrl ?? '',
          announcementBanner: biz.announcementBanner ?? '',
          workingHours: Array.from({ length: 7 }, (_, i) => {
            const h = biz.workingHours.find(w => w.dayOfWeek === i);
            return { dayOfWeek: i, isOpen: h?.isOpen ?? false, openTime: h?.openTime ?? '09:00', closeTime: h?.closeTime ?? '19:00' };
          }),
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: FormValues) => {
    if (!accessToken) return;
    setSaving(true);
    try {
      await api.business.updateSettings(data, accessToken);
      // Re-fetch to confirm saved values from server
      const fresh = await api.business.settings() as BusinessSettings;
      reset({
        companyName: fresh.companyName,
        shortDescription: fresh.shortDescription ?? '',
        description: fresh.description ?? '',
        phone: fresh.phone ?? '',
        phone2: fresh.phone2 ?? '',
        whatsApp: fresh.whatsApp ?? '',
        email: fresh.email ?? '',
        address: fresh.address ?? '',
        district: fresh.district ?? '',
        city: fresh.city ?? '',
        country: fresh.country ?? '',
        postalCode: fresh.postalCode ?? '',
        googleMapsUrl: fresh.googleMapsUrl ?? '',
        googleMapsEmbedUrl: fresh.googleMapsEmbedUrl ?? '',
        websiteUrl: fresh.websiteUrl ?? '',
        instagramUrl: fresh.instagramUrl ?? '',
        facebookUrl: fresh.facebookUrl ?? '',
        linkedInUrl: fresh.linkedInUrl ?? '',
        announcementBanner: fresh.announcementBanner ?? '',
        workingHours: Array.from({ length: 7 }, (_, i) => {
          const h = fresh.workingHours.find(w => w.dayOfWeek === i);
          return { dayOfWeek: i, isOpen: h?.isOpen ?? false, openTime: h?.openTime ?? '09:00', closeTime: h?.closeTime ?? '19:00' };
        }),
      });
      toast.add({ title: 'Kaydedildi', description: 'İşletme ayarları başarıyla güncellendi.', type: 'success' });
    } catch {
      toast.add({ title: 'Hata', description: 'Ayarlar kaydedilemedi.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 size={16} className="animate-spin" /> Yükleniyor...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">İşletme Ayarları</h1>
          <p className="text-muted-foreground text-sm mt-1">İletişim ve çalışma saati bilgileri</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* General */}
        <section className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-sm">Genel Bilgiler</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Şirket / Görünen Ad" error={errors.companyName?.message}>
              <Input {...register('companyName')} />
            </Field>
            <Field label="Website URL">
              <Input {...register('websiteUrl')} placeholder="https://" />
            </Field>
          </div>
          <Field label="Kısa Açıklama">
            <Input {...register('shortDescription')} />
          </Field>
          <Field label="Duyuru Bandı (| ile ayırın: Hızlı Teslimat | Kaliteli Ürün)">
            <Input {...register('announcementBanner')} placeholder="Hızlı Teslimat | Kaliteli Ürün | OEM Garantili" />
          </Field>
        </section>

        {/* Contact */}
        <section className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-sm">İletişim</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Telefon 1" error={errors.phone?.message}>
              <Input {...register('phone')} placeholder="+90 5xx xxx xx xx" />
            </Field>
            <Field label="Telefon 2 (opsiyonel)" error={errors.phone2?.message}>
              <Input {...register('phone2')} placeholder="+90 5xx xxx xx xx" />
            </Field>
            <Field label="WhatsApp (boşluksuz, örn: 905xxxxxxxxx)" error={errors.whatsApp?.message}>
              <Input {...register('whatsApp')} placeholder="905xxxxxxxxx" />
            </Field>
            <Field label="E-posta" error={errors.email?.message}>
              <Input {...register('email')} type="email" />
            </Field>
          </div>
        </section>

        {/* Address */}
        <section className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-sm">Adres</h2>
          <Field label="Sokak / Cadde">
            <Input {...register('address')} />
          </Field>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="İlçe">
              <Input {...register('district')} />
            </Field>
            <Field label="Şehir">
              <Input {...register('city')} />
            </Field>
            <Field label="Posta Kodu">
              <Input {...register('postalCode')} />
            </Field>
          </div>
          <Field label="Ülke">
            <Input {...register('country')} />
          </Field>
          <Field label="Google Maps URL">
            <Input {...register('googleMapsUrl')} placeholder="https://maps.google.com/?q=..." />
          </Field>
          <Field label="Google Maps Embed URL">
            <Input {...register('googleMapsEmbedUrl')} placeholder="https://maps.google.com/maps?q=...&output=embed" />
          </Field>
        </section>

        {/* Social */}
        <section className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-sm">Sosyal Medya</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Instagram"><Input {...register('instagramUrl')} placeholder="https://instagram.com/..." /></Field>
            <Field label="Facebook"><Input {...register('facebookUrl')} placeholder="https://facebook.com/..." /></Field>
            <Field label="LinkedIn"><Input {...register('linkedInUrl')} placeholder="https://linkedin.com/..." /></Field>
          </div>
        </section>

        {/* Working Hours */}
        <section className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-sm">Çalışma Saatleri</h2>
          <div className="space-y-3">
            {fields.map((field, idx) => (
              <div key={field.id} className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="w-20 sm:w-24 text-sm text-muted-foreground shrink-0">{DAY_NAMES[idx]}</span>
                <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                  <input type="checkbox" {...register(`workingHours.${idx}.isOpen`)} className="rounded" />
                  <span className="text-sm">Açık</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <Input {...register(`workingHours.${idx}.openTime`)} placeholder="09:00" className="w-20 text-sm" />
                  <span className="text-muted-foreground text-sm shrink-0">–</span>
                  <Input {...register(`workingHours.${idx}.closeTime`)} placeholder="19:00" className="w-20 text-sm" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <Button type="submit" disabled={saving} className="bg-brand text-brand-foreground hover:bg-brand/90 gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </form>
    </div>
  );
}
