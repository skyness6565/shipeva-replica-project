import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero-logistics.jpg";

const slides = [
  {
    eyebrow: "#1 Global Logistics Provider",
    titleA: "Leading Global",
    titleB: "Logistics Service",
    body: "A complete range of worldwide freight solutions delivered with unmatched reliability and speed.",
  },
  {
    eyebrow: "Express Delivery",
    titleA: "Fastest & Reliable",
    titleB: "Courier Service",
    body: "International ocean freight including FCL, LCL and consolidation, moved by a team that obsesses over details.",
  },
  {
    eyebrow: "Custom Solutions",
    titleA: "Professional",
    titleB: "Freight Solutions",
    body: "Tailored shipping programs engineered for the way your business actually moves cargo around the globe.",
  },
  {
    eyebrow: "State-of-the-Art Facilities",
    titleA: "Industry Standard",
    titleB: "Warehousing",
    body: "Comprehensive and scalable storage solutions backed by automation and 24/7 monitored security.",
  },
];

export function HeroSlider() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, []);
  const s = slides[i];

  return (
    <section
      id="home"
      className="relative isolate overflow-hidden bg-hero-gradient text-white"
    >
      <div className="absolute inset-0 -z-10">
        <img
          src={heroImg}
          alt=""
          width={1920}
          height={1080}
          className="h-full w-full object-cover opacity-[0.32] animate-slow-pan"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.18_0.12_295)/0.6] via-[oklch(0.18_0.12_295)/0.55] to-[oklch(0.14_0.1_290)/0.95]" />
        <div className="absolute -left-32 top-1/4 h-[420px] w-[420px] rounded-full bg-brand-glow/30 blur-3xl" />
        <div className="absolute right-0 top-0 h-[520px] w-[520px] rounded-full bg-amber/15 blur-3xl" />
      </div>

      <div className="container-x relative grid min-h-[88vh] place-items-center py-24">
        <div key={i} className="mx-auto max-w-4xl text-center animate-float-up">
          <span className="eyebrow rounded-full border border-white/15 bg-white/5 px-4 py-2 text-amber">
            <span className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse-dot" />
            {s.eyebrow}
          </span>

          <h1 className="mt-8 font-display text-[clamp(2.6rem,7vw,5.4rem)] font-extrabold leading-[0.98]">
            <span className="block text-white">{s.titleA}</span>
            <span className="mt-2 block text-amber-gradient">{s.titleB}</span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg text-white/75">
            {s.body}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#services"
              className="inline-flex items-center gap-2 rounded-full bg-amber-gradient px-8 py-4 text-[15px] font-bold text-brand-deep shadow-amber transition-transform hover:-translate-y-0.5"
            >
              Learn More
            </a>
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 rounded-full border-2 border-amber/70 px-8 py-4 text-[15px] font-bold text-white transition-all hover:bg-amber hover:text-brand-deep"
            >
              Contact Us <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => setI(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? "w-10 bg-amber" : "w-4 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Vertical scroll indicator */}
      <div className="pointer-events-none absolute bottom-6 left-6 hidden flex-col items-center gap-3 md:flex">
        <span className="rotate-180 text-[10px] font-bold uppercase tracking-[0.3em] text-white/60 [writing-mode:vertical-rl]">
          Scroll
        </span>
        <span className="h-10 w-px bg-gradient-to-b from-amber to-transparent animate-scroll-bounce" />
      </div>
    </section>
  );
}
