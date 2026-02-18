-- ============================================
-- FaOnSisT - Database Seed Script
-- PostgreSQL Demo Data
-- ============================================
-- Usage: psql -d faonsist -f prisma/seed.sql
-- ============================================

-- Clean slate: truncate all tables in correct FK order
TRUNCATE TABLE
  activities,
  notifications,
  file_uploads,
  notification_settings,
  messages,
  channel_files,
  channel_members,
  channels,
  knowledge_base,
  warehouse_movements,
  warehouse_counts,
  inventory_items,
  warehouses,
  warehouse_categories,
  asset_assignments,
  vehicle_documents,
  vehicle_maintenance,
  vehicle_fuel,
  vehicles,
  deliveries,
  orders,
  purchase_request_items,
  purchase_requests,
  tender_request_links,
  tender_bids,
  tender_items,
  tenders,
  sales,
  suppliers,
  cash_flows,
  safety_records,
  quality_records,
  correspondence,
  schedule_items,
  project_equipment,
  project_tasks,
  project_photos,
  project_materials,
  green_book_entries,
  contracts,
  daily_logs,
  progress_claims,
  work_items,
  subcontractors,
  projects,
  refresh_tokens,
  users
CASCADE;

-- ============================================
-- 1. USERS (3 users)
-- ============================================
WITH inserted_users AS (
  INSERT INTO users (id, name, email, phone, password, role, department, active, "createdAt", "updatedAt")
  VALUES
    (gen_random_uuid(), 'Hafsar Asilsoy', 'hafsar@faonsist.com', '0532 111 2233',
     '$2b$12$eDx09ll3v8.fAMcxTxRBAOGZzVRHVAU5VNVwNrBZRVtbwmq7wNHEa',
     'admin', 'Yonetim', true, NOW(), NOW()),
    (gen_random_uuid(), 'Mehmet Kaya', 'mehmet@faonsist.com', '0533 222 3344',
     '$2b$12$eDx09ll3v8.fAMcxTxRBAOGZzVRHVAU5VNVwNrBZRVtbwmq7wNHEa',
     'project_manager', 'Proje Yonetimi', true, NOW(), NOW()),
    (gen_random_uuid(), 'Ayse Demir', 'ayse@faonsist.com', '0534 333 4455',
     '$2b$12$eDx09ll3v8.fAMcxTxRBAOGZzVRHVAU5VNVwNrBZRVtbwmq7wNHEa',
     'accountant', 'Muhasebe', true, NOW(), NOW())
  RETURNING id, email
),

-- ============================================
-- 2. PROJECTS (2 projects)
-- ============================================
inserted_projects AS (
  INSERT INTO projects (id, "legacyId", ad, kod, konum, "basTarihi", "bitTarihi", butce, harcanan, durum, ilerleme,
                        "isverenAdi", "isverenTel", "mudurAdi", "mudurTel", aciklama, "createdAt", "updatedAt")
  VALUES
    (gen_random_uuid(), 1, 'Atasehir Rezidans Projesi', 'PRJ-001', 'Atasehir, Istanbul',
     '2025-03-01', '2026-12-31', 45000000, 12500000, 'devam', 35,
     'Atasehir Gayrimenkul A.S.', '0212 555 1234', 'Mehmet Kaya', '0533 222 3344',
     'Atasehir bolgesinde 120 daireli lux rezidans projesi', NOW(), NOW()),
    (gen_random_uuid(), 2, 'Kadikoy Ticaret Merkezi', 'PRJ-002', 'Kadikoy, Istanbul',
     '2025-09-15', '2027-06-30', 78000000, 5200000, 'devam', 12,
     'Kadikoy Holding', '0216 444 5678', 'Ali Yilmaz', '0535 666 7788',
     'Kadikoy merkezde 15 katli ticaret ve ofis merkezi', NOW(), NOW())
  RETURNING id, "legacyId"
),

-- Helper: extract individual user IDs
user_hafsar AS (SELECT id FROM inserted_users WHERE email = 'hafsar@faonsist.com'),
user_mehmet AS (SELECT id FROM inserted_users WHERE email = 'mehmet@faonsist.com'),
user_ayse  AS (SELECT id FROM inserted_users WHERE email = 'ayse@faonsist.com'),

