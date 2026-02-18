// ============================================
// FaOnSisT - Database Seed
// Demo veriler oluşturma
// ============================================

import 'dotenv/config';
import { PrismaClient } from '../lib/generated/prisma/client.ts';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ---- USERS ----
  const hashedPassword = await bcrypt.hash('1234', 12);

  const hafsar = await prisma.user.upsert({
    where: { email: 'hafsar@faonsist.com' },
    update: {},
    create: {
      name: 'Hafsar Asilsoy',
      email: 'hafsar@faonsist.com',
      phone: '05321234567',
      password: hashedPassword,
      role: 'admin',
      permissions: 'Tum yetkiler',
      department: 'Yonetim',
      active: true,
    },
  });

  const mehmet = await prisma.user.upsert({
    where: { email: 'mehmet@faonsist.com' },
    update: {},
    create: {
      name: 'Mehmet Kaya',
      email: 'mehmet@faonsist.com',
      phone: '05339876543',
      password: hashedPassword,
      role: 'project_manager',
      permissions: 'Build modulu',
      department: 'Santiye',
      active: true,
    },
  });

  const ayse = await prisma.user.upsert({
    where: { email: 'ayse@faonsist.com' },
    update: {},
    create: {
      name: 'Ayse Demir',
      email: 'ayse@faonsist.com',
      phone: '05425551234',
      password: hashedPassword,
      role: 'accountant',
      permissions: 'Supply, Sales okuma',
      department: 'Muhasebe',
      active: true,
    },
  });

  console.log('Users created:', hafsar.name, mehmet.name, ayse.name);

  // ---- PROJECTS ----
  const now = new Date().toISOString();

  const project1 = await prisma.project.create({
    data: {
      legacyId: 1,
      ad: 'Atasehir Rezidans Projesi',
      kod: 'PRJ-2025-001',
      konum: 'Atasehir, Istanbul',
      basTarihi: '2025-01-15',
      bitTarihi: '2026-06-30',
      butce: 45000000,
      harcanan: 12500000,
      durum: 'devam',
      ilerleme: 35,
      isverenAdi: 'ABC Insaat A.S.',
      isverenTel: '0212 555 1234',
      isverenEposta: 'info@abcinsaat.com',
      mudurAdi: 'Mehmet Kaya',
      mudurTel: '05339876543',
      aciklama: 'A ve B blok toplam 120 daireli rezidans projesi',
    },
  });

  // Project 1 sub-entities
  await prisma.subcontractor.createMany({
    data: [
      { projectId: project1.id, legacyId: 1, firma: 'Demir Celik Ltd.', isKalemi: 'Demir Iscilik', tutar: 3500000, odenen: 1200000, durum: 'aktif', iletisim: 'Ali Demir', telefon: '0532 111 2233' },
      { projectId: project1.id, legacyId: 2, firma: 'Beton A.S.', isKalemi: 'Beton Temini', tutar: 5200000, odenen: 2800000, durum: 'aktif', iletisim: 'Veli Beton', telefon: '0533 222 3344' },
    ],
  });

  await prisma.workItem.createMany({
    data: [
      { projectId: project1.id, legacyId: 1, pozNo: '04.001', tanim: 'Kalip Iscilik', birim: 'm2', miktar: 15000, birimFiyat: 180, toplamTutar: 2700000, yapilan: 5250, kategori: 'Kaba Insaat' },
      { projectId: project1.id, legacyId: 2, pozNo: '04.002', tanim: 'Demir Iscilik', birim: 'ton', miktar: 1200, birimFiyat: 2500, toplamTutar: 3000000, yapilan: 420, kategori: 'Kaba Insaat' },
      { projectId: project1.id, legacyId: 3, pozNo: '04.003', tanim: 'C30/37 Beton', birim: 'm3', miktar: 8000, birimFiyat: 850, toplamTutar: 6800000, yapilan: 2800, kategori: 'Kaba Insaat' },
    ],
  });

  await prisma.progressClaim.createMany({
    data: [
      { projectId: project1.id, legacyId: 1, no: 1, donem: 'Ocak 2025', tutar: 3500000, kesinti: 175000, netTutar: 3325000, durum: 'odendi', tarih: '2025-01-31' },
      { projectId: project1.id, legacyId: 2, no: 2, donem: 'Subat 2025', tutar: 4200000, kesinti: 210000, netTutar: 3990000, durum: 'onaylandi', tarih: '2025-02-28' },
    ],
  });

  await prisma.dailyLog.createMany({
    data: [
      { projectId: project1.id, legacyId: 1, tarih: '2025-02-14', havaDurumu: 'Gunesli', sicaklik: '12', personelSayisi: 45, ekipmanlar: '2 Vinca, 1 Beton Pompasi', yapilanIsler: 'A Blok 5.kat kalip iscilik', sorunlar: 'Yok' },
      { projectId: project1.id, legacyId: 2, tarih: '2025-02-13', havaDurumu: 'Parcali Bulutlu', sicaklik: '8', personelSayisi: 38, ekipmanlar: '2 Vinca', yapilanIsler: 'B Blok temel betonu', sorunlar: 'Malzeme gecikmesi' },
    ],
  });

  await prisma.safetyRecord.createMany({
    data: [
      { projectId: project1.id, legacyId: 1, tarih: '2025-02-10', tur: 'denetim', aciklama: 'Haftalik ISG denetimi tamamlandi', oncelik: 'normal', durum: 'tamamlandi', sorumlu: 'Ahmet ISG' },
      { projectId: project1.id, legacyId: 2, tarih: '2025-02-01', tur: 'egitim', aciklama: 'Yeni personel ISG oryantasyonu', oncelik: 'yuksek', durum: 'tamamlandi', sorumlu: 'Ahmet ISG' },
    ],
  });

  await prisma.scheduleItem.createMany({
    data: [
      { projectId: project1.id, legacyId: 1, isAdi: 'Hafriyat', basTarihi: '2025-01-15', bitTarihi: '2025-02-15', sure: 30, ilerleme: 100, sorumlu: 'Mehmet Kaya', durum: 'tamamlandi' },
      { projectId: project1.id, legacyId: 2, isAdi: 'Temel Betonu', basTarihi: '2025-02-01', bitTarihi: '2025-03-15', sure: 45, ilerleme: 65, sorumlu: 'Mehmet Kaya', durum: 'devam' },
      { projectId: project1.id, legacyId: 3, isAdi: 'Kaba Insaat', basTarihi: '2025-03-01', bitTarihi: '2025-08-30', sure: 180, ilerleme: 15, sorumlu: 'Mehmet Kaya', durum: 'devam' },
    ],
  });

  await prisma.cashFlow.createMany({
    data: [
      { projectId: project1.id, legacyId: 1, tarih: '2025-01-31', aciklama: '1. Hakedis Odemesi', tur: 'gelir', kategori: 'hakedis', tutar: 3325000, durum: 'gerceklesen' },
      { projectId: project1.id, legacyId: 2, tarih: '2025-02-15', aciklama: 'Taseron Demir Iscilik', tur: 'gider', kategori: 'taseron', tutar: 1200000, durum: 'gerceklesen' },
    ],
  });

  await prisma.qualityRecord.createMany({
    data: [
      { projectId: project1.id, legacyId: 1, tarih: '2025-02-10', tur: 'test', aciklama: 'Beton basinc testi - C30/37', sonuc: 'uygun', sorumlu: 'Lab' },
    ],
  });

  await prisma.correspondence.createMany({
    data: [
      { projectId: project1.id, legacyId: 1, tarih: '2025-02-01', tur: 'giden', gonderenAlici: 'ABC Insaat', konu: 'Hakedis Raporu Gonderimi', referansNo: 'YZ-2025-001' },
    ],
  });

  // ---- PROJECT 2 ----
  const project2 = await prisma.project.create({
    data: {
      legacyId: 2,
      ad: 'Kadikoy Ticaret Merkezi',
      kod: 'PRJ-2025-002',
      konum: 'Kadikoy, Istanbul',
      basTarihi: '2025-03-01',
      bitTarihi: '2026-12-31',
      butce: 78000000,
      harcanan: 5200000,
      durum: 'devam',
      ilerleme: 12,
      isverenAdi: 'XYZ Yatirim Holding',
      isverenTel: '0216 444 5678',
      mudurAdi: 'Hafsar Asilsoy',
      mudurTel: '05321234567',
      aciklama: '3 blok ticaret merkezi + otopark',
    },
  });

  await prisma.workItem.createMany({
    data: [
      { projectId: project2.id, legacyId: 10, pozNo: '01.001', tanim: 'Hafriyat', birim: 'm3', miktar: 25000, birimFiyat: 45, toplamTutar: 1125000, yapilan: 18000, kategori: 'Zemin' },
      { projectId: project2.id, legacyId: 11, pozNo: '02.001', tanim: 'Fore Kazik', birim: 'mt', miktar: 3000, birimFiyat: 650, toplamTutar: 1950000, yapilan: 900, kategori: 'Temel' },
    ],
  });

  console.log('Projects created with sub-entities');

  // ---- TENDERS ----
  const tender1 = await prisma.tender.create({
    data: {
      legacyId: 20001,
      baslik: 'A Blok Mekanik Tesisat',
      item: 'Mekanik Tesisat Isleri',
      tip: 'acik',
      amount: 8500000,
      status: 'completed',
      delivery: 14,
      rating: 4,
      kazananTeklifId: 'bid1',
      komisyonNotu: 'Fiyat-kalite dengesi en iyi teklif',
    },
  });

  await prisma.tenderBid.createMany({
    data: [
      { tenderId: tender1.id, legacyId: 1, firma: 'Mek-Tek Tesisat', yetkili: 'Hasan Mekanik', telefon: '0532 444 5566', toplamFiyat: 8500000, teslimatGun: 14, puan: 88, durum: 'kazandi', odemeSartlari: '%30 pesinat, %70 hakedis', garanti: '2 yil' },
      { tenderId: tender1.id, legacyId: 2, firma: 'Isi-Su Muhendislik', yetkili: 'Can Isitma', telefon: '0533 555 6677', toplamFiyat: 9200000, teslimatGun: 21, puan: 72, durum: 'degerlendirildi' },
      { tenderId: tender1.id, legacyId: 3, firma: 'Comfort Klima', yetkili: 'Selim Klima', telefon: '0534 666 7788', toplamFiyat: 7800000, teslimatGun: 10, puan: 65, durum: 'degerlendirildi' },
    ],
  });

  await prisma.tenderItem.createMany({
    data: [
      { tenderId: tender1.id, kalemAdi: 'Pis Su Tesisati', miktar: 120, birim: 'daire' },
      { tenderId: tender1.id, kalemAdi: 'Temiz Su Tesisati', miktar: 120, birim: 'daire' },
      { tenderId: tender1.id, kalemAdi: 'Dogalgaz Tesisati', miktar: 120, birim: 'daire' },
    ],
  });

  const tender2 = await prisma.tender.create({
    data: {
      legacyId: 20002,
      baslik: 'Hazir Beton Temini',
      item: 'Hazir Beton Temini',
      tip: 'kapaliZarf',
      amount: 2500 * 500 + 2900 * 200, // 1.83M
      status: 'reviewing',
      delivery: 7,
      rating: 3,
      komisyonNotu: 'En dusuk teklif bazli tahmini tutar',
    },
  });

  await prisma.tenderBid.createMany({
    data: [
      { tenderId: tender2.id, legacyId: 4, firma: 'Beton A.S.', yetkili: 'Veli Beton', toplamFiyat: 2500 * 500 + 2900 * 200, teslimatGun: 1, puan: 80, kalemler: [{ kalem: 'C30/37 Beton', miktar: 500, birim: 'm3', birimFiyat: 2500 }, { kalem: 'C35/45 Beton', miktar: 200, birim: 'm3', birimFiyat: 2900 }] },
      { tenderId: tender2.id, legacyId: 5, firma: 'Mega Beton', yetkili: 'Kemal Beton', toplamFiyat: 2700 * 500 + 3100 * 200, teslimatGun: 1, puan: 70 },
    ],
  });

  const tender3 = await prisma.tender.create({
    data: {
      legacyId: 20003,
      baslik: 'Elektrik Kablo ve Malzeme',
      item: 'Elektrik Kablo ve Malzeme',
      tip: 'dogrudan',
      amount: 485000,
      status: 'pending',
      delivery: 14,
      rating: 3,
      komisyonNotu: 'Tahmini butce',
    },
  });

  console.log('Tenders created with bids');

  // ---- SALES ----
  await prisma.sale.createMany({
    data: [
      { legacyId: 30001, customer: 'Yilmaz Holding A.S.', phone: '0212 555 1122', product: 'Atasehir Rezidans A Blok - Daire (3+1)', price: 8500000, installments: 12, paid: 3541666, stage: 'negotiation', status: 'active' },
      { legacyId: 30002, customer: 'Mehmet Aktas', phone: '0532 666 7788', product: 'Atasehir Rezidans A Blok - Daire (2+1)', price: 5200000, installments: 24, paid: 1083333, stage: 'proposal', status: 'active' },
      { legacyId: 30003, customer: 'Deniz Insaat Ltd.', phone: '0216 333 4455', product: 'Kadikoy Ticaret Merkezi - B Blok 3.Kat Ofis', price: 12000000, installments: 6, paid: 6000000, stage: 'contract', status: 'active' },
      { legacyId: 30004, customer: 'Ayhan Celik', phone: '0533 999 8877', product: 'Atasehir Rezidans A Blok - Daire (1+1)', price: 3800000, installments: 1, paid: 0, stage: 'meeting', status: 'active' },
      { legacyId: 30005, customer: 'Kara Gayrimenkul', phone: '0212 777 6655', product: 'Kadikoy Ticaret Merkezi - Zemin Kat Magaza', price: 18500000, installments: 8, paid: 0, stage: 'lead', status: 'active' },
      { legacyId: 30006, customer: 'Ozturk Tekstil A.S.', phone: '0216 444 3322', product: 'Kadikoy Ticaret Merkezi - A Blok 2.Kat Ofis', price: 9200000, installments: 10, paid: 920000, stage: 'proposal', status: 'active' },
    ],
  });

  console.log('Sales created');

  // ---- CHANNELS & MESSAGES ----
  const genelChannel = await prisma.channel.create({
    data: {
      legacyId: 'genel',
      name: 'genel',
      type: 'channel',
      members: {
        create: [
          { userId: hafsar.id, role: 'admin' },
          { userId: mehmet.id },
          { userId: ayse.id },
        ],
      },
    },
  });

  await prisma.message.createMany({
    data: [
      { channelId: genelChannel.id, userId: mehmet.id, text: 'Atasehir projesinin hakedis raporu hazirlandi.', time: '09:15' },
      { channelId: genelChannel.id, userId: ayse.id, text: 'Tedarikci odemeleri icin onay bekliyorum.', time: '09:32' },
      { channelId: genelChannel.id, userId: hafsar.id, text: 'Tamam, bugun icinde onaylarim.', time: '09:45' },
    ],
  });

  await prisma.channelFile.createMany({
    data: [
      { channelId: genelChannel.id, legacyId: 101, name: 'Santiye_Guvenlik_Proseduru.pdf', type: 'PDF', size: '1.2 MB', desc: 'Genel santiye is guvenligi proseduru', uploadedBy: 'Hafsar Asilsoy', uploadedAt: '2025-01-15T10:00:00' },
      { channelId: genelChannel.id, legacyId: 102, name: '2025_Butce_Plani.xlsx', type: 'XLSX', size: '856 KB', desc: 'Yillik butce ve nakit akim plani', uploadedBy: 'Ayse Demir', uploadedAt: '2025-01-20T14:30:00' },
    ],
  });

  const projeTakipChannel = await prisma.channel.create({
    data: {
      legacyId: 'proje-takip',
      name: 'proje-takip',
      type: 'channel',
      members: {
        create: [
          { userId: hafsar.id, role: 'admin' },
          { userId: mehmet.id },
        ],
      },
    },
  });

  await prisma.message.create({
    data: { channelId: projeTakipChannel.id, userId: mehmet.id, text: 'A Blok kaba insaat %45 tamamlandi.', time: '10:00' },
  });

  await prisma.channelFile.createMany({
    data: [
      { channelId: projeTakipChannel.id, legacyId: 103, name: 'A_Blok_Vaziyet_Plani.dwg', type: 'DWG', size: '4.7 MB', desc: 'A Blok vaziyet plani - Rev.03', uploadedBy: 'Mehmet Kaya', uploadedAt: '2025-02-01T09:00:00' },
      { channelId: projeTakipChannel.id, legacyId: 104, name: 'Hakedis_Raporu_Ocak.pdf', type: 'PDF', size: '2.1 MB', desc: 'Ocak ayi hakedis ozet raporu', uploadedBy: 'Mehmet Kaya', uploadedAt: '2025-02-05T11:20:00' },
    ],
  });

  const duyurularChannel = await prisma.channel.create({
    data: {
      legacyId: 'duyurular',
      name: 'duyurular',
      type: 'channel',
      members: {
        create: [
          { userId: hafsar.id, role: 'admin' },
          { userId: mehmet.id },
          { userId: ayse.id },
        ],
      },
    },
  });

  await prisma.message.create({
    data: { channelId: duyurularChannel.id, userId: hafsar.id, text: 'Yarin saat 14:00 genel toplanti yapilacaktir.', time: '08:00' },
  });

  console.log('Channels & messages created');

  // ---- KNOWLEDGE BASE ----
  await prisma.knowledgeBaseItem.createMany({
    data: [
      { legacyId: 201, title: 'Beton Dokum Proseduru', category: 'Prosedur', fileType: 'PDF', desc: 'C30/37 beton dokum asamalari ve kalite kontrol adimlari', addedBy: 'Mehmet Kaya', addedAt: '2025-01-10T08:00:00', source: 'Manuel eklendi' },
      { legacyId: 202, title: 'Hakedis Hesaplama Sablonu', category: 'Sablonlar', fileType: 'XLSX', desc: 'Standart hakedis hesaplama Excel sablonu', addedBy: 'Ayse Demir', addedAt: '2025-01-12T10:30:00', source: 'Manuel eklendi' },
      { legacyId: 203, title: 'Iskele Kurulum Kilavuzu', category: 'Teknik', fileType: 'PDF', desc: 'Cephe iskele montaj ve demontaj teknik sartnamesi', addedBy: 'Hafsar Asilsoy', addedAt: '2025-01-18T13:00:00', source: 'Manuel eklendi' },
      { legacyId: 204, title: 'ISG Egitim Materyali', category: 'Egitim', fileType: 'DOCX', desc: 'Yeni personel is sagligi ve guvenligi egitim dokumani', addedBy: 'Hafsar Asilsoy', addedAt: '2025-01-25T09:15:00', source: 'Manuel eklendi' },
      { legacyId: 205, title: 'Taseronluk Sozlesme Ornegi', category: 'Sozlesme', fileType: 'DOCX', desc: 'Standart taseron is sozlesmesi taslagi', addedBy: 'Ayse Demir', addedAt: '2025-02-02T16:00:00', source: 'Manuel eklendi' },
    ],
  });

  // ---- WAREHOUSE CATEGORIES ----
  await prisma.warehouseCategory.createMany({
    data: [
      { key: 'insaat', ad: 'Insaat', renk: 'orange' },
      { key: 'ofis', ad: 'Ofis', renk: 'blue' },
      { key: 'it', ad: 'IT', renk: 'purple' },
      { key: 'arac', ad: 'Arac-Gerec', renk: 'cyan' },
      { key: 'mobilya', ad: 'Mobilya', renk: 'amber' },
      { key: 'diger', ad: 'Diger', renk: 'gray' },
    ],
  });

  // ---- SUPPLIERS ----
  await prisma.supplier.createMany({
    data: [
      { legacyId: 1, firma: 'Beton A.S.', yetkili: 'Veli Beton', telefon: '0533 222 3344', email: 'info@betonas.com', kategori: 'beton', puan: 4, aktif: true },
      { legacyId: 2, firma: 'Demir Celik Ltd.', yetkili: 'Ali Demir', telefon: '0532 111 2233', email: 'satis@demircelik.com', kategori: 'demir', puan: 5, aktif: true },
      { legacyId: 3, firma: 'Mega Beton', yetkili: 'Kemal Beton', telefon: '0534 333 4455', email: 'info@megabeton.com', kategori: 'beton', puan: 3, aktif: true },
      { legacyId: 4, firma: 'Elektrik Market', yetkili: 'Emre Elektrik', telefon: '0535 444 5566', email: 'siparis@elektrikmarket.com', kategori: 'elektrik', puan: 4, aktif: true },
    ],
  });

  console.log('Suppliers, knowledge base, and categories created');
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
