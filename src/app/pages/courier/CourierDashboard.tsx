import { useEffect, useState } from 'react';
import { Package, TruckIcon, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchCourierPackages, type CourierDelivery } from '../../lib/trackingApi';
import { toast } from 'sonner';

export function CourierDashboard() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<CourierDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadStats = async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    try {
      const nextDeliveries = await fetchCourierPackages(user?.employeeId);
      setDeliveries(nextDeliveries);
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
    void loadStats();
  }, [user?.employeeId]);

  const totalCount = deliveries.length;
  const completedCount = deliveries.filter(d => d.status.includes('Terkirim') || d.status === 'Selesai' || d.status === 'Sampai Tujuan').length;
  const inProgressCount = deliveries.filter(d => d.status === 'Dalam Pengiriman' || d.status === 'Lagi Dikirim').length;
  const waitingCount = totalCount - completedCount - inProgressCount;

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
      color: 'bg-green-50',
      trend: 'Sukses',
    },
    {
      title: 'Menunggu',
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
                  className="bg-white rounded-xl p-6 border border-border"
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

          {/* Recent Deliveries */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-xl font-bold mb-4">Pengiriman Terkini</h2>
            {recentDeliveries.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">Tidak ada pengiriman ditugaskan kepada Anda.</div>
            ) : (
              <div className="space-y-4">
                {recentDeliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium mb-1">{delivery.resiNumber}</div>
                      <div className="text-sm text-muted-foreground">
                        {delivery.recipient} • {delivery.destination}
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${delivery.statusColor}`}>
                      {delivery.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
