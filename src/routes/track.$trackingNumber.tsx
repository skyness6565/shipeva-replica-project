import { createFileRoute, Link, useServerFn } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { trackPackage } from "@/lib/tracking.functions";
import { TopBar } from "@/components/site/TopBar";
import { Header } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/SiteFooter";
import {
  Package, MapPin, Clock, Truck, CheckCircle2, AlertTriangle, Plane, Ship,
  Loader2, ArrowLeft,
} from "lucide-react";

export const Route = createFileRoute("/track/$trackingNumber")({
  head: ({ params }) => ({
    meta: [
      { title: `Tracking ${params.trackingNumber} — Shipvex` },
      { name: "description", content: `Live status for shipment ${params.trackingNumber}.` },
    ],
  }),
  component: TrackPage,
});

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  in_transit: "In Transit",
  arrived: "Arrived",
  delivered: "Delivered",
  held_by_customs: "Held by Customs",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900",
  processing: "bg-blue-100 text-blue-900",
  in_transit: "bg-indigo-100 text-indigo-900",
  arrived: "bg-teal-100 text-teal-900",
  delivered: "bg-emerald-100 text-emerald-900",
  held_by_customs: "bg-rose-100 text-rose-900",
};

function methodIcon(m?: string | null) {
  if (m?.toLowerCase() === "air") return <Plane className="h-4 w-4" />;
  if (m?.toLowerCase() === "sea") return <Ship className="h-4 w-4" />;
  return <Truck className="h-4 w-4" />;
}

function TrackPage() {
  const { trackingNumber } = Route.useParams();
  const track = useServerFn(trackPackage);
  const { data, isLoading, error } = useQuery({
    queryKey: ["track", trackingNumber],
    queryFn: () => track({ data: { trackingNumber } }),
  });

  return (
    <main className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <section className="bg-hero-gradient text-white py-14">
        <div className="container-x">
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <h1 className="mt-3 font-display text-3xl md:text-4xl font-extrabold">
            Shipment <span className="text-amber-gradient">{trackingNumber}</span>
          </h1>
        </div>
      </section>

      <section className="container-x py-10">
        {isLoading && (
          <div className="flex items-center gap-3 text-brand-deep/70">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading shipment...
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
            <AlertTriangle className="inline h-5 w-5 mr-2" /> {(error as Error).message}
          </div>
        )}
        {data && !data.found && (
          <div className="rounded-2xl border border-border bg-white p-8 text-center">
            <Package className="mx-auto h-10 w-10 text-brand-deep/40" />
            <h2 className="mt-3 font-display text-xl font-extrabold">No shipment found</h2>
            <p className="mt-1 text-brand-deep/60">
              We couldn't find a package matching <strong>{trackingNumber}</strong>. Please verify the tracking number.
            </p>
          </div>
        )}
        {data && data.found && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-3xl border border-border bg-white p-6 shadow-brand/30">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-brand-deep/50">Status</p>
                    <span className={`mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold ${STATUS_COLOR[data.package.status]}`}>
                      {STATUS_LABEL[data.package.status]}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-brand-deep/50">Reference</p>
                    <p className="font-mono text-sm">{data.package.reference_id}</p>
                  </div>
                </div>
                <h2 className="mt-4 font-display text-2xl font-extrabold">{data.package.package_name}</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Info label="Origin" value={data.package.origin_country} />
                  <Info label="Destination" value={data.package.destination_country} />
                  <Info label="Current Location" value={data.package.current_location ?? "—"} />
                  <Info
                    label="Method"
                    value={
                      <span className="inline-flex items-center gap-2">
                        {methodIcon(data.package.shipment_method)} {data.package.shipment_method ?? "—"}
                      </span>
                    }
                  />
                  <Info label="Weight" value={data.package.weight ? `${data.package.weight} kg` : "—"} />
                  <Info
                    label="Estimated Delivery"
                    value={
                      data.package.expected_delivery_date ??
                      (data.package.estimated_delivery_days
                        ? `${data.package.estimated_delivery_days} days`
                        : "—")
                    }
                  />
                </div>
                {data.package.shipment_description && (
                  <p className="mt-4 text-sm text-brand-deep/70">{data.package.shipment_description}</p>
                )}
              </div>

              {data.package.image_urls?.length > 0 && (
                <div className="rounded-3xl border border-border bg-white p-6">
                  <h3 className="font-display text-lg font-extrabold">Package Photos</h3>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {data.package.image_urls.map((u: string) => (
                      <img key={u} src={u} alt="Package" className="aspect-square w-full rounded-xl object-cover" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-border bg-white p-6">
              <h3 className="font-display text-lg font-extrabold">Tracking History</h3>
              <ol className="mt-4 space-y-4">
                {data.events.map((e, idx) => (
                  <li key={e.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`mt-1 grid h-8 w-8 place-items-center rounded-full ${idx === 0 ? "bg-amber-gradient" : "bg-secondary"}`}>
                        {e.status === "delivered" ? (
                          <CheckCircle2 className="h-4 w-4 text-brand-deep" />
                        ) : e.status === "held_by_customs" ? (
                          <AlertTriangle className="h-4 w-4 text-brand-deep" />
                        ) : (
                          <Truck className="h-4 w-4 text-brand-deep" />
                        )}
                      </div>
                      {idx < data.events.length - 1 && <div className="w-px flex-1 bg-border" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-bold">{STATUS_LABEL[e.status]}</p>
                      {e.location && (
                        <p className="text-xs text-brand-deep/60 inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {e.location}
                        </p>
                      )}
                      {e.note && <p className="mt-1 text-sm text-brand-deep/70">{e.note}</p>}
                      <p className="mt-1 text-xs text-brand-deep/40 inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date(e.event_time).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
                {data.events.length === 0 && (
                  <li className="text-sm text-brand-deep/50">No tracking events yet.</li>
                )}
              </ol>
            </div>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-brand-deep/50">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
