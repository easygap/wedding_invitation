import { Noto_Serif_KR, Noto_Sans_KR, Great_Vibes, Inter } from "next/font/google";
import "./globals.css";

const serifKR = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const sansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-cursive",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "우리 결혼합니다 💍 준수 & 윤겸",
  description: "소중한 분들을 초대합니다. 저희 두 사람의 새로운 시작에 함께해 주세요.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2C1810",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={`${serifKR.variable} ${sansKR.variable} ${greatVibes.variable} ${inter.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
