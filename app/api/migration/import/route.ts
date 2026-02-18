// ============================================
// POST /api/migration/import
// localStorage'dan gelen tam S objesini DB'ye aktar
// Base64 dosyaları decode edip diske kaydet
// Eski ID → yeni UUID mapping döndür
// ============================================

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, unauthorizedResponse, forbiddenResponse, successResponse, hashPassword } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

// ---- Helpers ----

/** Base64 data URI → disk dosyası, URL döndür */
async function saveBase64File(
  base64Data: string,
  folder: string,
  filename: string
): Promise<string | null> {
  try {
    if (!base64Data || !base64Data.startsWith('data:')) return null;

    const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) return null;

    const [, mimeType, data] = matches;
    const buffer = Buffer.from(data, 'base64');

    // Dosya uzantısını mime type'dan çıkar
    const extMap: Record<string, string> = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'application/pdf': '.pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
      'text/plain': '.txt',
    };
    const ext = extMap[mimeType] || '.bin';
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_') + ext;

    const dir = path.join(UPLOAD_DIR, folder);
    await mkdir(dir, { recursive: true });

    const filePath = path.join(dir, safeFilename);
    await writeFile(filePath, buffer);

    return `/uploads/${folder}/${safeFilename}`;
  } catch (err) {
    console.error('File save error:', err);
    return null;
  }
}

/** Eski ID mapping tracker */
interface IdMapping {
  projects: Record<number, string>;
  tenders: Record<number, string>;
  sales: Record<number, string>;
  channels: Record<number, string>;
  users: Record<number, string>;
  suppliers: Record<number, string>;
  warehouses: Record<number, string>;
  vehicles: Record<number, string>;
  purchaseRequests: Record<number, string>;
  orders: Record<number, string>;
}

