import type { Metadata } from "next";
import { Gowun_Batang, Noto_Sans_KR } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

const gowun = Gowun_Batang({
  variable: "--font-gowun",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const notoKr = Noto_Sans_KR({
  variable: "--font-noto-kr",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "사주만세력 | 사주 · 궁합 · 대운 · 택일",
  description: "만세력 기반 사주팔자, 궁합, 대운, 년도별/일일 운세, 택일을 무료로 확인해보세요.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${gowun.variable} ${notoKr.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-[var(--card-border)] px-4 py-6 text-center text-xs text-foreground/40">
          본 서비스는 오픈소스 만세력 라이브러리를 활용한 참고용 콘텐츠이며, 전문적인 명리 상담을 대체하지 않습니다.
        </footer>
      </body>
    </html>
  );
}
