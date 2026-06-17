import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, X, Upload, ShieldAlert } from "lucide-react";

export type PackageFormValues = {
  id?: string;
  package_name: string;
  tracking_number: string;
  sender_name: string; sender_email: string;
  receiver_name: string; receiver_email: string;
  origin_country: string; destination_country: string; current_location: string;
  shipment_fee: string; currency: string; weight: string;
  package_type: string; shipment_method: string;
  estimated_delivery_days: string; shipment_description: string;
  status: string;
  dispatch_date: string; expected_delivery_date: string;
  image_urls: string[];
  notes: string;
  customs_hold: boolean;
};

export function emptyPackage(): PackageFormValues {
  return {
    package_name: "", tracking_number: "",
    sender_name: "", sender_email: "",
    receiver_name: "", receiver_email: "",
    origin_country: "", destination_country: "", current_location: "",
    shipment_fee: "0", currency: "USD", weight: "",
    package_type: "", shipment_method: "Air",
    estimated_delivery_days: "", shipment_description: "",
    status: "pending", dispatch_date: "", expected_delivery_date: "",
    image_urls: [], notes: "", customs_hold: false,
  };
}

const CURRENCIES = ["USD", "EUR", "GBP", "NGN", "CAD", "AUD", "BTC", "ETH", "USDT"];
const METHODS = ["Air", "Sea", "Road"];
const STATUSES: [string, string][] = [
  ["pending", "Pending"],
  ["processing", "Processing"],
  ["in_transit", "In Transit"],
  ["transit", "Transit"],
  ["out_for_delivery", "Out for Delivery"],
  ["arrived", "Arrived"],
  ["delivered", "Delivered"],
];

type SignedFn = (p: { bucket: "package-images" | "package-documents"; path: string }) =>
  Promise<{ upload: { token: string; path: string }; readUrl?: string }>;

export function PackageForm({
  initial, onSubmit, submitLabel, busy, signedUrl,
}: {
  initial: PackageFormValues;
  onSubmit: (v: any) => void;
  submitLabel: string;
  busy: boolean;
  signedUrl: SignedFn;
}) {
  const [v, setV] = useState<PackageFormValues>(initial);
  const [uploadingImg, setUploadingImg] = useState(false);
  const set = (k: keyof PackageFormValues, val: any) => setV((s) => ({ ...s, [k]: val }));

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploadingImg(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const sig = await signedUrl({ bucket: "package-images", path });
        const { error } = await supabase.storage
          .from("package-images")
          .uploadToSignedUrl(sig.upload.path, sig.upload.token, file);
        if (error) throw error;
        if (sig.readUrl) newUrls.push(sig.readUrl);
      }
      set("image_urls", [...v.image_urls, ...newUrls]);
      toast.success("Uploaded");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploadingImg(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    // map "transit" alias to in_transit for the DB enum
    const status = v.status === "transit" ? "in_transit" : v.status;
    onSubmit({
      ...v,
      status,
      shipment_fee: v.shipment_fee ? Number(v.shipment_fee) : 0,
      weight: v.weight ? Number(v.weight) : null,
      estimated_delivery_days: v.estimated_delivery_days ? Number(v.estimated_delivery_days) : null,
      tracking_number: v.tracking_number || undefined,
      dispatch_date: v.dispatch_date || null,
      expected_delivery_date: v.expected_delivery_date || null,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <Section title="Package">
        <Input label="Tracking Number (auto if blank)" value={v.tracking_number} onChange={(x) => set("tracking_number", x)} />
        <Input label="Package Type" value={v.package_type} onChange={(x) => set("package_type", x)} />
        <Input label="Weight (kg)" type="number" value={v.weight} onChange={(x) => set("weight", x)} />
      </Section>

      <Section title="Sender">
        <Input label="Full Name *" value={v.sender_name} onChange={(x) => set("sender_name", x)} required />
        <Input label="Email" type="email" value={v.sender_email} onChange={(x) => set("sender_email", x)} />
      </Section>

      <Section title="Receiver">
        <Input label="Full Name *" value={v.receiver_name} onChange={(x) => set("receiver_name", x)} required />
        <Input label="Email" type="email" value={v.receiver_email} onChange={(x) => set("receiver_email", x)} />
      </Section>

      <Section title="Route & Logistics">
        <Input label="Origin Country *" value={v.origin_country} onChange={(x) => set("origin_country", x)} required />
        <Input label="Destination Country *" value={v.destination_country} onChange={(x) => set("destination_country", x)} required />
        <Input label="Current Location" value={v.current_location} onChange={(x) => set("current_location", x)} />
        <Select label="Shipment Method" value={v.shipment_method} onChange={(x) => set("shipment_method", x)} options={METHODS.map((m) => [m, m])} />
        <Input label="Estimated Delivery Days" type="number" value={v.estimated_delivery_days} onChange={(x) => set("estimated_delivery_days", x)} />
        <Select label="Status" value={v.status} onChange={(x) => set("status", x)} options={STATUSES} />
      </Section>

      <div className="rounded-2xl bg-white border border-border p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-brand-deep">Customs Hold</h3>
              <p className="text-xs text-brand-deep/60">
                When ON, the tracking page shows the package is held by customs.
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={v.customs_hold}
            onClick={() => set("customs_hold", !v.customs_hold)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition ${v.customs_hold ? "bg-amber-500" : "bg-gray-300"}`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${v.customs_hold ? "left-[22px]" : "left-0.5"}`}
            />
          </button>
        </div>
      </div>

      <Section title="Fees">
        <Input label="Shipment Fee" type="number" value={v.shipment_fee} onChange={(x) => set("shipment_fee", x)} />
        <Select label="Currency" value={v.currency} onChange={(x) => set("currency", x)} options={CURRENCIES.map((c) => [c, c])} />
      </Section>

      <Section title="Details" full>
        <Textarea label="Shipment Description" value={v.shipment_description} onChange={(x) => set("shipment_description", x)} />
      </Section>

      <div className="rounded-2xl bg-white border border-border p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold">Package Images</h3>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold">
            {uploadingImg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload
            <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => upload(e.target.files)} />
          </label>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {v.image_urls.map((u) => (
            <div key={u} className="relative">
              <img src={u} alt="" className="aspect-square w-full rounded-lg object-cover" />
              <button type="button" onClick={() => set("image_urls", v.image_urls.filter((x) => x !== u))}
                className="absolute -top-1.5 -right-1.5 grid h-6 w-6 place-items-center rounded-full bg-rose-600 text-white">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={busy}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-hero-gradient px-8 text-sm font-bold text-white disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Section({ title, children, full }: { title: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className="rounded-2xl bg-white border border-border p-5">
      <h3 className="font-display font-bold text-brand-deep">{title}</h3>
      <div className={`mt-4 grid gap-4 ${full ? "" : "sm:grid-cols-2 lg:grid-cols-3"}`}>{children}</div>
    </div>
  );
}
function Input({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-brand-deep/60">{label}</span>
      <input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-brand-glow" />
    </label>
  );
}
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-brand-deep/60">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-11 w-full rounded-xl border border-border bg-white px-3 text-sm">
        {options.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
      </select>
    </label>
  );
}
function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-brand-deep/60">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
        className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand-glow" />
    </label>
  );
}
