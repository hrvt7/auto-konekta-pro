import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import CustomerForm, { CustomerFormData } from "@/components/CustomerForm";

export default function CustomerEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<CustomerFormData | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase.from("customers").select("*").eq("id", id).single().then(({ data }) => {
      if (data) {
        setInitialData({
          entity_type: data.entity_type || "individual",
          full_name: data.full_name || "", birth_name: data.birth_name || "",
          birth_place: data.birth_place || "", birth_date: data.birth_date || "",
          mothers_name: data.mothers_name || "", id_type: data.id_type || "Személyigazolvány",
          id_number: data.id_number || "", address: data.address || "",
          nationality: data.nationality || "magyar",
          company_name: data.company_name || "", company_address: data.company_address || "",
          registration_number: data.registration_number || "",
          representative_name: data.representative_name || "",
          phone: data.phone || "", email: data.email || "", notes: data.notes || "",
        });
      }
      setFetching(false);
    });
  }, [id]);

  const handleSubmit = async (data: CustomerFormData) => {
    if (!id) return;
    setLoading(true);
    const { error } = await supabase.from("customers").update({
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
    }).eq("id", id);
    setLoading(false);
    if (error) { toast({ title: "Hiba", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Vevő frissítve!" });
    navigate(`/customers/${id}`);
  };

  if (fetching) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;
  if (!initialData) return <div className="text-center py-20"><p className="text-muted-foreground">Vevő nem található</p></div>;

  return (
    <div className="pb-20 lg:pb-0">
      <Link to={`/customers/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />Vissza
      </Link>
      <h1 className="text-2xl font-bold text-foreground mb-6">Vevő szerkesztése</h1>
      <CustomerForm initialData={initialData} onSubmit={handleSubmit} submitLabel="Mentés" loading={loading} />
    </div>
  );
}
