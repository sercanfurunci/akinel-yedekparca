'use client';

import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { User, Lock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { PasswordStrengthMeter, ConfirmMatchHint } from '@/components/auth/PasswordStrength';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { UserProfile } from '@/lib/types';

const profileSchema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalı'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalı'),
  phoneNumber: z.string().optional(),
  addressLine: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifrenizi girin'),
  newPassword: z.string()
    .min(8, 'En az 8 karakter olmalı')
    .regex(/[A-Z]/, 'En az bir büyük harf içermeli')
    .regex(/[0-9]/, 'En az bir rakam içermeli'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3">
      <CheckCircle size={15} className="shrink-0" />
      {message}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-brand-muted border border-brand/20 text-brand text-sm px-4 py-3">
      {message}
    </div>
  );
}

export default function AccountSettingsPage() {
  const { accessToken, user: authUser, setAuth, refreshToken } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  const profileForm = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });
  const newPassword = useWatch({ control: passwordForm.control, name: 'newPassword', defaultValue: '' });
  const confirmPassword = useWatch({ control: passwordForm.control, name: 'confirmPassword', defaultValue: '' });

  useEffect(() => {
    if (!accessToken) { router.push('/login'); return; }
    api.account.getProfile(accessToken).then((data) => {
      const p = data as UserProfile;
      setProfile(p);
      profileForm.reset({
        firstName: p.firstName,
        lastName: p.lastName,
        phoneNumber: p.phoneNumber ?? '',
        addressLine: p.addressLine ?? '',
        district: p.district ?? '',
        city: p.city ?? '',
        postalCode: p.postalCode ?? '',
      });
    }).catch(() => router.push('/login'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const onProfileSubmit = async (data: ProfileForm) => {
    setProfileSuccess('');
    setProfileError('');
    try {
      const updated = await api.account.updateProfile(data, accessToken!) as UserProfile;
      setProfile(updated);
      // sync auth store name
      if (authUser) {
        setAuth({ ...authUser, firstName: updated.firstName, lastName: updated.lastName }, accessToken!, refreshToken!);
      }
      setProfileSuccess('Profil bilgileriniz güncellendi.');
    } catch {
      setProfileError('Güncelleme sırasında bir hata oluştu.');
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setPwSuccess('');
    setPwError('');
    try {
      await api.account.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword }, accessToken!);
      setPwSuccess('Şifreniz başarıyla güncellendi.');
      passwordForm.reset();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setPwError(msg.includes('400') ? 'Mevcut şifreniz hatalı.' : 'Şifre güncellenirken hata oluştu.');
    }
  };

  if (!profile) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Breadcrumbs items={[
        { label: 'Ana Sayfa', href: '/' },
        { label: 'Hesabım', href: '/account' },
        { label: 'Hesap Ayarları' },
      ]} />

      <h1 className="text-2xl font-bold mb-8">Hesap Ayarları</h1>

      {/* Profile section */}
      <div className="bg-white border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <User size={18} className="text-brand" />
          <h2 className="text-base font-bold text-[#111827]">Kişisel Bilgiler</h2>
        </div>

        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          {profileSuccess && <SuccessBanner message={profileSuccess} />}
          {profileError && <ErrorBanner message={profileError} />}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-[#111827]">Ad</Label>
              <Input className="h-10" {...profileForm.register('firstName')} />
              {profileForm.formState.errors.firstName && (
                <p className="text-xs text-destructive">{profileForm.formState.errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-[#111827]">Soyad</Label>
              <Input className="h-10" {...profileForm.register('lastName')} />
              {profileForm.formState.errors.lastName && (
                <p className="text-xs text-destructive">{profileForm.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-[#111827]">E-posta</Label>
            <Input className="h-10 bg-gray-50 text-muted-foreground" value={profile.email} disabled />
            <p className="text-xs text-muted-foreground">E-posta adresi değiştirilemez.</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-[#111827]">Telefon</Label>
            <Input className="h-10" placeholder="05xx xxx xx xx" {...profileForm.register('phoneNumber')} />
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#111827] mb-3">Adres Bilgileri</p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Adres</Label>
                <Input className="h-10" placeholder="Sokak, mahalle, bina no..." {...profileForm.register('addressLine')} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">İlçe</Label>
                  <Input className="h-10" placeholder="İlçe" {...profileForm.register('district')} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Şehir</Label>
                  <Input className="h-10" placeholder="Şehir" {...profileForm.register('city')} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Posta Kodu</Label>
                  <Input className="h-10" placeholder="34000" {...profileForm.register('postalCode')} />
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" className="h-10 text-sm font-semibold" disabled={profileForm.formState.isSubmitting}>
            {profileForm.formState.isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </form>
      </div>

      {/* Password section */}
      <div className="bg-white border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={18} className="text-brand" />
          <h2 className="text-base font-bold text-[#111827]">Şifre Değiştir</h2>
        </div>

        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          {pwSuccess && <SuccessBanner message={pwSuccess} />}
          {pwError && <ErrorBanner message={pwError} />}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-[#111827]">Mevcut Şifre</Label>
            <Input type="password" className="h-10" autoComplete="current-password" {...passwordForm.register('currentPassword')} />
            {passwordForm.formState.errors.currentPassword && (
              <p className="text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-[#111827]">Yeni Şifre</Label>
            <Input type="password" className="h-10" autoComplete="new-password" placeholder="En az 8 karakter, büyük harf ve rakam" {...passwordForm.register('newPassword')} />
            <PasswordStrengthMeter password={newPassword} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-[#111827]">Yeni Şifre Tekrar</Label>
            <Input type="password" className="h-10" autoComplete="new-password" {...passwordForm.register('confirmPassword')} />
            <ConfirmMatchHint password={newPassword} confirm={confirmPassword} />
            {passwordForm.formState.errors.confirmPassword && (
              <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="h-10 text-sm font-semibold" disabled={passwordForm.formState.isSubmitting}>
            {passwordForm.formState.isSubmitting ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
          </Button>
        </form>
      </div>
    </div>
  );
}
