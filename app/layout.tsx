import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "FaOnSisT - Entegre İş Yönetim Platformu",
  description: "İşletmenizi tek platformdan yönetin. İletişim, ERP, CRM ve Stok yönetimi.",
  keywords: ["ERP", "CRM", "İş Yönetimi", "Proje Yönetimi", "Stok Yönetimi"],
  authors: [{ name: "ASM Group" }],
  creator: "ASM Group",
  publisher: "ASM Group",
  metadataBase: new URL("https://faonsist.com"),
  openGraph: {
    title: "FaOnSisT - Entegre İş Yönetim Platformu",
    description: "İşletmenizi tek platformdan yönetin",
    type: "website",
    locale: "tr_TR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className={inter.variable}>
        {children}
      </body>
    </html>
  );
}
