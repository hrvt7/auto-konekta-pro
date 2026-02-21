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
import { FileText, Download } from "lucide-react";
import { formatDate, docTypeLabels, docStatusConfig } from "@/lib/format";

export default function Documents() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    if (!profile?.dealership_id) return;
    setLoading(true);
    let q = supabase.from("documents")
      .select("*, vehicles(brand, model), sales(customers(full_name, company_name, entity_type))")
      .eq("dealership_id", profile.dealership_id)
      .order("created_at", { ascending: false });
    if (typeFilter !== "all") q = q.eq("doc_type", typeFilter);
    if (dateFrom) q = q.gte("created_at", dateFrom);
    if (dateTo) q = q.lte("created_at", dateTo + "T23:59:59");
    q.then(({ data, error }) => {
      if (error) toast({ title: "Hiba", description: error.message, variant: "destructive" });
      else setDocuments(data || []);
      setLoading(false);
    });
  }, [profile?.dealership_id, typeFilter, dateFrom, dateTo]);

  const getCustomerName = (d: any) => {
    const c = d.sales?.customers;
    if (!c) return "–";
    return c.entity_type === "company" ? c.company_name : c.full_name;
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold text-foreground">Dokumentumok</h1>

      <div className="flex flex-wrap items-end gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Dokumentum típus" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Összes típus</SelectItem>
            {Object.entries(docTypeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-40" />
        <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-40" />
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}</div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium">Még nincs generált dokumentum</h3>
          <p className="text-sm text-muted-foreground mt-1">Dokumentumok az értékesítési folyamat során keletkeznek</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dokumentum típus</TableHead>
                <TableHead>Autó</TableHead>
                <TableHead>Vevő</TableHead>
                <TableHead>Generálva</TableHead>
                <TableHead>Státusz</TableHead>
                <TableHead>Letöltés</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map(d => {
                const dsc = docStatusConfig[d.status || "pending"] || docStatusConfig.pending;
                return (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{docTypeLabels[d.doc_type] || d.doc_type}</TableCell>
                    <TableCell>{d.vehicles ? `${d.vehicles.brand} ${d.vehicles.model}` : "–"}</TableCell>
                    <TableCell>{getCustomerName(d)}</TableCell>
                    <TableCell>{d.generated_at ? formatDate(d.generated_at) : "–"}</TableCell>
                    <TableCell><Badge className={dsc.className}>{dsc.label}</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" disabled={d.status !== "generated" || !d.file_url} onClick={() => window.open(d.file_url, "_blank")}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
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
