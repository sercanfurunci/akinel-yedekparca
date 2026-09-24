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

const DAY_NAMES = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

const schema = z.object({
  companyName: z.string().min(1),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  phone: z.string().optional(),
  whatsApp: z.string().optional(),
  email: z.string().optional(),
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
  workingHours: z.array(z.object({
    dayOfWeek: z.number(),
    isOpen: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
  })),
});

type FormValues = z.infer<typeof schema>;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export default function AdminBusinessPage() {
  const { accessToken } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
          logoUrl: biz.logoUrl ?? '',
          phone: biz.phone ?? '',
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
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 size={16} className="animate-spin" /> Yükleniyor...</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">İşletme Ayarları</h1>
          <p className="text-muted-foreground text-sm mt-1">İletişim ve çalışma saati bilgileri</p>
        </div>
        {saved && <span className="text-sm text-green-600 font-medium">Kaydedildi ✓</span>}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* General */}
        <section className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-sm">Genel Bilgiler</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Şirket / Görünen Ad">
              <Input {...register('companyName')} />
            </Field>
            <Field label="Website URL">
              <Input {...register('websiteUrl')} placeholder="https://" />
            </Field>
          </div>
          <Field label="Kısa Açıklama">
            <Input {...register('shortDescription')} />
          </Field>
          <Field label="Logo URL">
            <Input {...register('logoUrl')} placeholder="https://" />
          </Field>
        </section>

        {/* Contact */}
        <section className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-sm">İletişim</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Telefon">
              <Input {...register('phone')} placeholder="+90 5xx xxx xx xx" />
            </Field>
            <Field label="WhatsApp (numara, boşluksuz)">
              <Input {...register('whatsApp')} placeholder="905xxxxxxxxx" />
            </Field>
            <Field label="E-posta">
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
              <div key={field.id} className="flex items-center gap-3">
                <span className="w-24 text-sm text-muted-foreground shrink-0">{DAY_NAMES[idx]}</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register(`workingHours.${idx}.isOpen`)} className="rounded" />
                  <span className="text-sm">Açık</span>
                </label>
                <Input {...register(`workingHours.${idx}.openTime`)} placeholder="09:00" className="w-24 text-sm" />
                <span className="text-muted-foreground text-sm">–</span>
                <Input {...register(`workingHours.${idx}.closeTime`)} placeholder="19:00" className="w-24 text-sm" />
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
