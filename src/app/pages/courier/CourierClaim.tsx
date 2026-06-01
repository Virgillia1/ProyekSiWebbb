import { useEffect, useState } from 'react';
import { BoxIcon, MapPin, Package, ArrowRight, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchCourierPackages, claimPackageRequest, type CourierDelivery } from '../../lib/trackingApi';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

export function CourierClaim() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<CourierDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAvailablePackages = async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    try {
      const nextDeliveries = await fetchCourierPackages(user?.employeeId, 'unclaimed');
      setDeliveries(nextDeliveries);
      if (silent) {
        toast.success('Daftar paket baru diperbarui!', {
          description: 'Data paket tersedia paling baru telah dimuat.',
        });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memuat paket yang tersedia.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void loadAvailablePackages();
  }, []);

  const handleClaim = async (packageId: string) => {
    if (!user) {
      toast.error('Anda harus login terlebih dahulu.');
      return;
    }
    setClaimingId(packageId);
    try {
      await claimPackageRequest(packageId, user.employeeId ?? '', user.name);
      toast.success('Paket berhasil diambil!', {
        description: 'Paket ini kini terdaftar dalam daftar pengiriman Anda.',
      });
      await loadAvailablePackages();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mengambil paket.');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Ambil Paket Baru</h1>
          <p className="text-muted-foreground">Pilih dan ambil paket baru yang belum ditugaskan ke kurir</p>
        </div>
        <button
          onClick={() => {
            setIsRefreshing(true);
            void loadAvailablePackages(true);
          }}
          disabled={isLoading || isRefreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-border hover:bg-secondary hover:text-foreground text-muted-foreground font-semibold shadow-sm transition-all duration-300 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
          Segarkan
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat data paket tersedia...</div>
      ) : (
        <>
          {deliveries.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-border">
              <BoxIcon className="h-16 w-16 text-muted-foreground/60 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-1 text-foreground">Tidak Ada Paket Baru</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Saat ini seluruh paket sudah diambil atau ditugaskan. Silakan periksa kembali nanti!
              </p>
              <Button onClick={loadAvailablePackages} className="mt-4" variant="outline">
                Segarkan Halaman
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {deliveries.map((delivery, index) => (
                <motion.div
                  key={delivery.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header Card */}
                    <div className="flex items-start justify-between mb-4 border-b border-border pb-4">
                      <div>
                        <div className="font-bold text-lg text-primary">{delivery.resiNumber}</div>
                        <div className="text-xs text-muted-foreground">Berat: {delivery.weight}</div>
                      </div>
                      <div className="bg-[#63D25F]/10 text-[#2F8A2E] text-xs font-semibold px-3 py-1 rounded-full border border-[#63D25F]/20">
                        Tersedia untuk Diambil
                      </div>
                    </div>

                    {/* Route Details */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-secondary p-2 rounded-lg text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Rute Pengiriman</p>
                          <div className="flex items-center gap-2 font-medium text-sm">
                            <span>{delivery.currentLocation}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span>{delivery.destination}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-secondary p-2 rounded-lg text-muted-foreground">
                          <Package className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Penerima</p>
                          <p className="font-medium text-sm">{delivery.recipient}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-secondary p-2 rounded-lg text-muted-foreground">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Estimasi Pengantaran</p>
                          <p className="font-medium text-sm text-amber-600">{delivery.estimatedTime}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <Button
                    onClick={() => handleClaim(delivery.id)}
                    className="w-full bg-[#63D25F] hover:bg-[#52c14e] text-white font-semibold py-5 rounded-lg flex items-center justify-center gap-2 border border-[#63D25F]/30"
                    disabled={claimingId !== null}
                  >
                    <CheckCircle className="h-5 w-5" />
                    {claimingId === delivery.id ? 'Mengambil...' : 'Ambil Paket Ini'}
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
