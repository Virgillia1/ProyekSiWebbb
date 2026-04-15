import { MapPin, Clock, CheckCircle2, Package as PackageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface DeliveryDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  delivery: any;
}

export function DeliveryDetailModal({ open, onOpenChange, delivery }: DeliveryDetailModalProps) {
  if (!delivery) return null;

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Pengiriman</DialogTitle>
          <DialogDescription>
            Resi: {delivery.resiNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Status */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Status Saat Ini</div>
                <div className="text-xl font-bold text-primary">{delivery.status}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">Lokasi</div>
                <div className="font-medium">{delivery.currentLocation}</div>
              </div>
            </div>
          </div>

          {/* Recipient Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Penerima</div>
              <div className="font-medium">{delivery.recipient}</div>
              <div className="text-sm text-muted-foreground">{delivery.recipientPhone}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Alamat Tujuan</div>
              <div className="font-medium">{delivery.destination}</div>
            </div>
          </div>

          {/* Timeline */}
          {delivery.history && delivery.history.length > 0 && (
            <div>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Riwayat Pengiriman
              </h3>
              <div className="space-y-4">
                {[...delivery.history].reverse().map((item: any, index: number) => (
                  <div key={index} className="relative pl-8 pb-6 last:pb-0">
                    {/* Timeline line */}
                    {index < delivery.history.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-border" />
                    )}
                    
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-1.5">
                      {item.status === 'Paket Terkirim' ? (
                        <div className="bg-green-500 rounded-full p-1.5">
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        </div>
                      ) : (
                        <div className="bg-primary rounded-full p-1.5">
                          <PackageIcon className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className={`${item.status === 'Paket Terkirim' ? 'bg-green-50 border-green-200' : 'bg-secondary/50'} rounded-lg p-4 border`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium">{item.status}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(item.timestamp)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4" />
                        {item.location}
                      </div>

                      {item.description && (
                        <div className="text-sm text-muted-foreground">
                          {item.description}
                        </div>
                      )}

                      {/* Photo if exists */}
                      {item.photoUrl && (
                        <div className="mt-3">
                          <div className="text-xs font-medium text-muted-foreground mb-2">
                            Foto Bukti Pengiriman:
                          </div>
                          <img
                            src={item.photoUrl}
                            alt="Bukti pengiriman"
                            className="w-full h-64 object-cover rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!delivery.history || delivery.history.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada riwayat pengiriman
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
