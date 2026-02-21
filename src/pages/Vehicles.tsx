import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Car, X } from "lucide-react";
import VehicleCard from "@/components/VehicleCard";

export default function Vehicles() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [brandSearch, setBrandSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [kmMax, setKmMax] = useState("");

  const fetchVehicles = async () => {
    if (!profile?.dealership_id) return;
    setLoading(true);
    let q = supabase
      .from("vehicles")
      .select("*, vehicle_images(url, is_primary)")
      .eq("dealership_id", profile.dealership_id)
      .order("created_at", { ascending: false });

    if (brandSearch) q = q.ilike("brand", `%${brandSearch}%`);
    if (statusFilter !== "all") q = q.eq("status", statusFilter);
    if (priceMin) q = q.gte("selling_price", parseInt(priceMin));
    if (priceMax) q = q.lte("selling_price", parseInt(priceMax));
    if (kmMax) q = q.lte("mileage", parseInt(kmMax));

    const { data, error } = await q;
    if (error) { toast({ title: "Hiba", description: error.message, variant: "destructive" }); }
    else {
      setVehicles((data || []).map(v => ({
        ...v,
        primary_image_url: v.vehicle_images?.find((i: any) => i.is_primary)?.url || v.vehicle_images?.[0]?.url || null,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchVehicles(); }, [profile?.dealership_id, brandSearch, statusFilter, priceMin, priceMax, kmMax]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    const vehicle = vehicles.find(v => v.id === id);
    if (!vehicle) return;
    const { error } = await supabase.from("vehicles").update({ status: newStatus }).eq("id", id);
    if (error) { toast({ title: "Hiba", description: error.message, variant: "destructive" }); return; }
    await supabase.from("vehicle_status_log").insert({
      vehicle_id: id, old_status: vehicle.status, new_status: newStatus, changed_by: user?.id,
    });
    toast({ title: "Státusz frissítve" });
    fetchVehicles();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) { toast({ title: "Hiba", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Jármű törölve" });
    fetchVehicles();
  };

  const clearFilters = () => { setBrandSearch(""); setStatusFilter("all"); setPriceMin(""); setPriceMax(""); setKmMax(""); };
  const hasFilters = brandSearch || statusFilter !== "all" || priceMin || priceMax || kmMax;

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Készlet</h1>
        <Button asChild><Link to="/vehicles/new"><Plus className="mr-2 h-4 w-4" />Új autó hozzáadása</Link></Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <Input placeholder="Márka keresése..." value={brandSearch} onChange={e => setBrandSearch(e.target.value)} className="w-48" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Összes státusz</SelectItem>
            <SelectItem value="available">Készleten</SelectItem>
            <SelectItem value="reserved">Foglalt</SelectItem>
            <SelectItem value="sold">Eladva</SelectItem>
            <SelectItem value="service">Szervizben</SelectItem>
          </SelectContent>
        </Select>
        <Input type="number" placeholder="Ár min (Ft)" value={priceMin} onChange={e => setPriceMin(e.target.value)} className="w-36" />
        <Input type="number" placeholder="Ár max (Ft)" value={priceMax} onChange={e => setPriceMax(e.target.value)} className="w-36" />
        <Input type="number" placeholder="Max km" value={kmMax} onChange={e => setKmMax(e.target.value)} className="w-32" />
        {hasFilters && <button onClick={clearFilters} className="text-sm text-accent hover:underline flex items-center gap-1"><X className="h-3 w-3" />Szűrők törlése</button>}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-72 rounded-lg" />)}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Car className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-foreground">Még nincs autó a készletben</h3>
          <p className="text-sm text-muted-foreground mt-1">Adja hozzá első járművét a kezdéshez</p>
          <Button className="mt-4" asChild><Link to="/vehicles/new">Első autó hozzáadása</Link></Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map(v => (
            <VehicleCard key={v.id} vehicle={v} onStatusChange={handleStatusChange} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
