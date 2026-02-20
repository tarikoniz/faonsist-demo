'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Bir hata oluştu</h2>
          <button onClick={() => reset()}>Tekrar dene</button>
        </div>
      </body>
    </html>
  );
}
