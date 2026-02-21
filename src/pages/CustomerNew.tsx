import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import CustomerForm, { CustomerFormData } from "@/components/CustomerForm";

export default function CustomerNew() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CustomerFormData) => {
    if (!profile?.dealership_id) return;
    setLoading(true);
    const { data: customer, error } = await supabase.from("customers").insert({
      dealership_id: profile.dealership_id,
      entity_type: data.entity_type,
      full_name: data.full_name || null, birth_name: data.birth_name || null,
      birth_place: data.birth_place || null, birth_date: data.birth_date || null,
      mothers_name: data.mothers_name || null, id_type: data.id_type || null,
      id_number: data.id_number || null, address: data.address || null,
      nationality: data.nationality || "magyar",
      company_name: data.company_name || null, company_address: data.company_address || null,
      registration_number: data.registration_number || null,
      representative_name: data.representative_name || null,
      phone: data.phone || null, email: data.email || null, notes: data.notes || null,
    }).select("id").single();
    setLoading(false);
    if (error) { toast({ title: "Hiba", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Vevő mentve!" });
    navigate(`/customers/${customer!.id}`);
  };

  return (
    <div className="pb-20 lg:pb-0">
      <Link to="/customers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />Vevők
      </Link>
      <h1 className="text-2xl font-bold text-foreground mb-6">Új vevő hozzáadása</h1>
      <CustomerForm onSubmit={handleSubmit} submitLabel="Mentés" loading={loading} />
    </div>
  );
}
