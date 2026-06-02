import { useEffect, useState } from 'react';
import { Search, MapPin, Clock, Package, User, CheckCircle2, Eye } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { UpdateStatusModal } from '../../components/UpdateStatusModal';
import { DeliveryDetailModal } from '../../components/DeliveryDetailModal';
import {
  createCourierTrackingEvent,
  fetchCourierPackages,
  type CourierDelivery,
} from '../../lib/trackingApi';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

import { useMetadata } from '../../lib/useMetadata';

export function CourierTracking() {
  useMetadata(
    'Daftar Pengantaran Kurir',
    'Lihat dan kelola pengiriman paket aktif, update status pelacakan real-time, dan unggah foto bukti pengiriman.'
  );

  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState<CourierDelivery | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [deliveries, setDeliveries] = useState<CourierDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDeliveries = async () => {
    setIsLoading(true);

    try {
      const nextDeliveries = await fetchCourierPackages(user?.employeeId);
      setDeliveries(nextDeliveries);

      if (selectedDelivery) {
        const refreshedSelectedDelivery =
          nextDeliveries.find((delivery) => delivery.id === selectedDelivery.id) ?? null;
        setSelectedDelivery(refreshedSelectedDelivery);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memuat data pengiriman.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDeliveries();
  }, [user?.employeeId]);

  const filteredDeliveries = deliveries.filter(
    (delivery) =>
      delivery.resiNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.recipient.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateStatus = (delivery: CourierDelivery) => {
    setSelectedDelivery(delivery);
    setIsUpdateModalOpen(true);
  };

  const handleStatusUpdate = async (statusData: {
    status: string;
    location: string;
    description: string;
    timestamp: string;
    photoUrl?: string;
  }) => {
    if (!selectedDelivery) {
      return;
    }

    try {
      await createCourierTrackingEvent(selectedDelivery.id, statusData);
      await loadDeliveries();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui status paket.');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tracking Resi</h1>
        <p className="text-muted-foreground">Lacak dan kelola paket pengiriman Anda</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Cari nomor resi atau nama penerima..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Deliveries List */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat data pengiriman...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDeliveries.map((delivery, index) => (
            <motion.div
              key={delivery.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl border border-border p-6 hover:shadow-lg transition-shadow"
            >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-bold text-lg mb-1">{delivery.resiNumber}</div>
                <div className={`text-sm font-medium px-3 py-1 rounded-full inline-block ${delivery.bgColor} ${delivery.statusColor}`}>
                  {delivery.status}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Berat</div>
                <div className="font-medium">{delivery.weight}</div>
              </div>
            </div>

            {/* Recipient Info */}
            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">{delivery.recipient}</div>
                  <div className="text-sm text-muted-foreground">{delivery.recipientPhone}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Tujuan</div>
                  <div className="text-sm text-muted-foreground">{delivery.destination}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Lokasi Saat Ini</div>
                  <div className="text-sm text-muted-foreground">{delivery.currentLocation}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Estimasi</div>
                  <div className="text-sm text-muted-foreground">{delivery.estimatedTime}</div>
                </div>
              </div>
            </div>

            {/* Status History */}
            {delivery.history && delivery.history.length > 0 && (
              <div className="mb-4 p-3 bg-secondary/50 rounded-lg">
                <div className="text-xs font-medium text-muted-foreground mb-2">Update Terakhir:</div>
                <div className="space-y-1">
                  {delivery.history.slice(-2).reverse().map((h: any, idx: number) => (
                    <div key={idx} className="text-xs">
                      <div className="flex items-center gap-2">
                        {h.status === 'Paket Terkirim' && <CheckCircle2 className="h-3 w-3 text-green-600" />}
                        <span className="font-medium">{h.status}</span>
                        <span className="text-muted-foreground">• {h.location}</span>
                      </div>
                      {h.photoUrl && (
                        <img src={h.photoUrl} alt="Bukti" className="mt-2 w-full h-32 object-cover rounded" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {(() => {
                const isCompleted =
                  delivery.status === 'Selesai' ||
                  delivery.status.includes('Terkirim') ||
                  delivery.status === 'Sampai Tujuan';
                return (
                  <Button
                    className="flex-1"
                    size="sm"
                    onClick={() => handleUpdateStatus(delivery)}
                    disabled={isCompleted}
                  >
                    {isCompleted ? 'Selesai' : 'Update Status'}
                  </Button>
                );
              })()}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSelectedDelivery(delivery);
                  setIsDetailModalOpen(true);
                }}
              >
                <Eye className="h-4 w-4 mr-1" />
                Detail
              </Button>
              <Button variant="outline" size="sm">
                Hubungi
              </Button>
            </div>
            </motion.div>
          ))}
        </div>
      )}

      {!isLoading && filteredDeliveries.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Tidak ada paket ditemukan</p>
        </div>
      )}

      {/* Update Status Modal */}
      <UpdateStatusModal
        open={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
        delivery={selectedDelivery}
        onUpdateStatus={handleStatusUpdate}
      />

      {/* Delivery Detail Modal */}
      <DeliveryDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        delivery={selectedDelivery}
      />
    </div>
  );
}
