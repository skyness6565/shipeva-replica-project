import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Ship,
  Twitter,
  Youtube,
} from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-[oklch(0.12_0.08_290)] text-white/75">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <a href="#home" className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-gradient text-brand-deep shadow-amber">
              <Ship className="h-5 w-5" />
            </span>
            <span className="font-display text-2xl font-extrabold text-white">
              Shipvex<span className="text-amber">.</span>
            </span>
          </a>
          <p className="mt-5 text-[14.5px] leading-relaxed text-white/65">
            A full-service global logistics partner moving air, ocean and road freight across more than 160 countries with reliability you can plan around.
          </p>
          <div className="mt-6 flex gap-2">
            {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white/70 transition-all hover:-translate-y-0.5 hover:border-amber hover:bg-amber hover:text-brand-deep"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg font-extrabold text-white">Quick Links</h4>
          <ul className="mt-5 space-y-3 text-[14.5px]">
            {["About Us", "Our Services", "Track Shipment", "Get a Quote", "News & Insights", "Careers"].map((l) => (
              <li key={l}>
                <a href="#" className="transition-colors hover:text-amber">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg font-extrabold text-white">Services</h4>
          <ul className="mt-5 space-y-3 text-[14.5px]">
            {["Air Freight", "Sea / Ocean Freight", "Road Transportation", "Warehousing", "Packaging & Storage", "Secure Logistics"].map((l) => (
              <li key={l}>
                <a href="#services" className="transition-colors hover:text-amber">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg font-extrabold text-white">Contact</h4>
          <ul className="mt-5 space-y-4 text-[14.5px]">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
              <span>2244 Harbor Lane, Suite 410<br />Long Beach, CA 90802</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
              <span>+1 (800) 555-0144</span>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
              <span>katehitler4@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/55 md:flex-row">
          <p>© {new Date().getFullYear()} Shipvex Express. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-amber">Privacy Policy</a>
            <a href="#" className="hover:text-amber">Terms of Service</a>
            <a href="#" className="hover:text-amber">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
