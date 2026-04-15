import { MapPin } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Rating } from './Rating';
import { Staff } from '../data/mockData';

interface StaffCardProps {
  staff: Staff;
  onClick: () => void;
}

export function StaffCard({ staff, onClick }: StaffCardProps) {
  return (
    <Card
      className="hover:shadow-lg transition-all cursor-pointer hover:border-primary group"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <img
            src={staff.photo}
            alt={staff.name}
            className="h-20 w-20 rounded-full object-cover ring-2 ring-offset-2 ring-gray-200 group-hover:ring-primary transition-all"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{staff.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{staff.role}</p>
            <div className="flex items-center gap-2 mb-2">
              <Rating rating={staff.rating} size="sm" showNumber />
              <span className="text-xs text-muted-foreground">
                ({staff.totalReviews} reviews)
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{staff.location}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
