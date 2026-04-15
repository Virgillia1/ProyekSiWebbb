import { MapPin, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Rating } from './Rating';
import { Staff } from '../data/mockData';
import { ScrollArea } from './ui/scroll-area';

interface StaffDetailModalProps {
  staff: Staff | null;
  open: boolean;
  onClose: () => void;
}

export function StaffDetailModal({ staff, open, onClose }: StaffDetailModalProps) {
  if (!staff) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Staff Profile</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Profile Section */}
            <div className="flex items-start gap-6">
              <img
                src={staff.photo}
                alt={staff.name}
                className="h-32 w-32 rounded-full object-cover ring-4 ring-offset-2 ring-primary/20"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{staff.name}</h2>
                <p className="text-muted-foreground mb-3">{staff.role}</p>
                <div className="flex items-center gap-2 mb-3">
                  <Rating rating={staff.rating} size="md" showNumber />
                  <span className="text-sm text-muted-foreground">
                    ({staff.totalReviews} total reviews)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{staff.location}</span>
                </div>
              </div>
            </div>

            {/* Rating Breakdown */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Rating Breakdown</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = staff.reviews.filter((r) => r.rating === star).length;
                  const percentage = (count / staff.reviews.length) * 100;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-sm w-12">{star} star</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer Reviews */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Customer Reviews</h3>
              <div className="space-y-4">
                {staff.reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{review.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <Rating rating={review.rating} size="sm" />
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
