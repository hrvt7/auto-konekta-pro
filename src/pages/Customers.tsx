import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Users, Search } from "lucide-react";
import { formatDate } from "@/lib/format";

export default function Customers() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!profile?.dealership_id) return;
    setLoading(true);
    let q = supabase.from("customers").select("*, sales(id)").eq("dealership_id", profile.dealership_id).order("created_at", { ascending: false });
    if (search) q = q.or(`full_name.ilike.%${search}%,company_name.ilike.%${search}%`);
    q.then(({ data, error }) => {
      if (error) toast({ title: "Hiba", description: error.message, variant: "destructive" });
      else setCustomers(data || []);
      setLoading(false);
    });
  }, [profile?.dealership_id, search]);

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Vevők</h1>
        <Button asChild><Link to="/customers/new"><Plus className="mr-2 h-4 w-4" />Új vevő hozzáadása</Link></Button>
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Név keresése..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}</div>
      ) : customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium">Még nincs vevő rögzítve</h3>
          <p className="text-sm text-muted-foreground mt-1">Adja hozzá első vevőjét</p>
          <Button className="mt-4" asChild><Link to="/customers/new">Új vevő hozzáadása</Link></Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Név</TableHead>
                <TableHead>Típus</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vásárlások</TableHead>
                <TableHead>Regisztrálva</TableHead>
                <TableHead>Műveletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.entity_type === "company" ? c.company_name : c.full_name}</TableCell>
                  <TableCell>
                    <Badge className={c.entity_type === "company" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}>
                      {c.entity_type === "company" ? "Jogi személy" : "Magánszemély"}
                    </Badge>
                  </TableCell>
                  <TableCell>{c.phone || "–"}</TableCell>
                  <TableCell>{c.email || "–"}</TableCell>
                  <TableCell>{c.sales?.length || 0}</TableCell>
                  <TableCell>{formatDate(c.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" asChild><Link to={`/customers/${c.id}`}>Részletek</Link></Button>
                      <Button variant="ghost" size="sm" asChild><Link to={`/customers/${c.id}/edit`}>Szerkesztés</Link></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
