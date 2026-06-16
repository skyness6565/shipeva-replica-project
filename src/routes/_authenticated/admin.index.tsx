import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { dashboardStats } from "@/lib/admin.functions";
import { Package, Truck, CheckCircle2, Clock, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending", processing: "Processing", in_transit: "In Transit",
  arrived: "Arrived", out_for_delivery: "Out for Delivery",
  delivered: "Delivered", held_by_customs: "Held by Customs",
};

function Dashboard() {
  const fn = useServerFn(dashboardStats);
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fn() });

  const cards = [
    { label: "Total Packages", value: data?.total ?? 0, icon: Package, accent: "bg-indigo-50 text-indigo-700" },
    { label: "Active Shipments", value: data?.active ?? 0, icon: Truck, accent: "bg-blue-50 text-blue-700" },
    { label: "Delivered", value: data?.delivered ?? 0, icon: CheckCircle2, accent: "bg-emerald-50 text-emerald-700" },
    { label: "Pending", value: data?.pending ?? 0, icon: Clock, accent: "bg-amber-50 text-amber-700" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-brand-deep">Dashboard</h1>
          <p className="text-sm text-brand-deep/60">Overview of your shipping operations</p>
        </div>
        <Link to="/admin/packages" className="text-sm font-semibold text-brand-glow hover:underline">
          View all packages →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-white border border-border p-5 shadow-sm">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${c.accent}`}>
              <c.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-xs uppercase tracking-wider text-brand-deep/50">{c.label}</p>
            <p className="mt-1 text-3xl font-display font-extrabold text-brand-deep">
              {isLoading ? "…" : c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-border p-6">
          <h2 className="font-display text-lg font-extrabold">Recent Activity</h2>
          <ul className="mt-4 divide-y divide-border">
            {(data?.recent ?? []).map((e: any) => (
              <li key={e.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {e.packages?.package_name ?? "Package"}{" "}
                    <span className="text-brand-deep/50 font-mono text-xs">
                      {e.packages?.tracking_number}
                    </span>
                  </p>
                  <p className="text-xs text-brand-deep/60 truncate">
                    {STATUS_LABEL[e.status]}{e.location ? ` · ${e.location}` : ""}{e.note ? ` · ${e.note}` : ""}
                  </p>
                </div>
                <p className="text-xs text-brand-deep/40 whitespace-nowrap">
                  {new Date(e.event_time).toLocaleString()}
                </p>
              </li>
            ))}
            {data?.recent?.length === 0 && (
              <li className="py-6 text-center text-sm text-brand-deep/50">No activity yet.</li>
            )}
          </ul>
        </div>
        <div className="rounded-2xl bg-white border border-border p-6">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-700">
            <Users className="h-5 w-5" />
          </div>
          <p className="mt-4 text-xs uppercase tracking-wider text-brand-deep/50">Customers</p>
          <p className="mt-1 text-3xl font-display font-extrabold">{data?.customers ?? 0}</p>
          <Link to="/admin/customers" className="mt-4 inline-block text-sm font-semibold text-brand-glow hover:underline">
            Manage customers →
          </Link>
        </div>
      </div>
    </div>
  );
}
