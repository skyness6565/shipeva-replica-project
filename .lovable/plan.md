## Goal

Build a single-page logistics homepage inspired by the Shipeva demo — same section order, visual hierarchy, dark-purple + amber palette, animated counters, tracking bar, and modern micro-interactions. We'll recreate the aesthetic rather than copy assets/copy verbatim (to avoid IP issues), keeping the look-and-feel very close.

## Section order (top to bottom)

1. **Top utility bar** — "24/7 Global Logistics" · Toll-Free Support · email (right)
2. **Sticky header** — wordmark logo, nav (Home, About, Services dropdown, Track, Contact), search icon, amber "Get Quote" button
3. **Hero slider** — full-viewport dark purple/indigo gradient with subtle freight imagery overlay; rotating slides (Leading Global Logistics Service / Fastest & Reliable Courier / Professional Freight Solutions / Industry Standard Warehousing); pill eyebrow, huge headline with amber accent line, subhead, "Learn More" (amber) + "Contact Us" (outline) CTAs, vertical "SCROLL" indicator
4. **Tracking bar** — overlapping card: eyebrow "Real-Time Tracking", heading, input + amber "Track Shipment" button
5. **Services grid** — 6 cards (Air Freight, Sea/Ocean, Road, Diplomatic Bag, Warehousing, Packaging & Storage) with icon, small eyebrow tag, title, copy, Learn More link, hover lift
6. **Why Choose Us** — 6 feature tiles with icons (Track & Trace, Secure Warehousing, Express Delivery, Domestic Services, Global Coverage, 24/7 Support)
7. **Impact / Animated counters** — 4 counters (Delivered Packages 101,273+ · KM Per Year 673,754+ · Happy Clients 16,714+ · Countries Served 160+), plus 3 performance cards (On-Time 99.8%, GPS Real-time, Rating 4.9/5) and 3 badges (11+ Years, ISO 27001, 8+ Awards)
8. **Testimonials** — 3 cards, 5-star, quote, avatar initials, name + role
9. **Trusted Partners** — 5 monochrome partner logos in a row (use generic placeholder marks)
10. **CTA band** — "Ready to Ship with Confidence?" with Get Free Quote + Track Shipment buttons on gradient
11. **Footer** — 4 columns: brand + about + socials, Quick Links, Services, Contact (address, phone, email); bottom bar with copyright

## Visual system

- **Palette**: deep indigo/purple background `#1a0b3d` → `#2d1b69`, amber accent `#f59e0b` / `#fbbf24`, white text, muted lavender body text
- **Typography**: bold display sans (e.g. Plus Jakarta Sans / Manrope) for headings, clean sans body; oversized hero headline; uppercase eyebrow tags with letter-spacing
- **Shapes**: pill buttons, rounded-2xl cards, soft shadows with purple tint, subtle gradient borders
- **Motion**: framer-motion fade-in/slide-up on scroll, animated number counters using IntersectionObserver, hero slide auto-rotate (~6s) with fade, hover lift on service cards, sticky header shadow on scroll, smooth scroll
- **Responsive**: 1-col mobile, 2-col tablet, 3-col desktop for service/feature grids; counters stack 2x2 then 4x1; nav collapses to hamburger sheet

## Technical

- Single route: `src/routes/index.tsx` composing section components in `src/components/site/`
  - `TopBar.tsx`, `Header.tsx`, `HeroSlider.tsx`, `TrackingBar.tsx`, `Services.tsx`, `WhyChooseUs.tsx`, `Stats.tsx`, `Testimonials.tsx`, `Partners.tsx`, `CtaBand.tsx`, `SiteFooter.tsx`
  - `AnimatedCounter.tsx` hook/component
- Design tokens in `src/styles.css` (`@theme` purple + amber, fonts, shadows, gradients)
- Fonts via `<link>` in `src/routes/__root.tsx` (Plus Jakarta Sans + Manrope)
- Icons: `lucide-react` (already available via shadcn)
- Hero background: AI-generated cargo plane/ship/truck photo with dark purple overlay (`imagegen`)
- Service icons: lucide (Plane, Ship, Truck, ShieldCheck, Warehouse, PackageCheck)
- SEO: `head()` in index route with title/description/og tags
- All copy paraphrased to avoid verbatim reproduction; tracking input is UI-only (shows toast on submit)

## Out of scope

- Real tracking backend, multi-page routing (About/Services/Contact), Google Translate language list at the bottom, real partner logos, CMS — homepage only as requested.

Ready to build on approval.