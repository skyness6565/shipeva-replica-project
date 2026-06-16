import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { TopBar } from "@/components/site/TopBar";
import { Header } from "@/components/site/Header";
import { HeroSlider } from "@/components/site/HeroSlider";
import { TrackingBar } from "@/components/site/TrackingBar";
import { Services } from "@/components/site/Services";
import { WhyChooseUs } from "@/components/site/WhyChooseUs";
import { Stats } from "@/components/site/Stats";
import { Testimonials } from "@/components/site/Testimonials";
import { Partners } from "@/components/site/Partners";
import { CtaBand } from "@/components/site/CtaBand";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shipvex Express — Global Logistics & Freight Solutions" },
      {
        name: "description",
        content:
          "Worldwide air, ocean and road freight, secure warehousing and real-time shipment tracking. Trusted by 16,000+ businesses across 160+ countries.",
      },
      { property: "og:title", content: "Shipvex Express — Global Logistics" },
      {
        property: "og:description",
        content: "Reliable global freight, warehousing and real-time tracking across 160+ countries.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main className="min-h-screen overflow-x-clip">
      <TopBar />
      <Header />
      <HeroSlider />
      <TrackingBar />
      <Services />
      <WhyChooseUs />
      <Stats />
      <Testimonials />
      <Partners />
      <CtaBand />
      <SiteFooter />
      <Toaster richColors position="top-center" />
    </main>
  );
}
