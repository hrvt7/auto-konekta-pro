import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Car, Edit, ShoppingCart } from "lucide-react";
import { formatHUF, formatKm, formatDate, getStatusConfig, fuelTypeLabels } from "@/lib/format";

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [vehicle, setVehicle] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [statusLog, setStatusLog] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    const [vRes, iRes, sRes, dRes] = await Promise.all([
      supabase.from("vehicles").select("*").eq("id", id).single(),
      supabase.from("vehicle_images").select("*").eq("vehicle_id", id).order("sort_order"),
      supabase.from("vehicle_status_log").select("*").eq("vehicle_id", id).order("created_at", { ascending: false }),
      supabase.from("documents").select("*").eq("vehicle_id", id).order("created_at", { ascending: false }),
    ]);
    if (vRes.data) setVehicle(vRes.data);
    if (iRes.data) { setImages(iRes.data); setSelectedImage(iRes.data.find((i: any) => i.is_primary)?.url || iRes.data[0]?.url || null); }
    if (sRes.data) setStatusLog(sRes.data);
    if (dRes.data) setDocuments(dRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!vehicle || !id) return;
    const { error } = await supabase.from("vehicles").update({ status: newStatus }).eq("id", id);
    if (error) { toast({ title: "Hiba", description: error.message, variant: "destructive" }); return; }
    await supabase.from("vehicle_status_log").insert({
      vehicle_id: id, old_status: vehicle.status, new_status: newStatus, changed_by: user?.id,
    });
    toast({ title: "Státusz frissítve" });
    fetchData();
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /><Skeleton className="h-48" /></div>;
  if (!vehicle) return <div className="text-center py-20"><p className="text-muted-foreground">Jármű nem található</p></div>;

  const sc = getStatusConfig(vehicle.status);
  const daysSince = Math.floor((Date.now() - new Date(vehicle.created_at).getTime()) / 86400000);

  const InfoRow = ({ label, value }: { label: string; value: string | null | undefined }) => (
    value && value !== "–" ? <div className="flex justify-between py-1.5 border-b border-border/50 last:border-0"><span className="text-sm text-muted-foreground">{label}</span><span className="text-sm font-medium">{value}</span></div> : null
  );

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <Link to="/vehicles" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />Készlet
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{vehicle.brand} {vehicle.model}</h1>
        <Button variant="outline" asChild><Link to={`/vehicles/${id}/edit`}><Edit className="mr-2 h-4 w-4" />Szerkesztés</Link></Button>
      </div>

      {/* Image gallery */}
      <div className="space-y-2">
        <div className="aspect-video rounded-lg bg-muted flex items-center justify-center overflow-hidden">
          {selectedImage ? <img src={selectedImage} alt="" className="h-full w-full object-cover" /> : <Car className="h-20 w-20 text-muted-foreground/30" />}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map(img => (
              <button key={img.id} onClick={() => setSelectedImage(img.url)} className={`h-16 w-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${selectedImage === img.url ? "border-accent" : "border-transparent"}`}>
                <img src={img.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-lg">Jármű adatok</CardTitle></CardHeader>
          <CardContent>
            <InfoRow label="Rendszám" value={vehicle.license_plate} />
            <InfoRow label="Alvázszám" value={vehicle.vin} />
            <InfoRow label="Motorszám" value={vehicle.engine_number} />
            <InfoRow label="Forgalmi eng. száma" value={vehicle.registration_doc_number} />
            <InfoRow label="Törzskönyv száma" value={vehicle.vehicle_log_number} />
            <InfoRow label="Évjárat" value={vehicle.year?.toString()} />
            <InfoRow label="Szín" value={vehicle.color} />
            <InfoRow label="Üzemanyag" value={fuelTypeLabels[vehicle.fuel_type] || vehicle.fuel_type} />
            <InfoRow label="Állapot" value={vehicle.condition === "new" ? "Új" : "Használt"} />
            <InfoRow label="Kilométeróra" value={formatKm(vehicle.mileage)} />
            <InfoRow label="Vételár" value={formatHUF(vehicle.purchase_price)} />
            <InfoRow label="Eladási ár" value={formatHUF(vehicle.selling_price)} />
            {vehicle.description && <div className="mt-4"><p className="text-sm text-muted-foreground mb-1">Leírás</p><p className="text-sm">{vehicle.description}</p></div>}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Státusz</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Badge className={`${sc.className} text-sm`}>{sc.label}</Badge>
              <Select value={vehicle.status || "available"} onValueChange={handleStatusChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Készleten</SelectItem>
                  <SelectItem value="reserved">Foglalt</SelectItem>
                  <SelectItem value="sold">Eladva</SelectItem>
                  <SelectItem value="service">Szervizben</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{daysSince} napja készleten</p>
            </CardContent>
          </Card>
          {vehicle.status === "available" && (
            <Button className="w-full" asChild>
              <Link to={`/sales/new?vehicle_id=${id}`}><ShoppingCart className="mr-2 h-4 w-4" />Eladás indítása</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="log">
        <TabsList>
          <TabsTrigger value="log">Státusz napló</TabsTrigger>
          <TabsTrigger value="docs">Dokumentumok</TabsTrigger>
        </TabsList>
        <TabsContent value="log">
          {statusLog.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Még nincs bejegyzés</p> : (
            <div className="space-y-2">
              {statusLog.map(log => (
                <div key={log.id} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                  <span className="text-muted-foreground">{formatDate(log.created_at)}</span>
                  <span>{getStatusConfig(log.old_status).label} → {getStatusConfig(log.new_status).label}</span>
                  {log.note && <span className="text-muted-foreground">— {log.note}</span>}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="docs">
          {documents.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Nincs kapcsolódó dokumentum</p> : (
            <div className="space-y-2">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <span>{doc.doc_type}</span>
                  <Badge className={doc.status === "generated" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>{doc.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
