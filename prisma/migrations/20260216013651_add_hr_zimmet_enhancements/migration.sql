-- AlterTable
ALTER TABLE "asset_assignments" ADD COLUMN     "belgeNo" TEXT,
ADD COLUMN     "birimDeger" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "gorevi" TEXT,
ADD COLUMN     "iseGirisTarihi" TEXT,
ADD COLUMN     "seriNo" TEXT,
ADD COLUMN     "tcKimlikNo" TEXT;

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "userId" TEXT,
    "ad" TEXT NOT NULL,
    "soyad" TEXT NOT NULL,
    "tcKimlikNo" TEXT,
    "dogumTarihi" TEXT,
    "cinsiyet" TEXT,
    "medeniDurum" TEXT,
    "telefonKisisel" TEXT,
    "telefonIs" TEXT,
    "emailKisisel" TEXT,
    "emailIs" TEXT,
    "adres" TEXT,
    "sehir" TEXT,
    "egitimDurumu" TEXT,
    "okulAdi" TEXT,
    "bolum" TEXT,
    "departmanId" TEXT,
    "gorevi" TEXT,
    "iseGirisTarihi" TEXT,
    "istenCikisTarihi" TEXT,
    "cikisSebebi" TEXT,
    "sgkNo" TEXT,
    "kanGrubu" TEXT,
    "acilDurumKisi" TEXT,
    "acilDurumTel" TEXT,
    "maas" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "calismaTipi" TEXT NOT NULL DEFAULT 'tam_zamanli',
    "durum" TEXT NOT NULL DEFAULT 'aktif',
    "notlar" TEXT,
    "profilResmi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "ad" TEXT NOT NULL,
    "kod" TEXT,
    "yoneticiId" TEXT,
    "aciklama" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_leaves" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "employeeId" TEXT NOT NULL,
    "izinTuru" TEXT NOT NULL,
    "basTarihi" TEXT NOT NULL,
    "bitTarihi" TEXT NOT NULL,
    "gunSayisi" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "durum" TEXT NOT NULL DEFAULT 'beklemede',
    "onaylayanId" TEXT,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_leaves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_documents" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "employeeId" TEXT NOT NULL,
    "tur" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "dosyaUrl" TEXT,
    "gecerlilikTarihi" TEXT,
    "notlar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_userId_key" ON "employees"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "employees_tcKimlikNo_key" ON "employees"("tcKimlikNo");

-- CreateIndex
CREATE INDEX "employees_departmanId_idx" ON "employees"("departmanId");

-- CreateIndex
CREATE INDEX "employees_durum_idx" ON "employees"("durum");

-- CreateIndex
CREATE INDEX "employees_createdAt_idx" ON "employees"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "departments_kod_key" ON "departments"("kod");

-- CreateIndex
CREATE INDEX "employee_leaves_employeeId_idx" ON "employee_leaves"("employeeId");

-- CreateIndex
CREATE INDEX "employee_leaves_durum_idx" ON "employee_leaves"("durum");

-- CreateIndex
CREATE INDEX "employee_documents_employeeId_idx" ON "employee_documents"("employeeId");

-- CreateIndex
CREATE INDEX "asset_assignments_belgeNo_idx" ON "asset_assignments"("belgeNo");

-- CreateIndex
CREATE INDEX "asset_assignments_zimmetliKisi_idx" ON "asset_assignments"("zimmetliKisi");

-- AddForeignKey
ALTER TABLE "employee_leaves" ADD CONSTRAINT "employee_leaves_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
