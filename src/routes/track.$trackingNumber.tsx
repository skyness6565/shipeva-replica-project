import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { trackPackage } from "@/lib/tracking.functions";
import {
  Package, MapPin, Clock, CheckCircle2, AlertTriangle, ArrowLeft,
  PackageSearch, User, Home, ChevronRight, Printer, DollarSign,
  Loader2, ScanLine,
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

const STAGES = [
  { key: "pending", label: "Pending", color: "from-fuchsia-500 to-pink-500" },
  { key: "processing", label: "Processing", color: "from-pink-500 to-purple-500" },
  { key: "in_transit", label: "In Transit", color: "from-purple-500 to-indigo-500" },
  { key: "arrived", label: "Arrived", color: "from-indigo-500 to-teal-500" },
  { key: "held_by_customs", label: "Customs Hold", color: "from-amber-500 to-orange-500" },
  { key: "out_for_delivery", label: "Out for Delivery", color: "from-orange-500 to-emerald-500" },
  { key: "delivered", label: "Delivered", color: "from-emerald-500 to-green-500" },
];

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  in_transit: "In Transit",
  arrived: "Arrived",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  held_by_customs: "Custom Hold",
};

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-400/40",
  processing: "bg-blue-500/20 text-blue-200 border-blue-400/40",
  in_transit: "bg-indigo-500/20 text-indigo-200 border-indigo-400/40",
  arrived: "bg-teal-500/20 text-teal-200 border-teal-400/40",
  out_for_delivery: "bg-orange-500/20 text-orange-200 border-orange-400/40",
  delivered: "bg-emerald-500/25 text-emerald-200 border-emerald-400/50",
  held_by_customs: "bg-amber-500/20 text-amber-200 border-amber-400/40",
};

function fmtDate(d?: string | null, opts?: Intl.DateTimeFormatOptions) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", opts ?? { month: "short", day: "2-digit", year: "numeric" });
}
function fmtShort(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short" });
}
function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function TrackPage() {
  const { trackingNumber } = Route.useParams();
  const track = useServerFn(trackPackage);
  const { data, isLoading, error } = useQuery({
    queryKey: ["track", trackingNumber],
    queryFn: () => track({ data: { trackingNumber } }),
  });

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,#3b1b6e_0%,#1f0b40_45%,#170733_100%)] text-white">
      <div className="container-x py-8">
        {/* Header row: Title card + Back to home */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 shadow-lg">
                <PackageSearch className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-black tracking-tight">TRACKING</h1>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-white/60">
              <Home className="h-4 w-4" />
              <Link to="/" className="hover:text-white">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-white/80">Tracking</span>
            </div>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold backdrop-blur hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>

        {isLoading && (
          <div className="mt-10 flex items-center gap-3 text-white/70">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading shipment...
          </div>
        )}
        {error && (
          <div className="mt-10 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6">
            <AlertTriangle className="inline h-5 w-5 mr-2" /> {(error as Error).message}
          </div>
        )}
        {data && !data.found && (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur">
            <Package className="mx-auto h-10 w-10 text-white/40" />
            <h2 className="mt-3 text-xl font-extrabold">No shipment found</h2>
            <p className="mt-1 text-white/60">
              We couldn't find a package matching <strong>{trackingNumber}</strong>.
            </p>
          </div>
        )}

        {data && data.found && <TrackingDetail data={data} />}
      </div>
    </main>
  );
}

