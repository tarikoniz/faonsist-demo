// ============================================
// FaOnSisT - Notification Email Templates
// Turkce, FaOnSisT markali email sablonlari
// ============================================

const turColors: Record<string, string> = {
  bilgi: '#3b82f6',
  uyari: '#f59e0b',
  kritik: '#ef4444',
  acil: '#dc2626',
};

const turLabels: Record<string, string> = {
  bilgi: 'Bilgi',
  uyari: 'Uyari',
  kritik: 'Kritik',
  acil: 'Acil',
};

export function renderNotificationEmail(
  baslik: string,
  mesaj: string,
  tur: string,
  link?: string
): string {
  const color = turColors[tur] || '#3b82f6';
  const label = turLabels[tur] || 'Bildirim';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const linkUrl = link ? `${appUrl}${link}` : appUrl + '/app';

  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <div style="background:#1e293b;border-radius:12px;overflow:hidden;border:1px solid #334155">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#0a0e1a 0%,#1e293b 100%);padding:24px;text-align:center">
        <h1 style="color:#3b82f6;font-size:24px;margin:0">FaOnSisT</h1>
        <p style="color:#94a3b8;font-size:12px;margin:4px 0 0">Insaat Yonetim Platformu</p>
      </div>
      <!-- Badge -->
      <div style="padding:20px 24px 0">
        <span style="display:inline-block;background:${color};color:white;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600">${label}</span>
      </div>
      <!-- Content -->
      <div style="padding:16px 24px">
        <h2 style="color:#e2e8f0;font-size:18px;margin:0 0 12px">${baslik}</h2>
        <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0">${mesaj}</p>
      </div>
      <!-- Button -->
      <div style="padding:16px 24px 24px;text-align:center">
        <a href="${linkUrl}" style="display:inline-block;background:${color};color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Detay Gor</a>
      </div>
      <!-- Footer -->
      <div style="background:#0f172a;padding:16px 24px;text-align:center">
        <p style="color:#475569;font-size:11px;margin:0">Bu email FaOnSisT platformu tarafindan otomatik gonderilmistir.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
