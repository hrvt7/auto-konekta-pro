import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit } from "lucide-react";
import { formatDate, formatHUF } from "@/lib/format";

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [customer, setCustomer] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      supabase.from("customers").select("*").eq("id", id).single(),
      supabase.from("sales").select("*, vehicles(brand, model), documents(id)").eq("customer_id", id).order("created_at", { ascending: false }),
    ]).then(([cRes, sRes]) => {
      if (cRes.data) setCustomer(cRes.data);
      if (sRes.data) setSales(sRes.data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;
  if (!customer) return <div className="text-center py-20"><p className="text-muted-foreground">Vevő nem található</p></div>;

  const isCompany = customer.entity_type === "company";
  const name = isCompany ? customer.company_name : customer.full_name;
  const InfoRow = ({ label, value }: { label: string; value: string | null | undefined }) => (
    value ? <div className="flex justify-between py-1.5 border-b border-border/50 last:border-0"><span className="text-sm text-muted-foreground">{label}</span><span className="text-sm font-medium">{value}</span></div> : null
  );

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <Link to="/customers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />Vevők
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{name}</h1>
          <Badge className={isCompany ? "bg-purple-100 text-purple-800 mt-1" : "bg-blue-100 text-blue-800 mt-1"}>
            {isCompany ? "Jogi személy" : "Magánszemély"}
          </Badge>
        </div>
        <Button variant="outline" asChild><Link to={`/customers/${id}/edit`}><Edit className="mr-2 h-4 w-4" />Szerkesztés</Link></Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Adatok</CardTitle></CardHeader>
        <CardContent>
          {isCompany ? (
            <>
              <InfoRow label="Cégnév" value={customer.company_name} />
              <InfoRow label="Székhely" value={customer.company_address} />
              <InfoRow label="Cégjegyzékszám" value={customer.registration_number} />
              <InfoRow label="Képviselő" value={customer.representative_name} />
            </>
          ) : (
            <>
              <InfoRow label="Teljes név" value={customer.full_name} />
              <InfoRow label="Születéskori név" value={customer.birth_name} />
              <InfoRow label="Születési hely" value={customer.birth_place} />
              <InfoRow label="Születési idő" value={formatDate(customer.birth_date)} />
              <InfoRow label="Anyja neve" value={customer.mothers_name} />
              <InfoRow label="Okmány típusa" value={customer.id_type} />
              <InfoRow label="Okmány száma" value={customer.id_number} />
              <InfoRow label="Lakcím" value={customer.address} />
              <InfoRow label="Állampolgárság" value={customer.nationality} />
            </>
          )}
          <InfoRow label="Telefon" value={customer.phone} />
          <InfoRow label="Email" value={customer.email} />
          {customer.notes && <div className="mt-4"><p className="text-sm text-muted-foreground mb-1">Megjegyzések</p><p className="text-sm">{customer.notes}</p></div>}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4">Vásárlási előzmények</h2>
        {sales.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Még nincs vásárlás</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jármű</TableHead>
                  <TableHead>Dátum</TableHead>
                  <TableHead>Vételár</TableHead>
                  <TableHead>Dokumentumok</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map(s => (
                  <TableRow key={s.id}>
                    <TableCell><Link to={`/sales/${s.id}`} className="text-accent hover:underline">{s.vehicles?.brand} {s.vehicles?.model}</Link></TableCell>
                    <TableCell>{formatDate(s.created_at)}</TableCell>
                    <TableCell>{formatHUF(s.sale_price)}</TableCell>
                    <TableCell>{s.documents?.length || 0} db</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
