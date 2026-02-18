// ============================================
// FaOnSisT - AI Report Prompt Templates
// Rapor turune ozel AI prompt sablonlari
// ============================================

export const REPORT_PROMPTS: Record<string, string> = {
  proje_ozet: `Sen bir insaat projesi analiz uzmanısin. Asagidaki proje verilerini analiz et ve Turkce bir rapor olustur.

Rapor formati:
## Yonetici Ozeti
Projenin genel durumu, kritik bulgular (2-3 cumle)

## Temel Gostergeler
- Butce kullanim orani ve degerlendirme
- Ilerleme durumu ve tahmini tamamlanma
- Taseron performansi

## Onemli Bulgular
- Butce asimi veya tasarruf alanlari
- Geciken gorevler ve riskleri
- ISG durumu

## Oneriler
- Maliyet optimizasyonu onerileri
- Risk azaltma stratejileri
- Oncelikli aksiyon maddeleri`,

  maliyet_analiz: `Sen bir insaat maliyet analizi uzmanısin. Asagidaki maliyet verilerini analiz et ve Turkce bir rapor olustur.

Rapor formati:
## Maliyet Ozeti
Genel maliyet durumu, toplam butce/harcama karsilastirma

## Proje Bazli Analiz
Her projenin butce performansi, sapma analizi

## Kategori Analizi
Harcamalarin kategorilere gore dagilimi

## Tasarruf Onerileri
Maliyet optimizasyonu icin somut oneriler`,

  nakit_akis: `Sen bir finansal analiz uzmanısin. Asagidaki nakit akisi verilerini analiz et ve Turkce bir rapor olustur.

Rapor formati:
## Nakit Akisi Ozeti
Toplam gelir/gider, net nakit durumu

## Aylik Trend
Aylara gore gelir/gider degisimi, mevsimsel etkiler

## Tahmin
Onumuzdeki donem icin nakit akisi tahmini

## Risk ve Oneriler
Nakit akisi riskleri ve yonetim onerileri`,

  performans: `Sen bir proje performans degerlendirme uzmanısin. Asagidaki verileri analiz et ve Turkce bir rapor olustur.

Rapor formati:
## Performans Ozeti
Genel performans durumu, onemli metrikler

## Proje Performansi
Projelerin ilerleme, butce ve zaman performansi

## Gorev Takibi
Gorev tamamlanma oranlari, geciken gorevler

## Iyilestirme Onerileri
Performans artirmak icin oneriler`,

  risk: `Sen bir insaat risk degerlendirme uzmanısin. Asagidaki proje verilerini analiz et ve Turkce bir risk raporu olustur.

Rapor formati:
## Risk Ozeti
Genel risk durumu, en kritik riskler

## Finansal Riskler
Butce asimi, nakit akisi riskleri

## Operasyonel Riskler
Gecikme, taseron, malzeme riskleri

## ISG Riskleri
Is guvenligi ve saglik riskleri

## Risk Azaltma Onerileri
Her risk kategorisi icin somut onlemler`,
};