function TrackingDetail({ data }: { data: Extract<Awaited<ReturnType<typeof trackPackage>>, { found: true }> }) {
  const pkg = data.package;
  const events = [...data.events].sort(
    (a, b) => new Date(b.event_time).getTime() - new Date(a.event_time).getTime()
  );
  const currentIdx = Math.max(0, STAGES.findIndex((s) => s.key === pkg.status));
  const lastUpdate = events[0]?.event_time ?? pkg.updated_at;

  return (
    <div className="mt-6 space-y-6">
      {/* Tracking Number + Live Route Map */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,400px)_1fr]">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-xl">
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">
                  <ScanLine className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold tracking-widest">TRACKING NUMBER</span>
              </div>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">Verified</span>
            </div>
            <p className="mt-5 break-all font-mono text-4xl font-black tracking-wider">
              {pkg.tracking_number}
            </p>
          </div>
          <div className="space-y-3 p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Current Status</span>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${STATUS_BADGE[pkg.status]}`}>
                {STATUS_LABEL[pkg.status]}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Last Updated</span>
              <span className="text-sm font-semibold">
                {fmtDate(lastUpdate, { month: "short", day: "2-digit", year: "numeric" })}
                {" · "}
                {fmtTime(lastUpdate)}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-fuchsia-500/30">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">Live Route Map</h3>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs">Fixed View</span>
          </div>
          <div className="relative h-[320px] w-full">
            <iframe
              title="Route map"
              className="absolute inset-0 h-full w-full border-0"
              src={`https://www.google.com/maps?q=${encodeURIComponent(pkg.current_location || pkg.destination_country)}&output=embed`}
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Customs Hold banner */}
      {pkg.customs_hold && (
        <div className="rounded-3xl border border-amber-400/40 bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-6 backdrop-blur">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-amber-500 text-white">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-extrabold text-amber-100">Package is being held by Customs</h3>
              <p className="mt-1 text-sm text-white/80">
                Your package is currently held by customs. For enquiries please reach us at{" "}
                <a href="mailto:katehitler4@gmail.com" className="font-bold text-amber-200 underline">
                  katehitler4@gmail.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      )}

      {/* From / To */}
      <div className="grid gap-6 sm:grid-cols-2">
        <PartyCard
          title="From"
          name={pkg.sender_name}
          line1={pkg.origin_country}
          line2={pkg.sender_email}
        />
        <PartyCard
          title="To"
          name={pkg.receiver_name}
          line1={pkg.destination_country}
          line2={pkg.receiver_email}
        />
      </div>

      {/* Shipment Details + Status Information + Journey */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,400px)_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/60">Shipment Details</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field label="Weight" value={pkg.weight ? `${pkg.weight} kg` : "—"} />
            <Field label="Type" value={pkg.shipment_method ?? pkg.package_type ?? "—"} />
            <Field label="Shipped" value={fmtDate(pkg.dispatch_date)} className="col-span-2" />
            <Field
              label="Expected"
              value={fmtDate(pkg.expected_delivery_date, { month: "short", day: "2-digit", year: "numeric" })}
              className="col-span-2"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/60">Status Information</h3>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/80">
                <Clock className="h-4 w-4" /> <span className="text-sm">Status</span>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${STATUS_BADGE[pkg.status]}`}>
                {STATUS_LABEL[pkg.status]}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-white/80">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">Location:</span>
              <span className="text-sm font-semibold">{pkg.current_location ?? "—"}</span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h3 className="text-lg font-bold">Journey Progress</h3>
            <div className="mt-6">
              <div className="relative flex items-start justify-between gap-2">
                {/* connector line */}
                <div className="absolute left-5 right-5 top-5 -z-0 h-1 rounded-full bg-white/10" />
                <div
                  className="absolute left-5 top-5 -z-0 h-1 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-emerald-500 transition-all"
                  style={{ width: `calc((100% - 2.5rem) * ${currentIdx / (STAGES.length - 1)})` }}
                />
                {STAGES.map((s, i) => {
                  const reached = i <= currentIdx;
                  const ev = events.find((e) => e.status === s.key);
                  return (
                    <div key={s.key} className="z-10 flex w-full flex-col items-center text-center">
                      <div
                        className={`grid h-10 w-10 place-items-center rounded-full text-sm font-black shadow-lg ${
                          reached
                            ? `bg-gradient-to-br ${s.color} text-white`
                            : "bg-white/10 text-white/40"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <p className={`mt-2 text-xs font-bold ${reached ? "text-white" : "text-white/40"}`}>
                        {s.label}
                      </p>
                      <p className="text-[10px] text-white/40">{ev ? fmtShort(ev.event_time) : "—"}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History + Parcel Information */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,400px)_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h3 className="text-lg font-bold">History</h3>
          <ol className="mt-5 space-y-5">
            {events.map((e, idx) => {
              const isDelivered = e.status === "delivered";
              const isHold = e.status === "held_by_customs";
              return (
                <li key={e.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                        isDelivered
                          ? "bg-emerald-500"
                          : isHold
                            ? "bg-amber-500"
                            : "bg-gradient-to-br from-fuchsia-500 to-purple-500"
                      }`}
                    >
                      {isDelivered ? (
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      ) : isHold ? (
                        <AlertTriangle className="h-4 w-4 text-white" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                    {idx < events.length - 1 && <div className="mt-1 w-px flex-1 bg-white/15" />}
                  </div>
                  <div className="min-w-0 flex-1 pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-bold">{STATUS_LABEL[e.status]}</p>
                      <span className="shrink-0 text-xs text-white/50">
                        {fmtShort(e.event_time)}, {fmtTime(e.event_time)}
                      </span>
                    </div>
                    {e.location && <p className="text-sm text-white/70">{e.location}</p>}
                    {e.note && <p className="text-xs text-white/50">{e.note}</p>}
                  </div>
                </li>
              );
            })}
            {events.length === 0 && <li className="text-sm text-white/50">No history yet.</li>}
          </ol>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h3 className="text-lg font-bold">Parcel Information</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-[140px_1fr]">
            <div className="grid aspect-square place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              {pkg.image_urls?.[0] ? (
                <img src={pkg.image_urls[0]} alt="Parcel" className="h-full w-full object-cover" />
              ) : (
                <Package className="h-10 w-10 text-white/30" />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Field
                label="Duty Fees"
                value={
                  <span className="text-emerald-300">✓ {pkg.shipment_fee ? "PAID" : "—"}</span>
                }
              />
              <Field label="Weight" value={pkg.weight ? `${pkg.weight} kg` : "—"} />
              <Field label="Mode" value={pkg.shipment_method ?? "—"} />
              <Field label="Pickup" value={fmtDate(pkg.dispatch_date)} />
              <Field label="Expected" value={fmtDate(pkg.expected_delivery_date)} />
              <Field label="Location" value={pkg.current_location ?? "—"} />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-500 px-5 py-2.5 text-sm font-bold shadow-lg hover:opacity-90"
            >
              <Printer className="h-4 w-4" /> Print Receipt
            </button>
            {pkg.shipment_fee ? (
              <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold shadow-lg hover:opacity-90">
                <DollarSign className="h-4 w-4" /> Pay Fee ({Number(pkg.shipment_fee).toLocaleString()} {pkg.currency})
              </button>
            ) : null}
          </div>
          {pkg.shipment_description && (
            <p className="mt-5 text-sm text-white/70">{pkg.shipment_description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PartyCard({
  title, name, line1, line2, line3,
}: { title: string; name?: string | null; line1?: string | null; line2?: string | null; line3?: string | null }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-fuchsia-500/25">
          <User className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-white/70">{title}</h3>
      </div>
      <div className="mt-4 space-y-1">
        <p className="text-base font-bold">{name ?? "—"}</p>
        {line1 && <p className="text-sm text-white/70">{line1}</p>}
        {line2 && <p className="text-sm text-white/60">{line2}</p>}
        {line3 && <p className="text-sm text-white/60">{line3}</p>}
      </div>
    </div>
  );
}

function Field({
  label, value, className = "",
}: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 px-3 py-2 ${className}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50">{label}</p>
      <p className="mt-0.5 truncate text-sm font-bold">{value}</p>
    </div>
  );
}
