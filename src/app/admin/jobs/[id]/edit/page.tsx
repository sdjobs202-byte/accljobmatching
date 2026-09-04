import { notFound } from "next/navigation";
import { getJobById, getCompanyById } from "@/lib/data";
import AdminJobEditForm from "./AdminJobEditForm";

export default async function EditAdminJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJobById(id);
  if (!job) notFound();
  const company = await getCompanyById(job.companyId);

  return <AdminJobEditForm job={job} companyName={company?.name ?? "(알 수 없음)"} />;
}
