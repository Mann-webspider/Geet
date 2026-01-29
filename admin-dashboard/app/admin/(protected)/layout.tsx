import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await verifyAdminSession();
  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader email={user.email} />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
