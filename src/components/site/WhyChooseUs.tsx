import {
  Clock,
  Globe2,
  Headphones,
  MapPin,
  Radar,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "./Reveal";

const items: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: Radar, title: "Track & Trace", body: "Live, minute-by-minute shipment visibility with GPS-grade accuracy on every leg of the journey." },
  { icon: ShieldCheck, title: "Secure Warehousing", body: "ISO-certified facilities, biometric access and 24/7 monitored security across our global network." },
  { icon: Zap, title: "Express Delivery", body: "Diverse operating infrastructure to clear cargo and deliver in the shortest possible transit window." },
  { icon: MapPin, title: "Domestic Services", body: "Next business day delivery for time-sensitive parcels with full nationwide coverage." },
  { icon: Globe2, title: "Global Coverage", body: "US, Europe, APAC and beyond — full international freight portfolio across air and sea." },
  { icon: Headphones, title: "24/7 Support", body: "Talk to an actual logistics specialist any time, in any time zone. No bots, no scripts." },
];

export function WhyChooseUs() {
  return (
    <section id="why" className="relative overflow-hidden bg-secondary/40 py-24">
      <div className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-brand-glow/10 blur-3xl" />
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow text-brand">
            <Clock className="h-3.5 w-3.5" /> Our Advantages
          </span>
          <h2 className="mt-4 font-display text-4xl font-extrabold text-brand-deep md:text-5xl">
            Why <span className="text-amber-gradient">Choose Us</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Trusted by thousands of customers worldwide for reliable, professional logistics solutions.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={i * 70}>
              <div className="group relative flex h-full items-start gap-5 rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-amber/50 hover:shadow-card">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-amber-gradient text-brand-deep shadow-amber">
                  <it.icon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-extrabold text-brand-deep">{it.title}</h3>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted-foreground">{it.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
