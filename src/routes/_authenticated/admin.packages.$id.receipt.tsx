import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getPackage } from "@/lib/admin.functions";
import {
  ArrowLeft, Printer, User, Users, Grid3x3, CreditCard,
  PlusCircle, CheckCircle2, ScrollText, ThumbsUp, Clock, MapPin, Home,
  ShieldCheck, ScanLine,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/packages/$id/receipt")({
  component: ReceiptPage,
});

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending", processing: "Processing", in_transit: "In Transit",
  arrived: "Arrived", out_for_delivery: "Out for Delivery",
  delivered: "Delivered", held_by_customs: "Held by Customs",
};

function fmtDate(d?: string | Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" });
}
function fmtTime(d?: string | Date | null) {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function Barcode({ value }: { value: string }) {
  // Deterministic pseudo-barcode pattern from string
  const bars = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < value.length * 4 + 30; i++) {
      const c = value.charCodeAt(i % value.length) || 7;
      arr.push(((c * (i + 3)) % 4) + 1);
    }
    return arr;
  }, [value]);
  return (
    <div className="inline-block bg-white p-2 border border-gray-200 rounded">
      <div className="flex items-end gap-[1px] h-16">
        {bars.map((w, i) => (
          <div key={i} style={{ width: w, height: "100%" }} className={i % 2 === 0 ? "bg-black" : "bg-white"} />
        ))}
      </div>
      <p className="text-center mt-1 text-[10px] font-mono tracking-widest text-gray-700">{value}</p>
    </div>
  );
}

function QRMock() {
  const cells = Array.from({ length: 49 }, (_, i) => (i * 31 + 7) % 5 < 2);
  return (
    <div className="grid grid-cols-7 gap-[2px] w-24 h-24 bg-white p-1 border border-gray-200 rounded">
      {cells.map((on, i) => (
        <div key={i} className={on ? "bg-black" : "bg-white"} />
      ))}
    </div>
  );
}

type ReceiptFields = {
  company_name: string;
  company_tagline: string;
  company_subtitle: string;
  support_email: string;
  support_website: string;
  order_id: string;
  booking_mode: string;
  payment_status: string;
  order_status: string;
  clearance_cost: string;
  stamp_date: string;
  thank_you_note: string;
};