-- Helper: extract individual project IDs
proj1 AS (SELECT id FROM inserted_projects WHERE "legacyId" = 1),
proj2 AS (SELECT id FROM inserted_projects WHERE "legacyId" = 2),

-- ============================================
-- 3. SUBCONTRACTORS (2 for project 1)
-- ============================================
inserted_subcontractors AS (
  INSERT INTO subcontractors (id, "legacyId", "projectId", firma, "isKalemi", "sozlesmeNo", tutar, odenen, durum,
                              "basTarihi", "bitTarihi", iletisim, telefon, notlar, "createdAt")
  SELECT gen_random_uuid(), 101, p.id, 'Demir Celik Ltd.', 'Celik Konstrüksiyon', 'SZL-2025-001',
         3500000, 1200000, 'aktif', '2025-04-01', '2025-12-31',
         'Ahmet Celik', '0532 444 5566', 'A Blok celik iskeleti yapimi', NOW()
  FROM proj1 p
  UNION ALL
  SELECT gen_random_uuid(), 102, p.id, 'Beton A.S.', 'Hazir Beton Temini', 'SZL-2025-002',
         5200000, 2100000, 'aktif', '2025-03-15', '2026-06-30',
         'Veli Beton', '0533 555 6677', 'Tum bloklar icin C30/37 beton temini', NOW()
  FROM proj1 p
  RETURNING id
),

-- ============================================
-- 4. WORK ITEMS (3 for project 1, 2 for project 2)
-- ============================================
inserted_work_items AS (
  -- Project 1 work items
  INSERT INTO work_items (id, "legacyId", "projectId", "pozNo", tanim, birim, miktar, "birimFiyat", "toplamTutar", yapilan, kategori, "createdAt")
  SELECT gen_random_uuid(), 201, p.id, '04.613/2A', 'Nervurlu celik hasir doseme', 'ton', 450, 28500, 12825000, 180, 'Kaba Yapi', NOW()
  FROM proj1 p
  UNION ALL
  SELECT gen_random_uuid(), 202, p.id, '18.195/1', 'C30/37 hazir beton dokumu', 'm3', 3200, 2850, 9120000, 1100, 'Kaba Yapi', NOW()
  FROM proj1 p
  UNION ALL
  SELECT gen_random_uuid(), 203, p.id, '27.535/1', 'Dis cephe aluminyum kompozit kaplama', 'm2', 4500, 1250, 5625000, 0, 'Ince Isler', NOW()
  FROM proj1 p
  UNION ALL
  -- Project 2 work items
  SELECT gen_random_uuid(), 204, p.id, '04.613/2A', 'Profil celik tasiyici kolon', 'ton', 680, 32000, 21760000, 85, 'Kaba Yapi', NOW()
  FROM proj2 p
  UNION ALL
  SELECT gen_random_uuid(), 205, p.id, '23.015/1', 'Temel hafriyat ve dolgu', 'm3', 12000, 185, 2220000, 4500, 'Altyapi', NOW()
  FROM proj2 p
  RETURNING id
),

-- ============================================
-- 5. PROGRESS CLAIMS (2 for project 1)
-- ============================================
inserted_progress_claims AS (
  INSERT INTO progress_claims (id, "legacyId", "projectId", no, donem, tutar, kesinti, "netTutar", durum, tarih, aciklama, "createdAt")
  SELECT gen_random_uuid(), 301, p.id, 1, '2025-06', 4500000, 225000, 4275000, 'onaylandi',
         '2025-06-30', '1. Hakediş - Temel ve bodrum kat imalatları', NOW()
  FROM proj1 p
  UNION ALL
  SELECT gen_random_uuid(), 302, p.id, 2, '2025-09', 3800000, 190000, 3610000, 'sunuldu',
         '2025-09-30', '2. Hakediş - Kaba yapı kat çıkma işleri', NOW()
  FROM proj1 p
  RETURNING id
),

