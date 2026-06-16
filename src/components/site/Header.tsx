import { useEffect, useState } from "react";
import { ChevronDown, Menu, Search, Ship, X } from "lucide-react";

const nav = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#why" },
  { label: "Services", href: "#services", caret: true },
  { label: "Track", href: "#track" },
  { label: "Contact", href: "#contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 shadow-[0_8px_30px_-20px_rgba(60,0,120,0.35)] backdrop-blur"
          : "bg-white"
      }`}
    >
      <div className="container-x flex h-[78px] items-center justify-between">
        <a href="#home" className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-gradient text-brand-deep shadow-amber">
            <Ship className="h-5 w-5" />
          </span>
          <span className="font-display text-[22px] font-extrabold tracking-tight text-brand-deep">
            Shipvex<span className="text-amber">.</span>
          </span>
        </a>

        <nav className="hidden items-center gap-9 lg:flex">
          {nav.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="group relative inline-flex items-center gap-1 text-[15px] font-semibold text-brand-deep/85 transition-colors hover:text-brand"
            >
              {item.label}
              {item.caret && <ChevronDown className="h-4 w-4 opacity-70 transition-transform group-hover:rotate-180" />}
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-amber-gradient transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            aria-label="Search"
            className="hidden h-10 w-10 place-items-center rounded-full text-brand-deep/70 transition-colors hover:bg-accent hover:text-brand md:grid"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
          <a
            href="#track"
            className="hidden rounded-full bg-amber-gradient px-6 py-3 text-sm font-bold text-brand-deep shadow-amber transition-transform hover:-translate-y-0.5 md:inline-flex"
          >
            Get Quote
          </a>
          <button
            aria-label="Open menu"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full bg-accent text-brand-deep lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-white lg:hidden">
          <div className="container-x flex flex-col gap-1 py-4">
            {nav.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-[15px] font-semibold text-brand-deep hover:bg-accent"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#track"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-amber-gradient px-5 py-3 text-center text-sm font-bold text-brand-deep shadow-amber"
            >
              Get Quote
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
