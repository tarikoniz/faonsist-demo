// ============================================
// FaOnSisT - AI Learning Engine Tests
// ============================================

import { describe, it, expect } from 'vitest';
import {
  extractKeywords,
  detectIntent,
  calculateSimilarity,
  freshnessMultiplier,
} from '../lib/ai-learning';

describe('extractKeywords', () => {
  it('Türkçe metinden keyword çıkarır', () => {
    const keywords = extractKeywords('Insaat projelerinde maliyet takibi nasil yapilir?');
    expect(keywords).toContain('insaat');
    expect(keywords).toContain('projelerinde');
    expect(keywords).toContain('maliyet');
    expect(keywords).toContain('takibi');
    expect(keywords).toContain('yapilir');
    // 'nasil' stop word olmalı
    expect(keywords).not.toContain('nasil');
  });

  it('Stop wordleri filtreler', () => {
    const keywords = extractKeywords('bu bir ve ile de');
    expect(keywords).toHaveLength(0);
  });

  it('Kısa kelimeleri filtreler (2 karakter altı)', () => {
    const keywords = extractKeywords('a b cd efg');
    expect(keywords).not.toContain('a');
    expect(keywords).not.toContain('b');
    expect(keywords).toContain('cd');
    expect(keywords).toContain('efg');
  });

  it('Büyük harfleri küçük harfe çevirir', () => {
    const keywords = extractKeywords('PROJE MALIYET');
    expect(keywords).toContain('proje');
    expect(keywords).toContain('maliyet');
  });

  it('Boş metin için boş dizi döner', () => {
    expect(extractKeywords('')).toHaveLength(0);
    expect(extractKeywords('   ')).toHaveLength(0);
  });
});

describe('detectIntent', () => {
  it('Proje intent tespiti', () => {
    expect(detectIntent(['proje', 'insaat', 'santiye'])).toBe('proje');
  });

  it('Bütçe intent tespiti', () => {
    expect(detectIntent(['butce', 'maliyet', 'harcama'])).toBe('butce');
  });

  it('İhale intent tespiti', () => {
    expect(detectIntent(['ihale', 'teklif', 'tedarik'])).toBe('ihale');
  });

  it('Satış intent tespiti', () => {
    expect(detectIntent(['satis', 'musteri', 'pipeline'])).toBe('satis');
  });

  it('Depo intent tespiti', () => {
    expect(detectIntent(['depo', 'envanter', 'stok'])).toBe('depo');
  });

  it('Araç intent tespiti', () => {
    expect(detectIntent(['arac', 'filo', 'plaka'])).toBe('arac');
  });

  it('Bilinmeyen keywords → genel', () => {
    expect(detectIntent(['xyz', 'abc'])).toBe('genel');
  });

  it('Boş keywords → genel', () => {
    expect(detectIntent([])).toBe('genel');
  });
});

describe('calculateSimilarity', () => {
  it('Tam eşleşme yüksek skor verir', () => {
    const score = calculateSimilarity(['proje', 'maliyet'], ['proje', 'maliyet']);
    expect(score).toBeGreaterThan(0.8);
  });

  it('Kısmi eşleşme orta skor verir', () => {
    const score = calculateSimilarity(['proje', 'maliyet'], ['proje', 'butce']);
    expect(score).toBeGreaterThan(0.2);
    expect(score).toBeLessThan(0.8);
  });

  it('Eşleşme yoksa 0 döner', () => {
    const score = calculateSimilarity(['abc', 'xyz'], ['def', 'ghi']);
    expect(score).toBe(0);
  });

  it('Boş dizi 0 döner', () => {
    expect(calculateSimilarity([], ['proje'])).toBe(0);
    expect(calculateSimilarity(['proje'], [])).toBe(0);
  });

  it('Substring eşleşme çalışır (Türkçe ek yapısı)', () => {
    // "projeyi" kelimesi "proje" ile kısmi eşleşmeli
    const score = calculateSimilarity(['projeyi'], ['proje', 'takip']);
    expect(score).toBeGreaterThan(0);
  });
});

describe('freshnessMultiplier', () => {
  it('Yeni kayıt → ~1.0 multiplier', () => {
    const score = freshnessMultiplier(new Date());
    expect(score).toBeCloseTo(1.0, 1);
  });

  it('30 günlük kayıt → ~0.5 multiplier', () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const score = freshnessMultiplier(thirtyDaysAgo);
    expect(score).toBeCloseTo(0.5, 1);
  });

  it('60 günlük kayıt → ~0.25 multiplier', () => {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const score = freshnessMultiplier(sixtyDaysAgo);
    expect(score).toBeCloseTo(0.25, 1);
  });
});
