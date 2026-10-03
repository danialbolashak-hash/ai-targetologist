import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Targetologist — Автоматизация таргетированной рекламы",
  description:
    "AI-платформа, которая полностью автоматизирует вашу рекламу. Анализирует рынок, создаёт офферы, генерирует креативы и запускает рекламу автоматически.",
  keywords: "таргетированная реклама, AI маркетинг, автоматизация рекламы, Facebook Ads, TikTok Ads",
  openGraph: {
    title: "AI Targetologist",
    description: "Ваш персональный AI-маркетолог. Полная автоматизация таргетированной рекламы.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0A0A0F] antialiased">{children}</body>
    </html>
  );
}
