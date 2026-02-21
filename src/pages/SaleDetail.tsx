import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Download, RefreshCw, XCircle } from "lucide-react";
import { formatHUF, formatDate, formatKm, getStatusConfig, docTypeLabels, docStatusConfig, paymentMethodLabels, saleStatusConfig } from "@/lib/format";

export default function SaleDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sale, setSale] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    const [sRes, dRes] = await Promise.all([
      supabase.from("sales").select("*, vehicles(brand, model, year, mileage, license_plate), customers!sales_customer_id_fkey(full_name, company_name, entity_type, address, company_address)").eq("id", id).single(),
      supabase.from("documents").select("*").eq("sale_id", id).order("created_at"),
    ]);
    if (sRes.data) setSale(sRes.data);
    if (dRes.data) setDocuments(dRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleRegenerate = async () => {
    const webhookUrl = import.meta.env.VITE_MAKE_WEBHOOK_URL;
    if (!webhookUrl || !id) return;
    setRegenerating(true);
    try {
      await fetch(webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sale_id: id }) });
      toast({ title: "✅ Dokumentumok újragenerálása elindítva" });
    } catch { toast({ title: "Hiba", description: "Webhook hívás sikertelen", variant: "destructive" }); }
    setRegenerating(false);
  };

  const handleCancel = async () => {
    if (!id || !sale) return;
    await supabase.from("sales").update({ status: "cancelled" }).eq("id", id);
    await supabase.from("vehicles").update({ status: "available" }).eq("id", sale.vehicle_id);
    await supabase.from("vehicle_status_log").insert({
      vehicle_id: sale.vehicle_id, old_status: "sold", new_status: "available", changed_by: user?.id, note: "Értékesítés törölve",
    });
    toast({ title: "Értékesítés törölve" });
    fetchData();
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-48" /></div>;
  if (!sale) return <div className="text-center py-20"><p className="text-muted-foreground">Értékesítés nem található</p></div>;

  const customerName = sale.customers?.entity_type === "company" ? sale.customers?.company_name : sale.customers?.full_name;
  const sc = saleStatusConfig[sale.status || "draft"] || saleStatusConfig.draft;

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <Link to="/sales" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />Értékesítések
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Értékesítés részletei</h1>
        <Badge className={sc.className}>{sc.label}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Jármű</CardTitle></CardHeader>
          <CardContent>
            <p className="font-medium">{sale.vehicles?.brand} {sale.vehicles?.model}</p>
            <p className="text-sm text-muted-foreground">{sale.vehicles?.year} · {sale.vehicles?.license_plate}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Vevő</CardTitle></CardHeader>
          <CardContent>
            <p className="font-medium">{customerName}</p>
            <p className="text-sm text-muted-foreground">{sale.customers?.address || sale.customers?.company_address}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Tranzakció</CardTitle></CardHeader>
          <CardContent>
            <p className="font-semibold">{formatHUF(sale.sale_price)}</p>
            <p className="text-sm text-muted-foreground">{paymentMethodLabels[sale.payment_method] || sale.payment_method}</p>
            {sale.possession_date && <p className="text-sm text-muted-foreground">Birtokbavétel: {formatDate(sale.possession_date)}</p>}
          </CardContent>
        </Card>
      </div>

      {/* Documents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Dokumentumok</h2>
          <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={regenerating}>
            <RefreshCw className={`mr-2 h-4 w-4 ${regenerating ? "animate-spin" : ""}`} />Újragenerálás
          </Button>
        </div>
        {documents.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Nincs dokumentum</p>
        ) : (
          <div className="space-y-2">
            {documents.map(doc => {
              const dsc = docStatusConfig[doc.status || "pending"] || docStatusConfig.pending;
              return (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{docTypeLabels[doc.doc_type] || doc.doc_type}</p>
                    {doc.generated_at && <p className="text-xs text-muted-foreground">{formatDate(doc.generated_at)}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={dsc.className}>{dsc.label}</Badge>
                    <Button variant="ghost" size="icon" disabled={doc.status !== "generated" || !doc.file_url} onClick={() => window.open(doc.file_url, "_blank")}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {sale.status !== "cancelled" && (
        <Button variant="destructive" onClick={handleCancel}>
          <XCircle className="mr-2 h-4 w-4" />Értékesítés törlése
        </Button>
      )}
    </div>
  );
}
