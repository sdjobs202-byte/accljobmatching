import { getCompanies } from "@/lib/data";
import AdminJobForm from "./AdminJobForm";

export default async function AdminNewJobPage() {
  const companies = await getCompanies();
  return <AdminJobForm companies={companies.map((c) => ({ id: c.id, name: c.name }))} />;
}
