import { getCompanies, getMyMatchKeywords } from "@/lib/data";
import MatchStudio, { type StudioCompany } from "./MatchStudio";

export const metadata = {
  title: "키워드 중간매칭 — 원하는 자리를 키워드로",
};

export default async function MatchPage() {
  const companies = await getCompanies();
  const saved = await getMyMatchKeywords();

  const studioCompanies: StudioCompany[] = companies.map((c) => ({
    id: c.id,
    name: c.name,
    region: c.region,
    intro: c.intro,
    industry: c.industry,
    hashtags: c.hashtags,
  }));

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-xs font-semibold text-indigo mb-3 tracking-widest">STEP · 중간매칭</p>
      <h1 className="hail text-3xl sm:text-4xl mb-2">원하는 자리를, 키워드로.</h1>
      <p className="text-sm text-muted mb-9 max-w-2xl">
        긴 서류를 다 읽지 않아도 됩니다. 원하는 내용을 넣으면 <b className="text-ink">키워드·해시태그</b>로 정리해
        드리고, 그 키워드로 <b className="text-ink">회사와 실시간 매칭</b>합니다.
      </p>

      <MatchStudio companies={studioCompanies} initialKeywords={saved} />
    </div>
  );
}
