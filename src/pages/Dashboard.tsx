import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Car, Users, ShoppingCart, Package, Plus } from "lucide-react";
import { formatHUF, formatKm, getStatusConfig } from "@/lib/format";

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ available: 0, reserved: 0, soldMonth: 0, customers: 0 });
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.dealership_id) return;
    const did = profile.dealership_id;

    const fetchData = async () => {
      const [avail, reserved, sold, custs, recent] = await Promise.all([
        supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("dealership_id", did).eq("status", "available"),
        supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("dealership_id", did).eq("status", "reserved"),
        supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("dealership_id", did).eq("status", "sold")
          .gte("updated_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        supabase.from("customers").select("id", { count: "exact", head: true }).eq("dealership_id", did),
        supabase.from("vehicles").select("*").eq("dealership_id", did).order("created_at", { ascending: false }).limit(5),
      ]);

      setStats({
        available: avail.count || 0,
        reserved: reserved.count || 0,
        soldMonth: sold.count || 0,
        customers: custs.count || 0,
      });
      setVehicles(recent.data || []);
      setLoading(false);
    };

    fetchData();
  }, [profile?.dealership_id]);

  const statCards = [
    { label: "Készleten", value: stats.available, icon: Package, color: "text-green-600" },
    { label: "Foglalt", value: stats.reserved, icon: Car, color: "text-amber-600" },
    { label: "Eladva (hónap)", value: stats.soldMonth, icon: ShoppingCart, color: "text-muted-foreground" },
    { label: "Összes vevő", value: stats.customers, icon: Users, color: "text-primary" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Irányítópult</h1>
        <Button asChild>
          <Link to="/vehicles/new"><Plus className="mr-2 h-4 w-4" />Új autó</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-xl bg-secondary p-3 ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-lg">Legutóbbi járművek</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/vehicles">Összes megtekintése</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Car className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p>Még nincs jármű felvéve.</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link to="/vehicles/new">Első autó hozzáadása</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Márka / Modell</TableHead>
                  <TableHead>Évjárat</TableHead>
                  <TableHead>Km</TableHead>
                  <TableHead>Ár</TableHead>
                  <TableHead>Státusz</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((v) => {
                  const sc = getStatusConfig(v.status);
                  return (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">
                        <Link to={`/vehicles/${v.id}`} className="hover:text-accent">
                          {v.brand} {v.model}
                        </Link>
                      </TableCell>
                      <TableCell>{v.year || "–"}</TableCell>
                      <TableCell>{formatKm(v.mileage)}</TableCell>
                      <TableCell>{formatHUF(v.selling_price)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={sc.className}>{sc.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
