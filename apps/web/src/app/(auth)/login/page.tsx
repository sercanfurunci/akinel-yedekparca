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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <div className="rounded-lg bg-destructive/10 text-destructive text-sm px-4 py-3">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="email">E-posta</Label>
        <Input
          id="email"
          type="email"
          placeholder="ornek@email.com"
          autoComplete="email"
          {...register('email')}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">Şifre</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            className="pr-10"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            {...register('rememberMe')}
            className="rounded border-input"
          />
          Beni Hatırla
        </label>
        <Link href="#" className="text-xs text-brand hover:underline">
          Şifremi Unuttum
        </Link>
      </div>

      <Button
        type="submit"
        className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="container max-w-sm mx-auto py-16 px-4">
      <Card>
        <CardHeader className="text-center">
          <div className="text-brand font-bold text-2xl mb-1">Akinel</div>
          <CardTitle>Giriş Yap</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <p className="text-sm text-center mt-5 text-muted-foreground">
            Hesabınız yok mu?{' '}
            <Link href="/register" className="text-brand font-medium hover:underline">
              Kayıt Olun
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
