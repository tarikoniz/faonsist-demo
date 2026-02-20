// ============================================
// State Bridge API
// GET  /api/state — DB'den S objesini yeniden oluştur
// PUT  /api/state — S objesini al, DB'ye kaydet
// ============================================

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, unauthorizedResponse, successResponse } from '@/lib/auth';

// ---- GET: DB'den tam S objesi oluştur ----
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    // Tüm tabloları paralel olarak çek
    const [
      projects,
      tenders,
      sales,
      activities,
      channels,
      users,
      warehouses,
      inventoryItems,
      warehouseMovements,
      warehouseCounts,
      assetAssignments,
      vehicles,
      purchaseRequests,
      suppliers,
      orders,
      notifications,
      knowledgeBase,
      warehouseCategories,
      notificationSettings,
      employees,
      departments,
      employeeLeaves,
      employeeDocuments,
    ] = await Promise.all([
      prisma.project.findMany({
        include: {
          subcontractors: true,
          workItems: true,
          progressClaims: true,
          dailyLogs: true,
          greenBookEntries: true,
          contracts: true,
          materials: true,
          cashFlows: true,
          safetyRecords: true,
          qualityRecords: true,
          correspondence: true,
          scheduleItems: true,
          equipment: true,
          tasks: true,
          photos: true,
        },
      }),
      prisma.tender.findMany({
        include: { items: true, bids: true, requests: true },
      }),
      prisma.sale.findMany(),
      prisma.activity.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
      prisma.channel.findMany({
        include: { members: true, messages: true, files: true },
      }),
      prisma.user.findMany({
        select: {
          id: true, name: true, phone: true, email: true, role: true,
          permissions: true, active: true, department: true, customModules: true,
        },
      }),
      prisma.warehouse.findMany(),
      prisma.inventoryItem.findMany(),
      prisma.warehouseMovement.findMany(),
      prisma.warehouseCount.findMany(),
      prisma.assetAssignment.findMany(),
      prisma.vehicle.findMany({
        include: { documents: true, maintenance: true, fuel: true },
      }),
      prisma.purchaseRequest.findMany({ include: { items: true } }),
      prisma.supplier.findMany(),
      prisma.order.findMany({ include: { deliveries: true } }),
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.knowledgeBaseItem.findMany(),
      prisma.warehouseCategory.findMany(),
      prisma.notificationSettings.findFirst({ where: { userId: user.id } }),
      prisma.employee.findMany({ include: { leaves: true, documents: true } }),
      prisma.department.findMany(),
      prisma.employeeLeave.findMany(),
      prisma.employeeDocument.findMany(),
    ]);

    // Projeleri S formatına çevir (array'leri alt-entity olarak project objesine göm)
    const projectsForState = projects.map((p) => ({
      id: p.legacyId || p.id,
      ad: p.ad,
      kod: p.kod,
      konum: p.konum,
      basTarihi: p.basTarihi,
      bitTarihi: p.bitTarihi,
      butce: p.butce,
      harcanan: p.harcanan,
      durum: p.durum,
      ilerleme: p.ilerleme,
      isverenAdi: p.isverenAdi,
      isverenTel: p.isverenTel,
      isverenEposta: p.isverenEposta,
      mudurAdi: p.mudurAdi,
      mudurTel: p.mudurTel,
      aciklama: p.aciklama,
      tpiId: p.id, // DB UUID for sync
      tapinanlar: p.subcontractors.map((s) => ({
        id: s.legacyId || s.id,
        firma: s.firma,
        isKalemi: s.isKalemi,
        sozlesmeNo: s.sozlesmeNo,
        tutar: s.tutar,
        odenen: s.odenen,
        durum: s.durum,
        basTarihi: s.basTarihi,
        bitTarihi: s.bitTarihi,
        iletisim: s.iletisim,
        telefon: s.telefon,
        notlar: s.notlar,
      })),
      isKalemleri: p.workItems.map((w) => ({
        id: w.legacyId || w.id,
        pozNo: w.pozNo,
        tanim: w.tanim,
        birim: w.birim,
        miktar: w.miktar,
        birimFiyat: w.birimFiyat,
        toplamTutar: w.toplamTutar,
        yapilan: w.yapilan,
        kategori: w.kategori,
      })),
      hakedisler: p.progressClaims.map((h) => ({
        id: h.legacyId || h.id,
        no: h.no,
        donem: h.donem,
        tutar: h.tutar,
        kesinti: h.kesinti,
        netTutar: h.netTutar,
        durum: h.durum,
        tarih: h.tarih,
        aciklama: h.aciklama,
      })),
      gunlukRaporlar: p.dailyLogs.map((d) => ({
        id: d.legacyId || d.id,
        tarih: d.tarih,
        havaDurumu: d.havaDurumu,
        sicaklik: d.sicaklik,
        personelSayisi: d.personelSayisi,
        ekipmanlar: d.ekipmanlar,
        yapilanIsler: d.yapilanIsler,
        sorunlar: d.sorunlar,
        notlar: d.notlar,
      })),
      yesilDefter: p.greenBookEntries.map((g) => ({
        id: g.legacyId || g.id,
        tarih: g.tarih,
        aciklama: g.aciklama,
        miktar: g.miktar,
        birim: g.birim,
        birimFiyat: g.birimFiyat,
        toplamTutar: g.toplamTutar,
        onayDurumu: g.onayDurumu,
      })),
      sozlesmeler: p.contracts.map((c) => ({
        id: c.legacyId || c.id,
        baslik: c.baslik,
        tur: c.tur,
        taraflar: c.taraflar,
        tutar: c.tutar,
        basTarihi: c.basTarihi,
        bitTarihi: c.bitTarihi,
        durum: c.durum,
        dosyaUrl: c.dosyaUrl,
        aciklama: c.aciklama,
      })),
      malzemeler: p.materials.map((m) => ({
        id: m.legacyId || m.id,
        malzemeAdi: m.malzemeAdi,
        birim: m.birim,
        miktar: m.miktar,
        birimFiyat: m.birimFiyat,
        toplamTutar: m.toplamTutar,
        tedarikci: m.tedarikci,
        durum: m.durum,
        siparisTarihi: m.siparisTarihi,
        teslimTarihi: m.teslimTarihi,
      })),
      nakitAkisi: p.cashFlows.map((n) => ({
        id: n.legacyId || n.id,
        tarih: n.tarih,
        aciklama: n.aciklama,
        tur: n.tur,
        kategori: n.kategori,
        tutar: n.tutar,
        durum: n.durum,
      })),
      isg: p.safetyRecords.map((s) => ({
        id: s.legacyId || s.id,
        tarih: s.tarih,
        tur: s.tur,
        aciklama: s.aciklama,
        oncelik: s.oncelik,
        durum: s.durum,
        sorumlu: s.sorumlu,
        ekNot: s.ekNot,
      })),
      kaliteKontrol: p.qualityRecords.map((q) => ({
        id: q.legacyId || q.id,
        tarih: q.tarih,
        tur: q.tur,
        aciklama: q.aciklama,
        sonuc: q.sonuc,
        sorumlu: q.sorumlu,
        ekNot: q.ekNot,
      })),
      yazisMalar: p.correspondence.map((y) => ({
        id: y.legacyId || y.id,
        tarih: y.tarih,
        tur: y.tur,
        gonderenAlici: y.gonderenAlici,
        konu: y.konu,
        icerik: y.icerik,
        dosyaUrl: y.dosyaUrl,
        dosyaAdi: y.dosyaAdi,
        referansNo: y.referansNo,
      })),
      isProgrami: p.scheduleItems.map((s) => ({
        id: s.legacyId || s.id,
        isAdi: s.isAdi,
        basTarihi: s.basTarihi,
        bitTarihi: s.bitTarihi,
        sure: s.sure,
        ilerleme: s.ilerleme,
        sorumlu: s.sorumlu,
        bagimlilik: s.bagimlilik,
        durum: s.durum,
      })),
      ekipmanlar: p.equipment.map((e) => ({
        id: e.legacyId || e.id,
        ekipmanAdi: e.ekipmanAdi,
        tur: e.tur,
        plaka: e.plaka,
        durum: e.durum,
        gunlukUcret: e.gunlukUcret,
        operatorAdi: e.operatorAdi,
      })),
      gorevler: p.tasks.map((t) => ({
        id: t.legacyId || t.id,
        baslik: t.baslik,
        aciklama: t.aciklama,
        atananKisi: t.atananKisi,
        oncelik: t.oncelik,
        durum: t.durum,
        sonTarih: t.sonTarih,
        tamamlanma: t.tamamlanma,
      })),
      fotograflar: p.photos.map((f) => ({
        id: f.legacyId || f.id,
        baslik: f.baslik,
        aciklama: f.aciklama,
        dosyaUrl: f.dosyaUrl,
        thumbnail: f.thumbnail,
        tarih: f.tarih,
        kategori: f.kategori,
      })),
    }));

    // Tenders => S formatı
    const tendersForState = tenders.map((t) => ({
      id: t.legacyId || t.id,
      baslik: t.baslik,
      item: t.item,
      tip: t.tip,
      amount: t.amount,
      toplamTutar: t.toplamTutar,
      supplier: t.supplier,
      delivery: t.delivery,
      rating: t.rating,
      status: t.status,
      kazananTeklifId: t.kazananTeklifId,
      komisyonNotu: t.komisyonNotu,
      createdAt: t.createdAt.toISOString(),
      kalemler: t.items.map((i) => ({
        id: i.id,
        kalemAdi: i.kalemAdi,
        miktar: i.miktar,
        birim: i.birim,
        aciklama: i.aciklama,
      })),
      teklifler: t.bids.map((b) => ({
        id: b.legacyId || b.id,
        firma: b.firma,
        yetkili: b.yetkili,
        telefon: b.telefon,
        email: b.email,
        teklifTarihi: b.teklifTarihi,
        gecerlilikGun: b.gecerlilikGun,
        toplamFiyat: b.toplamFiyat,
        teslimatGun: b.teslimatGun,
        odemeSartlari: b.odemeSartlari,
        garanti: b.garanti,
        aciklama: b.aciklama,
        puan: b.puan,
        durum: b.durum,
        kalemler: b.kalemler,
      })),
      talepIds: t.requests.map((r) => r.requestId),
    }));

    // Sales => S formatı
    const salesForState = sales.map((s) => ({
      id: s.legacyId || s.id,
      customer: s.customer,
      phone: s.phone,
      product: s.product,
      price: s.price,
      installments: s.installments,
      paid: s.paid,
      stage: s.stage,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
    }));

    // Users => S formatı (password olmadan)
    const usersForState = users.map((u) => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      email: u.email,
      role: u.role,
      perms: u.permissions,
      active: u.active,
      customModules: u.customModules ?? undefined,
    }));

    // Channels & Messages => S formatı
    const channelsForState = channels.map((ch) => ({
      id: ch.legacyId || ch.id,
      name: ch.name,
      members: ch.members.length,
      type: ch.type,
      memberList: ch.members.map((m) => {
        const u = users.find((uu) => uu.id === m.userId);
        return u ? u.name : 'Bilinmiyor';
      }),
    }));

    const messagesForState: Record<string, any[]> = {};
    channels.forEach((ch) => {
      const chKey = ch.legacyId || ch.id;
      messagesForState[chKey] = ch.messages.map((m) => {
        const msgUser = users.find((u) => u.id === m.userId);
        return {
          id: m.legacyId || m.id,
          user: msgUser?.name || 'Bilinmiyor',
          text: m.text,
          time: m.time || m.createdAt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          mine: m.userId === user.id,
        };
      });
    });

    const connFilesForState: Record<string, any[]> = {};
    channels.forEach((ch) => {
      const chKey = ch.legacyId || ch.id;
      if (ch.files.length > 0) {
        connFilesForState[chKey] = ch.files.map((f) => ({
          id: f.legacyId || f.id,
          name: f.name,
          type: f.type,
          size: f.size,
          desc: f.desc,
          uploadedBy: f.uploadedBy,
          uploadedAt: f.uploadedAt,
          channel: chKey,
        }));
      }
    });

    // Warehouse & Inventory => S formatı
    const depoForState = warehouses.map((w) => ({
      id: w.legacyId || w.id,
      ad: w.ad,
      konum: w.konum,
      sorumlu: w.sorumlu,
      telefon: w.telefon,
      kapasite: w.kapasite,
      tip: w.tip,
      durum: w.durum,
      aciklama: w.aciklama,
    }));

    const envanterForState = inventoryItems.map((i) => ({
      id: i.legacyId || i.id,
      depoId: i.warehouseId,
      ad: i.ad,
      kod: i.kod,
      kategori: i.kategori,
      birim: i.birim,
      miktar: i.miktar,
      minStok: i.minStok,
      maxStok: i.maxStok,
      birimFiyat: i.birimFiyat,
      konum: i.konum,
      barkod: i.barkod,
      durum: i.durum,
      sonSayimTarihi: i.sonSayimTarihi,
    }));

    // Vehicles => S formatı
    const araclarForState = vehicles.map((v) => ({
      id: v.legacyId || v.id,
      plaka: v.plaka,
      marka: v.marka,
      model: v.model,
      yil: v.yil,
      tur: v.tur,
      yakit: v.yakit,
      kmSayaci: v.kmSayaci,
      durum: v.durum,
      sofor: v.sofor,
      departman: v.departman,
      sigortaBitis: v.sigortaBitis,
      muayeneBitis: v.muayeneBitis,
      kaskoVarMi: v.kaskoVarMi,
      kasko: v.kasko,
      notlar: v.notlar,
      belgeler: v.documents.map((d) => ({
        id: d.legacyId || d.id,
        tur: d.tur,
        belgeNo: d.belgeNo,
        basTarihi: d.basTarihi,
        bitTarihi: d.bitTarihi,
        dosyaUrl: d.dosyaUrl,
        hatirlatma: d.hatirlatma,
        notlar: d.notlar,
      })),
      bakimlar: v.maintenance.map((b) => ({
        id: b.legacyId || b.id,
        tarih: b.tarih,
        tur: b.tur,
        aciklama: b.aciklama,
        km: b.km,
        maliyet: b.maliyet,
        servis: b.servis,
        durum: b.durum,
        sonrakiKm: b.sonrakiKm,
        sonrakiTarih: b.sonrakiTarih,
      })),
      yakitlar: v.fuel.map((y) => ({
        id: y.legacyId || y.id,
        tarih: y.tarih,
        litre: y.litre,
        tutar: y.tutar,
        km: y.km,
        istasyon: y.istasyon,
        yakitTuru: y.yakitTuru,
        notlar: y.notlar,
      })),
    }));

    // Purchase requests => S formatı
    const satinalmaTalepleriForState = purchaseRequests.map((pr) => ({
      id: pr.legacyId || pr.id,
      talepNo: pr.talepNo,
      baslik: pr.baslik,
      aciklama: pr.aciklama,
      taleptEden: pr.taleptEden,
      departman: pr.departman,
      oncelik: pr.oncelik,
      durum: pr.durum,
      tapinanTutar: pr.tapinanTutar,
      onaylayanId: pr.onaylayanId,
      onayTarihi: pr.onayTarihi,
      redNedeni: pr.redNedeni,
      createdAt: pr.createdAt.toISOString(),
      kalemler: pr.items.map((i) => ({
        id: i.id,
        malzemeAdi: i.malzemeAdi,
        miktar: i.miktar,
        birim: i.birim,
        tapinanFiyat: i.tapinanFiyat,
        aciklama: i.aciklama,
      })),
    }));

    // Suppliers => S formatı
    const tedarikcilerForState = suppliers.map((s) => ({
      id: s.legacyId || s.id,
      firma: s.firma,
      yetkili: s.yetkili,
      telefon: s.telefon,
      email: s.email,
      adres: s.adres,
      vergiNo: s.vergiNo,
      kategori: s.kategori,
      altKategori: s.altKategori,
      puan: s.puan,
      notlar: s.notlar,
      aktif: s.aktif,
    }));

    // Orders => S formatı
    const ordersForState = orders.map((o) => ({
      id: o.legacyId || o.id,
      siparisNo: o.siparisNo,
      tedarikci: o.tedarikci,
      kalemler: o.kalemler,
      toplamTutar: o.toplamTutar,
      durum: o.durum,
      siparisTarihi: o.siparisTarihi,
      beklenenTarih: o.beklenenTarih,
      odemeDurumu: o.odemeDurumu,
      notlar: o.notlar,
      ihaleId: o.ihaleId,
      teslimatlar: o.deliveries.map((d) => ({
        id: d.legacyId || d.id,
        teslimTarihi: d.teslimTarihi,
        teslimAlan: d.teslimAlan,
        kalemler: d.kalemler,
        notlar: d.notlar,
        belgeler: d.belgeler,
      })),
    }));

    // Build the S object
    const S = {
      projects: projectsForState,
      tenders: tendersForState,
      sales: salesForState,
      activities: activities.map((a) => ({
        id: a.legacyId || a.id,
        action: a.action,
        detail: a.detail,
        entityType: a.entityType,
        entityId: a.entityId,
        createdAt: a.createdAt.toISOString(),
      })),
      channels: channelsForState,
      messages: messagesForState,
      users: usersForState,
      currentChannel: 'genel',
      theme: 'dark',
      connFiles: connFilesForState,
      knowledgeBase: knowledgeBase.map((k) => ({
        id: k.legacyId || k.id,
        title: k.title,
        category: k.category,
        fileType: k.fileType,
        desc: k.desc,
        addedBy: k.addedBy,
        addedAt: k.addedAt,
        source: k.source,
      })),
      depolar: depoForState,
      envanter: envanterForState,
      depoHareketler: warehouseMovements.map((m) => ({
        id: m.legacyId || m.id,
        depoId: m.warehouseId,
        tur: m.tur,
        malzemeAdi: m.malzemeAdi,
        malzemeId: m.malzemeId,
        miktar: m.miktar,
        birim: m.birim,
        aciklama: m.aciklama,
        islemYapan: m.islemYapan,
        hedefDepo: m.hedefDepo,
        kaynakDepo: m.kaynakDepo,
        tarih: m.tarih,
      })),
      sayimlar: warehouseCounts.map((c) => ({
        id: c.legacyId || c.id,
        depoId: c.warehouseId,
        tarih: c.tarih,
        sayimNo: c.sayimNo,
        durum: c.durum,
        kalemler: c.kalemler,
        sayimYapan: c.sayimYapan,
        notlar: c.notlar,
      })),
      zimmetler: assetAssignments.map((z) => ({
        id: z.legacyId || z.id,
        malzemeAdi: z.malzemeAdi,
        malzemeId: z.malzemeId,
        zimmetliKisi: z.zimmetliKisi,
        departman: z.departman,
        tarih: z.tarih,
        durum: z.durum,
        notlar: z.notlar,
        belgeNo: z.belgeNo,
        seriNo: z.seriNo,
        birimDeger: z.birimDeger,
        tcKimlikNo: z.tcKimlikNo,
        gorevi: z.gorevi,
        iseGirisTarihi: z.iseGirisTarihi,
      })),
      araclar: araclarForState,
      depoKategoriler: warehouseCategories.length > 0
        ? warehouseCategories.map((c) => ({ key: c.key, ad: c.ad, renk: c.renk }))
        : [
            { key: 'insaat', ad: 'Insaat', renk: 'orange' },
            { key: 'ofis', ad: 'Ofis', renk: 'blue' },
            { key: 'it', ad: 'IT', renk: 'purple' },
            { key: 'arac', ad: 'Arac-Gerec', renk: 'cyan' },
            { key: 'mobilya', ad: 'Mobilya', renk: 'amber' },
            { key: 'diger', ad: 'Diger', renk: 'gray' },
          ],
      satinalmaTalepleri: satinalmaTalepleriForState,
      tedarikcilerHavuzu: tedarikcilerForState,
      orders: ordersForState,
      bildirimler: notifications.map((n) => ({
        id: n.legacyId || n.id,
        baslik: n.baslik,
        mesaj: n.mesaj,
        tur: n.tur,
        kategori: n.kategori,
        okundu: n.okundu,
        link: n.link,
        createdAt: n.createdAt.toISOString(),
      })),
      personeller: employees.map((e) => ({
        id: e.legacyId || e.id,
        userId: e.userId,
        ad: e.ad,
        soyad: e.soyad,
        tcKimlikNo: e.tcKimlikNo,
        dogumTarihi: e.dogumTarihi,
        cinsiyet: e.cinsiyet,
        medeniDurum: e.medeniDurum,
        telefonKisisel: e.telefonKisisel,
        telefonIs: e.telefonIs,
        emailKisisel: e.emailKisisel,
        emailIs: e.emailIs,
        adres: e.adres,
        sehir: e.sehir,
        egitimDurumu: e.egitimDurumu,
        okulAdi: e.okulAdi,
        bolum: e.bolum,
        departmanId: e.departmanId,
        gorevi: e.gorevi,
        iseGirisTarihi: e.iseGirisTarihi,
        istenCikisTarihi: e.istenCikisTarihi,
        cikisSebebi: e.cikisSebebi,
        sgkNo: e.sgkNo,
        kanGrubu: e.kanGrubu,
        acilDurumKisi: e.acilDurumKisi,
        acilDurumTel: e.acilDurumTel,
        maas: e.maas,
        calismaTipi: e.calismaTipi,
        durum: e.durum,
        notlar: e.notlar,
        profilResmi: e.profilResmi,
      })),
      departmanlar: departments.map((d) => ({
        id: d.legacyId || d.id,
        ad: d.ad,
        kod: d.kod,
        yoneticiId: d.yoneticiId,
        aciklama: d.aciklama,
        aktif: d.aktif,
      })),
      izinler: employeeLeaves.map((l) => ({
        id: l.legacyId || l.id,
        employeeId: l.employeeId,
        izinTuru: l.izinTuru,
        basTarihi: l.basTarihi,
        bitTarihi: l.bitTarihi,
        gunSayisi: l.gunSayisi,
        durum: l.durum,
        onaylayanId: l.onaylayanId,
        aciklama: l.aciklama,
      })),
      personelBelgeler: employeeDocuments.map((d) => ({
        id: d.legacyId || d.id,
        employeeId: d.employeeId,
        tur: d.tur,
        baslik: d.baslik,
        dosyaUrl: d.dosyaUrl,
        gecerlilikTarihi: d.gecerlilikTarihi,
        notlar: d.notlar,
      })),
      bildirimAyarlar: notificationSettings?.settings || {
        belgeEsikler: {
          gun60: { aktif: true, seviye: 'bilgi' },
          gun30: { aktif: true, seviye: 'uyari' },
          gun7: { aktif: true, seviye: 'kritik' },
          gun0: { aktif: true, seviye: 'acil' },
        },
        kmBakimHatirlatma: { aktif: true, aralik: 10000, seviye: 'uyari' },
        filoSorumlusu: { userId: null, tumBildirimleriAl: true },
        departmanRouting: {
          santiye: { aktif: false, hedefRol: null },
          ofis: { aktif: false, hedefRol: null },
          yonetim: { aktif: false, hedefRol: null },
          muhasebe: { aktif: false, hedefRol: null },
          diger: { aktif: false, hedefRol: null },
        },
        kategoriler: { 'arac-filo': true, envanter: true, genel: true },
        sesAktif: false,
        girisModalGoster: true,
      },
    };

    return successResponse(S);
  } catch (error) {
    console.error('State GET error:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'State yukleme hatasi' } },
      { status: 500 }
    );
  }
}

