import { notFound } from "next/navigation";
import { getJobById, getCompanyById } from "@/lib/data";
import ApplyForm from "./ApplyForm";

export default async function ApplyPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = await getJobById(jobId);
  if (!job) notFound();
  const co = await getCompanyById(job.companyId);

  return (
    <div className="mx-auto max-w-2xl px-5 py-14">
      <p className="text-sm text-muted">{co?.name}</p>
      <h1 className="text-2xl font-bold mt-1 mb-8">{job.title} 지원하기</h1>
      <ApplyForm jobId={jobId} />
    </div>
  );
}
