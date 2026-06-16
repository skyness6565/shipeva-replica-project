import { Award, Lock, Sparkles, TrendingUp } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";
import { Reveal } from "./Reveal";

const counters = [
  { end: 101273, suffix: "+", label: "Delivered Packages" },
  { end: 673754, suffix: "+", label: "KM Per Year" },
  { end: 16714, suffix: "+", label: "Happy Clients" },
  { end: 160, suffix: "+", label: "Countries Served" },
];

const performance = [
  { title: "Delivery Performance", value: "99.8%", caption: "On-Time Delivery", body: "Industry-leading on-time performance across all shipping methods." },
  { title: "Tracking Precision", value: "Real-time", caption: "GPS Accuracy", body: "Advanced tracking systems with minute-by-minute updates." },
  { title: "Client Satisfaction", value: "4.9/5", caption: "Average Rating", body: "Outstanding client satisfaction across all our logistics services." },
];

const badges = [
  { icon: Award, value: "11+ Years", label: "Industry Experience" },
  { icon: Lock, value: "ISO 27001", label: "Security Certification" },
  { icon: Sparkles, value: "8+ Awards", label: "Industry Recognition" },
];

export function Stats() {
  return (
    <section className="relative overflow-hidden bg-hero-gradient py-24 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_20%,oklch(0.55_0.22_300/0.4),transparent_50%),radial-gradient(circle_at_80%_60%,oklch(0.78_0.17_70/0.25),transparent_50%)]" />
      <div className="container-x relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow text-amber">
            <TrendingUp className="h-3.5 w-3.5" /> By The Numbers
          </span>
          <h2 className="mt-4 font-display text-4xl font-extrabold md:text-5xl">
            Our Impact & <span className="text-amber-gradient">Achievements</span>
          </h2>
          <p className="mt-4 text-white/70">Delivering excellence across the globe with industry-leading standards.</p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {counters.map((c, i) => (
            <Reveal key={c.label} delay={i * 80}>
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-7 text-center backdrop-blur transition-all hover:-translate-y-1 hover:border-amber/40">
                <div className="font-display text-4xl font-extrabold text-amber-gradient md:text-5xl">
                  <AnimatedCounter end={c.end} suffix={c.suffix} />
                </div>
                <div className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                  {c.label}
                </div>
                <span className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-amber/60 to-transparent" />
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {performance.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <div className="h-full rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur">
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-amber">{p.title}</div>
                <div className="mt-4 font-display text-4xl font-extrabold text-white">{p.value}</div>
                <div className="mt-1 text-sm font-semibold text-white/80">{p.caption}</div>
                <p className="mt-3 text-[14.5px] leading-relaxed text-white/65">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {badges.map((b, i) => (
            <Reveal key={b.label} delay={i * 80}>
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-amber-gradient text-brand-deep">
                  <b.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-lg font-extrabold text-white">{b.value}</div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">{b.label}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
