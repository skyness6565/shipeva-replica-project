import { createServerFn } from "@tanstack/react-start";

export const trackPackage = createServerFn({ method: "POST" })
  .inputValidator((data: { trackingNumber: string }) => {
    const t = (data?.trackingNumber ?? "").trim();
    if (!t) throw new Error("Tracking number is required");
    if (t.length > 64) throw new Error("Tracking number too long");
    return { trackingNumber: t };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: pkg, error } = await supabaseAdmin
      .from("packages")
      .select(
        "id,tracking_number,reference_id,package_name,sender_name,receiver_name,origin_country,destination_country,current_location,status,shipment_method,package_type,weight,estimated_delivery_days,shipment_description,dispatch_date,expected_delivery_date,image_urls,created_at,updated_at",
      )
      .eq("tracking_number", data.trackingNumber)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!pkg) return { found: false as const };

    const { data: events } = await supabaseAdmin
      .from("tracking_events")
      .select("id,status,location,note,event_time")
      .eq("package_id", pkg.id)
      .order("event_time", { ascending: false });

    return { found: true as const, package: pkg, events: events ?? [] };
  });
