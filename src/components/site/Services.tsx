import {
  ArrowUpRight,
  Boxes,
  Plane,
  Ship,
  ShieldCheck,
  Truck,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "./Reveal";

type Service = {
  icon: LucideIcon;
  tag: string;
  title: string;
  body: string;
};

const services: Service[] = [
  {
    icon: Plane,
    tag: "Premium Service",
    title: "Air Freight",
    body: "IATA-endorsed air forwarding with priority handling, customs clearance and global capacity on every major lane.",
  },
  {
    icon: Ship,
    tag: "Global Network",
    title: "Sea / Ocean Freight",
    body: "International FCL and LCL shipping with port-to-port and door-to-door options, backed by 200+ partner ports.",
  },
  {
    icon: Truck,
    tag: "Domestic & Cross-border",
    title: "Road Transportation",
    body: "A dependable fleet and vetted carrier network covering same-day, next-day and long-haul road freight.",
  },
  {
    icon: ShieldCheck,
    tag: "Secure & Confidential",
    title: "Diplomatic Bag & Secure Logistics",
    body: "End-to-end chain-of-custody for sensitive mail, equipment and high-value parcels with full security clearance.",
  },
  {
    icon: Warehouse,
    tag: "State-of-the-Art",
    title: "Warehousing",
    body: "Shared and dedicated facilities with real-time WMS, climate control and automated pick-and-pack operations.",
  },
  {
    icon: Boxes,
    tag: "Cargo Insurance",
    title: "Packaging & Storage",
    body: "Industrial-grade packaging, palletization and insured storage for raw materials, electronics and finished goods.",
  },
];

export function Services() {
  return (
    <section id="services" className="relative bg-background py-24">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow text-brand">
            <span className="h-px w-8 bg-brand" /> What We Offer
          </span>
          <h2 className="mt-4 font-display text-4xl font-extrabold leading-tight text-brand-deep md:text-5xl">
            Our <span className="text-amber-gradient">Services</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Comprehensive shipping and logistics solutions, tuned to the way your business actually moves cargo.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 80}>
              <article className="group relative h-full overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-glow/40 hover:shadow-brand">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber/0 transition-colors duration-300 group-hover:bg-amber/15" />
                <div className="relative">
                  <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-hero-gradient text-amber shadow-brand">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <span className="eyebrow text-brand/70">{s.tag}</span>
                  <h3 className="mt-2 font-display text-xl font-extrabold text-brand-deep">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{s.body}</p>
                  <a
                    href="#contact"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand transition-colors hover:text-amber"
                  >
                    Learn More
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
