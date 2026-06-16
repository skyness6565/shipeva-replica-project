import { Anchor, Globe, Handshake, Plane, Rocket, Truck, Warehouse } from "lucide-react";
import { Reveal } from "./Reveal";

const partners = [
  { icon: Plane, name: "AeroLine" },
  { icon: Anchor, name: "PortMark" },
  { icon: Truck, name: "Routely" },
  { icon: Warehouse, name: "Stowpoint" },
  { icon: Globe, name: "OrbitX" },
  { icon: Rocket, name: "Liftoff" },
];

export function Partners() {
  return (
    <section className="bg-secondary/40 py-20">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow text-brand">
            <Handshake className="h-3.5 w-3.5" /> Our Network
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold text-brand-deep md:text-4xl">
            Trusted <span className="text-amber-gradient">Partners</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Working with industry leaders to deliver the best logistics solutions worldwide.
          </p>
        </Reveal>

        <Reveal className="mt-12">
          <div className="grid grid-cols-2 items-center gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {partners.map((p) => (
              <div
                key={p.name}
                className="group flex items-center justify-center gap-3 rounded-2xl border border-border bg-card px-4 py-6 text-brand-deep/50 transition-all hover:-translate-y-0.5 hover:border-amber/40 hover:text-brand-deep"
              >
                <p.icon className="h-6 w-6" />
                <span className="font-display text-base font-extrabold tracking-tight">{p.name}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
