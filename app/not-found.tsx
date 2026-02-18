// ============================================
// FaOnSisT - 404 Not Found Page
// ============================================

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-4 text-6xl font-bold text-gray-600">404</div>
        <h1 className="mb-2 text-2xl font-bold text-white">Sayfa Bulunamadi</h1>
        <p className="mb-8 text-sm text-gray-400">
          Aradiginiz sayfa mevcut degil veya kaldirilmis olabilir.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
        >
          Ana Sayfaya Don
        </Link>
      </div>
    </div>
  );
}
