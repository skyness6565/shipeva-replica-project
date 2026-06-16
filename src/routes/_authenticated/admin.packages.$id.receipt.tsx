import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { getPackage, updateReceiptData } from "@/lib/admin.functions";
import { toast } from "sonner";
import {
  ArrowLeft, Printer, Download, Save, User, Users, Grid3x3, CreditCard,
  PlusCircle, CheckCircle2, ScrollText, ThumbsUp, Clock, MapPin, Home,
  ShieldCheck, ScanLine, Plus, Trash2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/packages/$id/receipt")({
  component: ReceiptPage,
});

type ParcelRow = {
  qty: string;
  product: string;
  status: string;
  description: string;
  shipping_cost: string;
  clearance_cost: string;
};

type ReceiptData = {
  company_name: string;
  company_tagline: string;
  company_subtitle: string;
  support_email: string;
  support_website: string;
  receipt_date: string; // ISO
  tracking_number: string;
  sender_name: string;
  sender_phone: string;
  sender_address: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  order_id: string;
  booking_mode: string;
  shipment_cost: string;
  currency: string;
  order_status: string;
  rows: ParcelRow[];
  payment_status: string;
  stamp_date: string;
  thank_you_note: string;
};

function defaultReceipt(pkg: any): ReceiptData {
  return {
    company_name: "Pinnacletrack Logistics",
    company_tagline: "Global Logistics Solutions",
    company_subtitle: "International Shipping & Logistics Services",
    support_email: "katehitler4@gmail.com",
    support_website: "https://pinnacletrack-logistics.com",
    receipt_date: new Date().toISOString(),
    tracking_number: pkg?.tracking_number ?? "",
    sender_name: pkg?.sender_name ?? "",
    sender_phone: pkg?.sender_phone ?? "",
    sender_address: pkg?.origin_country ?? "",
    receiver_name: pkg?.receiver_name ?? "",
    receiver_phone: pkg?.receiver_phone ?? "",
    receiver_address: pkg?.destination_country ?? "",
    order_id: pkg?.reference_id ?? pkg?.tracking_number ?? "",
    booking_mode: "ToPay",
    shipment_cost: String(pkg?.shipment_fee ?? "0"),
    currency: pkg?.currency ?? "USD",
    order_status: "Order Confirmed",
    rows: [
      {
        qty: "1",
        product: pkg?.package_type ?? "Parcel",
        status: "Order Confirmed",
        description: pkg?.shipment_description ?? "",
        shipping_cost: String(pkg?.shipment_fee ?? "0"),
        clearance_cost: "60",
      },
    ],
    payment_status: "To Pay on Delivery",
    stamp_date: new Date().toISOString(),
    thank_you_note: "We appreciate your business and look forward to delivering your package safely.",
  };
}

