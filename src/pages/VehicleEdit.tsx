import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import VehicleForm, { VehicleFormData } from "@/components/VehicleForm";

export default function VehicleEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<VehicleFormData | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase.from("vehicles").select("*").eq("id", id).single().then(({ data }) => {
      if (data) {
        setInitialData({
          license_plate: data.license_plate || "", vin: data.vin || "", engine_number: data.engine_number || "",
          registration_doc_number: data.registration_doc_number || "", vehicle_log_number: data.vehicle_log_number || "",
          brand: data.brand, model: data.model, year: data.year?.toString() || "", color: data.color || "",
          fuel_type: data.fuel_type || "", condition: data.condition || "used",
          mileage: data.mileage?.toString() || "", purchase_price: data.purchase_price?.toString() || "",
          selling_price: data.selling_price?.toString() || "", description: data.description || "", notes: data.notes || "",
        });
      }
      setFetching(false);
    });
  }, [id]);

  const handleSubmit = async (data: VehicleFormData) => {
    if (!id) return;
    setLoading(true);
    const { error } = await supabase.from("vehicles").update({
      license_plate: data.license_plate || null, vin: data.vin || null, engine_number: data.engine_number || null,
      registration_doc_number: data.registration_doc_number || null, vehicle_log_number: data.vehicle_log_number || null,
      brand: data.brand, model: data.model, year: data.year ? parseInt(data.year) : null,
      color: data.color || null, fuel_type: data.fuel_type || null, condition: data.condition || "used",
      mileage: data.mileage ? parseInt(data.mileage) : null,
      purchase_price: data.purchase_price ? parseInt(data.purchase_price) : null,
      selling_price: data.selling_price ? parseInt(data.selling_price) : null,
      description: data.description || null, notes: data.notes || null,
    }).eq("id", id);
    setLoading(false);
    if (error) { toast({ title: "Hiba", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Jármű frissítve!" });
    navigate(`/vehicles/${id}`);
    return id;
  };

  if (fetching) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;
  if (!initialData) return <div className="text-center py-20"><p className="text-muted-foreground">Jármű nem található</p></div>;

  return (
    <div className="pb-20 lg:pb-0">
      <Link to={`/vehicles/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />Vissza
      </Link>
      <h1 className="text-2xl font-bold text-foreground mb-6">Jármű szerkesztése</h1>
      <VehicleForm vehicleId={id} initialData={initialData} onSubmit={handleSubmit} submitLabel="Mentés" loading={loading} />
    </div>
  );
}
