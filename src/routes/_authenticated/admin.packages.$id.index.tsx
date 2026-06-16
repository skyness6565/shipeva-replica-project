import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  getPackage, updatePackage, deletePackage, addTrackingEvent, signedUrlForUpload,
} from "@/lib/admin.functions";
import { PackageForm, type PackageFormValues } from "@/components/admin/PackageForm";
import { toast } from "sonner";
import { Trash2, Plus, MapPin, Clock, ExternalLink, Receipt } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/packages/$id/")({
  component: EditPackage,
});

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending", processing: "Processing", in_transit: "In Transit",
  arrived: "Arrived", out_for_delivery: "Out for Delivery",
  delivered: "Delivered", held_by_customs: "Held by Customs",
};
const STATUSES = Object.entries(STATUS_LABEL);

function toForm(pkg: any): PackageFormValues {
  return {
    id: pkg.id,
    package_name: pkg.package_name ?? "",
    tracking_number: pkg.tracking_number ?? "",
    sender_name: pkg.sender_name ?? "", sender_email: pkg.sender_email ?? "",
    receiver_name: pkg.receiver_name ?? "", receiver_email: pkg.receiver_email ?? "",
    origin_country: pkg.origin_country ?? "", destination_country: pkg.destination_country ?? "",
    current_location: pkg.current_location ?? "",
    shipment_fee: String(pkg.shipment_fee ?? "0"), currency: pkg.currency ?? "USD",
    weight: pkg.weight != null ? String(pkg.weight) : "",
    package_type: pkg.package_type ?? "", shipment_method: pkg.shipment_method ?? "Air",
    estimated_delivery_days: pkg.estimated_delivery_days != null ? String(pkg.estimated_delivery_days) : "",
    shipment_description: pkg.shipment_description ?? "",
    status: pkg.status ?? "pending",
    dispatch_date: pkg.dispatch_date ?? "", expected_delivery_date: pkg.expected_delivery_date ?? "",
    image_urls: pkg.image_urls ?? [],
    notes: pkg.notes ?? "",
    customs_hold: pkg.customs_hold ?? false,
  };
}

function EditPackage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const get = useServerFn(getPackage);
  const update = useServerFn(updatePackage);
  const del = useServerFn(deletePackage);
  const addEv = useServerFn(addTrackingEvent);
  const signed = useServerFn(signedUrlForUpload);

  const { data, isLoading } = useQuery({
    queryKey: ["package", id],
    queryFn: () => get({ data: { id } }),
  });

  const upMut = useMutation({
    mutationFn: (v: PackageFormValues) => update({ data: { id, ...v } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["package", id] }); toast.success("Saved"); },
    onError: (e: any) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: () => del({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); navigate({ to: "/admin/packages" }); },
  });

  if (isLoading || !data) return <p className="text-brand-deep/60">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold">{data.package.package_name}</h1>
          <p className="text-sm text-brand-deep/60 font-mono">{data.package.tracking_number} · {data.package.reference_id}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/track/$trackingNumber" params={{ trackingNumber: data.package.tracking_number }}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold">
            <ExternalLink className="h-4 w-4" /> Public page
          </Link>
          <Link to="/admin/packages/$id/receipt" params={{ id }}
            className="inline-flex items-center gap-1 rounded-full bg-[#1a76d2] text-white px-4 py-2 text-sm font-semibold">
            <Receipt className="h-4 w-4" /> Receipt
          </Link>
          <button onClick={() => confirm("Delete this package?") && delMut.mutate()}
            className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>

      <TrackingHistoryPanel
        packageId={id}
        events={data.events}
        currentStatus={data.package.status}
        currentLocation={data.package.current_location}
        onAdd={async (payload) => {
          await addEv({ data: { package_id: id, ...payload } });
          qc.invalidateQueries({ queryKey: ["package", id] });
          toast.success("Update added");
        }}
        statuses={STATUSES}
      />

      <PackageForm
        initial={toForm(data.package)}
        submitLabel="Save Changes"
        busy={upMut.isPending}
        onSubmit={(v) => upMut.mutate(v)}
        signedUrl={(p) => signed({ data: p })}
      />
    </div>
  );
}

function TrackingHistoryPanel({
  events, onAdd, statuses, currentStatus, currentLocation,
}: {
  packageId: string; events: any[];
  onAdd: (p: { status: string; location?: string; note?: string }) => Promise<void>;
  statuses: [string, string][]; currentStatus: string; currentLocation: string | null;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [location, setLocation] = useState(currentLocation ?? "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="rounded-2xl bg-white border border-border p-6">
      <h2 className="font-display font-extrabold text-lg">Tracking History</h2>
      <form
        className="mt-4 grid gap-3 sm:grid-cols-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try { await onAdd({ status, location, note }); setNote(""); }
          finally { setBusy(false); }
        }}
      >
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="h-11 rounded-xl border border-border px-3 text-sm">
          {statuses.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location"
          className="h-11 rounded-xl border border-border px-3 text-sm" />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)"
          className="h-11 rounded-xl border border-border px-3 text-sm" />
        <button disabled={busy} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-amber-gradient text-brand-deep font-bold">
          <Plus className="h-4 w-4" /> Add Update
        </button>
      </form>

      <ol className="mt-6 space-y-3">
        {events.map((e) => (
          <li key={e.id} className="rounded-xl border border-border p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold">{STATUS_LABEL[e.status]}</p>
              <p className="text-xs text-brand-deep/40 inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {new Date(e.event_time).toLocaleString()}
              </p>
            </div>
            {e.location && (
              <p className="mt-1 text-xs text-brand-deep/60 inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {e.location}
              </p>
            )}
            {e.note && <p className="mt-1 text-sm text-brand-deep/70">{e.note}</p>}
          </li>
        ))}
        {events.length === 0 && <li className="text-sm text-brand-deep/50">No updates yet.</li>}
      </ol>
    </div>
  );
}