// ---- POST Handler ----
export async function POST(request: NextRequest) {
  try {
    // Admin kontrolü
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();
    if (user.role !== 'admin') {
      return forbiddenResponse('Sadece admin kullanicilar veri aktarimi yapabilir');
    }

    const body = await request.json();
    const S = body.data || body; // { data: S } veya direkt S

    const mapping: IdMapping = {
      projects: {},
      tenders: {},
      sales: {},
      channels: {},
      users: {},
      suppliers: {},
      warehouses: {},
      vehicles: {},
      purchaseRequests: {},
      orders: {},
    };

    const stats = {
      users: 0,
      projects: 0,
      tenders: 0,
      sales: 0,
      channels: 0,
      messages: 0,
      suppliers: 0,
      warehouses: 0,
      inventoryItems: 0,
      vehicles: 0,
      purchaseRequests: 0,
      orders: 0,
      files: 0,
      knowledgeBase: 0,
    };

    await prisma.$transaction(async (tx) => {
      // ============================
      // 1. USERS (varsa import et)
      // ============================
      if (Array.isArray(S.users) && S.users.length > 0) {
        for (const u of S.users) {
          // Mevcut email varsa atla
          const existing = await tx.user.findUnique({ where: { email: u.email || '' } });
          if (existing) {
            if (typeof u.id === 'number') mapping.users[u.id] = existing.id;
            continue;
          }

          const newUser = await tx.user.create({
            data: {
              name: u.name || 'Kullanici',
              phone: u.phone || null,
              email: u.email || `user_${Date.now()}@faonsist.com`,
              password: u.password ? await hashPassword(u.password) : await hashPassword('1234'),
              role: u.role || 'viewer',
              permissions: u.perms || null,
              active: u.active !== false,
              department: u.department || null,
            },
          });
          if (typeof u.id === 'number') mapping.users[u.id] = newUser.id;
          stats.users++;
        }
      }

      // ============================
      // 2. PROJECTS + sub-entities
      // ============================
      if (Array.isArray(S.projects)) {
        for (const p of S.projects) {
          const project = await tx.project.create({
            data: {
              legacyId: typeof p.id === 'number' ? p.id : null,
              ad: p.ad || '',
              kod: p.kod || null,
              konum: p.konum || null,
              basTarihi: p.basTarihi || null,
              bitTarihi: p.bitTarihi || null,
              butce: p.butce || 0,
              harcanan: p.harcanan || 0,
              durum: p.durum || 'devam',
              ilerleme: p.ilerleme || 0,
              isverenAdi: p.isverenAdi || null,
              isverenTel: p.isverenTel || null,
              isverenEposta: p.isverenEposta || null,
              mudurAdi: p.mudurAdi || null,
              mudurTel: p.mudurTel || null,
              aciklama: p.aciklama || null,
            },
          });
          if (typeof p.id === 'number') mapping.projects[p.id] = project.id;
          stats.projects++;

          // Subcontractors
          if (p.tapinanlar?.length) {
            for (const s of p.tapinanlar) {
              await tx.subcontractor.create({
                data: {
                  projectId: project.id,
                  legacyId: typeof s.id === 'number' ? s.id : null,
                  firma: s.firma || '', isKalemi: s.isKalemi,
                  sozlesmeNo: s.sozlesmeNo, tutar: s.tutar || 0,
                  odenen: s.odenen || 0, durum: s.durum || 'aktif',
                  basTarihi: s.basTarihi, bitTarihi: s.bitTarihi,
                  iletisim: s.iletisim, telefon: s.telefon, notlar: s.notlar,
                },
              });
            }
          }

          // Work Items
          if (p.isKalemleri?.length) {
            for (const w of p.isKalemleri) {
              await tx.workItem.create({
                data: {
                  projectId: project.id,
                  legacyId: typeof w.id === 'number' ? w.id : null,
                  pozNo: w.pozNo, tanim: w.tanim || '',
                  birim: w.birim, miktar: w.miktar || 0,
                  birimFiyat: w.birimFiyat || 0, toplamTutar: w.toplamTutar || 0,
                  yapilan: w.yapilan || 0, kategori: w.kategori,
                },
              });
            }
          }

          // Progress Claims
          if (p.hakedisler?.length) {
            for (const h of p.hakedisler) {
              await tx.progressClaim.create({
                data: {
                  projectId: project.id,
                  legacyId: typeof h.id === 'number' ? h.id : null,
                  no: h.no || 0, donem: h.donem,
                  tutar: h.tutar || 0, kesinti: h.kesinti || 0,
                  netTutar: h.netTutar || 0, durum: h.durum || 'hazirlaniyor',
                  tarih: h.tarih, aciklama: h.aciklama,
                },
              });
            }
          }

          // Daily Logs
          if (p.gunlukRaporlar?.length) {
            for (const d of p.gunlukRaporlar) {
              await tx.dailyLog.create({
                data: {
                  projectId: project.id,
                  legacyId: typeof d.id === 'number' ? d.id : null,
                  tarih: d.tarih || '', havaDurumu: d.havaDurumu,
                  sicaklik: d.sicaklik, personelSayisi: d.personelSayisi || 0,
                  ekipmanlar: d.ekipmanlar, yapilanIsler: d.yapilanIsler,
                  sorunlar: d.sorunlar, notlar: d.notlar,
                },
              });
            }
          }

          // Green Book
          if (p.yesilDefter?.length) {
            for (const g of p.yesilDefter) {
              await tx.greenBookEntry.create({
                data: {
                  projectId: project.id,
                  legacyId: typeof g.id === 'number' ? g.id : null,
                  tarih: g.tarih, aciklama: g.aciklama || '',
                  miktar: g.miktar || 0, birim: g.birim,
                  birimFiyat: g.birimFiyat || 0, toplamTutar: g.toplamTutar || 0,
                  onayDurumu: g.onayDurumu || 'beklemede',
                },
              });
            }
          }

          // Contracts
          if (p.sozlesmeler?.length) {
            for (const c of p.sozlesmeler) {
              await tx.contract.create({
                data: {
                  projectId: project.id,
                  legacyId: typeof c.id === 'number' ? c.id : null,
                  baslik: c.baslik || '', tur: c.tur,
                  taraflar: c.taraflar, tutar: c.tutar || 0,
                  basTarihi: c.basTarihi, bitTarihi: c.bitTarihi,
                  durum: c.durum || 'aktif', dosyaUrl: c.dosyaUrl, aciklama: c.aciklama,
                },
              });
            }
          }

          // Materials
          if (p.malzemeler?.length) {
            for (const m of p.malzemeler) {
              await tx.projectMaterial.create({
                data: {
                  projectId: project.id,
                  legacyId: typeof m.id === 'number' ? m.id : null,
                  malzemeAdi: m.malzemeAdi || '', birim: m.birim,
                  miktar: m.miktar || 0, birimFiyat: m.birimFiyat || 0,
                  toplamTutar: m.toplamTutar || 0, tedarikci: m.tedarikci,
                  durum: m.durum || 'beklemede',
                  siparisTarihi: m.siparisTarihi, teslimTarihi: m.teslimTarihi,
                },
              });
            }
          }

          // Cash Flows
          if (p.nakitAkisi?.length) {
            for (const n of p.nakitAkisi) {
              await tx.cashFlow.create({
                data: {
                  projectId: project.id,
                  legacyId: typeof n.id === 'number' ? n.id : null,
                  tarih: n.tarih || '', aciklama: n.aciklama || '',
                  tur: n.tur || 'gider', kategori: n.kategori,
                  tutar: n.tutar || 0, durum: n.durum || 'planlanan',
                },
              });
            }
          }

          // Safety Records
          if (p.isg?.length) {
            for (const s of p.isg) {
              await tx.safetyRecord.create({
                data: {
                  projectId: project.id,
                  legacyId: typeof s.id === 'number' ? s.id : null,
                  tarih: s.tarih || '', tur: s.tur || '',
                  aciklama: s.aciklama || '', oncelik: s.oncelik || 'normal',
                  durum: s.durum || 'acik', sorumlu: s.sorumlu, ekNot: s.ekNot,
                },
              });
            }
          }

          // Quality Records
          if (p.kaliteKontrol?.length) {
            for (const q of p.kaliteKontrol) {
              await tx.qualityRecord.create({
                data: {
                  projectId: project.id,
                  legacyId: typeof q.id === 'number' ? q.id : null,
                  tarih: q.tarih || '', tur: q.tur || '',
                  aciklama: q.aciklama || '', sonuc: q.sonuc || 'beklemede',
                  sorumlu: q.sorumlu, ekNot: q.ekNot,
                },
              });
            }
          }

          // Correspondence (dosyaları kaydet)
          if (p.yazisMalar?.length) {
            for (const y of p.yazisMalar) {
              let dosyaUrl = y.dosyaUrl || null;
              // Base64 dosyayı diske kaydet
              if (dosyaUrl && dosyaUrl.startsWith('data:')) {
                const savedUrl = await saveBase64File(
                  dosyaUrl,
                  'correspondence',
                  `prj_${project.id}_yaz_${y.id || Date.now()}`
                );
                if (savedUrl) {
                  dosyaUrl = savedUrl;
                  stats.files++;
                }
              }
              await tx.correspondence.create({
                data: {
                  projectId: project.id,
                  legacyId: typeof y.id === 'number' ? y.id : null,
                  tarih: y.tarih || '', tur: y.tur || '',
                  gonderenAlici: y.gonderenAlici, konu: y.konu || '',
                  icerik: y.icerik, dosyaUrl,
                  dosyaAdi: y.dosyaAdi, referansNo: y.referansNo,
                },
              });
            }
          }

          // Schedule Items
          if (p.isProgrami?.length) {
            for (const s of p.isProgrami) {
              await tx.scheduleItem.create({
                data: {
                  projectId: project.id,
                  legacyId: typeof s.id === 'number' ? s.id : null,
                  isAdi: s.isAdi || '', basTarihi: s.basTarihi,
                  bitTarihi: s.bitTarihi, sure: s.sure || 0,
                  ilerleme: s.ilerleme || 0, sorumlu: s.sorumlu,
                  bagimlilik: s.bagimlilik, durum: s.durum || 'planlanmis',
                },
              });
            }
          }

          // Equipment
          if (p.ekipmanlar?.length) {
            for (const e of p.ekipmanlar) {
              await tx.projectEquipment.create({
                data: {
                  projectId: project.id,
                  legacyId: typeof e.id === 'number' ? e.id : null,
                  ekipmanAdi: e.ekipmanAdi || '', tur: e.tur,
                  plaka: e.plaka, durum: e.durum || 'aktif',
                  gunlukUcret: e.gunlukUcret || 0, operatorAdi: e.operatorAdi,
                },
              });
            }
          }

          // Tasks
          if (p.gorevler?.length) {
            for (const t of p.gorevler) {
              await tx.projectTask.create({
                data: {
                  projectId: project.id,
                  legacyId: typeof t.id === 'number' ? t.id : null,
                  baslik: t.baslik || '', aciklama: t.aciklama,
                  atananKisi: t.atananKisi, oncelik: t.oncelik || 'normal',
                  durum: t.durum || 'yapilacak', sonTarih: t.sonTarih,
                  tamamlanma: t.tamamlanma || 0,
                },
              });
            }
          }

          // Photos (base64 → disk)
          if (p.fotograflar?.length) {
            for (const f of p.fotograflar) {
              let dosyaUrl = f.dosyaUrl || null;
              let thumbnail = f.thumbnail || null;

              if (dosyaUrl && dosyaUrl.startsWith('data:')) {
                const savedUrl = await saveBase64File(
                  dosyaUrl,
                  'photos',
                  `prj_${project.id}_foto_${f.id || Date.now()}`
                );
                if (savedUrl) { dosyaUrl = savedUrl; stats.files++; }
              }
              if (thumbnail && thumbnail.startsWith('data:')) {
                const savedThumb = await saveBase64File(
                  thumbnail,
                  'photos/thumbs',
                  `prj_${project.id}_thumb_${f.id || Date.now()}`
                );
                if (savedThumb) thumbnail = savedThumb;
              }

              await tx.projectPhoto.create({
                data: {
                  projectId: project.id,
                  legacyId: typeof f.id === 'number' ? f.id : null,
                  baslik: f.baslik || '', aciklama: f.aciklama,
                  dosyaUrl, thumbnail,
                  tarih: f.tarih, kategori: f.kategori,
                },
              });
            }
          }
        }
      }

      // ============================
      // 3. TENDERS
      // ============================
      if (Array.isArray(S.tenders)) {
        for (const t of S.tenders) {
          const tender = await tx.tender.create({
            data: {
              legacyId: typeof t.id === 'number' ? t.id : null,
              baslik: t.baslik, item: t.item,
              tip: t.tip || 'acik', amount: t.amount || 0,
              toplamTutar: t.toplamTutar || 0,
              supplier: t.supplier, delivery: t.delivery || 0,
              rating: t.rating || 0, status: t.status || 'pending',
              kazananTeklifId: t.kazananTeklifId, komisyonNotu: t.komisyonNotu,
            },
          });
          if (typeof t.id === 'number') mapping.tenders[t.id] = tender.id;
          stats.tenders++;

          if (t.kalemler?.length) {
            for (const k of t.kalemler) {
              await tx.tenderItem.create({
                data: {
                  tenderId: tender.id,
                  kalemAdi: k.kalemAdi || '', miktar: k.miktar || 0,
                  birim: k.birim, aciklama: k.aciklama,
                },
              });
            }
          }

          if (t.teklifler?.length) {
            for (const b of t.teklifler) {
              await tx.tenderBid.create({
                data: {
                  tenderId: tender.id,
                  legacyId: typeof b.id === 'number' ? b.id : null,
                  firma: b.firma || '', yetkili: b.yetkili,
                  telefon: b.telefon, email: b.email,
                  teklifTarihi: b.teklifTarihi, gecerlilikGun: b.gecerlilikGun || 30,
                  toplamFiyat: b.toplamFiyat || 0, teslimatGun: b.teslimatGun || 0,
                  odemeSartlari: b.odemeSartlari, garanti: b.garanti,
                  aciklama: b.aciklama, puan: b.puan || 0,
                  durum: b.durum || 'degerlendirildi',
                  kalemler: b.kalemler || null,
                },
              });
            }
          }

          // Tender-Request Links
          if (t.talepIds?.length) {
            for (const reqId of t.talepIds) {
              const mappedReqId = typeof reqId === 'number' ? mapping.purchaseRequests[reqId] : reqId;
              if (mappedReqId) {
                await tx.tenderRequestLink.create({
                  data: { tenderId: tender.id, requestId: mappedReqId },
                });
              }
            }
          }
        }
      }

      // ============================
      // 4. SALES
      // ============================
      if (Array.isArray(S.sales)) {
        for (const s of S.sales) {
          const sale = await tx.sale.create({
            data: {
              legacyId: typeof s.id === 'number' ? s.id : null,
              customer: s.customer || '', phone: s.phone || null,
              product: s.product || null, price: s.price || 0,
              installments: s.installments || 1, paid: s.paid || 0,
              stage: s.stage || 'lead', status: s.status || 'active',
            },
          });
          if (typeof s.id === 'number') mapping.sales[s.id] = sale.id;
          stats.sales++;
        }
      }

      // ============================
      // 5. SUPPLIERS
      // ============================
      if (Array.isArray(S.tedarikcilerHavuzu)) {
        for (const s of S.tedarikcilerHavuzu) {
          const supplier = await tx.supplier.create({
            data: {
              legacyId: typeof s.id === 'number' ? s.id : null,
              firma: s.firma || '', yetkili: s.yetkili || null,
              telefon: s.telefon || null, email: s.email || null,
              adres: s.adres || null, vergiNo: s.vergiNo || null,
              kategori: s.kategori || null, altKategori: s.altKategori || null,
              puan: s.puan || 0, notlar: s.notlar || null,
              aktif: s.aktif !== false,
            },
          });
          if (typeof s.id === 'number') mapping.suppliers[s.id] = supplier.id;
          stats.suppliers++;
        }
      }

      // ============================
      // 6. PURCHASE REQUESTS
      // ============================
      if (Array.isArray(S.satinalmaTalepleri)) {
        for (const pr of S.satinalmaTalepleri) {
          const req = await tx.purchaseRequest.create({
            data: {
              legacyId: typeof pr.id === 'number' ? pr.id : null,
              talepNo: pr.talepNo, baslik: pr.baslik || '',
              aciklama: pr.aciklama, taleptEden: pr.taleptEden,
              departman: pr.departman, oncelik: pr.oncelik || 'normal',
              durum: pr.durum || 'beklemede', tapinanTutar: pr.tapinanTutar || 0,
              onaylayanId: pr.onaylayanId, onayTarihi: pr.onayTarihi,
              redNedeni: pr.redNedeni,
            },
          });
          if (typeof pr.id === 'number') mapping.purchaseRequests[pr.id] = req.id;
          stats.purchaseRequests++;

          if (pr.kalemler?.length) {
            for (const k of pr.kalemler) {
              await tx.purchaseRequestItem.create({
                data: {
                  requestId: req.id,
                  malzemeAdi: k.malzemeAdi || '', miktar: k.miktar || 0,
                  birim: k.birim, tapinanFiyat: k.tapinanFiyat || 0,
                  aciklama: k.aciklama,
                },
              });
            }
          }
        }
      }

      // ============================
      // 7. ORDERS + Deliveries
      // ============================
      if (Array.isArray(S.orders)) {
        for (const o of S.orders) {
          const order = await tx.order.create({
            data: {
              legacyId: typeof o.id === 'number' ? o.id : null,
              siparisNo: o.siparisNo, tedarikci: o.tedarikci || '',
              kalemler: o.kalemler || null, toplamTutar: o.toplamTutar || 0,
              durum: o.durum || 'olusturuldu', siparisTarihi: o.siparisTarihi,
              beklenenTarih: o.beklenenTarih, odemeDurumu: o.odemeDurumu || 'odenmedi',
              notlar: o.notlar, ihaleId: o.ihaleId,
            },
          });
          if (typeof o.id === 'number') mapping.orders[o.id] = order.id;
          stats.orders++;

          if (o.teslimatlar?.length) {
            for (const d of o.teslimatlar) {
              await tx.delivery.create({
                data: {
                  orderId: order.id,
                  legacyId: typeof d.id === 'number' ? d.id : null,
                  teslimTarihi: d.teslimTarihi || '',
                  teslimAlan: d.teslimAlan, kalemler: d.kalemler || null,
                  notlar: d.notlar, belgeler: d.belgeler || null,
                },
              });
            }
          }
        }
      }

      // ============================
      // 8. CHANNELS + Messages + Files
      // ============================
      if (Array.isArray(S.channels)) {
        for (const ch of S.channels) {
          const channel = await tx.channel.create({
            data: {
              legacyId: typeof ch.id === 'number' ? ch.id : null,
              name: ch.name || 'Kanal',
              type: ch.type || 'group',
            },
          });
          if (typeof ch.id === 'number') mapping.channels[ch.id] = channel.id;
          stats.channels++;

          // Members
          if (ch.memberList?.length) {
            for (const memberName of ch.memberList) {
              // Üye isminden user bul
              const memberUser = await tx.user.findFirst({
                where: { name: { contains: memberName } },
                select: { id: true },
              });
              if (memberUser) {
                await tx.channelMember.create({
                  data: { channelId: channel.id, userId: memberUser.id },
                });
              }
            }
          }

          // Messages
          const chKey = typeof ch.id === 'number' ? ch.id : ch.id;
          const msgs = S.messages?.[chKey] || S.messages?.[ch.name?.toLowerCase()];
          if (Array.isArray(msgs)) {
            for (const m of msgs) {
              // Mesaj sahibini bul
              const msgUser = await tx.user.findFirst({
                where: { name: { contains: m.user || '' } },
                select: { id: true },
              });

              await tx.message.create({
                data: {
                  channelId: channel.id,
                  legacyId: typeof m.id === 'number' ? m.id : null,
                  userId: msgUser?.id || user.id,
                  text: m.text || '',
                  time: m.time || null,
                },
              });
              stats.messages++;
            }
          }

          // Channel Files
          const chFiles = S.connFiles?.[chKey] || S.connFiles?.[ch.name?.toLowerCase()];
          if (Array.isArray(chFiles)) {
            for (const f of chFiles) {
              await tx.channelFile.create({
                data: {
                  channelId: channel.id,
                  legacyId: typeof f.id === 'number' ? f.id : null,
                  name: f.name || 'dosya',
                  type: f.type || 'document',
                  size: f.size || '0 KB',
                  desc: f.desc || null,
                  uploadedBy: f.uploadedBy || user.name,
                  uploadedAt: f.uploadedAt || null,
                },
              });
            }
          }
        }
      }

      // ============================
      // 9. WAREHOUSES + Inventory
      // ============================
      if (Array.isArray(S.depolar)) {
        for (const w of S.depolar) {
          const wh = await tx.warehouse.create({
            data: {
              legacyId: typeof w.id === 'number' ? w.id : null,
              ad: w.ad || '', konum: w.konum,
              sorumlu: w.sorumlu, telefon: w.telefon,
              kapasite: w.kapasite, tip: w.tip,
              durum: w.durum || 'aktif', aciklama: w.aciklama,
            },
          });
          if (typeof w.id === 'number') mapping.warehouses[w.id] = wh.id;
          stats.warehouses++;
        }
      }

      if (Array.isArray(S.envanter)) {
        for (const i of S.envanter) {
          // Depo mapping
          const warehouseId = typeof i.depoId === 'number'
            ? mapping.warehouses[i.depoId]
            : i.depoId;

          if (!warehouseId) continue; // Depo bulunamadıysa atla

          await tx.inventoryItem.create({
            data: {
              warehouseId,
              legacyId: typeof i.id === 'number' ? i.id : null,
              ad: i.ad || '', kod: i.kod || null,
              kategori: i.kategori || null, birim: i.birim || null,
              miktar: i.miktar || 0, minStok: i.minStok || 0,
              maxStok: i.maxStok || 0, birimFiyat: i.birimFiyat || 0,
              konum: i.konum || null, barkod: i.barkod || null,
              durum: i.durum || 'aktif', sonSayimTarihi: i.sonSayimTarihi || null,
            },
          });
          stats.inventoryItems++;
        }
      }

      // Warehouse Movements
      if (Array.isArray(S.depoHareketler)) {
        for (const m of S.depoHareketler) {
          const warehouseId = typeof m.depoId === 'number'
            ? mapping.warehouses[m.depoId]
            : m.depoId;
          if (!warehouseId) continue;

          await tx.warehouseMovement.create({
            data: {
              warehouseId,
              legacyId: typeof m.id === 'number' ? m.id : null,
              tur: m.tur || 'giris', malzemeAdi: m.malzemeAdi || '',
              malzemeId: m.malzemeId || null, miktar: m.miktar || 0,
              birim: m.birim || null, aciklama: m.aciklama || null,
              islemYapan: m.islemYapan || null,
              hedefDepo: m.hedefDepo || null, kaynakDepo: m.kaynakDepo || null,
              tarih: m.tarih || null,
            },
          });
        }
      }

      // Warehouse Counts
      if (Array.isArray(S.sayimlar)) {
        for (const c of S.sayimlar) {
          const warehouseId = typeof c.depoId === 'number'
            ? mapping.warehouses[c.depoId]
            : c.depoId;
          if (!warehouseId) continue;

          await tx.warehouseCount.create({
            data: {
              warehouseId,
              legacyId: typeof c.id === 'number' ? c.id : null,
              tarih: c.tarih || '', sayimNo: c.sayimNo || null,
              durum: c.durum || 'tamamlandi', kalemler: c.kalemler || null,
              sayimYapan: c.sayimYapan || null, notlar: c.notlar || null,
            },
          });
        }
      }

      // Asset Assignments
      if (Array.isArray(S.zimmetler)) {
        for (const z of S.zimmetler) {
          await tx.assetAssignment.create({
            data: {
              legacyId: typeof z.id === 'number' ? z.id : null,
              malzemeAdi: z.malzemeAdi || '', malzemeId: z.malzemeId,
              zimmetliKisi: z.zimmetliKisi || '',
              departman: z.departman, tarih: z.tarih,
              durum: z.durum || 'aktif', notlar: z.notlar,
            },
          });
        }
      }

      // ============================
      // 10. VEHICLES
      // ============================
      if (Array.isArray(S.araclar)) {
        for (const v of S.araclar) {
          const vehicle = await tx.vehicle.create({
            data: {
              legacyId: typeof v.id === 'number' ? v.id : null,
              plaka: v.plaka || '', marka: v.marka, model: v.model,
              yil: v.yil, tur: v.tur, yakit: v.yakit,
              kmSayaci: v.kmSayaci || 0, durum: v.durum || 'aktif',
              sofor: v.sofor, departman: v.departman,
              sigortaBitis: v.sigortaBitis, muayeneBitis: v.muayeneBitis,
              kaskoVarMi: v.kaskoVarMi || false, kasko: v.kasko,
              notlar: v.notlar,
            },
          });
          if (typeof v.id === 'number') mapping.vehicles[v.id] = vehicle.id;
          stats.vehicles++;

          // Vehicle Documents (dosyaları kaydet)
          if (v.belgeler?.length) {
            for (const d of v.belgeler) {
              let dosyaUrl = d.dosyaUrl || null;
              if (dosyaUrl && dosyaUrl.startsWith('data:')) {
                const savedUrl = await saveBase64File(
                  dosyaUrl,
                  'vehicles',
                  `veh_${vehicle.id}_doc_${d.id || Date.now()}`
                );
                if (savedUrl) { dosyaUrl = savedUrl; stats.files++; }
              }
              await tx.vehicleDocument.create({
                data: {
                  vehicleId: vehicle.id,
                  legacyId: typeof d.id === 'number' ? d.id : null,
                  tur: d.tur || '', belgeNo: d.belgeNo,
                  basTarihi: d.basTarihi, bitTarihi: d.bitTarihi,
                  dosyaUrl, hatirlatma: d.hatirlatma !== false,
                  notlar: d.notlar,
                },
              });
            }
          }

          // Maintenance
          if (v.bakimlar?.length) {
            for (const b of v.bakimlar) {
              await tx.vehicleMaintenance.create({
                data: {
                  vehicleId: vehicle.id,
                  legacyId: typeof b.id === 'number' ? b.id : null,
                  tarih: b.tarih || '', tur: b.tur || '',
                  aciklama: b.aciklama, km: b.km || 0,
                  maliyet: b.maliyet || 0, servis: b.servis,
                  durum: b.durum || 'tamamlandi',
                  sonrakiKm: b.sonrakiKm, sonrakiTarih: b.sonrakiTarih,
                },
              });
            }
          }

          // Fuel
          if (v.yakitlar?.length) {
            for (const y of v.yakitlar) {
              await tx.vehicleFuel.create({
                data: {
                  vehicleId: vehicle.id,
                  legacyId: typeof y.id === 'number' ? y.id : null,
                  tarih: y.tarih || '', litre: y.litre || 0,
                  tutar: y.tutar || 0, km: y.km || 0,
                  istasyon: y.istasyon, yakitTuru: y.yakitTuru,
                  notlar: y.notlar,
                },
              });
            }
          }
        }
      }

      // ============================
      // 11. KNOWLEDGE BASE
      // ============================
      if (Array.isArray(S.knowledgeBase)) {
        for (const k of S.knowledgeBase) {
          await tx.knowledgeBaseItem.create({
            data: {
              legacyId: typeof k.id === 'number' ? k.id : null,
              title: k.title || '', category: k.category || null,
              fileType: k.fileType || null, desc: k.desc || null,
              addedBy: k.addedBy || null, addedAt: k.addedAt || null,
              source: k.source || null,
            },
          });
          stats.knowledgeBase++;
        }
      }

      // ============================
      // 12. WAREHOUSE CATEGORIES
      // ============================
      if (Array.isArray(S.depoKategoriler)) {
        await tx.warehouseCategory.deleteMany();
        for (const c of S.depoKategoriler) {
          await tx.warehouseCategory.create({
            data: { key: c.key, ad: c.ad, renk: c.renk || null },
          });
        }
      }

      // ============================
      // 13. NOTIFICATION SETTINGS
      // ============================
      if (S.bildirimAyarlar) {
        await tx.notificationSettings.upsert({
          where: { userId: user.id },
          update: { settings: S.bildirimAyarlar },
          create: { userId: user.id, settings: S.bildirimAyarlar },
        });
      }

      // ============================
      // 14. ACTIVITIES LOG
      // ============================
      await tx.activity.create({
        data: {
          action: 'migration_import',
          detail: `Veri aktarimi tamamlandi: ${stats.projects} proje, ${stats.tenders} ihale, ${stats.sales} satis, ${stats.channels} kanal`,
          entityType: 'system',
          userId: user.id,
        },
      });

    }, { timeout: 120000 }); // 2 dakika timeout (büyük veri için)

    return successResponse(
      { mapping, stats },
      `Veri aktarimi basariyla tamamlandi: ${stats.projects} proje, ${stats.tenders} ihale, ${stats.sales} satis, ${stats.channels} kanal, ${stats.files} dosya`
    );
  } catch (error) {
    console.error('Migration import error:', error);
    return Response.json(
      {
        success: false,
        error: {
          code: 'MIGRATION_ERROR',
          message: 'Veri aktarimi hatasi: ' + (error instanceof Error ? error.message : String(error)),
        },
      },
      { status: 500 }
    );
  }
}