-- ============================================
-- 6. DAILY LOGS (2 for project 1)
-- ============================================
inserted_daily_logs AS (
  INSERT INTO daily_logs (id, "legacyId", "projectId", tarih, "havaDurumu", sicaklik, "personelSayisi",
                          ekipmanlar, "yapilanIsler", sorunlar, notlar, "createdAt")
  SELECT gen_random_uuid(), 401, p.id, '2025-12-10', 'Gunesli', '12°C', 45,
         'Vinc x2, Beton Pompasi x1, Jenerator x3',
         '3. kat kalip montaji tamamlandi, 4. kat demir baglama basladi',
         'Malzeme gecikmeleri nedeniyle 2 gunluk kayma',
         'Yarin beton dokumu planlanmaktadir', NOW()
  FROM proj1 p
  UNION ALL
  SELECT gen_random_uuid(), 402, p.id, '2025-12-11', 'Parcali Bulutlu', '10°C', 52,
         'Vinc x2, Beton Pompasi x2, Jenerator x3, Kompressor x1',
         '4. kat beton dokumu tamamlandi (85m3), 3. kat kalip sokumu basladi',
         NULL,
         'Is guvenliği denetimi yapildi, sorun tespit edilmedi', NOW()
  FROM proj1 p
  RETURNING id
),

-- ============================================
-- 7. SAFETY RECORDS (2 for project 1)
-- ============================================
inserted_safety_records AS (
  INSERT INTO safety_records (id, "legacyId", "projectId", tarih, tur, aciklama, oncelik, durum, sorumlu, "ekNot", "createdAt")
  SELECT gen_random_uuid(), 501, p.id, '2025-11-15', 'denetim',
         'Aylik ISG denetimi - Iskele ve korkuluk kontrolleri yapildi',
         'normal', 'kapandi', 'Mehmet Kaya',
         'Tum korkuluklar standartlara uygun bulundu', NOW()
  FROM proj1 p
  UNION ALL
  SELECT gen_random_uuid(), 502, p.id, '2025-12-05', 'egitim',
         'Yuksekte calisma egitimi - 25 personel katildi',
         'yuksek', 'kapandi', 'ISG Uzmani - Hasan Ozturk',
         'Sertifikalar dagitildi, bir sonraki egitim Ocak 2026', NOW()
  FROM proj1 p
  RETURNING id
),

-- ============================================
-- 8. SCHEDULE ITEMS (3 for project 1)
-- ============================================
inserted_schedule_items AS (
  INSERT INTO schedule_items (id, "legacyId", "projectId", "isAdi", "basTarihi", "bitTarihi", sure, ilerleme,
                              sorumlu, bagimlilik, durum, "createdAt")
  SELECT gen_random_uuid(), 601, p.id, 'Temel ve Bodrum Kat', '2025-03-01', '2025-07-15', 135, 100,
         'Mehmet Kaya', NULL, 'tamamlandi', NOW()
  FROM proj1 p
  UNION ALL
  SELECT gen_random_uuid(), 602, p.id, 'Kaba Yapi Kat Cikma', '2025-07-16', '2026-04-30', 288, 45,
         'Mehmet Kaya', NULL, 'devam', NOW()
  FROM proj1 p
  UNION ALL
  SELECT gen_random_uuid(), 603, p.id, 'Dis Cephe ve Ince Isler', '2026-05-01', '2026-11-30', 213, 0,
         'Ali Yilmaz', NULL, 'planlanmis', NOW()
  FROM proj1 p
  RETURNING id
),

-- ============================================
-- 9. CASH FLOWS (2 for project 1)
-- ============================================
inserted_cash_flows AS (
  INSERT INTO cash_flows (id, "legacyId", "projectId", tarih, aciklama, tur, kategori, tutar, durum, "createdAt")
  SELECT gen_random_uuid(), 701, p.id, '2025-06-30', 'Isveren 1. Hakedis Odemesi', 'gelir', 'hakedis',
         4275000, 'gerceklesti', NOW()
  FROM proj1 p
  UNION ALL
  SELECT gen_random_uuid(), 702, p.id, '2025-07-15', 'Demir Celik Ltd. 2. Odeme', 'gider', 'taseron',
         800000, 'gerceklesti', NOW()
  FROM proj1 p
  RETURNING id
),

