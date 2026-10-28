'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Eye, EyeOff, MailCheck } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordStrengthMeter, ConfirmMatchHint } from '@/components/auth/PasswordStrength';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { analytics } from '@/lib/analytics';
import type { AuthResponse } from '@/lib/types';

const schema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalı'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalı'),
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermeli')
    .regex(/[0-9]/, 'Şifre en az bir rakam içermeli'),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine(v => v === true, 'Kullanım koşullarını kabul etmeniz gerekiyor'),
  kvkkAccepted: z.boolean().refine(v => v === true, 'KVKK metnini onaylamanız gerekiyor'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof schema>;


export default function RegisterPage() {
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSuccess = async (credential: string) => {
    setGoogleLoading(true);
    setError('');
    try {
      const res = await api.auth.googleLogin(credential) as AuthResponse;
      setAuth(res.user, res.accessToken, res.refreshToken);
      analytics.signupCompleted();
      router.push('/account');
    } catch {
      setError('Google ile kayıt yapılamadı. Lütfen tekrar deneyin.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const password = useWatch({ control, name: 'password', defaultValue: '' });
  const confirmPassword = useWatch({ control, name: 'confirmPassword', defaultValue: '' });

  const onSubmit = async (data: FormValues) => {
    setError('');
    analytics.signupStarted();
    try {
      await api.auth.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      analytics.signupCompleted();
      setRegisteredEmail(data.email);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('409') || msg.toLowerCase().includes('conflict')) {
        setError('Bu e-posta adresiyle zaten bir hesap mevcut.');
      } else {
        setError('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  };

  if (registeredEmail) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#F3F4F6] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <Link href="/" className="inline-block">
              <img src="/logo-light.webp" alt="AKINEL OTO YEDEK PARÇA" className="h-14 w-auto mx-auto" />
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-border p-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mx-auto mb-5">
              <MailCheck size={32} className="text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-[#111827] mb-2">E-postanızı Doğrulayın</h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              <strong className="text-[#111827]">{registeredEmail}</strong> adresine bir doğrulama bağlantısı gönderdik.
              Hesabınızı aktifleştirmek için e-postanızdaki bağlantıya tıklayın.
            </p>
            <p className="text-xs text-muted-foreground">Mail gelmediyse spam/gereksiz klasörünü kontrol edin.</p>
            <div className="mt-6 pt-6 border-t border-border">
              <Link href="/login" className="text-sm text-brand font-semibold hover:underline">
                Giriş sayfasına dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F3F4F6] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <img src="/logo-light.webp" alt="AKINEL OTO YEDEK PARÇA" className="h-14 w-auto mx-auto" />
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-border p-7">
          <div className="text-center mb-6">
            <div className="w-10 h-1 bg-brand rounded-full mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-[#111827]">Kayıt Ol</h1>
            <p className="text-sm text-muted-foreground mt-1">Yeni bir hesap oluşturun.</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-brand-muted border border-brand/20 text-brand text-sm px-4 py-3">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-semibold text-[#111827] uppercase tracking-wide">Ad</Label>
                <Input id="firstName" placeholder="Ali" className="h-11 focus-visible:border-brand focus-visible:ring-brand/30" {...register('firstName')} />
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-semibold text-[#111827] uppercase tracking-wide">Soyad</Label>
                <Input id="lastName" placeholder="Yılmaz" className="h-11 focus-visible:border-brand focus-visible:ring-brand/30" {...register('lastName')} />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-[#111827] uppercase tracking-wide">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                autoComplete="email"
                className="h-11 focus-visible:border-brand focus-visible:ring-brand/30"
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-[#111827] uppercase tracking-wide">Şifre</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Şifrenizi oluşturun"
                  autoComplete="new-password"
                  className="pr-10 h-11 focus-visible:border-brand focus-visible:ring-brand/30"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrengthMeter password={password} />
              {errors.password && !password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold text-[#111827] uppercase tracking-wide">Şifre Tekrar</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Şifrenizi tekrar girin"
                  autoComplete="new-password"
                  className="pr-10 h-11 focus-visible:border-brand focus-visible:ring-brand/30"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand transition-colors"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <ConfirmMatchHint password={password} confirm={confirmPassword} />
            </div>

            {/* Terms & KVKK */}
            <div className="space-y-2 pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  className="mt-0.5 accent-brand shrink-0"
                  {...register('termsAccepted')}
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  <Link href="/kullanim-kosullari" target="_blank" className="text-brand font-semibold hover:underline">Kullanım Koşulları</Link>
                  {' '}ve{' '}
                  <Link href="/gizlilik-politikasi" target="_blank" className="text-brand font-semibold hover:underline">Gizlilik Politikası</Link>
                  &apos;nı okudum ve kabul ediyorum.
                </span>
              </label>
              {errors.termsAccepted && <p className="text-xs text-destructive pl-5">{errors.termsAccepted.message}</p>}

              <label className="flex items-start gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  className="mt-0.5 accent-brand shrink-0"
                  {...register('kvkkAccepted')}
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  <Link href="/kvkk" target="_blank" className="text-brand font-semibold hover:underline">KVKK Aydınlatma Metni</Link>
                  &apos;ni okudum, kişisel verilerimin işlenmesine onay veriyorum.
                </span>
              </label>
              {errors.kvkkAccepted && <p className="text-xs text-destructive pl-5">{errors.kvkkAccepted.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-sm font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">veya</span>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={(res) => { if (res.credential) handleGoogleSuccess(res.credential); }}
                onError={() => setError('Google ile kayıt yapılamadı.')}
                width="368"
                text="signup_with"
                locale="tr"
              />
            </div>
            {googleLoading && <p className="text-xs text-center text-muted-foreground">İşleniyor...</p>}
          </form>

          <p className="text-sm text-center mt-6 text-muted-foreground">
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="text-brand font-semibold hover:underline">
              Giriş Yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
