import type { Metadata, Viewport } from "next";
import { Cinzel, Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const notoSans = Noto_Sans_SC({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const notoSerif = Noto_Serif_SC({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "星语秘境 Astral Oracle · AI 塔罗与神秘学占卜",
    template: "%s · 星语秘境 Astral Oracle",
  },
  description:
    "在星空与牌面之间,聆听你早已知晓的答案。AI 塔罗占卜、每日一牌、星座运势、解梦与关系指引,仅供娱乐与自我探索。",
  keywords: ["塔罗", "占卜", "AI 塔罗", "星座运势", "解梦", "每日一牌"],
  openGraph: {
    title: "星语秘境 Astral Oracle",
    description: "AI 塔罗占卜、每日运势、星座与解梦。答案藏在你已知晓的心中。",
    type: "website",
    locale: "zh_CN",
    siteName: "星语秘境 Astral Oracle",
  },
  twitter: {
    card: "summary_large_image",
    title: "星语秘境 Astral Oracle",
    description: "AI 塔罗占卜、每日运势、星座与解梦。",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#070812",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${notoSans.variable} ${notoSerif.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
