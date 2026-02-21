/** Format number as Hungarian currency: "3 500 000 Ft" */
export function formatHUF(amount: number | null | undefined): string {
  if (amount == null) return "–";
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " Ft";
}

/** Format number as mileage: "125 000 km" */
export function formatKm(km: number | null | undefined): string {
  if (km == null) return "–";
  return km.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " km";
}

/** Vehicle status labels & colors */
export const statusConfig: Record<string, { label: string; className: string }> = {
  available: { label: "Készleten", className: "bg-green-100 text-green-800" },
  reserved: { label: "Foglalt", className: "bg-amber-100 text-amber-800" },
  sold: { label: "Eladva", className: "bg-gray-100 text-gray-800" },
  service: { label: "Szervizben", className: "bg-blue-100 text-blue-800" },
};

export function getStatusConfig(status: string | null | undefined) {
  return statusConfig[status || "available"] || statusConfig.available;
}

/** Document status labels */
export const docStatusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Függőben", className: "bg-amber-100 text-amber-800" },
  generated: { label: "Generálva", className: "bg-green-100 text-green-800" },
  error: { label: "Hiba", className: "bg-red-100 text-red-800" },
};

/** Document type labels (keys match db doc_type values) */
export const docTypeLabels: Record<string, string> = {
  adasveteli: "Adásvételi szerződés",
  uzembentartoi: "Üzembentartói szerződés",
  meghatalmazas: "Meghatalmazás",
  atadas_atveteli: "Átadás-átvételi elismervény",
};

/** Format date as Hungarian: "2026. február 21." */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "–";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "–";
  const months = ["január","február","március","április","május","június","július","augusztus","szeptember","október","november","december"];
  return `${d.getFullYear()}. ${months[d.getMonth()]} ${d.getDate()}.`;
}

/** Fuel type labels */
export const fuelTypeLabels: Record<string, string> = {
  benzin: "Benzin",
  dizel: "Dízel",
  elektromos: "Elektromos",
  hibrid: "Hibrid",
  lpg: "LPG",
  egyeb: "Egyéb",
};

/** Payment method labels */
export const paymentMethodLabels: Record<string, string> = {
  cash: "Készpénz",
  transfer: "Átutalás",
  financing: "Finanszírozás",
};

/** Sale status config */
export const saleStatusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Vázlat", className: "bg-gray-100 text-gray-800" },
  completed: { label: "Befejezett", className: "bg-green-100 text-green-800" },
  cancelled: { label: "Törölt", className: "bg-red-100 text-red-800" },
};
