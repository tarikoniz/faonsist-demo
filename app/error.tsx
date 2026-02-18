'use client';

// ============================================
// FaOnSisT - Global Error Page
// Next.js App Router error boundary
// ============================================

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-8">
      <div className="mx-auto max-w-md rounded-lg border border-red-500/20 bg-gray-900 p-8 text-center shadow-xl">
        <div className="mb-4 text-5xl">⚠️</div>
        <h1 className="mb-2 text-2xl font-bold text-white">Bir Hata Olustu</h1>
        <p className="mb-6 text-sm text-gray-400">
          Beklenmedik bir hata meydana geldi. Lutfen tekrar deneyin veya sayfayi yenileyin.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 rounded border border-red-500/20 bg-red-950/20 p-3 text-left">
            <summary className="cursor-pointer text-xs text-red-400">
              Hata Detaylari
            </summary>
            <pre className="mt-2 max-h-40 overflow-auto text-xs text-red-300">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}

        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            Tekrar Dene
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="rounded-lg bg-gray-700 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-600"
          >
            Ana Sayfa
          </button>
        </div>
      </div>
    </div>
  );
}