-- ============================================
-- 10. TENDERS (3 tenders with bids)
-- ============================================
inserted_tenders AS (
  INSERT INTO tenders (id, "legacyId", baslik, item, tip, amount, "toplamTutar", supplier, delivery, rating,
                       status, "komisyonNotu", "createdAt", "updatedAt")
  VALUES
    (gen_random_uuid(), 20001, 'A Blok Mekanik Tesisat Ihalesi', 'A Blok Mekanik Tesisat', 'kapaliZarf',
     8500000, 8500000, 'Teknik Tesisat A.S.', 120, 4,
     'completed', 'Fiyat-kalite dengesi acisindan en uygun teklif secildi', NOW(), NOW()),
    (gen_random_uuid(), 20002, 'Hazir Beton Temini Ihalesi', 'Hazir Beton Temini', 'acik',
     1830000, 1830000, NULL, 90, 0,
     'reviewing', 'Teklifler degerlendirme asamasinda', NOW(), NOW()),
    (gen_random_uuid(), 20003, 'Elektrik Kablo Temini', 'Elektrik Kablo ve Aksesuarlar', 'dogrudan',
     485000, 485000, NULL, 30, 0,
     'pending', NULL, NOW(), NOW())
  RETURNING id, "legacyId"
),

tender1 AS (SELECT id FROM inserted_tenders WHERE "legacyId" = 20001),
tender2 AS (SELECT id FROM inserted_tenders WHERE "legacyId" = 20002),

-- Tender 1 bids (3 bids - completed tender)
inserted_tender_bids AS (
  INSERT INTO tender_bids (id, "legacyId", "tenderId", firma, yetkili, telefon, email,
                           "teklifTarihi", "gecerlilikGun", "toplamFiyat", "teslimatGun",
                           "odemeSartlari", garanti, aciklama, puan, durum, "createdAt")
  SELECT gen_random_uuid(), 30001, t.id, 'Teknik Tesisat A.S.', 'Burak Teknik', '0532 777 8899',
         'burak@tekniktesisat.com', '2025-10-01', 60, 8200000, 110,
         '%30 pesinat, %70 is bitiminde', '2 yil', 'Referansli firma, onceki projede basarili', 92, 'kazandi', NOW()
  FROM tender1 t
  UNION ALL
  SELECT gen_random_uuid(), 30002, t.id, 'Istanbul Mekanik Ltd.', 'Kemal Isik', '0533 888 9900',
         'kemal@istmek.com', '2025-10-03', 45, 9100000, 130,
         '%50 pesinat, %50 is bitiminde', '1 yil', NULL, 75, 'degerlendirildi', NOW()
  FROM tender1 t
  UNION ALL
  SELECT gen_random_uuid(), 30003, t.id, 'Mega Tesisat Sanayi', 'Fatma Demir', '0534 999 0011',
         'fatma@megatesisat.com', '2025-10-05', 30, 8750000, 100,
         '%40 pesinat, %60 teslimde', '2 yil', 'Teslim suresi en kisa teklif', 83, 'degerlendirildi', NOW()
  FROM tender1 t
  UNION ALL
  -- Tender 2 bids (2 bids - reviewing)
  SELECT gen_random_uuid(), 30004, t.id, 'Beton A.S.', 'Veli Beton', '0533 555 6677',
         'veli@betonas.com', '2025-11-20', 60, 1780000, 85,
         'Aylık fatura, 30 gun vade', '1 yil', 'Mevcut taseron, proje deneyimi var', 0, 'degerlendirildi', NOW()
  FROM tender2 t
  UNION ALL
  SELECT gen_random_uuid(), 30005, t.id, 'Marmara Beton Ltd.', 'Serkan Yildiz', '0535 111 2233',
         'serkan@marmarabeton.com', '2025-11-22', 45, 1920000, 75,
         '%20 pesinat, kalanı aylık', '2 yil', 'C30/37 ve C35/45 sinifi icin ayricalikli fiyat', 0, 'degerlendirildi', NOW()
  FROM tender2 t
  RETURNING id
),

