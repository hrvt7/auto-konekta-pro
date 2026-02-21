import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, ClipboardList, FileText } from "lucide-react";
import { formatDate, formatHUF, saleStatusConfig } from "@/lib/format";

export default function Sales() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    if (!profile?.dealership_id) return;
    setLoading(true);
    let q = supabase.from("sales")
      .select("*, vehicles(brand, model), customers(full_name, company_name, entity_type), documents(id)")
      .eq("dealership_id", profile.dealership_id)
      .order("created_at", { ascending: false });
    if (statusFilter !== "all") q = q.eq("status", statusFilter);
    if (dateFrom) q = q.gte("created_at", dateFrom);
    if (dateTo) q = q.lte("created_at", dateTo + "T23:59:59");
    q.then(({ data, error }) => {
      if (error) toast({ title: "Hiba", description: error.message, variant: "destructive" });
      else setSales(data || []);
      setLoading(false);
    });
  }, [profile?.dealership_id, statusFilter, dateFrom, dateTo]);

  const getCustomerName = (s: any) => s.customers?.entity_type === "company" ? s.customers?.company_name : s.customers?.full_name;

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Értékesítések</h1>
        <Button asChild><Link to="/sales/new"><Plus className="mr-2 h-4 w-4" />Új értékesítés</Link></Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Összes státusz</SelectItem>
            <SelectItem value="draft">Vázlat</SelectItem>
            <SelectItem value="completed">Befejezett</SelectItem>
            <SelectItem value="cancelled">Törölt</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-40" />
        <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-40" />
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}</div>
      ) : sales.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ClipboardList className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium">Még nincs értékesítés</h3>
          <Button className="mt-4" asChild><Link to="/sales/new">Új értékesítés</Link></Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Autó</TableHead>
                <TableHead>Vevő</TableHead>
                <TableHead>Vételár</TableHead>
                <TableHead>Dátum</TableHead>
                <TableHead>Státusz</TableHead>
                <TableHead>Dok.</TableHead>
                <TableHead>Műveletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map(s => {
                const sc = saleStatusConfig[s.status || "draft"] || saleStatusConfig.draft;
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.vehicles?.brand} {s.vehicles?.model}</TableCell>
                    <TableCell>{getCustomerName(s) || "–"}</TableCell>
                    <TableCell>{formatHUF(s.sale_price)}</TableCell>
                    <TableCell>{formatDate(s.created_at)}</TableCell>
                    <TableCell><Badge className={sc.className}>{sc.label}</Badge></TableCell>
                    <TableCell><span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" />{s.documents?.length || 0}</span></TableCell>
                    <TableCell><Button variant="ghost" size="sm" asChild><Link to={`/sales/${s.id}`}>Részletek</Link></Button></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
