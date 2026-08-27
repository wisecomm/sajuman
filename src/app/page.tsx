import Link from "next/link";

const features = [
  { href: "/saju", title: "사주팔자", desc: "생년월일시로 나의 사주(년월일시주)와 십신, 오행, 공망을 확인합니다." },
  { href: "/daeun", title: "대운", desc: "10년 단위로 흐르는 대운의 순행/역행과 간지 흐름을 타임라인으로 봅니다." },
  { href: "/gunghap", title: "궁합", desc: "두 사람의 사주를 비교해 오행·십신 궁합을 분석합니다." },
  { href: "/yearly", title: "년도별 운세", desc: "원하는 해의 세운(歲運) 간지와 나의 사주와의 관계를 확인합니다." },
  { href: "/monthly", title: "월운", desc: "절기로 나뉘는 12개월의 흐름을 보고, 이번 달 기운을 확인합니다." },
  { href: "/daily", title: "일일 운세", desc: "오늘 또는 특정 날짜의 일진(日辰)과 나의 사주와의 관계를 봅니다." },
  { href: "/taekil", title: "택일", desc: "결혼·이사·계약 등 목적에 맞는 좋은 날짜를 기간 내에서 찾아줍니다." },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col items-center gap-3 py-8 text-center">
        <h1 className="text-3xl font-bold text-[var(--brand)] sm:text-4xl">사주만세력</h1>
        <p className="max-w-lg text-sm text-foreground/60 sm:text-base">
          정밀 만세력 계산 라이브러리를 기반으로 사주, 궁합, 대운, 년도별·일일 운세, 택일까지
          한곳에서 확인해보세요.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="group rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition-shadow hover:shadow-md"
          >
            <h2 className="mb-1 text-lg font-semibold text-[var(--brand)] group-hover:underline">{f.title}</h2>
            <p className="text-sm text-foreground/60">{f.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
