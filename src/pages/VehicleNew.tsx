import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import VehicleForm, { VehicleFormData } from "@/components/VehicleForm";

export default function VehicleNew() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [vehicleId, setVehicleId] = useState<string | null>(null);

  const handleSubmit = async (data: VehicleFormData) => {
    if (!profile?.dealership_id) return;
    setLoading(true);

    // If we already created the vehicle (for image upload), just update
    if (vehicleId) {
      const { error } = await supabase.from("vehicles").update({
        license_plate: data.license_plate || null, vin: data.vin || null, engine_number: data.engine_number || null,
        registration_doc_number: data.registration_doc_number || null, vehicle_log_number: data.vehicle_log_number || null,
        brand: data.brand, model: data.model, year: data.year ? parseInt(data.year) : null,
        color: data.color || null, fuel_type: data.fuel_type || null, condition: data.condition || "used",
        mileage: data.mileage ? parseInt(data.mileage) : null,
        purchase_price: data.purchase_price ? parseInt(data.purchase_price) : null,
        selling_price: data.selling_price ? parseInt(data.selling_price) : null,
        description: data.description || null, notes: data.notes || null,
      }).eq("id", vehicleId);
      setLoading(false);
      if (error) { toast({ title: "Hiba", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Jármű mentve!" });
      navigate(`/vehicles/${vehicleId}`);
      return vehicleId;
    }

    const { data: vehicle, error } = await supabase.from("vehicles").insert({
      dealership_id: profile.dealership_id,
      brand: data.brand, model: data.model,
      license_plate: data.license_plate || null, vin: data.vin || null, engine_number: data.engine_number || null,
      registration_doc_number: data.registration_doc_number || null, vehicle_log_number: data.vehicle_log_number || null,
      year: data.year ? parseInt(data.year) : null, color: data.color || null,
      fuel_type: data.fuel_type || null, condition: data.condition || "used",
      mileage: data.mileage ? parseInt(data.mileage) : null,
      purchase_price: data.purchase_price ? parseInt(data.purchase_price) : null,
      selling_price: data.selling_price ? parseInt(data.selling_price) : null,
      description: data.description || null, notes: data.notes || null,
    }).select("id").single();
    setLoading(false);
    if (error || !vehicle) { toast({ title: "Hiba", description: error?.message, variant: "destructive" }); return; }
    setVehicleId(vehicle.id);
    toast({ title: "Jármű mentve!", description: "Most feltölthet képeket is." });
    navigate(`/vehicles/${vehicle.id}`);
    return vehicle.id;
  };

  return (
    <div className="pb-20 lg:pb-0">
      <Link to="/vehicles" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />Készlet
      </Link>
      <h1 className="text-2xl font-bold text-foreground mb-6">Új jármű hozzáadása</h1>
      <VehicleForm vehicleId={vehicleId || undefined} onSubmit={handleSubmit} submitLabel="Mentés" loading={loading} />
    </div>
  );
}