-- ============================================
-- 11. SALES (6 records)
-- ============================================
inserted_sales AS (
  INSERT INTO sales (id, "legacyId", customer, phone, product, price, installments, paid, stage, status, "createdAt", "updatedAt")
  VALUES
    (gen_random_uuid(), 5001, 'Ahmet Yilmaz', '0532 100 2001', 'A Blok Daire 5', 4200000, 120, 4200000, 'contract', 'won', NOW(), NOW()),
    (gen_random_uuid(), 5002, 'Fatma Ozkan', '0533 200 3002', 'A Blok Daire 12', 5100000, 60, 2550000, 'contract', 'active', NOW(), NOW()),
    (gen_random_uuid(), 5003, 'Mustafa Sahin', '0534 300 4003', 'B Blok Daire 3', 3800000, 1, 0, 'negotiation', 'active', NOW(), NOW()),
    (gen_random_uuid(), 5004, 'Zeynep Koc', '0535 400 5004', 'B Blok Daire 8', 4500000, 48, 0, 'proposal', 'active', NOW(), NOW()),
    (gen_random_uuid(), 5005, 'Ibrahim Cetin', '0536 500 6005', 'C Blok Daire 1', 6200000, 1, 0, 'meeting', 'active', NOW(), NOW()),
    (gen_random_uuid(), 5006, 'Elif Arslan', '0537 600 7006', 'C Blok Daire 15', 5800000, 1, 0, 'lead', 'active', NOW(), NOW())
  RETURNING id
),

-- ============================================
-- 12. CHANNELS (3 channels) with members and messages
-- ============================================
inserted_channels AS (
  INSERT INTO channels (id, "legacyId", name, type, "createdAt", "updatedAt")
  VALUES
    (gen_random_uuid(), 'genel', 'Genel', 'channel', NOW(), NOW()),
    (gen_random_uuid(), 'proje-takip', 'Proje Takip', 'channel', NOW(), NOW()),
    (gen_random_uuid(), 'duyurular', 'Duyurular', 'channel', NOW(), NOW())
  RETURNING id, "legacyId"
),

ch_genel  AS (SELECT id FROM inserted_channels WHERE "legacyId" = 'genel'),
ch_proje  AS (SELECT id FROM inserted_channels WHERE "legacyId" = 'proje-takip'),
ch_duyuru AS (SELECT id FROM inserted_channels WHERE "legacyId" = 'duyurular'),

-- Channel members: all 3 users in genel, hafsar+mehmet in proje-takip, hafsar in duyurular
inserted_channel_members AS (
  INSERT INTO channel_members (id, "channelId", "userId", role, "joinedAt")
  -- genel: all 3 users
  SELECT gen_random_uuid(), ch.id, u.id, 'admin', NOW()
  FROM ch_genel ch, user_hafsar u
  UNION ALL
  SELECT gen_random_uuid(), ch.id, u.id, 'member', NOW()
  FROM ch_genel ch, user_mehmet u
  UNION ALL
  SELECT gen_random_uuid(), ch.id, u.id, 'member', NOW()
  FROM ch_genel ch, user_ayse u
  UNION ALL
  -- proje-takip: hafsar + mehmet
  SELECT gen_random_uuid(), ch.id, u.id, 'admin', NOW()
  FROM ch_proje ch, user_hafsar u
  UNION ALL
  SELECT gen_random_uuid(), ch.id, u.id, 'member', NOW()
  FROM ch_proje ch, user_mehmet u
  UNION ALL
  -- duyurular: all 3 users
  SELECT gen_random_uuid(), ch.id, u.id, 'admin', NOW()
  FROM ch_duyuru ch, user_hafsar u
  UNION ALL
  SELECT gen_random_uuid(), ch.id, u.id, 'member', NOW()
  FROM ch_duyuru ch, user_mehmet u
  UNION ALL
  SELECT gen_random_uuid(), ch.id, u.id, 'member', NOW()
  FROM ch_duyuru ch, user_ayse u
  RETURNING id
),

