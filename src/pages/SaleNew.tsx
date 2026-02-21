import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Check, Search, Car, User } from "lucide-react";
import { formatHUF, formatKm, getStatusConfig, docTypeLabels } from "@/lib/format";
import CustomerForm, { CustomerFormData, emptyCustomerForm } from "@/components/CustomerForm";

const STEPS = ["Jármű", "Vevő", "Üzembentartó", "Tranzakció", "Tanúk", "Összefoglalás"];

export default function SaleNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 1: Vehicle
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  // Step 2: Customer
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState<CustomerFormData>(emptyCustomerForm);

  // Step 3: Operator
  const [operatorSame, setOperatorSame] = useState(true);
  const [operatorData, setOperatorData] = useState<CustomerFormData>(emptyCustomerForm);
  const [selectedOperator, setSelectedOperator] = useState<any>(null);

  // Step 4: Transaction
  const [salePrice, setSalePrice] = useState("");
  const [salePriceText, setSalePriceText] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentDate, setPaymentDate] = useState("");
  const [docHandoverDate, setDocHandoverDate] = useState("");
  const [possessionDate, setPossessionDate] = useState("");
  const [possessionTime, setPossessionTime] = useState("");
  const [ownershipTransferDate, setOwnershipTransferDate] = useState("");
  const [mileageAtSale, setMileageAtSale] = useState("");
  const [trustManagement, setTrustManagement] = useState(false);

  // Step 5: Witnesses
  const [w1Name, setW1Name] = useState("");
  const [w1IdType, setW1IdType] = useState("Személyigazolvány");
  const [w1IdNumber, setW1IdNumber] = useState("");
  const [w1Address, setW1Address] = useState("");
  const [w2Name, setW2Name] = useState("");
  const [w2IdType, setW2IdType] = useState("Személyigazolvány");
  const [w2IdNumber, setW2IdNumber] = useState("");
  const [w2Address, setW2Address] = useState("");

  // Step 6: Documents
  const [docTypes, setDocTypes] = useState<Record<string, boolean>>({
    adasveteli: true, uzembentartoi: true, meghatalmazas: true, atadas_atveteli: true,
  });

  // Fetch vehicles
  useEffect(() => {
    if (!profile?.dealership_id) return;
    const preselectedId = searchParams.get("vehicle_id");
    supabase.from("vehicles").select("*, vehicle_images(url, is_primary)")
      .eq("dealership_id", profile.dealership_id)
      .then(({ data }) => {
        const mapped = (data || []).map(v => ({
          ...v, primary_image_url: v.vehicle_images?.find((i: any) => i.is_primary)?.url || v.vehicle_images?.[0]?.url || null,
        }));
        setVehicles(mapped);
        if (preselectedId) {
          const found = mapped.find(v => v.id === preselectedId);
          if (found) { setSelectedVehicle(found); setSalePrice(found.selling_price?.toString() || ""); }
        }
      });
  }, [profile?.dealership_id]);

  // Fetch customers
  useEffect(() => {
    if (!profile?.dealership_id) return;
    supabase.from("customers").select("*").eq("dealership_id", profile.dealership_id).order("created_at", { ascending: false })
      .then(({ data }) => setCustomers(data || []));
  }, [profile?.dealership_id]);

  const filteredVehicles = vehicles.filter(v => v.status === "available" && (!vehicleSearch || `${v.brand} ${v.model}`.toLowerCase().includes(vehicleSearch.toLowerCase())));
  const filteredCustomers = customers.filter(c => !customerSearch || (c.full_name || c.company_name || "").toLowerCase().includes(customerSearch.toLowerCase()));

  const canProceed = () => {
    if (step === 0) return !!selectedVehicle;
    if (step === 1) return !!selectedCustomer || showNewCustomer;
    if (step === 3) return !!salePrice;
    if (step === 4) return !!w1Name && !!w2Name;
    return true;
  };

  const handleSave = async () => {
    if (!profile?.dealership_id || !selectedVehicle || !user) return;
    setSaving(true);

    try {
      // Create inline customer if needed
      let customerId = selectedCustomer?.id;
      if (!customerId && showNewCustomer) {
        const { data: nc, error } = await supabase.from("customers").insert({
          dealership_id: profile.dealership_id, entity_type: newCustomerData.entity_type,
          full_name: newCustomerData.full_name || null, birth_name: newCustomerData.birth_name || null,
          birth_place: newCustomerData.birth_place || null, birth_date: newCustomerData.birth_date || null,
          mothers_name: newCustomerData.mothers_name || null, id_type: newCustomerData.id_type || null,
          id_number: newCustomerData.id_number || null, address: newCustomerData.address || null,
          nationality: newCustomerData.nationality || "magyar",
          company_name: newCustomerData.company_name || null, company_address: newCustomerData.company_address || null,
          registration_number: newCustomerData.registration_number || null,
          representative_name: newCustomerData.representative_name || null,
          phone: newCustomerData.phone || null, email: newCustomerData.email || null,
        }).select("id").single();
        if (error || !nc) throw new Error(error?.message || "Vevő létrehozása sikertelen");
        customerId = nc.id;
      }

      // Create operator if different
      let operatorId: string | null = null;
      if (!operatorSame) {
        const { data: op, error } = await supabase.from("customers").insert({
          dealership_id: profile.dealership_id, entity_type: operatorData.entity_type,
          full_name: operatorData.full_name || null, birth_name: operatorData.birth_name || null,
          birth_place: operatorData.birth_place || null, birth_date: operatorData.birth_date || null,
          mothers_name: operatorData.mothers_name || null, id_type: operatorData.id_type || null,
          id_number: operatorData.id_number || null, address: operatorData.address || null,
          nationality: operatorData.nationality || "magyar",
          company_name: operatorData.company_name || null, company_address: operatorData.company_address || null,
          registration_number: operatorData.registration_number || null,
          representative_name: operatorData.representative_name || null,
          phone: operatorData.phone || null, email: operatorData.email || null,
        }).select("id").single();
        if (error || !op) throw new Error(error?.message || "Üzembentartó létrehozása sikertelen");
        operatorId = op.id;
      }

      // Insert sale
      const { data: sale, error: saleErr } = await supabase.from("sales").insert({
        dealership_id: profile.dealership_id, vehicle_id: selectedVehicle.id, customer_id: customerId,
        operator_id: operatorId, operator_same_as_buyer: operatorSame,
        sale_price: parseInt(salePrice), sale_price_text: salePriceText || null,
        payment_method: paymentMethod, payment_date: paymentDate || null,
        doc_handover_date: docHandoverDate || null, possession_date: possessionDate || null,
        possession_time: possessionTime || null, ownership_transfer_date: ownershipTransferDate || null,
        mileage_at_sale: mileageAtSale ? parseInt(mileageAtSale) : null,
        trust_management: trustManagement, status: "completed",
      }).select("id").single();
      if (saleErr || !sale) throw new Error(saleErr?.message || "Értékesítés mentése sikertelen");

      // Insert witnesses
      await supabase.from("witnesses").insert([
        { sale_id: sale.id, witness_number: 1, full_name: w1Name, id_type: w1IdType, id_number: w1IdNumber || null, address: w1Address || null },
        { sale_id: sale.id, witness_number: 2, full_name: w2Name, id_type: w2IdType, id_number: w2IdNumber || null, address: w2Address || null },
      ]);

      // Update vehicle status
      await supabase.from("vehicles").update({ status: "sold" }).eq("id", selectedVehicle.id);
      await supabase.from("vehicle_status_log").insert({
        vehicle_id: selectedVehicle.id, old_status: selectedVehicle.status, new_status: "sold", changed_by: user.id,
      });

      // Insert documents
      const selectedDocs = Object.entries(docTypes).filter(([, v]) => v).map(([k]) => k);
      if (selectedDocs.length > 0) {
        await supabase.from("documents").insert(
          selectedDocs.map(dt => ({ sale_id: sale.id, dealership_id: profile.dealership_id, doc_type: dt, vehicle_id: selectedVehicle.id, status: "pending" }))
        );
      }

      // Webhook
      const webhookUrl = import.meta.env.VITE_MAKE_WEBHOOK_URL;
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sale_id: sale.id }) });
        } catch { /* webhook failure is non-blocking */ }
      }

      toast({ title: "✅ Értékesítés rögzítve!", description: "Dokumentumok generálása folyamatban..." });
      navigate(`/sales/${sale.id}`);
    } catch (err: any) {
      toast({ title: "Hiba", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const getCustomerDisplayName = (c: any) => c.entity_type === "company" ? c.company_name : c.full_name;

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold">Új értékesítés</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center">
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap ${i === step ? "bg-accent text-accent-foreground" : i < step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {i < step ? <Check className="h-3 w-3" /> : <span>{i + 1}</span>}
              <span className="hidden sm:inline">{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className="w-4 h-px bg-border mx-1" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      {step === 0 && (
        <div className="space-y-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Jármű keresése..." value={vehicleSearch} onChange={e => setVehicleSearch(e.target.value)} className="pl-9" />
          </div>
          {selectedVehicle && (
            <Card className="border-accent border-2">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                  {selectedVehicle.primary_image_url ? <img src={selectedVehicle.primary_image_url} alt="" className="h-full w-full object-cover" /> : <Car className="h-6 w-6 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{selectedVehicle.brand} {selectedVehicle.model}</p>
                  <p className="text-sm text-muted-foreground">{selectedVehicle.year} · {formatKm(selectedVehicle.mileage)} · {formatHUF(selectedVehicle.selling_price)}</p>
                </div>
                <Badge className={getStatusConfig(selectedVehicle.status).className}>{getStatusConfig(selectedVehicle.status).label}</Badge>
              </CardContent>
            </Card>
          )}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVehicles.filter(v => v.id !== selectedVehicle?.id).map(v => (
              <Card key={v.id} className="cursor-pointer hover:border-accent transition-colors" onClick={() => { setSelectedVehicle(v); setSalePrice(v.selling_price?.toString() || ""); }}>
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="h-12 w-12 rounded bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    {v.primary_image_url ? <img src={v.primary_image_url} alt="" className="h-full w-full object-cover" /> : <Car className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{v.brand} {v.model}</p>
                    <p className="text-xs text-muted-foreground">{formatHUF(v.selling_price)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          {!showNewCustomer ? (
            <>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Vevő keresése..." value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} className="pl-9" />
              </div>
              {selectedCustomer && (
                <Card className="border-accent border-2">
                  <CardContent className="flex items-center gap-3 p-4">
                    <User className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">{getCustomerDisplayName(selectedCustomer)}</p>
                      <p className="text-sm text-muted-foreground">{selectedCustomer.phone || selectedCustomer.email || ""}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
              <div className="space-y-2">
                {filteredCustomers.filter(c => c.id !== selectedCustomer?.id).map(c => (
                  <Card key={c.id} className="cursor-pointer hover:border-accent transition-colors" onClick={() => setSelectedCustomer(c)}>
                    <CardContent className="flex items-center gap-3 p-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{getCustomerDisplayName(c)}</p>
                        <p className="text-xs text-muted-foreground">{c.phone || c.email || ""}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button variant="outline" onClick={() => setShowNewCustomer(true)}>Új vevő felvétele</Button>
            </>
          ) : (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={() => setShowNewCustomer(false)}>
                <ArrowLeft className="mr-1 h-4 w-4" />Vissza a kereséshez
              </Button>
              <CustomerForm initialData={newCustomerData} onSubmit={async (d) => { setNewCustomerData(d); setShowNewCustomer(false); setSelectedCustomer(null); }} submitLabel="Vevő kiválasztása" loading={false} />
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Üzembentartó</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Checkbox checked={operatorSame} onCheckedChange={v => setOperatorSame(!!v)} id="op-same" />
              <Label htmlFor="op-same">Az üzembentartó megegyezik a vevővel</Label>
            </div>
            {operatorSame ? (
              <p className="text-sm text-muted-foreground">Üzembentartó = {getCustomerDisplayName(selectedCustomer) || newCustomerData.full_name || newCustomerData.company_name}</p>
            ) : (
              <CustomerForm initialData={operatorData} onSubmit={async (d) => setOperatorData(d)} submitLabel="Mentés" loading={false} />
            )}
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Tranzakció adatok</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Vételár (Ft) *</Label><Input type="number" required value={salePrice} onChange={e => setSalePrice(e.target.value)} /></div>
            <div className="space-y-2"><Label>Vételár szöveggel</Label><Input value={salePriceText} onChange={e => setSalePriceText(e.target.value)} placeholder="pl. Hárommillió forint" /></div>
            <div className="space-y-2">
              <Label>Fizetés módja</Label>
              <div className="flex gap-4 pt-2">
                {[["cash","Készpénz"],["transfer","Átutalás"],["financing","Finanszírozás"]].map(([v,l]) => (
                  <label key={v} className="flex items-center gap-2 text-sm"><input type="radio" name="payment" value={v} checked={paymentMethod===v} onChange={() => setPaymentMethod(v)} />{l}</label>
                ))}
              </div>
            </div>
            <div className="space-y-2"><Label>Fizetés dátuma</Label><Input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} /></div>
            <div className="space-y-2"><Label>Okmányok átadásának dátuma</Label><Input type="date" value={docHandoverDate} onChange={e => setDocHandoverDate(e.target.value)} /></div>
            <div className="space-y-2"><Label>Birtokbavétel dátuma</Label><Input type="date" value={possessionDate} onChange={e => setPossessionDate(e.target.value)} /></div>
            <div className="space-y-2"><Label>Birtokbavétel időpontja</Label><Input type="time" value={possessionTime} onChange={e => setPossessionTime(e.target.value)} /></div>
            <div className="space-y-2"><Label>Tulajdonjog változás hatályba lépése</Label><Input type="date" value={ownershipTransferDate} onChange={e => setOwnershipTransferDate(e.target.value)} /></div>
            <div className="space-y-2"><Label>Km óra állás az eladáskor</Label><Input type="number" value={mileageAtSale} onChange={e => setMileageAtSale(e.target.value)} /></div>
            <div className="flex items-center gap-3 sm:col-span-2">
              <Label>Bizalmi vagyonkezelés</Label>
              <Switch checked={trustManagement} onCheckedChange={setTrustManagement} />
              <span className="text-sm text-muted-foreground">{trustManagement ? "Igen" : "Nem"}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {[{ n: 1, name: w1Name, setName: setW1Name, idType: w1IdType, setIdType: setW1IdType, idNum: w1IdNumber, setIdNum: setW1IdNumber, addr: w1Address, setAddr: setW1Address },
            { n: 2, name: w2Name, setName: setW2Name, idType: w2IdType, setIdType: setW2IdType, idNum: w2IdNumber, setIdNum: setW2IdNumber, addr: w2Address, setAddr: setW2Address }
          ].map(w => (
            <Card key={w.n}>
              <CardHeader><CardTitle className="text-lg">Tanú {w.n}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Teljes név *</Label><Input required value={w.name} onChange={e => w.setName(e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>Okmány típusa</Label>
                  <Select value={w.idType} onValueChange={w.setIdType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Személyigazolvány">Személyigazolvány</SelectItem>
                      <SelectItem value="Útlevél">Útlevél</SelectItem>
                      <SelectItem value="Jogosítvány">Jogosítvány</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Okmány száma</Label><Input value={w.idNum} onChange={e => w.setIdNum(e.target.value)} /></div>
                <div className="space-y-2"><Label>Lakcím</Label><Input value={w.addr} onChange={e => w.setAddr(e.target.value)} /></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {step === 5 && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card><CardHeader><CardTitle className="text-base">Jármű</CardTitle></CardHeader><CardContent><p className="font-medium">{selectedVehicle?.brand} {selectedVehicle?.model}</p><p className="text-sm text-muted-foreground">{selectedVehicle?.year} · {formatHUF(parseInt(salePrice))}</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Vevő</CardTitle></CardHeader><CardContent><p className="font-medium">{getCustomerDisplayName(selectedCustomer) || newCustomerData.full_name || newCustomerData.company_name}</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Tranzakció</CardTitle></CardHeader><CardContent><p className="text-sm">{formatHUF(parseInt(salePrice))} · {paymentMethod === "cash" ? "Készpénz" : paymentMethod === "transfer" ? "Átutalás" : "Finanszírozás"}</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Tanúk</CardTitle></CardHeader><CardContent><p className="text-sm">{w1Name}, {w2Name}</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-lg">Dokumentumok</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(docTypeLabels).map(([key, label]) => (
                <div key={key} className="flex items-center gap-3">
                  <Checkbox checked={docTypes[key]} onCheckedChange={v => setDocTypes(p => ({ ...p, [key]: !!v }))} id={`doc-${key}`} />
                  <Label htmlFor={`doc-${key}`}>{label}</Label>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={() => step === 0 ? navigate("/sales") : setStep(s => s - 1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />{step === 0 ? "Vissza" : "Előző"}
        </Button>
        {step < 5 ? (
          <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
            Tovább<ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSave} disabled={saving} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {saving ? "Generálás folyamatban..." : "Szerződések generálása és mentés"}
          </Button>
        )}
      </div>
    </div>
  );
}
