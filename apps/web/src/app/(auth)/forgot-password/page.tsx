'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';

const schema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const [sent, setSent] = useState(false);

  const onSubmit = async (data: FormValues) => {
    await api.auth.forgotPassword(data.email);
    setSent(true);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F3F4F6] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <img src="/logo-light.webp" alt="AKINEL OTO YEDEK PARÇA" className="h-14 w-auto mx-auto" />
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-border p-7">
          {sent ? (
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mx-auto mb-5">
                <MailCheck size={32} className="text-green-600" />
              </div>
              <h1 className="text-xl font-bold text-[#111827] mb-2">Mail Gönderildi</h1>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Eğer bu e-posta ile kayıtlı bir hesap varsa, şifre sıfırlama bağlantısı gönderildi.
                Spam klasörünü de kontrol edin.
              </p>
              <Link href="/login" className="text-sm text-brand font-semibold hover:underline">
                Giriş sayfasına dön
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-10 h-1 bg-brand rounded-full mx-auto mb-3" />
                <h1 className="text-2xl font-bold text-[#111827]">Şifremi Unuttum</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
                </p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={isSubmitting}>
                  {isSubmitting ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
                </Button>
              </form>
              <p className="text-sm text-center mt-6 text-muted-foreground">
                <Link href="/login" className="text-brand font-semibold hover:underline">
                  Giriş sayfasına dön
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