-- Messages in channels
inserted_messages AS (
  INSERT INTO messages (id, "legacyId", "channelId", "userId", text, time, mine, "createdAt")
  -- genel channel messages
  SELECT gen_random_uuid(), 8001, ch.id, u.id,
         'Gununuz hayirli olsun, bugunki toplanti saat 14:00 da yapilacaktir.',
         '09:00', false, NOW() - INTERVAL '2 hours'
  FROM ch_genel ch, user_hafsar u
  UNION ALL
  SELECT gen_random_uuid(), 8002, ch.id, u.id,
         'Tesekkurler, katilacagim. Atasehir projesinin son durumunu da gorusebilir miyiz?',
         '09:15', false, NOW() - INTERVAL '1 hour 45 minutes'
  FROM ch_genel ch, user_mehmet u
  UNION ALL
  SELECT gen_random_uuid(), 8003, ch.id, u.id,
         'Muhasebe raporlari hazir, toplantida sunabilirim.',
         '09:30', false, NOW() - INTERVAL '1 hour 30 minutes'
  FROM ch_genel ch, user_ayse u
  UNION ALL
  -- proje-takip channel messages
  SELECT gen_random_uuid(), 8004, ch.id, u.id,
         'Atasehir 4. kat beton dokumu bugun tamamlandi. Ilerleme %35 seviyesinde.',
         '17:00', false, NOW() - INTERVAL '1 day'
  FROM ch_proje ch, user_mehmet u
  UNION ALL
  SELECT gen_random_uuid(), 8005, ch.id, u.id,
         'Harika! Kadikoy projesi icin de temel hafriyat ilerleme raporunu paylasir misiniz?',
         '17:30', false, NOW() - INTERVAL '23 hours'
  FROM ch_proje ch, user_hafsar u
  UNION ALL
  -- duyurular channel messages
  SELECT gen_random_uuid(), 8006, ch.id, u.id,
         'Yeni ISG yonetmeligi yururluge girmistir. Tum saha personelinin bilgilendirilmesi gerekmektedir.',
         '10:00', false, NOW() - INTERVAL '3 days'
  FROM ch_duyuru ch, user_hafsar u
  RETURNING id
),

-- ============================================
-- 13. KNOWLEDGE BASE (5 items)
-- ============================================
inserted_kb AS (
  INSERT INTO knowledge_base (id, "legacyId", title, category, "fileType", "desc", "addedBy", "addedAt", source, "createdAt")
  VALUES
    (gen_random_uuid(), 9001, 'ISG Yonetmeligi 2025', 'Mevzuat', 'PDF',
     'Guncel is sagligi ve guvenligi yonetmeligi tam metni',
     'Hafsar Asilsoy', '2025-01-15', 'Resmi Gazete', NOW()),
    (gen_random_uuid(), 9002, 'Beton Dokum Standartlari', 'Teknik', 'PDF',
     'TS EN 206 Beton standardi ve uygulama kilavuzu',
     'Mehmet Kaya', '2025-03-10', 'TSE', NOW()),
    (gen_random_uuid(), 9003, 'Celik Yapilar Hesap Kilavuzu', 'Teknik', 'XLSX',
     'Celik yapi hesap tablolari ve referans degerleri',
     'Mehmet Kaya', '2025-04-20', 'Dahili', NOW()),
    (gen_random_uuid(), 9004, 'Ihale Degerlendirme Sablonu', 'Sablonlar', 'DOCX',
     'Standart ihale tekliflerini degerlendirme puan tablosu sablonu',
     'Ayse Demir', '2025-06-01', 'Dahili', NOW()),
    (gen_random_uuid(), 9005, 'Hakedis Hazirlama Rehberi', 'Egitim', 'PDF',
     'Hakedis hazirlama sureci ve dikkat edilmesi gereken hususlar',
     'Ayse Demir', '2025-07-15', 'Dahili', NOW())
  RETURNING id
),

