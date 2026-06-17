import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Truck, Loader2 } from "lucide-react";

const ADMIN_EMAIL = "alaye@gmail.com";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Admin Sign In — Shipvex" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      let { error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password,
      });
      if (error && /invalid login|invalid credentials/i.test(error.message)) {
        // Auto-provision the admin account on first use
        const { error: signUpErr } = await supabase.auth.signUp({
          email: ADMIN_EMAIL,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (signUpErr) throw signUpErr;
        const retry = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password,
        });
        if (retry.error) throw retry.error;
      } else if (error) {
        throw error;
      }
      navigate({ to: "/admin" });
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-hero-gradient text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white text-brand-deep shadow-brand p-8">
        <Link to="/" className="inline-flex items-center gap-2 font-display font-extrabold text-xl">
          <Truck className="h-6 w-6 text-brand-glow" /> Shipvex Admin
        </Link>
        <h1 className="mt-6 text-2xl font-display font-extrabold">Sign in to dashboard</h1>
        <p className="mt-1 text-sm text-brand-deep/60">
          Restricted area. Authorized personnel only.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              minLength={6}
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 h-12 w-full rounded-xl border-2 border-border px-4 outline-none focus:border-brand-glow"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-hero-gradient text-white font-bold shadow-brand disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign In
          </button>
        </form>
      </div>
    </main>
  );
}
