import { createFileRoute } from "@tanstack/react-router";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal — Clip N Copy" },
      { name: "description", content: "Clip N Copy Storefront Admin Dashboard & Inventory Management." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <AdminRoute>
      <AdminLayout />
    </AdminRoute>
  );
}
