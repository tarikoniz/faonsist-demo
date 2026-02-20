'use client';

// Global error boundary - Next.js 16 için basit versiyon
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body>
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2>Bir hata oluştu</h2>
          <p>Lütfen sayfayı yenileyin.</p>
          <button
            style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
            onClick={reset}
          >
            Tekrar dene
          </button>
        </div>
      </body>
    </html>
  );
}