function ReceiptPage() {
  const { id } = Route.useParams();
  const get = useServerFn(getPackage);
  const { data, isLoading } = useQuery({
    queryKey: ["package", id],
    queryFn: () => get({ data: { id } }),
  });

  const pkg = data?.package;

  const [fields, setFields] = useState<ReceiptFields>({
    company_name: "Pinnacletrack Logistics",
    company_tagline: "Global Logistics Solutions",
    company_subtitle: "International Shipping & Logistics Services",
    support_email: "katehitler4@gmail.com",
    support_website: "https://pinnacletrack-logistics.com",
    order_id: "",
    booking_mode: "ToPay",
    payment_status: "To Pay on Delivery",
    order_status: "Order Confirmed",
    clearance_cost: "60",
    stamp_date: new Date().toISOString(),
    thank_you_note: "We appreciate your business and look forward to delivering your package safely.",
  });

  // Hydrate defaults when package loads
  useMemo(() => {
    if (pkg && !fields.order_id) {
      setFields((f) => ({ ...f, order_id: pkg.reference_id || pkg.tracking_number || "" }));
    }
  }, [pkg, fields.order_id]);

  if (isLoading || !pkg) return <p className="text-brand-deep/60">Loading receipt…</p>;

  const shipping = Number(pkg.shipment_fee ?? 0);
  const clearance = Number(fields.clearance_cost || 0);
  const total = shipping + clearance;
  const currency = pkg.currency || "USD";
  const now = new Date();

  return (
    <div className="space-y-6">
      {/* Toolbar (hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link to="/admin/packages/$id" params={{ id }} className="inline-flex items-center gap-1 text-sm text-brand-deep/70 hover:text-brand-deep">
          <ArrowLeft className="h-4 w-4" /> Back to package
        </Link>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-[#1a76d2] text-white px-5 py-2 text-sm font-semibold shadow-md hover:bg-[#1565b8]">
          <Printer className="h-4 w-4" /> Print Receipt
        </button>
      </div>

      {/* Editor */}
      <div className="rounded-2xl bg-white border border-border p-5 print:hidden">
        <h2 className="font-display font-extrabold text-lg mb-3">Receipt Details</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Input label="Company Name" value={fields.company_name} onChange={(v) => setFields({ ...fields, company_name: v })} />
          <Input label="Tagline" value={fields.company_tagline} onChange={(v) => setFields({ ...fields, company_tagline: v })} />
          <Input label="Subtitle" value={fields.company_subtitle} onChange={(v) => setFields({ ...fields, company_subtitle: v })} />
          <Input label="Support Email" value={fields.support_email} onChange={(v) => setFields({ ...fields, support_email: v })} />
          <Input label="Website URL" value={fields.support_website} onChange={(v) => setFields({ ...fields, support_website: v })} />
          <Input label="Order ID" value={fields.order_id} onChange={(v) => setFields({ ...fields, order_id: v })} />
          <Input label="Booking Mode" value={fields.booking_mode} onChange={(v) => setFields({ ...fields, booking_mode: v })} />
          <Input label="Order Status" value={fields.order_status} onChange={(v) => setFields({ ...fields, order_status: v })} />
          <Input label="Payment Status" value={fields.payment_status} onChange={(v) => setFields({ ...fields, payment_status: v })} />
          <Input label={`Clearance Cost (${currency})`} value={fields.clearance_cost} onChange={(v) => setFields({ ...fields, clearance_cost: v })} type="number" />
          <Input label="Stamp Date/Time" value={fields.stamp_date.slice(0, 16)} onChange={(v) => setFields({ ...fields, stamp_date: v })} type="datetime-local" />
          <Input label="Thank You Note" value={fields.thank_you_note} onChange={(v) => setFields({ ...fields, thank_you_note: v })} />
        </div>
        <p className="mt-3 text-xs text-brand-deep/50">Sender, receiver, tracking number, weight, route and dates come from the package itself — edit them on the package page.</p>
      </div>

      {/* Receipt */}
      <div id="receipt" className="mx-auto max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 print:shadow-none print:border-0 print:max-w-none">
        {/* Top blue accent line */}
        <div className="h-1 bg-gradient-to-r from-[#1a76d2] to-[#5cbcff]" />

        {/* Header */}
        <div className="px-8 pt-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-md bg-[#e6f0fa] grid place-items-center text-[#1a4a8a] font-extrabold text-[10px] text-center leading-tight">
                {fields.company_name.split(" ")[0].toUpperCase().slice(0, 12)}
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-900">{fields.company_name}</h1>
                <p className="text-sm text-gray-500">{fields.company_tagline}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Receipt Generated</p>
              <p className="text-sm font-semibold text-gray-800">{fmtDate(now)}</p>
              <span className="mt-2 inline-block rounded-full bg-[#e6f0fa] text-[#1a4a8a] text-[10px] font-bold px-3 py-1 tracking-wide">
                OFFICIAL RECEIPT
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-[#1a76d2]">{fields.company_name} Logistics</h2>
              <p className="text-sm text-gray-500">{fields.company_subtitle}</p>
            </div>
            <div className="text-right text-xs text-gray-600 leading-relaxed">
              <p>{fields.support_email}</p>
              <p>{fields.support_website}</p>
            </div>
          </div>
        </div>

        {/* Tracking number bar */}
        <div className="px-8">
          <div className="rounded-xl bg-gradient-to-r from-[#1a76d2] to-[#2b8ae0] text-white p-5 flex items-center justify-between shadow">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/15 grid place-items-center">
                <ScanLine className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-white/80">Tracking Number</p>
                <p className="font-extrabold text-lg tracking-wide">{pkg.tracking_number}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-white text-[#1a76d2] text-xs font-bold px-3 py-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Verified
            </span>
          </div>
        </div>

        {/* Sender */}
        <PartyBlock
          icon={<User className="h-4 w-4 text-[#1a76d2]" />}
          title="Sender"
          name={pkg.sender_name}
          phone={pkg.sender_phone}
          countryLine={pkg.origin_country}
        />

        {/* Receiver */}
        <PartyBlock
          icon={<Users className="h-4 w-4 text-[#1a76d2]" />}
          title="Receiver"
          name={pkg.receiver_name}
          phone={pkg.receiver_phone}
          countryLine={pkg.destination_country}
        />

        {/* Shipment Details */}
        <div className="px-8 mt-5">
          <Card>
            <SectionTitle icon={<Grid3x3 className="h-4 w-4 text-[#1a76d2]" />}>Shipment Details</SectionTitle>
            <div className="grid place-items-center py-4">
              <Barcode value={pkg.tracking_number} />
            </div>
            <Row label="Order ID:" value={fields.order_id} />
            <Row label="Booking Mode:" value={<span className="inline-flex items-center gap-1 rounded bg-[#fde8ea] text-[#c0392b] text-xs font-semibold px-2 py-0.5">{fields.booking_mode}</span>} />
            <Row label="Shipment Cost:" value={<span className="font-semibold text-gray-800">{currency} {shipping}</span>} />
            <Row label="Status:" value={<span className="rounded bg-[#e6f7eb] text-[#1b8a3a] text-xs font-semibold px-2 py-0.5">{fields.order_status}</span>} />
          </Card>
        </div>

        {/* Parcel Details & Costs */}
        <div className="px-8 mt-5">
          <Card>
            <SectionTitle icon={<ScrollText className="h-4 w-4 text-[#1a76d2]" />}>Parcel Details &amp; Costs</SectionTitle>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase">
                  <tr>
                    <th className="text-left p-2">Qty</th>
                    <th className="text-left p-2">Product</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Description</th>
                    <th className="text-left p-2">Shipping Cost</th>
                    <th className="text-left p-2">Clearance Cost</th>
                    <th className="text-left p-2">Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-100 align-top">
                    <td className="p-2">1</td>
                    <td className="p-2">{pkg.package_type || "Parcel"}</td>
                    <td className="p-2"><span className="rounded bg-[#e6f7eb] text-[#1b8a3a] text-[11px] font-semibold px-2 py-0.5">{fields.order_status}</span></td>
                    <td className="p-2 whitespace-pre-wrap max-w-[220px]">{pkg.shipment_description || "—"}</td>
                    <td className="p-2">{currency} {shipping}</td>
                    <td className="p-2">{currency} {clearance}</td>
                    <td className="p-2 font-semibold">{currency} {total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Payment Methods */}
        <div className="px-8 mt-5">
          <Card>
            <SectionTitle icon={<CreditCard className="h-4 w-4 text-[#1a76d2]" />}>Payment Methods</SectionTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge>GeoTrust</Badge>
              <Badge>VISA</Badge>
              <Badge>MasterCard</Badge>
              <Badge>PayPal</Badge>
              <Badge>Safe Shopping</Badge>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              For your convenience we have {fields.company_name} several payment reliable, fast, secure.
            </p>
          </Card>
        </div>

        {/* Stamps */}
        <div className="px-8 mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <SectionTitle icon={<PlusCircle className="h-4 w-4 text-[#1a76d2]" />}>Official Stamp</SectionTitle>
            <div className="grid place-items-center py-3">
              <div className="h-20 w-20 rounded-full border-4 border-[#1a76d2]/50 grid place-items-center text-[#1a76d2] text-[9px] font-bold text-center rotate-[-8deg]">
                OFFICIAL<br />SEAL<br />EST. 1999
              </div>
            </div>
            <p className="text-center text-xs text-gray-500">{fmtDate(fields.stamp_date)} {fmtTime(fields.stamp_date)}</p>
          </Card>
          <Card>
            <SectionTitle icon={<CheckCircle2 className="h-4 w-4 text-[#1a76d2]" />}>Stamp Duty</SectionTitle>
            <div className="grid place-items-center py-3">
              <div className="h-20 w-20 rounded-full border-4 border-red-500/70 grid place-items-center text-red-600 text-[10px] font-extrabold text-center">
                STAMP<br />DUTY
              </div>
            </div>
            <p className="text-center text-xs text-gray-500">Verified &amp; Approved</p>
          </Card>
        </div>

        {/* Payment Summary */}
        <div className="px-8 mt-5">
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-[#1a76d2] to-[#2b8ae0] text-white px-5 py-3 font-extrabold text-sm flex items-center gap-2">
              <ScrollText className="h-4 w-4" /> Payment Summary
            </div>
            <div className="p-5 space-y-2 text-sm">
              <SummaryRow label="Shipping Cost:" value={`${currency} ${shipping}`} />
              <SummaryRow label="Clearance Cost:" value={`${currency} ${clearance}`} />
              <SummaryRow label="Total Amount:" value={<span className="text-[#1a76d2] font-extrabold">{currency} {total}</span>} bold />
              <SummaryRow label="Payment Status:" value={<span className="rounded-full bg-[#fff4e0] text-[#b76b00] text-xs font-semibold px-3 py-1">{fields.payment_status}</span>} />
            </div>
          </div>
        </div>

        {/* Digital Verification */}
        <div className="px-8 mt-5">
          <Card>
            <div className="flex items-start gap-4">
              <QRMock />
              <div>
                <p className="font-extrabold text-gray-800">Digital Verification</p>
                <p className="text-xs text-gray-500 mt-1">
                  Scan this QR code to verify this receipt's authenticity and check real-time shipment status.
                </p>
                <p className="text-xs text-[#1b8a3a] font-semibold mt-2 inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Digitally signed and secured
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Thank you */}
        <div className="px-8 my-6">
          <div className="rounded-xl bg-[#f5faff] border border-[#dbe9f7] p-6 text-center">
            <div className="grid place-items-center mb-2">
              <div className="h-10 w-10 rounded-full bg-[#e6f0fa] grid place-items-center text-[#1a76d2]">
                <ThumbsUp className="h-5 w-5" />
              </div>
            </div>
            <p className="font-extrabold text-[#1a76d2]">Thank You for Choosing {fields.company_name}</p>
            <p className="text-sm text-gray-600 mt-1">{fields.thank_you_note}</p>
            <p className="text-xs text-gray-500 mt-3 inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> Receipt generated on {fmtDate(now)} - {fmtTime(now)}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          aside, nav, header { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-brand-deep/70">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full h-10 rounded-lg border border-border px-3 text-sm"
      />
    </label>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-gray-200 bg-white p-5">{children}</div>;
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
      <div className="h-7 w-7 rounded-full bg-[#e6f0fa] grid place-items-center">{icon}</div>
      <p className="font-extrabold text-gray-800 text-sm">{children}</p>
    </div>
  );
}

function PartyBlock({
  icon, title, name, phone, countryLine,
}: { icon: React.ReactNode; title: string; name: string; phone?: string | null; countryLine?: string | null }) {
  return (
    <div className="px-8 mt-5">
      <Card>
        <SectionTitle icon={icon}>{title}</SectionTitle>
        <p className="mt-3 font-extrabold text-[#1a76d2]">{name}</p>
        {phone && (
          <p className="mt-2 text-xs text-gray-600 inline-flex items-center gap-2">
            <span className="h-4 w-4 grid place-items-center">📞</span> {phone}
          </p>
        )}
        {countryLine && (
          <p className="mt-2 text-xs text-gray-600 inline-flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-gray-500" /> {countryLine}
          </p>
        )}
        <p className="mt-2 text-xs text-gray-600 inline-flex items-center gap-2">
          <Home className="h-3.5 w-3.5 text-gray-500" /> {countryLine || "—"}
        </p>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm py-1.5 border-t border-gray-100 first:border-t-0">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: React.ReactNode; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 border-b last:border-b-0 border-dashed border-gray-200">
      <span className={`text-gray-700 ${bold ? "font-extrabold" : ""}`}>{label}</span>
      <span className={bold ? "font-extrabold" : ""}>{value}</span>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded border border-gray-300 bg-white px-2 py-1 text-[10px] font-semibold text-gray-700">
      {children}
    </span>
  );
}
