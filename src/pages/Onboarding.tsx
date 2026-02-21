import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isCompany, setIsCompany] = useState(true);

  // Company fields
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [representative, setRepresentative] = useState("");

  // Individual fields
  const [ownerName, setOwnerName] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [mothersName, setMothersName] = useState("");
  const [idType, setIdType] = useState("Személyigazolvány");
  const [idNumber, setIdNumber] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");

  // Common
  const [dealershipName, setDealershipName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const dealershipData: Record<string, unknown> = {
      entity_type: isCompany ? "company" : "individual",
      name: dealershipName,
      address: isCompany ? address : ownerAddress,
      phone,
      email,
    };

    if (isCompany) {
      Object.assign(dealershipData, {
        company_name: companyName,
        registration_number: regNumber,
        tax_number: taxNumber,
        representative_name: representative,
      });
    } else {
      Object.assign(dealershipData, {
        owner_name: ownerName,
        owner_birth_place: birthPlace,
        owner_birth_date: birthDate || null,
        owner_mothers_name: mothersName,
        owner_id_type: idType,
        owner_id_number: idNumber,
        owner_nationality: "magyar",
      });
    }

    const { data: dealership, error: dErr } = await supabase
      .from("dealerships")
      .insert(dealershipData as any)
      .select("id")
      .single();

    if (dErr || !dealership) {
      toast({ title: "Hiba", description: dErr?.message || "Nem sikerült létrehozni a kereskedést.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error: pErr } = await supabase
      .from("profiles")
      .update({ dealership_id: dealership.id })
      .eq("id", user.id);

    if (pErr) {
      toast({ title: "Hiba", description: pErr.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    await refreshProfile();
    setLoading(false);
    toast({ title: "Kész!", description: "Kereskedés sikeresen létrehozva." });
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4 py-12">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex items-center gap-2">
            <Car className="h-7 w-7 text-accent" />
            <span className="text-xl font-bold text-primary">AutoDok</span>
          </div>
          <CardTitle>Kereskedés beállítása</CardTitle>
          <CardDescription>Adja meg kereskedése adatait a kezdéshez</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Toggle */}
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
                <div className="space-y-2">
                  <Label>Cégnév *</Label>
                  <Input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Székhely *</Label>
                  <Input required value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cégjegyzékszám</Label>
                    <Input value={regNumber} onChange={(e) => setRegNumber(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Adószám</Label>
                    <Input value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Képviselő neve</Label>
                  <Input value={representative} onChange={(e) => setRepresentative(e.target.value)} />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Teljes név *</Label>
                  <Input required value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Születési hely *</Label>
                    <Input required value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Születési idő *</Label>
                    <Input type="date" required value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Anyja neve *</Label>
                  <Input required value={mothersName} onChange={(e) => setMothersName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Okmány típusa</Label>
                    <Input value={idType} onChange={(e) => setIdType(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Okmány száma *</Label>
                    <Input required value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Lakcím *</Label>
                  <Input required value={ownerAddress} onChange={(e) => setOwnerAddress(e.target.value)} />
                </div>
              </div>
            )}

            {/* Common fields */}
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label>Telephely neve *</Label>
                <Input required value={dealershipName} onChange={(e) => setDealershipName(e.target.value)} placeholder="pl. Kovács Autó Kft." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefon</Label>
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Mentés..." : "Kereskedés létrehozása"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