-- ============================================
-- 14. WAREHOUSE CATEGORIES (6 categories)
-- ============================================
inserted_wh_categories AS (
  INSERT INTO warehouse_categories (id, key, ad, renk)
  VALUES
    (gen_random_uuid(), 'insaat', 'Insaat Malzemeleri', '#ef4444'),
    (gen_random_uuid(), 'ofis', 'Ofis Malzemeleri', '#3b82f6'),
    (gen_random_uuid(), 'it', 'IT Ekipmanlari', '#8b5cf6'),
    (gen_random_uuid(), 'arac', 'Arac ve Is Makineleri', '#f59e0b'),
    (gen_random_uuid(), 'mobilya', 'Mobilya', '#10b981'),
    (gen_random_uuid(), 'diger', 'Diger', '#6b7280')
  RETURNING id
),

-- ============================================
-- 15. SUPPLIERS (4 records)
-- ============================================
inserted_suppliers AS (
  INSERT INTO suppliers (id, "legacyId", firma, yetkili, telefon, email, adres, "vergiNo",
                         kategori, "altKategori", puan, notlar, aktif, "createdAt", "updatedAt")
  VALUES
    (gen_random_uuid(), 4001, 'Demir Celik Ltd.', 'Ahmet Celik', '0532 444 5566',
     'ahmet@demircelik.com', 'Dilovasi OSB, Kocaeli', '1234567890',
     'Celik', 'Profil ve Hasir', 4, 'Guvenilir tedarikci, zamaninda teslimat', true, NOW(), NOW()),
    (gen_random_uuid(), 4002, 'Beton A.S.', 'Veli Beton', '0533 555 6677',
     'veli@betonas.com', 'Tuzla Sanayi, Istanbul', '2345678901',
     'Beton', 'Hazir Beton', 5, 'Istanbul un en buyuk hazir beton ureticisi', true, NOW(), NOW()),
    (gen_random_uuid(), 4003, 'Teknik Tesisat A.S.', 'Burak Teknik', '0532 777 8899',
     'burak@tekniktesisat.com', 'Umraniye, Istanbul', '3456789012',
     'Tesisat', 'Mekanik Tesisat', 4, 'Mekanik tesisat alaninda uzman firma', true, NOW(), NOW()),
    (gen_random_uuid(), 4004, 'Elektrik Malzeme San. Tic.', 'Serkan Volt', '0534 888 9900',
     'serkan@elektrikmalzeme.com', 'Dudullu OSB, Istanbul', '4567890123',
     'Elektrik', 'Kablo ve Aksesuarlar', 3, 'Genis urun yelpazesi, fiyat avantaji', true, NOW(), NOW())
  RETURNING id
)

-- ============================================
-- Final SELECT to confirm seed completion
-- ============================================
SELECT
  (SELECT COUNT(*) FROM inserted_users) AS users_count,
  (SELECT COUNT(*) FROM inserted_projects) AS projects_count,
  (SELECT COUNT(*) FROM inserted_subcontractors) AS subcontractors_count,
  (SELECT COUNT(*) FROM inserted_work_items) AS work_items_count,
  (SELECT COUNT(*) FROM inserted_progress_claims) AS progress_claims_count,
  (SELECT COUNT(*) FROM inserted_daily_logs) AS daily_logs_count,
  (SELECT COUNT(*) FROM inserted_safety_records) AS safety_records_count,
  (SELECT COUNT(*) FROM inserted_schedule_items) AS schedule_items_count,
  (SELECT COUNT(*) FROM inserted_cash_flows) AS cash_flows_count,
  (SELECT COUNT(*) FROM inserted_tenders) AS tenders_count,
  (SELECT COUNT(*) FROM inserted_tender_bids) AS tender_bids_count,
  (SELECT COUNT(*) FROM inserted_sales) AS sales_count,
  (SELECT COUNT(*) FROM inserted_channels) AS channels_count,
  (SELECT COUNT(*) FROM inserted_channel_members) AS channel_members_count,
  (SELECT COUNT(*) FROM inserted_messages) AS messages_count,
  (SELECT COUNT(*) FROM inserted_kb) AS knowledge_base_count,
  (SELECT COUNT(*) FROM inserted_wh_categories) AS warehouse_categories_count,
  (SELECT COUNT(*) FROM inserted_suppliers) AS suppliers_count;
