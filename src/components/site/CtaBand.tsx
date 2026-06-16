import { ArrowRight, PackageSearch, Rocket } from "lucide-react";
import { Reveal } from "./Reveal";

export function CtaBand() {
  return (
    <section id="contact" className="relative overflow-hidden bg-hero-gradient py-24 text-white">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_70%_30%,oklch(0.78_0.17_70/0.25),transparent_55%)]" />
      <div className="container-x relative">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="eyebrow text-amber">
            <Rocket className="h-3.5 w-3.5" /> Start Your Journey
          </span>
          <h2 className="mt-5 font-display text-4xl font-extrabold leading-tight md:text-5xl">
            Ready to Ship with <span className="text-amber-gradient">Confidence?</span>
          </h2>
          <p className="mt-5 text-white/75">
            Get started with our professional logistics services today. Contact us for a free quote and feel the difference on day one.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 rounded-full bg-amber-gradient px-8 py-4 text-sm font-bold text-brand-deep shadow-amber transition-transform hover:-translate-y-0.5"
            >
              Get Free Quote
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#track"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-8 py-4 text-sm font-bold text-white transition-all hover:border-amber hover:bg-amber hover:text-brand-deep"
            >
              <PackageSearch className="h-4 w-4" />
              Track Shipment
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
