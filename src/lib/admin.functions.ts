import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Ctx = { supabase: any; userId: string };

async function assertAdmin(context: Ctx) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
  return context.supabase;
}

function genTracking() {
  const rand = Array.from({ length: 9 }, () =>
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)],
  ).join("");
  return `SHX-${rand.slice(0, 3)}-${rand.slice(3, 9)}`;
}
function genRefId() {
  return `REF-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1e4)
    .toString()
    .padStart(4, "0")}`;
}

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      await assertAdmin(context as Ctx);
      return { isAdmin: true };
    } catch {
      return { isAdmin: false };
    }
  });

export const dashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdmin(context as Ctx);
    const counts = async (status?: string) => {
      const q = admin.from("packages").select("*", { count: "exact", head: true });
      if (status) q.eq("status", status as any);
      const { count } = await q;
      return count ?? 0;
    };
    const [total, pending, processing, transit, delivered, customers] = await Promise.all([
      counts(),
      counts("pending"),
      counts("processing"),
      counts("in_transit"),
      counts("delivered"),
      admin.from("customers").select("*", { count: "exact", head: true }).then((r: any) => r.count ?? 0),
    ]);
    const { data: recent } = await admin
      .from("tracking_events")
      .select("id,status,location,note,event_time,package_id,packages(tracking_number,package_name)")
      .order("event_time", { ascending: false })
      .limit(10);
    return {
      total,
      pending,
      processing,
      active: processing + transit,
      delivered,
      customers,
      recent: recent ?? [],
    };
  });

export const listPackages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { search?: string; status?: string } | undefined) => d ?? {})
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context as Ctx);
    let q = admin
      .from("packages")
      .select(
        "id,tracking_number,package_name,sender_name,receiver_name,origin_country,destination_country,status,shipment_method,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (data.status) q = q.eq("status", data.status as any);
    if (data.search) {
      const s = `%${data.search}%`;
      q = q.or(
        `tracking_number.ilike.${s},package_name.ilike.${s},sender_name.ilike.${s},receiver_name.ilike.${s},sender_email.ilike.${s},receiver_email.ilike.${s}`,
      );
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getPackage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context as Ctx);
    const { data: pkg, error } = await admin
      .from("packages")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!pkg) throw new Error("Not found");
    const { data: events } = await admin
      .from("tracking_events")
      .select("*")
      .eq("package_id", data.id)
      .order("event_time", { ascending: false });
    return { package: pkg, events: events ?? [] };
  });

const PKG_FIELDS = [
  "package_name","tracking_number","sender_name","sender_email",
  "receiver_name","receiver_email","origin_country","destination_country",
  "current_location","shipment_fee","currency","weight","package_type","shipment_method",
  "estimated_delivery_days","shipment_description","status","dispatch_date","expected_delivery_date",
  "image_urls","notes","customs_hold",
] as const;

function pickPkg(input: any) {
  const out: any = {};
  for (const k of PKG_FIELDS) if (input[k] !== undefined) out[k] = input[k];
  return out;
}

export const createPackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) => d ?? {})
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context as Ctx);
    const payload = pickPkg(data);
    if (!payload.package_name) throw new Error("Package name required");
    if (!payload.sender_name || !payload.receiver_name) throw new Error("Sender and receiver names required");
    if (!payload.origin_country || !payload.destination_country) throw new Error("Origin and destination required");
    if (!payload.tracking_number) payload.tracking_number = genTracking();
    const reference_id = genRefId();

    const { data: pkg, error } = await admin
      .from("packages")
      .insert({ ...payload, reference_id, created_by: context.userId })
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Upsert customers
    const ups: any[] = [];
    if (payload.sender_email)
      ups.push({ full_name: payload.sender_name, email: payload.sender_email });
    if (payload.receiver_email)
      ups.push({ full_name: payload.receiver_name, email: payload.receiver_email });
    if (ups.length) await admin.from("customers").upsert(ups, { onConflict: "email" });

    return pkg;
  });

export const updatePackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string } & Record<string, any>) => d)
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context as Ctx);
    const { id, ...rest } = data;
    const payload = pickPkg(rest);
    const { data: pkg, error } = await admin
      .from("packages")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return pkg;
  });

export const updateReceiptData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; receipt_data: Record<string, any> }) => d)
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context as Ctx);
    const { data: pkg, error } = await admin
      .from("packages")
      .update({ receipt_data: data.receipt_data })
      .eq("id", data.id)
      .select("id,receipt_data")
      .single();
    if (error) throw new Error(error.message);
    return pkg;
  });

export const deletePackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context as Ctx);
    const { error } = await admin.from("packages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addTrackingEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { package_id: string; status: string; location?: string; note?: string; event_time?: string }) => d,
  )
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context as Ctx);
    const { data: ev, error } = await admin
      .from("tracking_events")
      .insert({
        package_id: data.package_id,
        status: data.status as any,
        location: data.location ?? null,
        note: data.note ?? null,
        event_time: data.event_time ?? new Date().toISOString(),
        created_by: context.userId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    // sync package status + location
    await admin
      .from("packages")
      .update({ status: data.status as any, current_location: data.location ?? undefined })
      .eq("id", data.package_id);
    return ev;
  });

export const listCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { search?: string } | undefined) => d ?? {})
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context as Ctx);
    let q = admin.from("customers").select("*").order("created_at", { ascending: false }).limit(200);
    if (data.search) {
      const s = `%${data.search}%`;
      q = q.or(`full_name.ilike.${s},email.ilike.${s},phone.ilike.${s}`);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; full_name: string; email?: string; phone?: string; notes?: string }) => d)
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context as Ctx);
    if (data.id) {
      const { data: row, error } = await admin
        .from("customers")
        .update({ full_name: data.full_name, email: data.email, phone: data.phone, notes: data.notes })
        .eq("id", data.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return row;
    }
    const { data: row, error } = await admin
      .from("customers")
      .insert({ full_name: data.full_name, email: data.email, phone: data.phone, notes: data.notes })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context as Ctx);
    const { error } = await admin.from("customers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const signedUrlForUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { bucket: "package-images" | "package-documents"; path: string }) => d)
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context as Ctx);
    const { data: signed, error } = await admin.storage
      .from(data.bucket)
      .createSignedUploadUrl(data.path);
    if (error) throw new Error(error.message);
    const { data: read } = await admin.storage
      .from(data.bucket)
      .createSignedUrl(data.path, 60 * 60 * 24 * 365);
    return { upload: signed, readUrl: read?.signedUrl };
  });
