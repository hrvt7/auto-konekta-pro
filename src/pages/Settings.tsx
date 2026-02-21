import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

export default function Settings() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCompany, setIsCompany] = useState(true);

  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [representative, setRepresentative] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [mothersName, setMothersName] = useState("");
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [dealershipName, setDealershipName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!profile?.dealership_id) return;
    supabase.from("dealerships").select("*").eq("id", profile.dealership_id).single().then(({ data }) => {
      if (data) {
        setIsCompany(data.entity_type === "company");
        setCompanyName(data.company_name || "");
        setAddress(data.address || "");
        setRegNumber(data.registration_number || "");
        setTaxNumber(data.tax_number || "");
        setRepresentative(data.representative_name || "");
        setOwnerName(data.owner_name || "");
        setBirthPlace(data.owner_birth_place || "");
        setBirthDate(data.owner_birth_date || "");
        setMothersName(data.owner_mothers_name || "");
        setIdType(data.owner_id_type || "");
        setIdNumber(data.owner_id_number || "");
        setOwnerAddress(data.address || "");
        setDealershipName(data.name || "");
        setPhone(data.phone || "");
        setEmail(data.email || "");
      }
      setLoading(false);
    });
  }, [profile?.dealership_id]);

  const handleSave = async () => {
    if (!profile?.dealership_id) return;
    setSaving(true);
    const updateData: Record<string, unknown> = {
      entity_type: isCompany ? "company" : "individual",
      name: dealershipName, address: isCompany ? address : ownerAddress, phone, email,
    };
    if (isCompany) {
      Object.assign(updateData, { company_name: companyName, registration_number: regNumber, tax_number: taxNumber, representative_name: representative });
    } else {
      Object.assign(updateData, {
        owner_name: ownerName, owner_birth_place: birthPlace,
        owner_birth_date: birthDate || null, owner_mothers_name: mothersName,
        owner_id_type: idType, owner_id_number: idNumber, owner_nationality: "magyar",
      });
    }
    const { error } = await supabase.from("dealerships").update(updateData as any).eq("id", profile.dealership_id);
    setSaving(false);
    if (error) { toast({ title: "Hiba", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Beállítások mentve!" });
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold text-foreground">Beállítások</h1>

      <Card>
        <CardHeader><CardTitle>Kereskedés adatai</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <span className="text-sm font-medium">Kereskedő típusa</span>
              <div className="flex items-center gap-3">
                <span className={`text-sm ${!isCompany ? "font-semibold text-primary" : "text-muted-foreground"}`}>Magánszemély</span>
                <Switch checked={isCompany} onCheckedChange={setIsCompany} />
                <span className={`text-sm ${isCompany ? "font-semibold text-primary" : "text-muted-foreground"}`}>Jogi személy</span>
              </div>
            </div>

            {isCompany ? (
              <div className="space-y-4">
                <div className="space-y-2"><Label>Cégnév *</Label><Input required value={companyName} onChange={e => setCompanyName(e.target.value)} /></div>
                <div className="space-y-2"><Label>Székhely *</Label><Input required value={address} onChange={e => setAddress(e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Cégjegyzékszám</Label><Input value={regNumber} onChange={e => setRegNumber(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Adószám</Label><Input value={taxNumber} onChange={e => setTaxNumber(e.target.value)} /></div>
                </div>
                <div className="space-y-2"><Label>Képviselő neve</Label><Input value={representative} onChange={e => setRepresentative(e.target.value)} /></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2"><Label>Teljes név *</Label><Input required value={ownerName} onChange={e => setOwnerName(e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Születési hely</Label><Input value={birthPlace} onChange={e => setBirthPlace(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Születési idő</Label><Input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} /></div>
                </div>
                <div className="space-y-2"><Label>Anyja neve</Label><Input value={mothersName} onChange={e => setMothersName(e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Okmány típusa</Label><Input value={idType} onChange={e => setIdType(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Okmány száma</Label><Input value={idNumber} onChange={e => setIdNumber(e.target.value)} /></div>
                </div>
                <div className="space-y-2"><Label>Lakcím *</Label><Input required value={ownerAddress} onChange={e => setOwnerAddress(e.target.value)} /></div>
              </div>
            )}

            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2"><Label>Telephely neve *</Label><Input required value={dealershipName} onChange={e => setDealershipName(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Telefon</Label><Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
              </div>
            </div>

            <Button type="submit" disabled={saving}>{saving ? "Mentés..." : "Mentés"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
