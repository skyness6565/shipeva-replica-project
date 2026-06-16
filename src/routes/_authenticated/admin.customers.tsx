import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listCustomers, upsertCustomer, deleteCustomer } from "@/lib/admin.functions";
import { toast } from "sonner";
import { Search, Trash2, Pencil, Plus, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const qc = useQueryClient();
  const list = useServerFn(listCustomers);
  const upsert = useServerFn(upsertCustomer);
  const del = useServerFn(deleteCustomer);

  const { data, isLoading } = useQuery({
    queryKey: ["customers", search],
    queryFn: () => list({ data: { search } }),
  });
  const save = useMutation({
    mutationFn: (v: any) => upsert({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customers"] }); setEditing(null); toast.success("Saved"); },
    onError: (e: any) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customers"] }); toast.success("Deleted"); },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl md:text-3xl font-extrabold">Customers</h1>
        <button onClick={() => setEditing({ full_name: "", email: "", phone: "", notes: "" })}
          className="inline-flex items-center gap-2 rounded-full bg-hero-gradient px-5 py-2.5 text-sm font-bold text-white">
          <Plus className="h-4 w-4" /> New Customer
        </button>
      </div>

      <div className="rounded-2xl bg-white border border-border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-deep/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email"
            className="h-11 w-full rounded-xl border border-border bg-secondary/40 pl-10 pr-4 text-sm outline-none" />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-brand-deep/60">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={4} className="px-4 py-8 text-center text-brand-deep/50">Loading…</td></tr>}
            {data?.map((c: any) => (
              <tr key={c.id} className="border-t border-border">
                <td className="px-4 py-3 font-semibold">{c.full_name}</td>
                <td className="px-4 py-3 text-brand-deep/70">{c.email ?? "—"}</td>
                <td className="px-4 py-3 text-brand-deep/70">{c.phone ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing(c)} className="p-1.5 text-brand-glow"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => confirm("Delete customer?") && remove.mutate(c.id)} className="p-1.5 text-rose-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {data && data.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-brand-deep/50">No customers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}
            className="w-full max-w-md space-y-3 rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-extrabold text-lg">{editing.id ? "Edit Customer" : "New Customer"}</h3>
              <button type="button" onClick={() => setEditing(null)}><X className="h-5 w-5" /></button>
            </div>
            {[
              ["full_name", "Full Name"], ["email", "Email"], ["phone", "Phone"],
            ].map(([k, l]) => (
              <label key={k} className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-deep/60">{l}</span>
                <input value={editing[k] ?? ""} onChange={(e) => setEditing({ ...editing, [k]: e.target.value })}
                  className="mt-1 h-11 w-full rounded-xl border border-border px-3 text-sm" />
              </label>
            ))}
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-deep/60">Notes</span>
              <textarea value={editing.notes ?? ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                rows={3} className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm" />
            </label>
            <button disabled={save.isPending} className="h-11 w-full rounded-full bg-hero-gradient text-white font-bold">
              Save
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
