'use client';

import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';

const schema = z.object({
  newPassword: z.string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .regex(/[A-Z]/, 'En az bir büyük harf içermeli')
    .regex(/[0-9]/, 'En az bir rakam içermeli'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof schema>;

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit = async (data: FormValues) => {
    setError('');
    try {
      await api.auth.resetPassword(token, data.newPassword);
      setDone(true);
    } catch {
      setError('Bağlantı geçersiz veya süresi dolmuş. Lütfen yeniden şifre sıfırlama isteği gönderin.');
    }
  };

  if (done) {
    return (
      <div className="text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mx-auto mb-5">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-[#111827] mb-2">Şifre Güncellendi</h1>
        <p className="text-sm text-muted-foreground mb-6">Yeni şifrenizle giriş yapabilirsiniz.</p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center bg-brand hover:bg-brand/90 text-white text-sm font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Giriş Yap
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-6">
        <div className="w-10 h-1 bg-brand rounded-full mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-[#111827]">Yeni Şifre Belirle</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-brand-muted border border-brand/20 text-brand text-sm px-4 py-3">{error}</div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="newPassword" className="text-xs font-semibold text-[#111827] uppercase tracking-wide">Yeni Şifre</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPwd ? 'text' : 'password'}
              placeholder="En az 8 karakter, büyük harf ve rakam"
              autoComplete="new-password"
              className="pr-10 h-11 focus-visible:border-brand focus-visible:ring-brand/30"
              {...register('newPassword')}
            />
            <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand transition-colors">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
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
            <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand transition-colors">
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
        </div>
        <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={isSubmitting || !token}>
          {isSubmitting ? 'Kaydediliyor...' : 'Şifremi Güncelle'}
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F3F4F6] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <img src="/logo-light.webp" alt="AKINEL OTO YEDEK PARÇA" className="h-14 w-auto mx-auto" />
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-border p-7">
          <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Yükleniyor...</p>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
