ALTER TYPE shipment_status ADD VALUE IF NOT EXISTS 'out_for_delivery';
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS customs_hold boolean NOT NULL DEFAULT false;