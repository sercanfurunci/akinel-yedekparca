'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    api.auth.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border p-8 text-center">
      {status === 'loading' && (
        <>
          <Loader2 size={40} className="animate-spin text-brand mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#111827]">Doğrulanıyor...</h1>
          <p className="text-sm text-muted-foreground mt-2">Lütfen bekleyin.</p>
        </>
      )}
      {status === 'success' && (
        <>
          <div className="flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mx-auto mb-5">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-[#111827] mb-2">E-posta Doğrulandı!</h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Hesabınız başarıyla aktifleştirildi. Artık giriş yapabilirsiniz.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center bg-brand hover:bg-brand/90 text-white text-sm font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Giriş Yap
          </Link>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mx-auto mb-5">
            <XCircle size={32} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-[#111827] mb-2">Doğrulama Başarısız</h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Bu bağlantı geçersiz veya süresi dolmuş (24 saat). Yeniden kayıt olabilir veya destek alabilirsiniz.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center bg-brand hover:bg-brand/90 text-white text-sm font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Yeniden Kayıt Ol
            </Link>
            <Link href="/contact" className="text-sm text-brand hover:underline">
              Destek Al
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F3F4F6] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <img src="/logo-light.webp" alt="AKINEL OTO YEDEK PARÇA" className="h-14 w-auto mx-auto" />
          </Link>
        </div>
        <Suspense fallback={
          <div className="bg-white rounded-2xl shadow-sm border border-border p-8 text-center">
            <Loader2 size={40} className="animate-spin text-brand mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Doğrulanıyor...</p>
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
