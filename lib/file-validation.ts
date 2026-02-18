// ============================================
// FaOnSisT - File Validation (Magic Bytes)
// Browser MIME type'ı güvenilmez, dosya başlığını kontrol et
// ============================================

interface MagicSignature {
  mimeType: string;
  bytes: number[];
  offset?: number;
}

// Bilinen dosya formatlarının magic byte imzaları
const MAGIC_SIGNATURES: MagicSignature[] = [
  // Images
  { mimeType: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { mimeType: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mimeType: 'image/gif', bytes: [0x47, 0x49, 0x46, 0x38] }, // GIF8
  { mimeType: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }, // RIFF...WEBP
  { mimeType: 'image/bmp', bytes: [0x42, 0x4d] }, // BM
  { mimeType: 'image/tiff', bytes: [0x49, 0x49, 0x2a, 0x00] }, // II*.
  { mimeType: 'image/tiff', bytes: [0x4d, 0x4d, 0x00, 0x2a] }, // MM.*

  // PDF
  { mimeType: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF

  // ZIP (also docx, xlsx, pptx, odt, ods, odp)
  { mimeType: 'application/zip', bytes: [0x50, 0x4b, 0x03, 0x04] }, // PK..

  // RAR
  { mimeType: 'application/x-rar-compressed', bytes: [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07] }, // Rar!..

  // Microsoft Office (OLE)
  { mimeType: 'application/msword', bytes: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1] },
];

// ZIP tabanlı Office formatları (docx, xlsx, pptx, odt, ods, odp)
const ZIP_BASED_MIME_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
  'application/zip',
]);

// Text tabanlı dosyalar — magic byte kontrolü yapılmaz, içerik analizi yapılır
const TEXT_MIME_TYPES = new Set([
  'text/plain',
  'text/csv',
  'image/svg+xml',
]);

/**
 * Dosya buffer'ının magic bytes'ını kontrol ederek gerçek MIME type'ı doğrular
 *
 * @param buffer - Dosya buffer'ı
 * @param claimedMimeType - Browser'ın iddia ettiği MIME type
 * @returns { valid: boolean, detectedType?: string }
 */
export function validateFileMagicBytes(
  buffer: Buffer,
  claimedMimeType: string
): { valid: boolean; detectedType?: string; reason?: string } {
  // Boş dosya
  if (buffer.length === 0) {
    return { valid: false, reason: 'Dosya bos' };
  }

  // Text dosyaları — magic byte yok, sadece binary kontrol
  if (TEXT_MIME_TYPES.has(claimedMimeType)) {
    return validateTextFile(buffer, claimedMimeType);
  }

  // ZIP tabanlı Office dosyaları — ZIP magic byte kontrolü yeterli
  if (ZIP_BASED_MIME_TYPES.has(claimedMimeType)) {
    const isZip = matchesSignature(buffer, { mimeType: 'application/zip', bytes: [0x50, 0x4b, 0x03, 0x04] });
    if (isZip) {
      return { valid: true, detectedType: claimedMimeType };
    }
    return {
      valid: false,
      reason: `Dosya icerigi ${claimedMimeType} formatina uymuyor (ZIP imzasi bulunamadi)`,
    };
  }

  // OLE Office dosyaları (doc, xls, ppt)
  if (claimedMimeType === 'application/msword' ||
      claimedMimeType === 'application/vnd.ms-excel' ||
      claimedMimeType === 'application/vnd.ms-powerpoint') {
    const isOLE = matchesSignature(buffer, {
      mimeType: 'application/msword',
      bytes: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1],
    });
    if (isOLE) {
      return { valid: true, detectedType: claimedMimeType };
    }
    return {
      valid: false,
      reason: `Dosya icerigi ${claimedMimeType} formatina uymuyor (OLE imzasi bulunamadi)`,
    };
  }

  // Standart magic byte kontrolü
  for (const sig of MAGIC_SIGNATURES) {
    if (matchesSignature(buffer, sig)) {
      // WebP için ek kontrol — RIFF + WEBP
      if (sig.mimeType === 'image/webp' && claimedMimeType === 'image/webp') {
        if (buffer.length >= 12) {
          const webpMarker = buffer.slice(8, 12).toString('ascii');
          if (webpMarker === 'WEBP') {
            return { valid: true, detectedType: 'image/webp' };
          }
        }
        return { valid: false, reason: 'RIFF dosyasi var ama WEBP degil' };
      }

      // Tespit edilen tip claimed tip ile eşleşiyor mu?
      if (sig.mimeType === claimedMimeType) {
        return { valid: true, detectedType: sig.mimeType };
      }

      // JPEG subtypes kabul et
      if (sig.mimeType === 'image/jpeg' && claimedMimeType === 'image/jpeg') {
        return { valid: true, detectedType: sig.mimeType };
      }
    }
  }

  // Eşleşme bulunamadı
  return {
    valid: false,
    reason: `Dosya icerigi iddia edilen formata (${claimedMimeType}) uymuyor`,
  };
}

function matchesSignature(buffer: Buffer, sig: MagicSignature): boolean {
  const offset = sig.offset || 0;
  if (buffer.length < offset + sig.bytes.length) return false;

  for (let i = 0; i < sig.bytes.length; i++) {
    if (buffer[offset + i] !== sig.bytes[i]) return false;
  }
  return true;
}

function validateTextFile(buffer: Buffer, mimeType: string): { valid: boolean; detectedType?: string; reason?: string } {
  // İlk 8KB'yi kontrol et — binary karakter var mı?
  const checkLength = Math.min(buffer.length, 8192);
  let nullCount = 0;
  let controlCount = 0;

  for (let i = 0; i < checkLength; i++) {
    const byte = buffer[i];
    if (byte === 0) nullCount++;
    // Control characters (0x00-0x08, 0x0E-0x1F) — tab, newline, CR hariç
    if (byte < 0x09 || (byte > 0x0d && byte < 0x20)) controlCount++;
  }

  // %1'den fazla null/control character varsa binary dosya
  const binaryRatio = (nullCount + controlCount) / checkLength;
  if (binaryRatio > 0.01) {
    return {
      valid: false,
      reason: 'Dosya binary icerik barindiriyor, text dosyasi degil',
    };
  }

  // SVG için ek kontrol — <svg tag'ı olmalı
  if (mimeType === 'image/svg+xml') {
    const content = buffer.toString('utf-8', 0, Math.min(buffer.length, 4096));
    if (!content.includes('<svg') && !content.includes('<?xml')) {
      return { valid: false, reason: 'SVG formatina uymuyor (<svg etiketi bulunamadi)' };
    }
  }

  return { valid: true, detectedType: mimeType };
}