function fmtDate(d?: string | Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" });
}
function fmtTime(d?: string | Date | null) {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function Barcode({ value }: { value: string }) {
  const bars = useMemo(() => {
    const arr: number[] = [];
    const v = value || "0000";
    for (let i = 0; i < v.length * 4 + 30; i++) {
      const c = v.charCodeAt(i % v.length) || 7;
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

function ReceiptPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const get = useServerFn(getPackage);
  const save = useServerFn(updateReceiptData);

  const { data, isLoading } = useQuery({
    queryKey: ["package", id],
    queryFn: () => get({ data: { id } }),
  });

  const pkg = data?.package;
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [pdfing, setPdfing] = useState(false);
  const [diag, setDiag] = useState<string[]>([]);
  const log = (m: string) => setDiag((d) => [...d, `[${new Date().toLocaleTimeString()}] ${m}`]);

  function runPrintDiagnostics() {
    setDiag([]);
    log("Starting Print diagnostics…");
    log(`Receipt DOM present: ${receiptRef.current ? "yes" : "no"}`);
    log(`window.print available: ${typeof window.print === "function" ? "yes" : "no"}`);
    let testWin: Window | null = null;
    try {
      testWin = window.open("", "_blank", "width=400,height=300");
    } catch (e: any) {
      log(`window.open threw: ${e?.message ?? e}`);
    }
    if (!testWin) {
      log("❌ Popup BLOCKED by browser/iframe. Allow popups for this site.");
      return;
    }
    log("✅ Popup opened successfully.");
    try {
      testWin.document.write("<p>Print diagnostic test — closing in 1s</p>");
      testWin.document.close();
      log("✅ Wrote test content to popup.");
      try {
        testWin.print();
        log("✅ window.print() invoked on popup (dialog should appear).");
      } catch (e: any) {
        log(`❌ window.print() threw: ${e?.message ?? e}`);
      }
      setTimeout(() => { try { testWin!.close(); } catch {} }, 1000);
    } catch (e: any) {
      log(`❌ Failed writing to popup: ${e?.message ?? e}`);
    }
  }

  // Hydrate state once package loads
  useEffect(() => {
    if (!pkg || receipt) return;
    setReceipt((pkg.receipt_data as ReceiptData | null) ?? defaultReceipt(pkg));
  }, [pkg, receipt]);

  const saveMut = useMutation({
    mutationFn: (r: ReceiptData) => save({ data: { id, receipt_data: r } }),
    onSuccess: () => {
      toast.success("Receipt saved");
      qc.invalidateQueries({ queryKey: ["package", id] });
    },
    onError: (e: any) => toast.error(e.message ?? "Save failed"),
  });

  async function downloadPdf() {
    if (!receiptRef.current) return;
    setPdfing(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(receiptRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = canvas.height / canvas.width;
      const imgWidth = pageWidth;
      const imgHeight = imgWidth * ratio;
      let position = 0;
      let remaining = imgHeight;
      // Slice tall canvases across multiple A4 pages
      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      } else {
        while (remaining > 0) {
          pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
          remaining -= pageHeight;
          if (remaining > 0) {
            position -= pageHeight;
            pdf.addPage();
          }
        }
      }
      pdf.save(`receipt-${receipt?.tracking_number || id}.pdf`);
    } catch (e: any) {
      toast.error(e.message ?? "PDF generation failed");
    } finally {
      setPdfing(false);
    }
  }

  function printReceipt() {
    if (!receiptRef.current) {
      toast.error("Receipt not ready yet");
      return;
    }
    try {
      const html = receiptRef.current.outerHTML;
      // Collect current page styles (Tailwind + app CSS) so the popup looks identical.
      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map((n) => n.outerHTML)
        .join("\n");
      const win = window.open("", "_blank", "width=900,height=1200");
      if (!win) {
        toast.error("Popup blocked. Allow popups for this site, then try again.");
        return;
      }
      win.document.open();
      win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Receipt ${r.tracking_number}</title>${styles}
        <style>
          @page { size: A4; margin: 10mm; }
          html, body { background: #fff; margin: 0; padding: 16px; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          #receipt { box-shadow: none !important; border: 0 !important; max-width: 100% !important; }
        </style>
      </head><body>${html}</body></html>`);
      win.document.close();
      const trigger = () => {
        win.focus();
        win.print();
        // Close shortly after print dialog dismissed
        setTimeout(() => { try { win.close(); } catch {} }, 500);
      };
      // Wait for fonts/styles to apply
      if (win.document.readyState === "complete") setTimeout(trigger, 300);
      else win.addEventListener("load", () => setTimeout(trigger, 300));
    } catch (e: any) {
      toast.error(e?.message ?? "Print failed");
    }
  }

  if (isLoading || !pkg || !receipt) return <p className="text-brand-deep/60">Loading receipt…</p>;

  const r = receipt;
  const update = (patch: Partial<ReceiptData>) => setReceipt({ ...r, ...patch });
  const updateRow = (i: number, patch: Partial<ParcelRow>) =>
    setReceipt({ ...r, rows: r.rows.map((row, idx) => (idx === i ? { ...row, ...patch } : row)) });
  const addRow = () =>
    setReceipt({
      ...r,
      rows: [...r.rows, { qty: "1", product: "Parcel", status: r.order_status, description: "", shipping_cost: "0", clearance_cost: "0" }],
    });
  const removeRow = (i: number) =>
    setReceipt({ ...r, rows: r.rows.filter((_, idx) => idx !== i) });

  const totalShipping = r.rows.reduce((s, x) => s + (Number(x.shipping_cost) || 0), 0);
  const totalClearance = r.rows.reduce((s, x) => s + (Number(x.clearance_cost) || 0), 0);
  const grandTotal = totalShipping + totalClearance;

  return (
    <div className="space-y-6">
      {/* Toolbar (hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link to="/admin/packages/$id" params={{ id }} className="inline-flex items-center gap-1 text-sm text-brand-deep/70 hover:text-brand-deep">
          <ArrowLeft className="h-4 w-4" /> Back to package
        </Link>
        <div className="flex flex-wrap gap-2">
          <button
            disabled={saveMut.isPending}
            onClick={() => saveMut.mutate(r)}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white px-5 py-2 text-sm font-semibold shadow-md hover:bg-emerald-700 disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> {saveMut.isPending ? "Saving…" : "Save Receipt"}
          </button>
          <button
            disabled={pdfing}
            onClick={downloadPdf}
            className="inline-flex items-center gap-2 rounded-full bg-[#1a76d2] text-white px-5 py-2 text-sm font-semibold shadow-md hover:bg-[#1565b8] disabled:opacity-60"
          >
            <Download className="h-4 w-4" /> {pdfing ? "Generating…" : "Download PDF"}
          </button>
          <button onClick={printReceipt} className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-2 text-sm font-semibold">
            <Printer className="h-4 w-4" /> Print
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="rounded-2xl bg-white border border-border p-5 print:hidden space-y-5">
        <Group title="Branding">
          <Input label="Company Name" value={r.company_name} onChange={(v) => update({ company_name: v })} />
          <Input label="Tagline" value={r.company_tagline} onChange={(v) => update({ company_tagline: v })} />
          <Input label="Subtitle" value={r.company_subtitle} onChange={(v) => update({ company_subtitle: v })} />
          <Input label="Support Email" value={r.support_email} onChange={(v) => update({ support_email: v })} />
          <Input label="Website URL" value={r.support_website} onChange={(v) => update({ support_website: v })} />
          <Input label="Receipt Date" type="datetime-local" value={r.receipt_date.slice(0, 16)} onChange={(v) => update({ receipt_date: v })} />
        </Group>

        <Group title="Tracking">
          <Input label="Tracking Number" value={r.tracking_number} onChange={(v) => update({ tracking_number: v })} />
          <Input label="Order ID" value={r.order_id} onChange={(v) => update({ order_id: v })} />
          <Input label="Booking Mode" value={r.booking_mode} onChange={(v) => update({ booking_mode: v })} />
          <Input label="Order Status" value={r.order_status} onChange={(v) => update({ order_status: v })} />
          <Input label="Shipment Cost" type="number" value={r.shipment_cost} onChange={(v) => update({ shipment_cost: v })} />
          <Input label="Currency" value={r.currency} onChange={(v) => update({ currency: v })} />
        </Group>

        <Group title="Sender">
          <Input label="Name" value={r.sender_name} onChange={(v) => update({ sender_name: v })} />
          <Input label="Phone" value={r.sender_phone} onChange={(v) => update({ sender_phone: v })} />
          <Input label="Address" value={r.sender_address} onChange={(v) => update({ sender_address: v })} wide />
        </Group>

        <Group title="Receiver">
          <Input label="Name" value={r.receiver_name} onChange={(v) => update({ receiver_name: v })} />
          <Input label="Phone" value={r.receiver_phone} onChange={(v) => update({ receiver_phone: v })} />
          <Input label="Address" value={r.receiver_address} onChange={(v) => update({ receiver_address: v })} wide />
        </Group>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-extrabold text-brand-deep text-sm">Parcel Rows</h3>
            <button type="button" onClick={addRow} className="inline-flex items-center gap-1 text-xs font-semibold text-[#1a76d2]">
              <Plus className="h-3.5 w-3.5" /> Add row
            </button>
          </div>
          <div className="space-y-3">
            {r.rows.map((row, i) => (
              <div key={i} className="rounded-xl border border-border p-3 grid gap-2 sm:grid-cols-6">
                <Input label="Qty" value={row.qty} onChange={(v) => updateRow(i, { qty: v })} />
                <Input label="Product" value={row.product} onChange={(v) => updateRow(i, { product: v })} />
                <Input label="Status" value={row.status} onChange={(v) => updateRow(i, { status: v })} />
                <Input label="Shipping" type="number" value={row.shipping_cost} onChange={(v) => updateRow(i, { shipping_cost: v })} />
                <Input label="Clearance" type="number" value={row.clearance_cost} onChange={(v) => updateRow(i, { clearance_cost: v })} />
                <div className="flex items-end">
                  <button type="button" onClick={() => removeRow(i)} className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
                <div className="sm:col-span-6">
                  <Input label="Description" value={row.description} onChange={(v) => updateRow(i, { description: v })} wide />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Group title="Payment & Stamps">
          <Input label="Payment Status" value={r.payment_status} onChange={(v) => update({ payment_status: v })} />
          <Input label="Stamp Date" type="datetime-local" value={r.stamp_date.slice(0, 16)} onChange={(v) => update({ stamp_date: v })} />
          <Input label="Thank You Note" value={r.thank_you_note} onChange={(v) => update({ thank_you_note: v })} wide />
        </Group>
      </div>

      {/* Receipt preview */}
      <div
        ref={receiptRef}
        id="receipt"
        className="mx-auto max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 print:shadow-none print:border-0 print:max-w-none"
      >
        <div className="h-1 bg-gradient-to-r from-[#1a76d2] to-[#5cbcff]" />

        {/* Header */}
        <div className="px-8 pt-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-md bg-[#e6f0fa] grid place-items-center text-[#1a4a8a] font-extrabold text-[10px] text-center leading-tight">
                {(r.company_name.split(" ")[0] || "").toUpperCase().slice(0, 12)}
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-900">{r.company_name}</h1>
                <p className="text-sm text-gray-500">{r.company_tagline}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Receipt Generated</p>
              <p className="text-sm font-semibold text-gray-800">{fmtDate(r.receipt_date)}</p>
              <span className="mt-2 inline-block rounded-full bg-[#e6f0fa] text-[#1a4a8a] text-[10px] font-bold px-3 py-1 tracking-wide">
                OFFICIAL RECEIPT
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-[#1a76d2]">{r.company_name} Logistics</h2>
              <p className="text-sm text-gray-500">{r.company_subtitle}</p>
            </div>
            <div className="text-right text-xs text-gray-600 leading-relaxed">
              <p>{r.support_email}</p>
              <p>{r.support_website}</p>
            </div>
          </div>
        </div>

        {/* Tracking */}
        <div className="px-8">
          <div className="rounded-xl bg-gradient-to-r from-[#1a76d2] to-[#2b8ae0] text-white p-5 flex items-center justify-between shadow">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/15 grid place-items-center">
                <ScanLine className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-white/80">Tracking Number</p>
                <p className="font-extrabold text-lg tracking-wide">{r.tracking_number}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-white text-[#1a76d2] text-xs font-bold px-3 py-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Verified
            </span>
          </div>
        </div>

        <PartyBlock icon={<User className="h-4 w-4 text-[#1a76d2]" />} title="Sender" name={r.sender_name} phone={r.sender_phone} address={r.sender_address} />
        <PartyBlock icon={<Users className="h-4 w-4 text-[#1a76d2]" />} title="Receiver" name={r.receiver_name} phone={r.receiver_phone} address={r.receiver_address} />

        {/* Shipment Details */}
        <div className="px-8 mt-5">
          <Card>
            <SectionTitle icon={<Grid3x3 className="h-4 w-4 text-[#1a76d2]" />}>Shipment Details</SectionTitle>
            <div className="grid place-items-center py-4">
              <Barcode value={r.tracking_number} />
            </div>
            <Row label="Order ID:" value={r.order_id} />
            <Row label="Booking Mode:" value={<span className="inline-flex items-center gap-1 rounded bg-[#fde8ea] text-[#c0392b] text-xs font-semibold px-2 py-0.5">{r.booking_mode}</span>} />
            <Row label="Shipment Cost:" value={<span className="font-semibold text-gray-800">{r.currency} {r.shipment_cost}</span>} />
            <Row label="Status:" value={<span className="rounded bg-[#e6f7eb] text-[#1b8a3a] text-xs font-semibold px-2 py-0.5">{r.order_status}</span>} />
          </Card>
        </div>

        {/* Parcel rows */}
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
                    <th className="text-left p-2">Shipping</th>
                    <th className="text-left p-2">Clearance</th>
                    <th className="text-left p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {r.rows.map((row, i) => {
                    const t = (Number(row.shipping_cost) || 0) + (Number(row.clearance_cost) || 0);
                    return (
                      <tr key={i} className="border-t border-gray-100 align-top">
                        <td className="p-2">{row.qty}</td>
                        <td className="p-2">{row.product}</td>
                        <td className="p-2"><span className="rounded bg-[#e6f7eb] text-[#1b8a3a] text-[11px] font-semibold px-2 py-0.5">{row.status}</span></td>
                        <td className="p-2 whitespace-pre-wrap max-w-[220px]">{row.description || "—"}</td>
                        <td className="p-2">{r.currency} {row.shipping_cost}</td>
                        <td className="p-2">{r.currency} {row.clearance_cost}</td>
                        <td className="p-2 font-semibold">{r.currency} {t}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Payment methods */}
        <div className="px-8 mt-5">
          <Card>
            <SectionTitle icon={<CreditCard className="h-4 w-4 text-[#1a76d2]" />}>Payment Methods</SectionTitle>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge>GeoTrust</Badge>
              <Badge>VISA</Badge>
              <Badge>MasterCard</Badge>
              <Badge>PayPal</Badge>
              <Badge>Safe Shopping</Badge>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              For your convenience we have {r.company_name} several payment reliable, fast, secure.
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
            <p className="text-center text-xs text-gray-500">{fmtDate(r.stamp_date)} {fmtTime(r.stamp_date)}</p>
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
              <SummaryRow label="Shipping Cost:" value={`${r.currency} ${totalShipping}`} />
              <SummaryRow label="Clearance Cost:" value={`${r.currency} ${totalClearance}`} />
              <SummaryRow label="Total Amount:" value={<span className="text-[#1a76d2] font-extrabold">{r.currency} {grandTotal}</span>} bold />
              <SummaryRow label="Payment Status:" value={<span className="rounded-full bg-[#fff4e0] text-[#b76b00] text-xs font-semibold px-3 py-1">{r.payment_status}</span>} />
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
            <p className="font-extrabold text-[#1a76d2]">Thank You for Choosing {r.company_name}</p>
            <p className="text-sm text-gray-600 mt-1">{r.thank_you_note}</p>
            <p className="text-xs text-gray-500 mt-3 inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> Receipt generated on {fmtDate(r.receipt_date)} - {fmtTime(r.receipt_date)}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          html, body { background: white !important; }
          aside, nav, header, .print\\:hidden { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
          #receipt { box-shadow: none !important; border: 0 !important; max-width: 100% !important; }
        }
      `}</style>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-extrabold text-brand-deep text-sm mb-2">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", wide }: { label: string; value: string; onChange: (v: string) => void; type?: string; wide?: boolean }) {
  return (
    <label className={`block ${wide ? "sm:col-span-2 lg:col-span-3" : ""}`}>
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
  icon, title, name, phone, address,
}: { icon: React.ReactNode; title: string; name: string; phone?: string | null; address?: string | null }) {
  return (
    <div className="px-8 mt-5">
      <Card>
        <SectionTitle icon={icon}>{title}</SectionTitle>
        <p className="mt-3 font-extrabold text-[#1a76d2]">{name || "—"}</p>
        {phone && (
          <p className="mt-2 text-xs text-gray-600 inline-flex items-center gap-2">
            <span className="h-4 w-4 grid place-items-center">📞</span> {phone}
          </p>
        )}
        {address && (
          <p className="mt-2 text-xs text-gray-600 inline-flex items-start gap-2">
            <MapPin className="h-3.5 w-3.5 text-gray-500 mt-0.5" /> <span className="whitespace-pre-wrap">{address}</span>
          </p>
        )}
        <p className="mt-2 text-xs text-gray-600 inline-flex items-center gap-2">
          <Home className="h-3.5 w-3.5 text-gray-500" /> {address || "—"}
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
