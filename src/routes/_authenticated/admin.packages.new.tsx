import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { createPackage, signedUrlForUpload } from "@/lib/admin.functions";
import { PackageForm, emptyPackage, type PackageFormValues } from "@/components/admin/PackageForm";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/packages/new")({
  component: NewPackage,
});

function NewPackage() {
  const navigate = useNavigate();
  const create = useServerFn(createPackage);
  const signed = useServerFn(signedUrlForUpload);
  const mut = useMutation({
    mutationFn: (values: PackageFormValues) => create({ data: values }),
    onSuccess: (pkg: any) => {
      toast.success("Package created");
      navigate({ to: "/admin/packages/$id", params: { id: pkg.id } });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to create"),
  });
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold">New Package</h1>
        <p className="text-sm text-brand-deep/60">Create a new shipment. Tracking number is auto-generated if left blank.</p>
      </div>
      <PackageForm
        initial={emptyPackage()}
        submitLabel="Create Package"
        busy={mut.isPending}
        onSubmit={(v) => mut.mutate(v)}
        signedUrl={(p) => signed({ data: p })}
      />
    </div>
  );
}
