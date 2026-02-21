import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export interface CustomerFormData {
  entity_type: string;
  full_name: string;
  birth_name: string;
  birth_place: string;
  birth_date: string;
  mothers_name: string;
  id_type: string;
  id_number: string;
  address: string;
  nationality: string;
  company_name: string;
  company_address: string;
  registration_number: string;
  representative_name: string;
  phone: string;
  email: string;
  notes: string;
}

export const emptyCustomerForm: CustomerFormData = {
  entity_type: "individual", full_name: "", birth_name: "", birth_place: "", birth_date: "",
  mothers_name: "", id_type: "Személyigazolvány", id_number: "", address: "", nationality: "magyar",
  company_name: "", company_address: "", registration_number: "", representative_name: "",
  phone: "", email: "", notes: "",
};

interface Props {
  initialData?: CustomerFormData;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  submitLabel: string;
  loading: boolean;
}

export default function CustomerForm({ initialData, onSubmit, submitLabel, loading }: Props) {
  const [form, setForm] = useState<CustomerFormData>(initialData || emptyCustomerForm);
  const isCompany = form.entity_type === "company";
  const set = (key: keyof CustomerFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center justify-between rounded-lg border p-4">
        <span className="text-sm font-medium">Vevő típusa</span>
        <div className="flex items-center gap-3">
          <span className={`text-sm ${!isCompany ? "font-semibold text-primary" : "text-muted-foreground"}`}>Magánszemély</span>
          <Switch checked={isCompany} onCheckedChange={v => setForm(p => ({ ...p, entity_type: v ? "company" : "individual" }))} />
          <span className={`text-sm ${isCompany ? "font-semibold text-primary" : "text-muted-foreground"}`}>Jogi személy</span>
        </div>
      </div>

      {isCompany ? (
        <Card>
          <CardHeader><CardTitle className="text-lg">Cégadatok</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2"><Label>Cégnév *</Label><Input required value={form.company_name} onChange={set("company_name")} /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Székhely *</Label><Input required value={form.company_address} onChange={set("company_address")} /></div>
            <div className="space-y-2"><Label>Cégjegyzékszám *</Label><Input required value={form.registration_number} onChange={set("registration_number")} /></div>
            <div className="space-y-2"><Label>Képviselő neve *</Label><Input required value={form.representative_name} onChange={set("representative_name")} /></div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle className="text-lg">Személyes adatok</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2"><Label>Teljes név *</Label><Input required value={form.full_name} onChange={set("full_name")} /></div>
            <div className="space-y-2"><Label>Születéskori név</Label><Input value={form.birth_name} onChange={set("birth_name")} /></div>
            <div className="space-y-2"><Label>Állampolgárság</Label><Input value={form.nationality} onChange={set("nationality")} /></div>
            <div className="space-y-2"><Label>Születési hely *</Label><Input required value={form.birth_place} onChange={set("birth_place")} /></div>
            <div className="space-y-2"><Label>Születési idő *</Label><Input type="date" required value={form.birth_date} onChange={set("birth_date")} /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Anyja neve *</Label><Input required value={form.mothers_name} onChange={set("mothers_name")} /></div>
            <div className="space-y-2">
              <Label>Okmány típusa</Label>
              <Select value={form.id_type} onValueChange={v => setForm(p => ({ ...p, id_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Személyigazolvány">Személyigazolvány</SelectItem>
                  <SelectItem value="Útlevél">Útlevél</SelectItem>
                  <SelectItem value="Jogosítvány">Jogosítvány</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Okmány száma *</Label><Input required value={form.id_number} onChange={set("id_number")} /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Lakcím *</Label><Input required value={form.address} onChange={set("address")} /></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">Elérhetőség</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label>Telefon</Label><Input type="tel" value={form.phone} onChange={set("phone")} /></div>
          <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={set("email")} /></div>
          <div className="space-y-2 sm:col-span-2"><Label>Megjegyzések</Label><Textarea value={form.notes} onChange={set("notes")} /></div>
        </CardContent>
      </Card>

      <div className="sticky bottom-16 lg:bottom-0 bg-background py-3 border-t -mx-4 px-4 lg:-mx-6 lg:px-6">
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">{loading ? "Mentés..." : submitLabel}</Button>
      </div>
    </form>
  );
}
