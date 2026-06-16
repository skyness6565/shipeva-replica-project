import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { PackageSearch, Radar } from "lucide-react";
import { toast } from "sonner";

export function TrackingBar() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const t = code.trim();
    if (!t) {
      toast.error("Please enter a tracking number");
      return;
    }
    navigate({ to: "/track/$trackingNumber", params: { trackingNumber: t } });
  };

  return (
    <section id="track" className="relative z-10 -mt-16 md:-mt-20">
      <div className="container-x">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white shadow-brand">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_1fr]">
            <div className="bg-hero-gradient p-8 text-white md:p-10">
              <span className="eyebrow text-amber">
                <Radar className="h-4 w-4" /> Real-Time Tracking
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight md:text-4xl">
                Track & Trace Your <span className="text-amber-gradient">Shipment</span>
              </h2>
              <p className="mt-3 max-w-md text-white/70">
                Enter your tracking number and get minute-by-minute updates on your package across air, sea and land.
              </p>
            </div>
            <form onSubmit={onSubmit} className="flex flex-col justify-center gap-4 p-8 md:p-10">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-brand-deep/60">
                Tracking number
              </label>
              <div className="relative">
                <PackageSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-deep/40" />
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. SHX-9F2-77481"
                  className="h-14 w-full rounded-full border-2 border-border bg-secondary/40 pl-12 pr-4 text-[15px] font-semibold tracking-wide text-brand-deep outline-none transition-colors focus:border-brand-glow focus:bg-white"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-amber-gradient px-8 text-sm font-bold text-brand-deep shadow-amber transition-transform hover:-translate-y-0.5"
              >
                Track Shipment
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

