import { createFileRoute, Outlet, Link, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { checkIsAdmin } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, Package, Users, LogOut, Truck, Loader2, Plus,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Shipvex" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const check = useServerFn(checkIsAdmin);
  const { data, isLoading } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => check(),
  });

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-deep" />
      </div>
    );
  }

  if (!data?.isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="max-w-md rounded-2xl border border-border bg-white p-8 text-center">
          <h1 className="font-display text-2xl font-extrabold">Not authorized</h1>
          <p className="mt-2 text-brand-deep/60">
            Your account doesn't have admin access. Contact the system owner to grant the <code>admin</code> role.
          </p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth" });
            }}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-hero-gradient px-6 text-sm font-bold text-white"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const nav = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/packages", label: "Packages", icon: Package, exact: false },
    { to: "/admin/customers", label: "Customers", icon: Users, exact: false },
  ];

  return (
    <div className="min-h-screen flex bg-secondary/30">
      <aside className="hidden md:flex w-64 flex-col bg-hero-gradient text-white p-5">
        <Link to="/" className="inline-flex items-center gap-2 font-display text-lg font-extrabold">
          <Truck className="h-6 w-6 text-brand-glow" /> Shipvex
        </Link>
        <nav className="mt-8 space-y-1">
          {nav.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to as any}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10"
                }`}
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-2">
          <Link
            to="/admin/packages/new"
            className="flex items-center justify-center gap-2 rounded-full bg-amber-gradient px-4 py-2.5 text-sm font-bold text-brand-deep"
          >
            <Plus className="h-4 w-4" /> New Package
          </Link>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth" });
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="md:hidden flex items-center justify-between bg-hero-gradient text-white px-4 py-3">
          <Link to="/" className="font-display font-extrabold">Shipvex Admin</Link>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth" });
            }}
            className="text-sm"
          >
            Sign out
          </button>
        </div>
        <div className="md:hidden flex gap-1 overflow-x-auto px-3 py-2 bg-white border-b">
          {nav.map((n) => (
            <Link key={n.to} to={n.to as any} className="rounded-full px-3 py-1.5 text-xs font-semibold bg-secondary">
              {n.label}
            </Link>
          ))}
          <Link to="/admin/packages/new" className="rounded-full px-3 py-1.5 text-xs font-bold bg-amber-gradient text-brand-deep">
            + New
          </Link>
        </div>
        <div className="p-5 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
