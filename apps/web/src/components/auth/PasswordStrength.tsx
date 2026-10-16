'use client';

import { Check, X } from 'lucide-react';

function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;

  if (score <= 1) return { score, label: 'Çok Zayıf', color: '#ef4444' };
  if (score === 2) return { score, label: 'Zayıf', color: '#f97316' };
  if (score === 3) return { score, label: 'Orta', color: '#eab308' };
  if (score === 4) return { score, label: 'Güçlü', color: '#22c55e' };
  return { score, label: 'Çok Güçlü', color: '#16a34a' };
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const { score, label, color } = getStrength(password);

  const rules = [
    { ok: password.length >= 8, text: 'En az 8 karakter' },
    { ok: /[A-Z]/.test(password), text: 'En az bir büyük harf' },
    { ok: /[0-9]/.test(password), text: 'En az bir rakam' },
    { ok: /[^A-Za-z0-9]/.test(password), text: 'Özel karakter (!@#...)' },
  ];

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i < score ? color : '#e5e7eb' }}
          />
        ))}
      </div>
      <p className="text-xs font-medium" style={{ color }}>{label}</p>
      <ul className="space-y-1">
        {rules.map((r) => (
          <li key={r.text} className="flex items-center gap-1.5 text-xs">
            {r.ok
              ? <Check size={12} className="text-green-500 shrink-0" />
              : <X size={12} className="text-gray-300 shrink-0" />}
            <span className={r.ok ? 'text-green-700' : 'text-muted-foreground'}>{r.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ConfirmMatchHint({ password, confirm }: { password: string; confirm: string }) {
  if (!confirm) return null;
  const match = password === confirm;
  return (
    <p className={`flex items-center gap-1 text-xs mt-1 ${match ? 'text-green-600' : 'text-red-500'}`}>
      {match ? <Check size={12} /> : <X size={12} />}
      {match ? 'Şifreler eşleşiyor' : 'Şifreler eşleşmiyor'}
    </p>
  );
}
