'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShoppingCart, Package } from 'lucide-react';
import Link from 'next/link';
import { api, API_BASE } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice, getImageUrl } from '@/lib/utils';
import type { Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır'),
  customerEmail: z.string().email('Geçerli bir e-posta girin'),
  customerPhone: z.string()
    .regex(/^(0[5][0-9]{9}|[+]90[5][0-9]{9})$/, 'Geçerli bir telefon girin (0-5XX-XXX-XX-XX)'),
  shippingAddress: z.string().min(5, 'Adres en az 5 karakter olmalıdır'),
  shippingCity: z.string().min(2, 'Şehir gerekli'),
  shippingDistrict: z.string().min(2, 'İlçe gerekli'),
  shippingPostalCode: z.string().optional(),
  shippingNotes: z.string().optional(),
  paymentMethod: z.enum(['0', '1', '2']),
  termsAccepted: z.literal(true, { error: 'Kullanım koşullarını kabul etmeniz gerekmektedir.' }),
  privacyAccepted: z.literal(true, { error: 'Gizlilik politikasını kabul etmeniz gerekmektedir.' }),
  distanceSalesAccepted: z.literal(true, { error: 'Mesafeli satış sözleşmesini kabul etmeniz gerekmektedir.' }),
  marketingConsent: z.boolean().optional().default(false),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const paymentLabels: Record<string, string> = {
  '0': 'Kredi Kartı (sonraki adımda)',
  '1': 'Banka Havalesi / EFT',
  '2': 'Kapıda Ödeme',
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subTotal, totalItems, fetchCart } = useCartStore();
  const { user, accessToken } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema) as never,
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      shippingAddress: '',
      shippingCity: '',
      shippingDistrict: '',
      shippingPostalCode: '',
      shippingNotes: '',
      paymentMethod: '2',
      termsAccepted: undefined as unknown as true,
      privacyAccepted: undefined as unknown as true,
      distanceSalesAccepted: undefined as unknown as true,
      marketingConsent: false,
    },
  });

  const termsAccepted = watch('termsAccepted');
  const privacyAccepted = watch('privacyAccepted');
  const distanceSalesAccepted = watch('distanceSalesAccepted');
  const marketingConsent = watch('marketingConsent');

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (user) {
      setValue('customerName', `${user.firstName} ${user.lastName}`);
      setValue('customerEmail', user.email);
    }
  }, [user, setValue]);

  const onSubmit = async (data: CheckoutForm) => {
    if (items.length === 0) {
      setError('Sepetiniz boş.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        shippingAddress: data.shippingAddress,
        shippingCity: data.shippingCity,
        shippingDistrict: data.shippingDistrict,
        shippingPostalCode: data.shippingPostalCode || null,
        shippingNotes: data.shippingNotes || null,
        paymentMethod: parseInt(data.paymentMethod, 10),
        termsAccepted: data.termsAccepted,
        privacyAccepted: data.privacyAccepted,
        distanceSalesAccepted: data.distanceSalesAccepted,
        marketingConsent: data.marketingConsent ?? false,
      };

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

      const res = await fetch(`${API_BASE}/api/orders/checkout`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message ?? `Hata: ${res.status}`);
      }

      const order = await res.json() as Order;
      // Clear local cart state
      await fetchCart();
      router.push(`/order-confirmation?orderNumber=${order.orderNumber}&orderId=${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sipariş oluşturulamadı.');
    } finally {
      setSubmitting(false);
    }
  };

  const shippingCost = 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-8">Ödeme</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingCart size={48} className="mx-auto text-muted-foreground/30 mb-4" strokeWidth={1} />
          <p className="text-lg font-medium mb-2">Sepetiniz boş</p>
          <p className="text-muted-foreground mb-6">Ödeme yapabilmek için önce ürün ekleyin.</p>
          <Link href="/products">
            <Button className="bg-brand text-brand-foreground hover:bg-brand/90">
              Alışverişe Başla
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form — left/top */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Müşteri Bilgileri */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">Müşteri Bilgileri</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="customerName">Ad Soyad *</Label>
                    <Input id="customerName" {...register('customerName')} placeholder="Ali Yılmaz" />
                    {errors.customerName && <p className="text-xs text-destructive">{errors.customerName.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="customerPhone">Telefon *</Label>
                    <Input id="customerPhone" {...register('customerPhone')} placeholder="05321234567" />
                    {errors.customerPhone && <p className="text-xs text-destructive">{errors.customerPhone.message}</p>}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="customerEmail">E-posta *</Label>
                  <Input id="customerEmail" type="email" {...register('customerEmail')} placeholder="ali@example.com" />
                  {errors.customerEmail && <p className="text-xs text-destructive">{errors.customerEmail.message}</p>}
                </div>
              </section>

              {/* Teslimat Adresi */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">Teslimat Adresi</h2>
                <div className="space-y-1">
                  <Label htmlFor="shippingAddress">Adres *</Label>
                  <textarea
                    id="shippingAddress"
                    {...register('shippingAddress')}
                    rows={2}
                    placeholder="Cadde, Sokak, Bina No, Daire"
                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
                  />
                  {errors.shippingAddress && <p className="text-xs text-destructive">{errors.shippingAddress.message}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="shippingCity">Şehir *</Label>
                    <Input id="shippingCity" {...register('shippingCity')} placeholder="İstanbul" />
                    {errors.shippingCity && <p className="text-xs text-destructive">{errors.shippingCity.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="shippingDistrict">İlçe *</Label>
                    <Input id="shippingDistrict" {...register('shippingDistrict')} placeholder="Kadıköy" />
                    {errors.shippingDistrict && <p className="text-xs text-destructive">{errors.shippingDistrict.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="shippingPostalCode">Posta Kodu</Label>
                    <Input id="shippingPostalCode" {...register('shippingPostalCode')} placeholder="34710" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="shippingNotes">Notlar</Label>
                  <textarea
                    id="shippingNotes"
                    {...register('shippingNotes')}
                    rows={2}
                    placeholder="Sipariş ile ilgili eklemek istediğiniz notlar..."
                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
                  />
                </div>
              </section>

              {/* Ödeme Yöntemi */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">Ödeme Yöntemi</h2>
                <div className="space-y-3">
                  {(['2', '1', '0'] as const).map((val) => (
                    <label key={val} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/40 transition-colors">
                      <input
                        type="radio"
                        value={val}
                        {...register('paymentMethod')}
                        className="text-brand"
                      />
                      <span className="text-sm font-medium">{paymentLabels[val]}</span>
                    </label>
                  ))}
                </div>
              </section>

              {/* Sözleşmeler ve Onaylar */}
              <section className="space-y-3 border rounded-lg p-4 bg-gray-50">
                <h2 className="font-medium text-sm text-gray-700">Sözleşmeler ve Onaylar</h2>

                {/* Kullanım Koşulları — REQUIRED */}
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={!!termsAccepted}
                    onCheckedChange={(checked: boolean) => setValue('termsAccepted', checked === true ? true : (undefined as unknown as true), { shouldValidate: true })}
                  />
                  <label htmlFor="terms" className="text-sm leading-snug cursor-pointer">
                    <a href="/belgeler/kullanim-kosullari" target="_blank" className="text-blue-600 underline">
                      Kullanım Koşulları
                    </a>
                    {"'nı okudum ve kabul ediyorum."}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                </div>
                {errors.termsAccepted && (
                  <p className="text-xs text-destructive ml-6">{errors.termsAccepted.message}</p>
                )}

                {/* Gizlilik Politikası + KVKK — REQUIRED */}
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="privacy"
                    checked={!!privacyAccepted}
                    onCheckedChange={(checked: boolean) => setValue('privacyAccepted', checked === true ? true : (undefined as unknown as true), { shouldValidate: true })}
                  />
                  <label htmlFor="privacy" className="text-sm leading-snug cursor-pointer">
                    <a href="/belgeler/gizlilik-politikasi" target="_blank" className="text-blue-600 underline">
                      Gizlilik Politikası
                    </a>
                    {" ve "}
                    <a href="/belgeler/kvkk" target="_blank" className="text-blue-600 underline">
                      KVKK Aydınlatma Metni
                    </a>
                    {"'ni okudum, onaylıyorum."}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                </div>
                {errors.privacyAccepted && (
                  <p className="text-xs text-destructive ml-6">{errors.privacyAccepted.message}</p>
                )}

                {/* Mesafeli Satış Sözleşmesi — REQUIRED */}
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="distanceSales"
                    checked={!!distanceSalesAccepted}
                    onCheckedChange={(checked: boolean) => setValue('distanceSalesAccepted', checked === true ? true : (undefined as unknown as true), { shouldValidate: true })}
                  />
                  <label htmlFor="distanceSales" className="text-sm leading-snug cursor-pointer">
                    <a href="/belgeler/mesafeli-satis-sozlesmesi" target="_blank" className="text-blue-600 underline">
                      Mesafeli Satış Sözleşmesi
                    </a>
                    {" ve "}
                    <a href="/belgeler/on-bilgilendirme-formu" target="_blank" className="text-blue-600 underline">
                      Ön Bilgilendirme Formu
                    </a>
                    {"'nu okudum ve onaylıyorum."}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                </div>
                {errors.distanceSalesAccepted && (
                  <p className="text-xs text-destructive ml-6">{errors.distanceSalesAccepted.message}</p>
                )}

                {/* Pazarlama İzni — OPTIONAL */}
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="marketing"
                    checked={!!marketingConsent}
                    onCheckedChange={(checked: boolean) => setValue('marketingConsent', checked === true, { shouldValidate: true })}
                  />
                  <label htmlFor="marketing" className="text-sm leading-snug cursor-pointer text-gray-600">
                    Kampanya, indirim ve haberlerden haberdar olmak için iletişim izni veriyorum. (İsteğe bağlı)
                  </label>
                </div>

                <p className="text-xs text-gray-500">
                  * işaretli onaylar sipariş tamamlamak için zorunludur.
                </p>
              </section>

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 text-base bg-brand text-brand-foreground hover:bg-brand/90 font-semibold"
              >
                {submitting ? 'İşleniyor...' : 'Siparişi Tamamla'}
              </Button>
            </form>
          </div>

          {/* Sipariş Özeti — right/top */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="rounded-xl border bg-card p-5 space-y-4 sticky top-4">
              <h2 className="text-lg font-semibold">Sipariş Özeti</h2>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {items.map((item) => {
                  const imgUrl = getImageUrl(item.imageUrl);
                  return (
                    <div key={item.productId} className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg border bg-muted shrink-0 flex items-center justify-center overflow-hidden">
                        {imgUrl ? (
                          <img src={imgUrl} alt={item.productName} className="w-full h-full object-contain p-1" />
                        ) : (
                          <Package size={16} className="text-muted-foreground/30" strokeWidth={1} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug line-clamp-2">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity} adet × {formatPrice(item.price, item.currency)}</p>
                      </div>
                      <span className="text-sm font-semibold shrink-0">{formatPrice(item.lineTotal, item.currency)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ara Toplam ({totalItems} ürün)</span>
                  <span>{formatPrice(subTotal, 'TRY')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kargo</span>
                  <span className="text-green-600 font-medium">
                    {shippingCost === 0 ? 'Ücretsiz' : formatPrice(shippingCost, 'TRY')}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Toplam</span>
                  <span className="text-brand">{formatPrice(subTotal + shippingCost, 'TRY')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
