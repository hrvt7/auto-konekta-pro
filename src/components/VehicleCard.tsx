import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Car, MoreVertical } from "lucide-react";
import { formatHUF, formatKm, getStatusConfig } from "@/lib/format";

interface VehicleCardProps {
  vehicle: {
    id: string;
    brand: string;
    model: string;
    year: number | null;
    mileage: number | null;
    selling_price: number | null;
    status: string | null;
    primary_image_url?: string | null;
  };
  onStatusChange?: (id: string, newStatus: string) => void;
  onDelete?: (id: string) => void;
}

export default function VehicleCard({ vehicle, onStatusChange, onDelete }: VehicleCardProps) {
  const sc = getStatusConfig(vehicle.status);

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="aspect-[16/10] bg-muted flex items-center justify-center overflow-hidden">
        {vehicle.primary_image_url ? (
          <img src={vehicle.primary_image_url} alt={`${vehicle.brand} ${vehicle.model}`} className="h-full w-full object-cover" />
        ) : (
          <Car className="h-12 w-12 text-muted-foreground/40" />
        )}
      </div>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-foreground">{vehicle.brand} {vehicle.model}</h3>
            {vehicle.year && <p className="text-sm text-muted-foreground">{vehicle.year}</p>}
          </div>
          <Badge className={sc.className}>{sc.label}</Badge>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatKm(vehicle.mileage)}</span>
          <span className="font-semibold text-foreground">{formatHUF(vehicle.selling_price)}</span>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link to={`/vehicles/${vehicle.id}`}>Részletek</Link>
          </Button>
          {vehicle.status === "available" && (
            <Button size="sm" className="flex-1" asChild>
              <Link to={`/sales/new?vehicle_id=${vehicle.id}`}>Eladás</Link>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/vehicles/${vehicle.id}/edit`}>Szerkesztés</Link>
              </DropdownMenuItem>
              {["available", "reserved", "service"].filter(s => s !== vehicle.status).map(s => (
                <DropdownMenuItem key={s} onClick={() => onStatusChange?.(vehicle.id, s)}>
                  Státusz: {getStatusConfig(s).label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete?.(vehicle.id)}>
                Törlés
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
