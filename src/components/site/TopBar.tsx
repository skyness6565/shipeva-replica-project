import { Clock, Headphones, Mail } from "lucide-react";

export function TopBar() {
  return (
    <div className="hidden border-b border-white/10 bg-[oklch(0.16_0.1_295)] text-[12.5px] text-white/80 md:block">
      <div className="container-x flex h-10 items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="inline-flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-amber" /> 24/7 Global Logistics
          </span>
          <span className="inline-flex items-center gap-2">
            <Headphones className="h-3.5 w-3.5 text-amber" /> Toll-Free Support
          </span>
        </div>
        <a href="mailto:hello@shipvex.co" className="inline-flex items-center gap-2 hover:text-amber">
          <Mail className="h-3.5 w-3.5 text-amber" /> hello@shipvex.co
        </a>
      </div>
    </div>
  );
}
