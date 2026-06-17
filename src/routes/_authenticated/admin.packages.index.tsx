import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listPackages } from "@/lib/admin.functions";
import { Search, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/packages/")({
  component: PackagesList,
});

const STATUS_OPTIONS = ["", "pending", "processing", "in_transit", "arrived", "delivered", "held_by_customs"];
const STATUS_LABEL: Record<string, string> = {
  pending: "Pending", processing: "Processing", in_transit: "In Transit",
  arrived: "Arrived", delivered: "Delivered", held_by_customs: "Held by Customs",
};
const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900",
  processing: "bg-blue-100 text-blue-900",
  in_transit: "bg-indigo-100 text-indigo-900",
  arrived: "bg-teal-100 text-teal-900",
  delivered: "bg-emerald-100 text-emerald-900",
  held_by_customs: "bg-rose-100 text-rose-900",
};

function PackagesList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const fn = useServerFn(listPackages);
  const { data, isLoading } = useQuery({
    queryKey: ["packages", search, status],
    queryFn: () => fn({ data: { search, status } }),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl md:text-3xl font-extrabold text-brand-deep">Packages</h1>
        <Link to="/admin/packages/new" className="inline-flex items-center gap-2 rounded-full bg-hero-gradient px-5 py-2.5 text-sm font-bold text-white">
          <Plus className="h-4 w-4" /> New Package
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white border border-border p-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-deep/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tracking #, name, email"
            className="h-11 w-full rounded-xl border border-border bg-secondary/40 pl-10 pr-4 text-sm outline-none focus:border-brand-glow"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-11 rounded-xl border border-border bg-white px-3 text-sm"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s ? STATUS_LABEL[s] : "All statuses"}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-brand-deep/60">
              <tr>
                <th className="px-4 py-3 text-left">Tracking</th>
                <th className="px-4 py-3 text-left">Package</th>
                <th className="px-4 py-3 text-left">Route</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-brand-deep/50">Loading…</td></tr>
              )}
              {data?.map((p: any) => (
                <tr key={p.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <Link to="/admin/packages/$id" params={{ id: p.id }} className="font-mono font-semibold text-brand-glow hover:underline">
                      {p.tracking_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{p.package_name}</p>
                    <p className="text-xs text-brand-deep/50">{p.sender_name} → {p.receiver_name}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-brand-deep/70">{p.origin_country} → {p.destination_country}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_COLOR[p.status]}`}>
                      {STATUS_LABEL[p.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-brand-deep/50">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {data && data.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-brand-deep/50">No packages found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
