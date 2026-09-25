'use client';

import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { AuthResponse } from '@/lib/types';

const schema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(1, 'Şifre gerekli'),
  rememberMe: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

function SessionExpiredBanner() {
  const searchParams = useSearchParams();
  if (searchParams.get('session') !== 'expired') return null;
  return (
    <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3">
      Oturumunuz sona erdi. Lütfen tekrar giriş yapın.
    </div>
  );
}

function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: FormValues) => {
    setError('');
    try {
      const res = await api.auth.login({ email: data.email, password: data.password }) as AuthResponse;
      setAuth(res.user, res.accessToken, res.refreshToken);
      router.push(res.user.role === 'Admin' ? '/admin' : '/account');
    } catch {
      setError('E-posta veya şifre hatalı. Lütfen tekrar deneyin.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Suspense fallback={null}>
        <SessionExpiredBanner />
      </Suspense>
      {error && (
        <div className="rounded-lg bg-brand-muted border border-brand/20 text-brand text-sm px-4 py-3">
          {error}
        </div>
      )}

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
            placeholder="••••••••"
            autoComplete="current-password"
            className="pr-10 h-11 focus-visible:border-brand focus-visible:ring-brand/30"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand transition-colors"
            aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm cursor-pointer text-[#111827]">
          <input
            type="checkbox"
            {...register('rememberMe')}
            className="rounded border-input accent-brand"
          />
          Beni Hatırla
        </label>
        <Link href="#" className="text-xs text-brand font-semibold hover:underline">
          Şifremi Unuttum
        </Link>
      </div>

      <Button
        type="submit"
        className="w-full h-11 text-sm font-semibold"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F3F4F6] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <img src="/logo-light.png" alt="AKINEL OTO YEDEK PARÇA" className="h-14 w-auto mx-auto" />
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-border p-7">
          <div className="text-center mb-6">
            <div className="w-10 h-1 bg-brand rounded-full mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-[#111827]">Giriş Yap</h1>
            <p className="text-sm text-muted-foreground mt-1">Hesabınıza erişmek için giriş yapın.</p>
          </div>
          <LoginForm />
          <p className="text-sm text-center mt-6 text-muted-foreground">
            Hesabınız yok mu?{' '}
            <Link href="/register" className="text-brand font-semibold hover:underline">
              Kayıt Olun
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
