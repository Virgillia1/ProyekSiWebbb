import { useEffect, useState } from 'react';
import { Package, TruckIcon, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchCourierPackages, createCourierTrackingEvent, type CourierDelivery } from '../../lib/trackingApi';
import { toast } from 'sonner';

export function CourierDashboard() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<CourierDelivery[]>([]);
  const [unclaimedDeliveries, setUnclaimedDeliveries] = useState<CourierDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadStats = async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    try {
      const [nextDeliveries, nextUnclaimed] = await Promise.all([
        fetchCourierPackages(user?.employeeId),
        fetchCourierPackages(user?.employeeId, 'unclaimed'),
      ]);
      setDeliveries(nextDeliveries);
      setUnclaimedDeliveries(nextUnclaimed);
      if (silent) {
        toast.success('Dashboard diperbarui!', {
          description: 'Data pengiriman terbaru telah dimuat.',
        });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memuat data dashboard.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.employeeId) {
      void loadStats();
    }
  }, [user?.employeeId]);

  const handleClaimPackage = async (packageId: string) => {
    try {
      await createCourierTrackingEvent(packageId, {
        status: 'Dalam Pengiriman',
        location: 'Gudang CargoLite',
        description: 'Paket telah diambil oleh kurir dan sedang dalam perjalanan.',
        timestamp: new Date().toISOString(),
      });
      toast.success('Paket berhasil diambil!', {
        description: 'Status paket sekarang "Dalam Pengiriman".',
      });
      void loadStats(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mengambil paket.');
    }
  };

  const completedCount = deliveries.filter(d => 
    d.status.includes('Terkirim') || 
    d.status === 'Selesai' || 
    d.status === 'Sampai Tujuan'
  ).length;

  const inProgressCount = deliveries.filter(d => 
    d.status === 'Dalam Pengiriman' || 
    d.status === 'Lagi Dikirim' || 
    d.status === 'Transit' || 
    d.status === 'Menuju ke Alamat Penerima'
  ).length;

  const waitingCount = unclaimedDeliveries.length;
  const totalCount = deliveries.length + unclaimedDeliveries.length;

  const stats = [
    {
      title: 'Total Pengiriman',
      value: String(totalCount),
      icon: Package,
      color: 'bg-blue-500',
      trend: 'Aktif',
    },
    {
      title: 'Dalam Pengiriman',
      value: String(inProgressCount),
      icon: TruckIcon,
      color: 'bg-primary',
      trend: 'Perjalanan',
    },
    {
      title: 'Selesai',
      value: String(completedCount),
      icon: CheckCircle2,
      color: 'bg-green-500',
      trend: 'Sukses',
    },
    {
      title: 'Menunggu Pengiriman',
      value: String(waitingCount),
      icon: Clock,
      color: 'bg-orange-500',
      trend: 'Pending',
    },
  ];

  const recentDeliveries = deliveries.slice(0, 5);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Selamat datang kembali, {user?.name}</p>
        </div>
        <button
          onClick={() => {
            setIsRefreshing(true);
            void loadStats(true);
          }}
          disabled={isLoading || isRefreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-border hover:bg-secondary hover:text-foreground text-muted-foreground font-semibold shadow-sm transition-all duration-300 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
          Segarkan
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat data dashboard...</div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 border border-border shadow-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm text-green-600 font-medium">{stat.trend}</span>
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.title}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Interactive Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Unclaimed/New Packages */}
            <div className="bg-white rounded-xl border border-border p-6 flex flex-col shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                </span>
                Paket Baru Menunggu Pengiriman
              </h2>
              {unclaimedDeliveries.length === 0 ? (
                <div className="text-center py-12 flex-1 flex flex-col items-center justify-center border border-dashed border-border rounded-xl bg-secondary/10">
                  <Package className="h-12 w-12 text-muted-foreground mb-3 opacity-60" />
                  <div className="text-muted-foreground font-semibold">Semua paket sudah diambil!</div>
                  <div className="text-xs text-muted-foreground mt-1">Tidak ada paket baru yang menunggu Anda.</div>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  {unclaimedDeliveries.map((delivery) => (
                    <div
                      key={delivery.id}
                      className="flex items-center justify-between p-4 bg-orange-50/30 hover:bg-orange-50/60 border border-orange-100/80 rounded-xl transition-all duration-200"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-orange-950 mb-0.5 truncate">{delivery.resiNumber}</div>
                        <div className="text-xs text-orange-700 font-semibold mb-1.5">{delivery.destination}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          Penerima: <span className="font-semibold text-foreground">{delivery.recipient}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleClaimPackage(delivery.id)}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                      >
                        <TruckIcon className="h-3.5 w-3.5" />
                        Ambil Paket
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Deliveries */}
            <div className="bg-white rounded-xl border border-border p-6 flex flex-col shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TruckIcon className="h-5 w-5 text-primary" />
                Pengiriman Terkini
              </h2>
              {recentDeliveries.length === 0 ? (
                <div className="text-center py-12 flex-1 flex flex-col items-center justify-center border border-dashed border-border rounded-xl bg-secondary/10">
                  <TruckIcon className="h-12 w-12 text-muted-foreground mb-3 opacity-60" />
                  <div className="text-muted-foreground font-semibold">Tidak ada pengiriman aktif</div>
                  <div className="text-xs text-muted-foreground mt-1">Klaim paket baru untuk memulai pengiriman.</div>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  {recentDeliveries.map((delivery) => (
                    <div
                      key={delivery.id}
                      className="flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/60 rounded-xl border border-border/40 transition-all duration-200"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-bold mb-0.5 truncate">{delivery.resiNumber}</div>
                        <div className="text-xs text-muted-foreground mb-1.5">{delivery.destination}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          Penerima: <span className="font-semibold text-foreground">{delivery.recipient}</span>
                        </div>
                      </div>
                      <div className={`text-xs font-semibold px-2.5 py-1 rounded-full ${delivery.bgColor} ${delivery.statusColor} shrink-0`}>
                        {delivery.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
