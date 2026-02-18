-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'employee',
    "permissions" TEXT,
    "avatar" TEXT,
    "department" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "ad" TEXT NOT NULL,
    "kod" TEXT,
    "konum" TEXT,
    "basTarihi" TEXT,
    "bitTarihi" TEXT,
    "butce" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "harcanan" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "durum" TEXT NOT NULL DEFAULT 'devam',
    "ilerleme" INTEGER NOT NULL DEFAULT 0,
    "isverenAdi" TEXT,
    "isverenTel" TEXT,
    "isverenEposta" TEXT,
    "mudurAdi" TEXT,
    "mudurTel" TEXT,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subcontractors" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "projectId" TEXT NOT NULL,
    "firma" TEXT NOT NULL,
    "isKalemi" TEXT,
    "sozlesmeNo" TEXT,
    "tutar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "odenen" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "durum" TEXT NOT NULL DEFAULT 'aktif',
    "basTarihi" TEXT,
    "bitTarihi" TEXT,
    "iletisim" TEXT,
    "telefon" TEXT,
    "notlar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subcontractors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_items" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "projectId" TEXT NOT NULL,
    "pozNo" TEXT,
    "tanim" TEXT NOT NULL,
    "birim" TEXT,
    "miktar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "birimFiyat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "toplamTutar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "yapilan" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "kategori" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress_claims" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "projectId" TEXT NOT NULL,
    "no" INTEGER NOT NULL DEFAULT 0,
    "donem" TEXT,
    "tutar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "kesinti" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netTutar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "durum" TEXT NOT NULL DEFAULT 'hazirlaniyor',
    "tarih" TEXT,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progress_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_logs" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "projectId" TEXT NOT NULL,
    "tarih" TEXT NOT NULL,
    "havaDurumu" TEXT,
    "sicaklik" TEXT,
    "personelSayisi" INTEGER NOT NULL DEFAULT 0,
    "ekipmanlar" TEXT,
    "yapilanIsler" TEXT,
    "sorunlar" TEXT,
    "notlar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "green_book_entries" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "projectId" TEXT NOT NULL,
    "tarih" TEXT,
    "aciklama" TEXT NOT NULL,
    "miktar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "birim" TEXT,
    "birimFiyat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "toplamTutar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "onayDurumu" TEXT NOT NULL DEFAULT 'beklemede',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "green_book_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "projectId" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "tur" TEXT,
    "taraflar" TEXT,
    "tutar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "basTarihi" TEXT,
    "bitTarihi" TEXT,
    "durum" TEXT NOT NULL DEFAULT 'aktif',
    "dosyaUrl" TEXT,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_materials" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "projectId" TEXT NOT NULL,
    "malzemeAdi" TEXT NOT NULL,
    "birim" TEXT,
    "miktar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "birimFiyat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "toplamTutar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tedarikci" TEXT,
    "durum" TEXT NOT NULL DEFAULT 'beklemede',
    "siparisTarihi" TEXT,
    "teslimTarihi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_flows" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "projectId" TEXT NOT NULL,
    "tarih" TEXT NOT NULL,
    "aciklama" TEXT NOT NULL,
    "tur" TEXT NOT NULL,
    "kategori" TEXT,
    "tutar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "durum" TEXT NOT NULL DEFAULT 'planlanan',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cash_flows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_records" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "projectId" TEXT NOT NULL,
    "tarih" TEXT NOT NULL,
    "tur" TEXT NOT NULL,
    "aciklama" TEXT NOT NULL,
    "oncelik" TEXT NOT NULL DEFAULT 'normal',
    "durum" TEXT NOT NULL DEFAULT 'acik',
    "sorumlu" TEXT,
    "ekNot" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_records" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "projectId" TEXT NOT NULL,
    "tarih" TEXT NOT NULL,
    "tur" TEXT NOT NULL,
    "aciklama" TEXT NOT NULL,
    "sonuc" TEXT NOT NULL DEFAULT 'beklemede',
    "sorumlu" TEXT,
    "ekNot" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quality_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "correspondence" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "projectId" TEXT NOT NULL,
    "tarih" TEXT NOT NULL,
    "tur" TEXT NOT NULL,
    "gonderenAlici" TEXT,
    "konu" TEXT NOT NULL,
    "icerik" TEXT,
    "dosyaUrl" TEXT,
    "dosyaAdi" TEXT,
    "referansNo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "correspondence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_items" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "projectId" TEXT NOT NULL,
    "isAdi" TEXT NOT NULL,
    "basTarihi" TEXT,
    "bitTarihi" TEXT,
    "sure" INTEGER NOT NULL DEFAULT 0,
    "ilerleme" INTEGER NOT NULL DEFAULT 0,
    "sorumlu" TEXT,
    "bagimlilik" TEXT,
    "durum" TEXT NOT NULL DEFAULT 'planlanmis',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_equipment" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "projectId" TEXT NOT NULL,
    "ekipmanAdi" TEXT NOT NULL,
    "tur" TEXT,
    "plaka" TEXT,
    "durum" TEXT NOT NULL DEFAULT 'aktif',
    "gunlukUcret" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "operatorAdi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_tasks" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "projectId" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "aciklama" TEXT,
    "atananKisi" TEXT,
    "oncelik" TEXT NOT NULL DEFAULT 'normal',
    "durum" TEXT NOT NULL DEFAULT 'yapilacak',
    "sonTarih" TEXT,
    "tamamlanma" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_photos" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "projectId" TEXT NOT NULL,
    "baslik" TEXT,
    "aciklama" TEXT,
    "dosyaUrl" TEXT,
    "thumbnail" TEXT,
    "tarih" TEXT,
    "kategori" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenders" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "baslik" TEXT,
    "item" TEXT,
    "tip" TEXT NOT NULL DEFAULT 'acik',
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "toplamTutar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "supplier" TEXT,
    "delivery" INTEGER NOT NULL DEFAULT 0,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "kazananTeklifId" TEXT,
    "komisyonNotu" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tender_items" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "kalemAdi" TEXT NOT NULL,
    "miktar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "birim" TEXT,
    "aciklama" TEXT,

    CONSTRAINT "tender_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tender_bids" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "tenderId" TEXT NOT NULL,
    "firma" TEXT NOT NULL,
    "yetkili" TEXT,
    "telefon" TEXT,
    "email" TEXT,
    "teklifTarihi" TEXT,
    "gecerlilikGun" INTEGER NOT NULL DEFAULT 30,
    "toplamFiyat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "teslimatGun" INTEGER NOT NULL DEFAULT 0,
    "odemeSartlari" TEXT,
    "garanti" TEXT,
    "aciklama" TEXT,
    "puan" INTEGER NOT NULL DEFAULT 0,
    "durum" TEXT NOT NULL DEFAULT 'degerlendirildi',
    "kalemler" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tender_bids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tender_request_links" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,

    CONSTRAINT "tender_request_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_requests" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "talepNo" TEXT,
    "baslik" TEXT NOT NULL,
    "aciklama" TEXT,
    "taleptEden" TEXT,
    "departman" TEXT,
    "oncelik" TEXT NOT NULL DEFAULT 'normal',
    "durum" TEXT NOT NULL DEFAULT 'beklemede',
    "tapinanTutar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "onaylayanId" TEXT,
    "onayTarihi" TEXT,
    "redNedeni" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "requesterId" TEXT,
    "approverId" TEXT,

    CONSTRAINT "purchase_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_request_items" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "malzemeAdi" TEXT NOT NULL,
    "miktar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "birim" TEXT,
    "tapinanFiyat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aciklama" TEXT,

    CONSTRAINT "purchase_request_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "siparisNo" TEXT,
    "tedarikci" TEXT NOT NULL,
    "kalemler" JSONB,
    "toplamTutar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "durum" TEXT NOT NULL DEFAULT 'olusturuldu',
    "siparisTarihi" TEXT,
    "beklenenTarih" TEXT,
    "odemeDurumu" TEXT NOT NULL DEFAULT 'odenmedi',
    "notlar" TEXT,
    "ihaleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliveries" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "orderId" TEXT NOT NULL,
    "teslimTarihi" TEXT NOT NULL,
    "teslimAlan" TEXT,
    "kalemler" JSONB,
    "notlar" TEXT,
    "belgeler" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "firma" TEXT NOT NULL,
    "yetkili" TEXT,
    "telefon" TEXT,
    "email" TEXT,
    "adres" TEXT,
    "vergiNo" TEXT,
    "kategori" TEXT,
    "altKategori" TEXT,
    "puan" INTEGER NOT NULL DEFAULT 0,
    "notlar" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "customer" TEXT NOT NULL,
    "phone" TEXT,
    "product" TEXT,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "installments" INTEGER NOT NULL DEFAULT 1,
    "paid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stage" TEXT NOT NULL DEFAULT 'lead',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channels" (
    "id" TEXT NOT NULL,
    "legacyId" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'channel',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel_members" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "channel_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "channelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "time" TEXT,
    "mine" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel_files" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "channelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "size" TEXT,
    "desc" TEXT,
    "uploadedBy" TEXT,
    "uploadedAt" TEXT,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "channel_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_base" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "fileType" TEXT,
    "desc" TEXT,
    "addedBy" TEXT,
    "addedAt" TEXT,
    "source" TEXT,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_base_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "ad" TEXT NOT NULL,
    "konum" TEXT,
    "sorumlu" TEXT,
    "telefon" TEXT,
    "kapasite" TEXT,
    "tip" TEXT,
    "durum" TEXT NOT NULL DEFAULT 'aktif',
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "warehouseId" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "kod" TEXT,
    "kategori" TEXT,
    "birim" TEXT,
    "miktar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minStok" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxStok" DOUBLE PRECISION,
    "birimFiyat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "konum" TEXT,
    "barkod" TEXT,
    "durum" TEXT NOT NULL DEFAULT 'aktif',
    "sonSayimTarihi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_movements" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "warehouseId" TEXT NOT NULL,
    "tur" TEXT NOT NULL,
    "malzemeAdi" TEXT,
    "malzemeId" TEXT,
    "miktar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "birim" TEXT,
    "aciklama" TEXT,
    "islemYapan" TEXT,
    "hedefDepo" TEXT,
    "kaynakDepo" TEXT,
    "tarih" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warehouse_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_counts" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "warehouseId" TEXT NOT NULL,
    "tarih" TEXT NOT NULL,
    "sayimNo" TEXT,
    "durum" TEXT NOT NULL DEFAULT 'devam',
    "kalemler" JSONB,
    "sayimYapan" TEXT,
    "notlar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warehouse_counts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_assignments" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "malzemeAdi" TEXT NOT NULL,
    "malzemeId" TEXT,
    "zimmetliKisi" TEXT NOT NULL,
    "departman" TEXT,
    "tarih" TEXT,
    "durum" TEXT NOT NULL DEFAULT 'aktif',
    "notlar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "plaka" TEXT NOT NULL,
    "marka" TEXT,
    "model" TEXT,
    "yil" INTEGER,
    "tur" TEXT,
    "yakit" TEXT,
    "kmSayaci" INTEGER NOT NULL DEFAULT 0,
    "durum" TEXT NOT NULL DEFAULT 'aktif',
    "sofor" TEXT,
    "departman" TEXT,
    "sigortaBitis" TEXT,
    "muayeneBitis" TEXT,
    "kaskoVarMi" BOOLEAN NOT NULL DEFAULT false,
    "kasko" TEXT,
    "notlar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_documents" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "vehicleId" TEXT NOT NULL,
    "tur" TEXT NOT NULL,
    "belgeNo" TEXT,
    "basTarihi" TEXT,
    "bitTarihi" TEXT,
    "dosyaUrl" TEXT,
    "hatirlatma" BOOLEAN NOT NULL DEFAULT true,
    "notlar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_maintenance" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "vehicleId" TEXT NOT NULL,
    "tarih" TEXT NOT NULL,
    "tur" TEXT NOT NULL,
    "aciklama" TEXT,
    "km" INTEGER NOT NULL DEFAULT 0,
    "maliyet" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "servis" TEXT,
    "durum" TEXT NOT NULL DEFAULT 'tamamlandi',
    "sonrakiKm" INTEGER,
    "sonrakiTarih" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_fuel" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "vehicleId" TEXT NOT NULL,
    "tarih" TEXT NOT NULL,
    "litre" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tutar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "km" INTEGER NOT NULL DEFAULT 0,
    "istasyon" TEXT,
    "yakitTuru" TEXT,
    "notlar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_fuel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "userId" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "mesaj" TEXT,
    "tur" TEXT NOT NULL DEFAULT 'bilgi',
    "kategori" TEXT,
    "okundu" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "detail" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_uploads" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT,
    "size" INTEGER NOT NULL DEFAULT 0,
    "path" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_categories" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "renk" TEXT,

    CONSTRAINT "warehouse_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "projects_legacyId_key" ON "projects"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "tenders_legacyId_key" ON "tenders"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_requests_legacyId_key" ON "purchase_requests"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_legacyId_key" ON "orders"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_legacyId_key" ON "suppliers"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "sales_legacyId_key" ON "sales"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "channels_legacyId_key" ON "channels"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "channel_members_channelId_userId_key" ON "channel_members"("channelId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_legacyId_key" ON "warehouses"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_legacyId_key" ON "inventory_items"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_legacyId_key" ON "vehicles"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_userId_key" ON "notification_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_categories_key_key" ON "warehouse_categories"("key");

-- AddForeignKey
ALTER TABLE "subcontractors" ADD CONSTRAINT "subcontractors_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_items" ADD CONSTRAINT "work_items_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_claims" ADD CONSTRAINT "progress_claims_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "green_book_entries" ADD CONSTRAINT "green_book_entries_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_materials" ADD CONSTRAINT "project_materials_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_flows" ADD CONSTRAINT "cash_flows_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_records" ADD CONSTRAINT "safety_records_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_records" ADD CONSTRAINT "quality_records_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "correspondence" ADD CONSTRAINT "correspondence_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_items" ADD CONSTRAINT "schedule_items_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_equipment" ADD CONSTRAINT "project_equipment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_photos" ADD CONSTRAINT "project_photos_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tender_items" ADD CONSTRAINT "tender_items_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "tenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tender_bids" ADD CONSTRAINT "tender_bids_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "tenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tender_request_links" ADD CONSTRAINT "tender_request_links_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "tenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requests" ADD CONSTRAINT "purchase_requests_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requests" ADD CONSTRAINT "purchase_requests_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_request_items" ADD CONSTRAINT "purchase_request_items_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "purchase_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_members" ADD CONSTRAINT "channel_members_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_members" ADD CONSTRAINT "channel_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_files" ADD CONSTRAINT "channel_files_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_movements" ADD CONSTRAINT "warehouse_movements_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_counts" ADD CONSTRAINT "warehouse_counts_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_documents" ADD CONSTRAINT "vehicle_documents_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_maintenance" ADD CONSTRAINT "vehicle_maintenance_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_fuel" ADD CONSTRAINT "vehicle_fuel_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_uploads" ADD CONSTRAINT "file_uploads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
