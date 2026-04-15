import { Package, Zap, Truck, Plane, Clock, DollarSign, LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ServiceCardProps {
  name: string;
  eta: string;
  coverage: string;
  notes: string;
  icon: string;
}

const iconMap: Record<string, LucideIcon> = {
  package: Package,
  zap: Zap,
  truck: Truck,
  plane: Plane,
  clock: Clock,
  'dollar-sign': DollarSign,
};

export function ServiceCard({ name, eta, coverage, notes, icon }: ServiceCardProps) {
  const Icon = iconMap[icon] || Package;

  return (
    <Card className="hover:shadow-lg transition-all hover:border-primary group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg mb-1">{name}</CardTitle>
            <p className="text-sm text-muted-foreground">ETA: {eta}</p>
          </div>
          <div className="bg-primary/10 group-hover:bg-primary group-hover:text-white transition-all p-3 rounded-lg">
            <Icon className="h-6 w-6 text-primary group-hover:text-white transition-all" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Coverage Area</p>
          <p className="text-sm">{coverage}</p>
        </div>
        <div className="pt-3 border-t">
          <p className="text-xs text-primary">{notes}</p>
        </div>
      </CardContent>
    </Card>
  );
}
