import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
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
  const { user, refreshProfile, loading: authLoading, session } = useAuth();
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

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Hiba", description: "Nincs bejelentkezett felhasználó.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const dealershipData: Record<string, unknown> = {
        entity_type: isCompany ? "company" : "individual",
        name: dealershipName,
        address: isCompany ? address : ownerAddress,
        phone: phone || null,
        email: email || null,
      };

      if (isCompany) {
        Object.assign(dealershipData, {
          company_name: companyName,
          registration_number: regNumber || null,
          tax_number: taxNumber || null,
          representative_name: representative || null,
        });
      } else {
        Object.assign(dealershipData, {
          owner_name: ownerName,
          owner_birth_place: birthPlace || null,
          owner_birth_date: birthDate || null,
          owner_mothers_name: mothersName || null,
          owner_id_type: idType || null,
          owner_id_number: idNumber || null,
          owner_nationality: "magyar",
        });
      }

      const { data: dealership, error: dErr } = await supabase
        .from("dealerships")
        .insert(dealershipData as any)
        .select("id")
        .single();

      if (dErr) throw new Error("Kereskedés létrehozása sikertelen: " + dErr.message);
      if (!dealership) throw new Error("Kereskedés nem jött létre.");

      const { error: pErr } = await supabase
        .from("profiles")
        .update({ dealership_id: dealership.id })
        .eq("id", user.id);

      if (pErr) throw new Error("Profil frissítése sikertelen: " + pErr.message);

      await refreshProfile();
      toast({ title: "Siker!", description: "Kereskedés sikeresen létrehozva." });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Hiba", description: err.message || "Ismeretlen hiba.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
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