// ---- Helper: Sanitize values for Prisma ----
// Converts undefined → null, number → string where needed, string → number where needed
function str(val: unknown): string | null {
  if (val === undefined || val === null || val === '') return null;
  return String(val);
}
function strReq(val: unknown, fallback = ''): string {
  if (val === undefined || val === null) return fallback;
  return String(val);
}
function num(val: unknown, fallback = 0): number {
  if (val === undefined || val === null) return fallback;
  const n = Number(val);
  return isNaN(n) ? fallback : n;
}
function int(val: unknown, fallback = 0): number {
  if (val === undefined || val === null) return fallback;
  if (typeof val === 'string') {
    const parsed = parseInt(val.replace(/\D/g, ''));
    return isNaN(parsed) ? fallback : parsed;
  }
  return typeof val === 'number' ? Math.round(val) : fallback;
}
function bool(val: unknown, fallback = false): boolean {
  if (val === undefined || val === null) return fallback;
  return Boolean(val);
}
function intNull(val: unknown): number | null {
  if (val === undefined || val === null) return null;
  const n = Number(val);
  return isNaN(n) ? null : Math.round(n);
}
function legacyId(val: unknown): number | null {
  return typeof val === 'number' ? val : null;
}

// ---- PUT: S objesini al, DB'ye kaydet ----
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const S = await request.json();

    // Transaction içinde tüm tabloları güncelle
    await prisma.$transaction(async (tx) => {
      // --- SALES ---
      if (Array.isArray(S.sales)) {
        await tx.sale.deleteMany();
        for (const s of S.sales) {
          await tx.sale.create({
            data: {
              legacyId: legacyId(s.id),
              customer: strReq(s.customer),
              phone: str(s.phone),
              product: str(s.product),
              price: num(s.price),
              installments: int(s.installments, 1),
              paid: num(s.paid),
              stage: strReq(s.stage, 'lead'),
              status: strReq(s.status, 'active'),
            },
          });
        }
      }

      // --- SUPPLIERS ---
      if (Array.isArray(S.tedarikcilerHavuzu)) {
        await tx.supplier.deleteMany();
        for (const s of S.tedarikcilerHavuzu) {
          await tx.supplier.create({
            data: {
              legacyId: legacyId(s.id),
              firma: strReq(s.firma),
              yetkili: str(s.yetkili),
              telefon: str(s.telefon),
              email: str(s.email),
              adres: str(s.adres),
              vergiNo: str(s.vergiNo),
              kategori: str(s.kategori),
              altKategori: str(s.altKategori),
              puan: int(s.puan),
              notlar: str(s.notlar),
              aktif: bool(s.aktif, true),
            },
          });
        }
      }

      // --- NOTIFICATION SETTINGS ---
      if (S.bildirimAyarlar) {
        await tx.notificationSettings.upsert({
          where: { userId: user.id },
          update: { settings: S.bildirimAyarlar },
          create: { userId: user.id, settings: S.bildirimAyarlar },
        });
      }

      // --- WAREHOUSE CATEGORIES ---
      if (Array.isArray(S.depoKategoriler)) {
        await tx.warehouseCategory.deleteMany();
        for (const c of S.depoKategoriler) {
          await tx.warehouseCategory.create({
            data: { key: strReq(c.key), ad: strReq(c.ad), renk: str(c.renk) },
          });
        }
      }

      // --- PROJECTS (with sub-entities) ---
      if (Array.isArray(S.projects)) {
        const existingProjects = await tx.project.findMany({ select: { id: true, legacyId: true } });
        const projectMap = new Map(existingProjects.map((p) => [p.legacyId, p.id]));

        for (const p of S.projects) {
          const pLegacyId = legacyId(p.id);
          const existingId = pLegacyId ? projectMap.get(pLegacyId) : null;

          const projectData = {
            legacyId: pLegacyId,
            ad: strReq(p.ad),
            kod: str(p.kod),
            konum: str(p.konum),
            basTarihi: str(p.basTarihi),
            bitTarihi: str(p.bitTarihi),
            butce: num(p.butce),
            harcanan: num(p.harcanan),
            durum: strReq(p.durum, 'devam'),
            ilerleme: int(p.ilerleme),
            isverenAdi: str(p.isverenAdi),
            isverenTel: str(p.isverenTel),
            isverenEposta: str(p.isverenEposta),
            mudurAdi: str(p.mudurAdi),
            mudurTel: str(p.mudurTel),
            aciklama: str(p.aciklama),
          };

          let projectId: string;
          if (existingId) {
            await tx.project.update({ where: { id: existingId }, data: projectData });
            projectId = existingId;
          } else {
            const created = await tx.project.create({ data: projectData });
            projectId = created.id;
          }

          // Delete existing sub-entities
          await tx.subcontractor.deleteMany({ where: { projectId } });
          await tx.workItem.deleteMany({ where: { projectId } });
          await tx.progressClaim.deleteMany({ where: { projectId } });
          await tx.dailyLog.deleteMany({ where: { projectId } });
          await tx.greenBookEntry.deleteMany({ where: { projectId } });
          await tx.contract.deleteMany({ where: { projectId } });
          await tx.projectMaterial.deleteMany({ where: { projectId } });
          await tx.cashFlow.deleteMany({ where: { projectId } });
          await tx.safetyRecord.deleteMany({ where: { projectId } });
          await tx.qualityRecord.deleteMany({ where: { projectId } });
          await tx.correspondence.deleteMany({ where: { projectId } });
          await tx.scheduleItem.deleteMany({ where: { projectId } });
          await tx.projectEquipment.deleteMany({ where: { projectId } });
          await tx.projectTask.deleteMany({ where: { projectId } });
          await tx.projectPhoto.deleteMany({ where: { projectId } });

          // Re-create sub-entities with type-safe helpers
          if (p.tapinanlar?.length) {
            for (const s of p.tapinanlar) {
              await tx.subcontractor.create({
                data: {
                  projectId, legacyId: legacyId(s.id),
                  firma: strReq(s.firma), isKalemi: str(s.isKalemi), sozlesmeNo: str(s.sozlesmeNo),
                  tutar: num(s.tutar), odenen: num(s.odenen),
                  durum: strReq(s.durum, 'aktif'),
                  basTarihi: str(s.basTarihi), bitTarihi: str(s.bitTarihi),
                  iletisim: str(s.iletisim), telefon: str(s.telefon), notlar: str(s.notlar),
                },
              });
            }
          }

          if (p.isKalemleri?.length) {
            for (const w of p.isKalemleri) {
              await tx.workItem.create({
                data: {
                  projectId, legacyId: legacyId(w.id),
                  pozNo: str(w.pozNo), tanim: strReq(w.tanim),
                  birim: str(w.birim), miktar: num(w.miktar),
                  birimFiyat: num(w.birimFiyat), toplamTutar: num(w.toplamTutar),
                  yapilan: num(w.yapilan), kategori: str(w.kategori),
                },
              });
            }
          }

          if (p.hakedisler?.length) {
            for (const h of p.hakedisler) {
              await tx.progressClaim.create({
                data: {
                  projectId, legacyId: legacyId(h.id),
                  no: int(h.no), donem: str(h.donem),
                  tutar: num(h.tutar), kesinti: num(h.kesinti),
                  netTutar: num(h.netTutar), durum: strReq(h.durum, 'hazirlaniyor'),
                  tarih: str(h.tarih), aciklama: str(h.aciklama),
                },
              });
            }
          }

          if (p.gunlukRaporlar?.length) {
            for (const d of p.gunlukRaporlar) {
              await tx.dailyLog.create({
                data: {
                  projectId, legacyId: legacyId(d.id),
                  tarih: strReq(d.tarih), havaDurumu: str(d.havaDurumu),
                  sicaklik: str(d.sicaklik), personelSayisi: int(d.personelSayisi),
                  ekipmanlar: str(d.ekipmanlar), yapilanIsler: str(d.yapilanIsler),
                  sorunlar: str(d.sorunlar), notlar: str(d.notlar),
                },
              });
            }
          }

          if (p.yesilDefter?.length) {
            for (const g of p.yesilDefter) {
              await tx.greenBookEntry.create({
                data: {
                  projectId, legacyId: legacyId(g.id),
                  tarih: str(g.tarih), aciklama: strReq(g.aciklama),
                  miktar: num(g.miktar), birim: str(g.birim),
                  birimFiyat: num(g.birimFiyat), toplamTutar: num(g.toplamTutar),
                  onayDurumu: strReq(g.onayDurumu, 'beklemede'),
                },
              });
            }
          }

          if (p.sozlesmeler?.length) {
            for (const c of p.sozlesmeler) {
              await tx.contract.create({
                data: {
                  projectId, legacyId: legacyId(c.id),
                  baslik: strReq(c.baslik), tur: str(c.tur),
                  taraflar: str(c.taraflar), tutar: num(c.tutar),
                  basTarihi: str(c.basTarihi), bitTarihi: str(c.bitTarihi),
                  durum: strReq(c.durum, 'aktif'), dosyaUrl: str(c.dosyaUrl), aciklama: str(c.aciklama),
                },
              });
            }
          }

          if (p.malzemeler?.length) {
            for (const m of p.malzemeler) {
              await tx.projectMaterial.create({
                data: {
                  projectId, legacyId: legacyId(m.id),
                  malzemeAdi: strReq(m.malzemeAdi),
                  birim: str(m.birim), miktar: num(m.miktar),
                  birimFiyat: num(m.birimFiyat), toplamTutar: num(m.toplamTutar),
                  tedarikci: str(m.tedarikci), durum: strReq(m.durum, 'beklemede'),
                  siparisTarihi: str(m.siparisTarihi), teslimTarihi: str(m.teslimTarihi),
                },
              });
            }
          }

          if (p.nakitAkisi?.length) {
            for (const n of p.nakitAkisi) {
              await tx.cashFlow.create({
                data: {
                  projectId, legacyId: legacyId(n.id),
                  tarih: strReq(n.tarih), aciklama: strReq(n.aciklama),
                  tur: strReq(n.tur, 'gider'), kategori: str(n.kategori),
                  tutar: num(n.tutar), durum: strReq(n.durum, 'planlanan'),
                },
              });
            }
          }

          if (p.isg?.length) {
            for (const s of p.isg) {
              await tx.safetyRecord.create({
                data: {
                  projectId, legacyId: legacyId(s.id),
                  tarih: strReq(s.tarih), tur: strReq(s.tur),
                  aciklama: strReq(s.aciklama), oncelik: strReq(s.oncelik, 'normal'),
                  durum: strReq(s.durum, 'acik'), sorumlu: str(s.sorumlu), ekNot: str(s.ekNot),
                },
              });
            }
          }

          if (p.kaliteKontrol?.length) {
            for (const q of p.kaliteKontrol) {
              await tx.qualityRecord.create({
                data: {
                  projectId, legacyId: legacyId(q.id),
                  tarih: strReq(q.tarih), tur: strReq(q.tur),
                  aciklama: strReq(q.aciklama), sonuc: strReq(q.sonuc, 'beklemede'),
                  sorumlu: str(q.sorumlu), ekNot: str(q.ekNot),
                },
              });
            }
          }

          if (p.yazisMalar?.length) {
            for (const y of p.yazisMalar) {
              await tx.correspondence.create({
                data: {
                  projectId, legacyId: legacyId(y.id),
                  tarih: strReq(y.tarih), tur: strReq(y.tur),
                  gonderenAlici: str(y.gonderenAlici), konu: strReq(y.konu),
                  icerik: str(y.icerik), dosyaUrl: str(y.dosyaUrl),
                  dosyaAdi: str(y.dosyaAdi), referansNo: str(y.referansNo),
                },
              });
            }
          }

          if (p.isProgrami?.length) {
            for (const s of p.isProgrami) {
              await tx.scheduleItem.create({
                data: {
                  projectId, legacyId: legacyId(s.id),
                  isAdi: strReq(s.isAdi), basTarihi: str(s.basTarihi),
                  bitTarihi: str(s.bitTarihi), sure: int(s.sure),
                  ilerleme: int(s.ilerleme), sorumlu: str(s.sorumlu),
                  bagimlilik: str(s.bagimlilik), durum: strReq(s.durum, 'planlanmis'),
                },
              });
            }
          }

          if (p.ekipmanlar?.length) {
            for (const e of p.ekipmanlar) {
              await tx.projectEquipment.create({
                data: {
                  projectId, legacyId: legacyId(e.id),
                  ekipmanAdi: strReq(e.ekipmanAdi), tur: str(e.tur),
                  plaka: str(e.plaka), durum: strReq(e.durum, 'aktif'),
                  gunlukUcret: num(e.gunlukUcret), operatorAdi: str(e.operatorAdi),
                },
              });
            }
          }

          if (p.gorevler?.length) {
            for (const t of p.gorevler) {
              await tx.projectTask.create({
                data: {
                  projectId, legacyId: legacyId(t.id),
                  baslik: strReq(t.baslik), aciklama: str(t.aciklama),
                  atananKisi: str(t.atananKisi), oncelik: strReq(t.oncelik, 'normal'),
                  durum: strReq(t.durum, 'yapilacak'), sonTarih: str(t.sonTarih),
                  tamamlanma: int(t.tamamlanma),
                },
              });
            }
          }
        }
      }

      // --- TENDERS ---
      if (Array.isArray(S.tenders)) {
        await tx.tenderRequestLink.deleteMany();
        await tx.tenderBid.deleteMany();
        await tx.tenderItem.deleteMany();
        await tx.tender.deleteMany();

        for (const t of S.tenders) {
          const tender = await tx.tender.create({
            data: {
              legacyId: legacyId(t.id),
              baslik: str(t.baslik), item: str(t.item),
              tip: strReq(t.tip, 'acik'), amount: num(t.amount),
              toplamTutar: num(t.toplamTutar),
              supplier: str(t.supplier), delivery: int(t.delivery),
              rating: int(t.rating), status: strReq(t.status, 'pending'),
              kazananTeklifId: str(t.kazananTeklifId), komisyonNotu: str(t.komisyonNotu),
            },
          });

          if (t.kalemler?.length) {
            for (const k of t.kalemler) {
              await tx.tenderItem.create({
                data: {
                  tenderId: tender.id,
                  kalemAdi: strReq(k.kalemAdi), miktar: num(k.miktar),
                  birim: str(k.birim), aciklama: str(k.aciklama),
                },
              });
            }
          }

          if (t.teklifler?.length) {
            for (const b of t.teklifler) {
              await tx.tenderBid.create({
                data: {
                  tenderId: tender.id, legacyId: legacyId(b.id),
                  firma: strReq(b.firma), yetkili: str(b.yetkili),
                  telefon: str(b.telefon), email: str(b.email),
                  teklifTarihi: str(b.teklifTarihi), gecerlilikGun: int(b.gecerlilikGun, 30),
                  toplamFiyat: num(b.toplamFiyat), teslimatGun: int(b.teslimatGun),
                  odemeSartlari: str(b.odemeSartlari), garanti: str(b.garanti),
                  aciklama: str(b.aciklama), puan: int(b.puan),
                  durum: strReq(b.durum, 'degerlendirildi'),
                  kalemler: b.kalemler ?? null,
                },
              });
            }
          }
        }
      }

      // --- ORDERS ---
      if (Array.isArray(S.orders)) {
        await tx.delivery.deleteMany();
        await tx.order.deleteMany();

        for (const o of S.orders) {
          const order = await tx.order.create({
            data: {
              legacyId: legacyId(o.id),
              siparisNo: str(o.siparisNo), tedarikci: strReq(o.tedarikci),
              kalemler: o.kalemler ?? null, toplamTutar: num(o.toplamTutar),
              durum: strReq(o.durum, 'olusturuldu'), siparisTarihi: str(o.siparisTarihi),
              beklenenTarih: str(o.beklenenTarih), odemeDurumu: strReq(o.odemeDurumu, 'odenmedi'),
              notlar: str(o.notlar), ihaleId: str(o.ihaleId),
            },
          });

          if (o.teslimatlar?.length) {
            for (const d of o.teslimatlar) {
              await tx.delivery.create({
                data: {
                  orderId: order.id, legacyId: legacyId(d.id),
                  teslimTarihi: strReq(d.teslimTarihi),
                  teslimAlan: str(d.teslimAlan), kalemler: d.kalemler ?? null,
                  notlar: str(d.notlar), belgeler: d.belgeler ?? null,
                },
              });
            }
          }
        }
      }

      // --- PURCHASE REQUESTS ---
      if (Array.isArray(S.satinalmaTalepleri)) {
        await tx.purchaseRequestItem.deleteMany();
        await tx.purchaseRequest.deleteMany();

        for (const pr of S.satinalmaTalepleri) {
          const req = await tx.purchaseRequest.create({
            data: {
              legacyId: legacyId(pr.id),
              talepNo: str(pr.talepNo), baslik: strReq(pr.baslik),
              aciklama: str(pr.aciklama), taleptEden: str(pr.taleptEden),
              departman: str(pr.departman), oncelik: strReq(pr.oncelik, 'normal'),
              durum: strReq(pr.durum, 'beklemede'), tapinanTutar: num(pr.tapinanTutar),
              onaylayanId: str(pr.onaylayanId), onayTarihi: str(pr.onayTarihi),
              redNedeni: str(pr.redNedeni),
            },
          });

          if (pr.kalemler?.length) {
            for (const k of pr.kalemler) {
              await tx.purchaseRequestItem.create({
                data: {
                  requestId: req.id,
                  malzemeAdi: strReq(k.malzemeAdi), miktar: num(k.miktar),
                  birim: str(k.birim), tapinanFiyat: num(k.tapinanFiyat),
                  aciklama: str(k.aciklama),
                },
              });
            }
          }
        }
      }

      // --- WAREHOUSES ---
      if (Array.isArray(S.depolar)) {
        await tx.warehouseCount.deleteMany();
        await tx.warehouseMovement.deleteMany();
        await tx.inventoryItem.deleteMany();
        await tx.warehouse.deleteMany();

        for (const w of S.depolar) {
          await tx.warehouse.create({
            data: {
              legacyId: legacyId(w.id),
              ad: strReq(w.ad), konum: str(w.konum),
              sorumlu: str(w.sorumlu), telefon: str(w.telefon),
              kapasite: str(w.kapasite), tip: str(w.tip),
              durum: strReq(w.durum, 'aktif'), aciklama: str(w.aciklama),
            },
          });
        }
      }

      // --- VEHICLES ---
      if (Array.isArray(S.araclar)) {
        await tx.vehicleFuel.deleteMany();
        await tx.vehicleMaintenance.deleteMany();
        await tx.vehicleDocument.deleteMany();
        await tx.vehicle.deleteMany();

        for (const v of S.araclar) {
          const vehicle = await tx.vehicle.create({
            data: {
              legacyId: legacyId(v.id),
              plaka: strReq(v.plaka), marka: str(v.marka), model: str(v.model),
              yil: intNull(v.yil), tur: str(v.tur), yakit: str(v.yakit),
              kmSayaci: int(v.kmSayaci), durum: strReq(v.durum, 'aktif'),
              sofor: str(v.sofor), departman: str(v.departman),
              sigortaBitis: str(v.sigortaBitis), muayeneBitis: str(v.muayeneBitis),
              kaskoVarMi: bool(v.kaskoVarMi), kasko: str(v.kasko),
              notlar: str(v.notlar),
            },
          });

          if (v.belgeler?.length) {
            for (const d of v.belgeler) {
              await tx.vehicleDocument.create({
                data: {
                  vehicleId: vehicle.id, legacyId: legacyId(d.id),
                  tur: strReq(d.tur), belgeNo: str(d.belgeNo),
                  basTarihi: str(d.basTarihi), bitTarihi: str(d.bitTarihi),
                  dosyaUrl: str(d.dosyaUrl), hatirlatma: bool(d.hatirlatma, true),
                  notlar: str(d.notlar),
                },
              });
            }
          }

          if (v.bakimlar?.length) {
            for (const b of v.bakimlar) {
              await tx.vehicleMaintenance.create({
                data: {
                  vehicleId: vehicle.id, legacyId: legacyId(b.id),
                  tarih: strReq(b.tarih), tur: strReq(b.tur),
                  aciklama: str(b.aciklama), km: int(b.km),
                  maliyet: num(b.maliyet), servis: str(b.servis),
                  durum: strReq(b.durum, 'tamamlandi'),
                  sonrakiKm: intNull(b.sonrakiKm), sonrakiTarih: str(b.sonrakiTarih),
                },
              });
            }
          }

          if (v.yakitlar?.length) {
            for (const y of v.yakitlar) {
              await tx.vehicleFuel.create({
                data: {
                  vehicleId: vehicle.id, legacyId: legacyId(y.id),
                  tarih: strReq(y.tarih), litre: num(y.litre),
                  tutar: num(y.tutar), km: int(y.km),
                  istasyon: str(y.istasyon), yakitTuru: str(y.yakitTuru),
                  notlar: str(y.notlar),
                },
              });
            }
          }
        }
      }

      // --- ASSET ASSIGNMENTS ---
      if (Array.isArray(S.zimmetler)) {
        await tx.assetAssignment.deleteMany();
        for (const z of S.zimmetler) {
          await tx.assetAssignment.create({
            data: {
              legacyId: legacyId(z.id),
              malzemeAdi: strReq(z.malzemeAdi), malzemeId: str(z.malzemeId),
              zimmetliKisi: strReq(z.zimmetliKisi),
              departman: str(z.departman), tarih: str(z.tarih),
              durum: strReq(z.durum, 'aktif'), notlar: str(z.notlar),
              belgeNo: str(z.belgeNo), seriNo: str(z.seriNo),
              birimDeger: num(z.birimDeger), tcKimlikNo: str(z.tcKimlikNo),
              gorevi: str(z.gorevi), iseGirisTarihi: str(z.iseGirisTarihi),
            },
          });
        }
      }

      // --- EMPLOYEES ---
      if (Array.isArray(S.personeller)) {
        await tx.employeeDocument.deleteMany();
        await tx.employeeLeave.deleteMany();
        await tx.employee.deleteMany();
        for (const e of S.personeller) {
          await tx.employee.create({
            data: {
              legacyId: legacyId(e.id),
              userId: str(e.userId),
              ad: strReq(e.ad), soyad: strReq(e.soyad),
              tcKimlikNo: str(e.tcKimlikNo), dogumTarihi: str(e.dogumTarihi),
              cinsiyet: str(e.cinsiyet), medeniDurum: str(e.medeniDurum),
              telefonKisisel: str(e.telefonKisisel), telefonIs: str(e.telefonIs),
              emailKisisel: str(e.emailKisisel), emailIs: str(e.emailIs),
              adres: str(e.adres), sehir: str(e.sehir),
              egitimDurumu: str(e.egitimDurumu), okulAdi: str(e.okulAdi), bolum: str(e.bolum),
              departmanId: str(e.departmanId), gorevi: str(e.gorevi),
              iseGirisTarihi: str(e.iseGirisTarihi), istenCikisTarihi: str(e.istenCikisTarihi),
              cikisSebebi: str(e.cikisSebebi), sgkNo: str(e.sgkNo),
              kanGrubu: str(e.kanGrubu), acilDurumKisi: str(e.acilDurumKisi),
              acilDurumTel: str(e.acilDurumTel), maas: num(e.maas),
              calismaTipi: strReq(e.calismaTipi, 'tam_zamanli'),
              durum: strReq(e.durum, 'aktif'),
              notlar: str(e.notlar), profilResmi: str(e.profilResmi),
            },
          });
        }
      }

      // --- DEPARTMENTS ---
      if (Array.isArray(S.departmanlar)) {
        await tx.department.deleteMany();
        for (const d of S.departmanlar) {
          await tx.department.create({
            data: {
              legacyId: legacyId(d.id),
              ad: strReq(d.ad), kod: str(d.kod),
              yoneticiId: str(d.yoneticiId), aciklama: str(d.aciklama),
              aktif: bool(d.aktif, true),
            },
          });
        }
      }

      // --- USER CUSTOM MODULES ---
      // S.users ID'leri integer (legacy), DB UUID kullanıyor — email ile eşleştir
      if (Array.isArray(S.users)) {
        for (const u of S.users) {
          if (!u.email) continue;
          await tx.user.updateMany({
            where: { email: String(u.email) },
            data: { customModules: u.customModules ?? null },
          });
        }
      }

      // --- EMPLOYEE LEAVES ---
      if (Array.isArray(S.izinler)) {
        // Only delete/recreate if employees weren't already handled above
        if (!Array.isArray(S.personeller)) {
          await tx.employeeLeave.deleteMany();
        }
        for (const l of S.izinler) {
          const empId = strReq(l.employeeId);
          if (!empId) continue; // skip if no employee reference
          // Check if employee exists
          const emp = await tx.employee.findFirst({ where: { id: empId } });
          if (!emp) continue;
          await tx.employeeLeave.create({
            data: {
              legacyId: legacyId(l.id),
              employeeId: empId,
              izinTuru: strReq(l.izinTuru, 'yillik'),
              basTarihi: strReq(l.basTarihi), bitTarihi: strReq(l.bitTarihi),
              gunSayisi: num(l.gunSayisi), durum: strReq(l.durum, 'beklemede'),
              onaylayanId: str(l.onaylayanId), aciklama: str(l.aciklama),
            },
          });
        }
      }

      // --- EMPLOYEE DOCUMENTS ---
      if (Array.isArray(S.personelBelgeler)) {
        if (!Array.isArray(S.personeller)) {
          await tx.employeeDocument.deleteMany();
        }
        for (const d of S.personelBelgeler) {
          const empId = strReq(d.employeeId);
          if (!empId) continue;
          const emp = await tx.employee.findFirst({ where: { id: empId } });
          if (!emp) continue;
          await tx.employeeDocument.create({
            data: {
              legacyId: legacyId(d.id),
              employeeId: empId,
              tur: strReq(d.tur, 'diger'), baslik: strReq(d.baslik),
              dosyaUrl: str(d.dosyaUrl), gecerlilikTarihi: str(d.gecerlilikTarihi),
              notlar: str(d.notlar),
            },
          });
        }
      }
    }, { timeout: 60000 }); // 60 second timeout for large data

    return successResponse(null, 'Veriler basariyla kaydedildi');
  } catch (error) {
    console.error('State PUT error:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Veri kaydetme hatasi: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata') } },
      { status: 500 }
    );
  }
}
