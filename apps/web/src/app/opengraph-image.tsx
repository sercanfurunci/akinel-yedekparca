import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';
export const alt = 'AKINEL OTO YEDEK PARÇA';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  const logoData = await readFile(path.join(process.cwd(), 'public/logo-light.png'));
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#111827',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Background accent */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 20% 50%, rgba(227,30,36,0.15) 0%, transparent 60%)',
          }}
        />

        {/* Logo on white card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: 16,
            padding: '20px 48px',
            marginBottom: 36,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt="AKINEL OTO YEDEK PARÇA"
            width={340}
            height={161}
            style={{ objectFit: 'contain' }}
          />
        </div>

        {/* Main title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ color: '#FFFFFF', fontSize: 56, fontWeight: 800, lineHeight: 1.1, textAlign: 'center' }}>
            Aracınız için
          </span>
          <span style={{ color: '#E31E24', fontSize: 56, fontWeight: 800, lineHeight: 1.1, textAlign: 'center' }}>
            doğru parçayı bulun
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: 20,
            marginTop: 22,
            textAlign: 'center',
            maxWidth: 680,
          }}
        >
          OEM numarası, parça adı veya aracınızla hızlı arama.
        </div>

        {/* Domain */}
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            color: 'rgba(255,255,255,0.3)',
            fontSize: 15,
            letterSpacing: '0.05em',
          }}
        >
          akinelotoyedekparca.com.tr
        </div>
      </div>
    ),
    { ...size }
  );
}
