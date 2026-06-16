import { Quote, Star, Users } from "lucide-react";
import { Reveal } from "./Reveal";

const items = [
  {
    quote:
      "Compared to other logistics partners we've worked with, the service provided by Shipvex Express consistently exceeds industry standards.",
    initials: "MP",
    name: "Monique Pete",
    role: "Logistics Manager, Martrax Inc.",
  },
  {
    quote:
      "More than once, the Shipvex team has saved the day — delivering critical cargo on time with short notice. Their can-do attitude has won our loyalty.",
    initials: "SA",
    name: "Steve Anderson",
    role: "President / Owner, Duplication Factory",
  },
  {
    quote:
      "We get a consistently high level of service. They pick great carriers, use them regularly, and their communication is genuinely outstanding.",
    initials: "CB",
    name: "Cathy Beckman",
    role: "Logistics Team, Oxea Chemicals",
  },
];

export function Testimonials() {
  return (
    <section className="bg-background py-24">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow text-brand">
            <Users className="h-3.5 w-3.5" /> Client Stories
          </span>
          <h2 className="mt-4 font-display text-4xl font-extrabold text-brand-deep md:text-5xl">
            What Our <span className="text-amber-gradient">Clients Say</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Hear from customers around the world about their experience with our logistics solutions.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <figure className="relative flex h-full flex-col rounded-3xl border border-border bg-card p-8 shadow-card transition-all hover:-translate-y-1 hover:border-amber/50">
                <Quote className="absolute right-6 top-6 h-10 w-10 text-amber/20" />
                <div className="flex items-center gap-2 text-amber">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-current" />
                  ))}
                  <span className="ml-2 text-sm font-bold text-brand-deep">5.0</span>
                </div>
                <blockquote className="mt-5 flex-1 text-[15.5px] leading-relaxed text-brand-deep/85">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-4 border-t border-border pt-5">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-hero-gradient font-display text-sm font-extrabold text-amber">
                    {t.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="font-display font-extrabold text-brand-deep">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
