'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { AuthResponse } from '@/lib/types';

const schema = z.object({
  firstName: z.string().min(1, 'Ad gerekli'),
  lastName: z.string().min(1, 'Soyad gerekli'),
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit = async (data: FormValues) => {
    setError('');
    try {
      const res = await api.auth.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      }) as AuthResponse;
      setAuth(res.user, res.accessToken, res.refreshToken);
      router.push('/account');
    } catch {
      setError('Kayıt sırasında bir hata oluştu. E-posta adresi zaten kullanılıyor olabilir.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F3F4F6] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <img src="/logo.png" alt="AKINEL OTO YEDEK PARÇA" className="h-14 w-auto mx-auto" />
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

            {/* Name row */}
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
                  placeholder="En az 6 karakter"
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
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
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
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-sm font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
            </Button>
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
