import { notFound } from "next/navigation";
import { getAdminUserById } from "@/lib/data";
import AdminUserEditForm from "./AdminUserEditForm";

export default async function EditAdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAdminUserById(id);
  if (!user) notFound();

  return <AdminUserEditForm user={user} />;
}
