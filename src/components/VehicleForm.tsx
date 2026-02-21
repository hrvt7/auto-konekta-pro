import { useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface VehicleFormData {
  license_plate: string;
  vin: string;
  engine_number: string;
  registration_doc_number: string;
  vehicle_log_number: string;
  brand: string;
  model: string;
  year: string;
  color: string;
  fuel_type: string;
  condition: string;
  mileage: string;
  purchase_price: string;
  selling_price: string;
  description: string;
  notes: string;
}

const emptyForm: VehicleFormData = {
  license_plate: "", vin: "", engine_number: "", registration_doc_number: "", vehicle_log_number: "",
  brand: "", model: "", year: "", color: "", fuel_type: "", condition: "used",
  mileage: "", purchase_price: "", selling_price: "", description: "", notes: "",
};

interface VehicleFormProps {
  initialData?: VehicleFormData;
  vehicleId?: string;
  onSubmit: (data: VehicleFormData) => Promise<string | undefined>;
  submitLabel: string;
  loading: boolean;
}

interface UploadedImage {
  id?: string;
  url: string;
  is_primary: boolean;
}

export { emptyForm };

export default function VehicleForm({ initialData, vehicleId, onSubmit, submitLabel, loading }: VehicleFormProps) {
  const [form, setForm] = useState<VehicleFormData>(initialData || emptyForm);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile } = useAuth();
  const { toast } = useToast();

  const set = (key: keyof VehicleFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  const uploadFiles = useCallback(async (files: FileList, vId?: string) => {
    const targetId = vId || vehicleId;
    if (!targetId || !profile?.dealership_id) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const path = `${profile.dealership_id}/${targetId}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from("vehicle-images").upload(path, file);
      if (error) { toast({ title: "Feltöltési hiba", description: error.message, variant: "destructive" }); continue; }
      const { data: { publicUrl } } = supabase.storage.from("vehicle-images").getPublicUrl(path);
      const isPrimary = images.length === 0;
      const { data: img } = await supabase.from("vehicle_images").insert({ vehicle_id: targetId, url: publicUrl, is_primary: isPrimary, sort_order: images.length }).select("id, url, is_primary").single();
      if (img) setImages(p => [...p, img]);
    }
    setUploading(false);
  }, [vehicleId, profile?.dealership_id, images.length, toast]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
  };

  const deleteImage = async (img: UploadedImage) => {
    if (img.id) await supabase.from("vehicle_images").delete().eq("id", img.id);
    setImages(p => p.filter(i => i.url !== img.url));
  };

  // Load existing images
  const loadImages = useCallback(async () => {
    if (!vehicleId) return;
    const { data } = await supabase.from("vehicle_images").select("id, url, is_primary").eq("vehicle_id", vehicleId).order("sort_order");
    if (data) setImages(data);
  }, [vehicleId]);

  useState(() => { loadImages(); });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20 lg:pb-6">
      {/* Section 1: Identifiers */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Jármű azonosítók</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2"><Label>Rendszám</Label><Input value={form.license_plate} onChange={set("license_plate")} placeholder="ABC-123" /></div>
          <div className="space-y-2"><Label>Alvázszám (VIN)</Label><Input value={form.vin} onChange={set("vin")} /></div>
          <div className="space-y-2"><Label>Motorszám</Label><Input value={form.engine_number} onChange={set("engine_number")} /></div>
          <div className="space-y-2"><Label>Forgalmi engedély száma</Label><Input value={form.registration_doc_number} onChange={set("registration_doc_number")} /></div>
          <div className="space-y-2"><Label>Törzskönyv száma</Label><Input value={form.vehicle_log_number} onChange={set("vehicle_log_number")} /></div>
        </CardContent>
      </Card>

      {/* Section 2: Basics */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Alapadatok</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2"><Label>Márka *</Label><Input required value={form.brand} onChange={set("brand")} /></div>
          <div className="space-y-2"><Label>Modell *</Label><Input required value={form.model} onChange={set("model")} /></div>
          <div className="space-y-2"><Label>Évjárat</Label><Input type="number" min="1900" max="2026" value={form.year} onChange={set("year")} /></div>
          <div className="space-y-2"><Label>Szín</Label><Input value={form.color} onChange={set("color")} /></div>
          <div className="space-y-2">
            <Label>Üzemanyag</Label>
            <Select value={form.fuel_type} onValueChange={v => setForm(p => ({ ...p, fuel_type: v }))}>
              <SelectTrigger><SelectValue placeholder="Válasszon..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="benzin">Benzin</SelectItem>
                <SelectItem value="dizel">Dízel</SelectItem>
                <SelectItem value="elektromos">Elektromos</SelectItem>
                <SelectItem value="hibrid">Hibrid</SelectItem>
                <SelectItem value="lpg">LPG</SelectItem>
                <SelectItem value="egyeb">Egyéb</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Állapot</Label>
            <div className="flex gap-4 pt-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="condition" value="new" checked={form.condition === "new"} onChange={set("condition")} /> Új
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="condition" value="used" checked={form.condition === "used"} onChange={set("condition")} /> Használt
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Price */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Állapot és ár</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2"><Label>Kilométeróra állás</Label><Input type="number" value={form.mileage} onChange={set("mileage")} placeholder="km" /></div>
          <div className="space-y-2"><Label>Vételár (Ft)</Label><Input type="number" value={form.purchase_price} onChange={set("purchase_price")} /></div>
          <div className="space-y-2"><Label>Eladási ár (Ft) *</Label><Input type="number" required value={form.selling_price} onChange={set("selling_price")} /></div>
        </CardContent>
      </Card>

      {/* Section 4: Description */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Leírás</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Leírás</Label><Textarea rows={4} value={form.description} onChange={set("description")} placeholder="Hirdetési szöveg..." /></div>
          <div className="space-y-2"><Label>Belső megjegyzések</Label><Textarea rows={3} value={form.notes} onChange={set("notes")} placeholder="Csak belső használatra..." /></div>
        </CardContent>
      </Card>

      {/* Section 5: Images */}
      {vehicleId && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Képek</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer ${dragOver ? "border-accent bg-accent/10" : "border-border"}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{uploading ? "Feltöltés..." : "Húzza ide a képeket, vagy kattintson"}</p>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => e.target.files && uploadFiles(e.target.files)} />
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {images.map(img => (
                  <div key={img.url} className="relative group aspect-square rounded-lg overflow-hidden border">
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                    {img.is_primary && <span className="absolute top-1 left-1 bg-accent text-accent-foreground text-xs px-1.5 py-0.5 rounded">Fő</span>}
                    <button type="button" onClick={() => deleteImage(img)} className="absolute top-1 right-1 rounded-full bg-destructive text-destructive-foreground p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="sticky bottom-16 lg:bottom-0 bg-background py-3 border-t -mx-4 px-4 lg:-mx-6 lg:px-6">
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? "Mentés..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
