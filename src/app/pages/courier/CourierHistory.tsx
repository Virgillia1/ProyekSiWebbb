import { useEffect, useState } from 'react';
import { Calendar, Package, TruckIcon, CheckCircle2, XCircle, TrendingUp, BarChart3, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchCourierPackages, type CourierDelivery } from '../../lib/trackingApi';
import { toast } from 'sonner';

export function CourierHistory() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [deliveries, setDeliveries] = useState<CourierDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadHistory = async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    try {
      const nextDeliveries = await fetchCourierPackages(user?.employeeId);
      setDeliveries(nextDeliveries);
      if (silent) {
        toast.success('Histori pengiriman diperbarui!', {
          description: 'Data riwayat pengiriman paling mutakhir telah dimuat.',
        });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memuat histori pengiriman.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, [user?.employeeId]);

  const now = new Date('2026-06-01T22:17:00+07:00');

  const getFilteredDeliveries = () => {
    return deliveries.filter((d) => {
      const shipDate = new Date(d.date);
      const diffTime = Math.abs(now.getTime() - shipDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (selectedPeriod === 'week') {
        return diffDays <= 7;
      } else if (selectedPeriod === 'month') {
        return diffDays <= 30;
      } else {
        return diffDays <= 365;
      }
    });
  };

  const activeDeliveries = getFilteredDeliveries();

  const total = activeDeliveries.length;
  const completed = activeDeliveries.filter(d => d.status.includes('Terkirim') || d.status === 'Selesai' || d.status === 'Sampai Tujuan').length;
  const inProgress = activeDeliveries.filter(d => d.status === 'Dalam Pengiriman' || d.status === 'Lagi Dikirim').length;
  const cancelled = total - completed - inProgress;

  const currentStats = {
    total,
    completed,
    inProgress,
    cancelled,
  };

  const periods = [
    { value: 'week', label: 'Minggu Ini' },
    { value: 'month', label: 'Bulan Ini' },
    { value: 'year', label: 'Tahun Ini' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Histori Pengiriman</h1>
          <p className="text-muted-foreground">Lihat statistik dan riwayat pengiriman Anda</p>
        </div>
        <button
          onClick={() => {
            setIsRefreshing(true);
            void loadHistory(true);
          }}
          disabled={isLoading || isRefreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-border hover:bg-secondary hover:text-foreground text-muted-foreground font-semibold shadow-sm transition-all duration-300 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
          Segarkan
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat histori pengiriman...</div>
      ) : (
        <>
          {/* Period Selector */}
          <div className="flex gap-2 mb-6">
            {periods.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedPeriod === period.value
                    ? 'bg-primary text-white'
                    : 'bg-white border border-border hover:bg-secondary'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 border border-border"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-500 p-3 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{currentStats.total}</div>
              <div className="text-sm text-muted-foreground">Total Pengiriman</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 border border-border"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-green-500 p-3 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{currentStats.completed}</div>
              <div className="text-sm text-muted-foreground">Selesai</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 border border-border"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-primary p-3 rounded-lg">
                  <TruckIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{currentStats.inProgress}</div>
              <div className="text-sm text-muted-foreground">Dalam Proses</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 border border-border"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-red-500 p-3 rounded-lg">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{currentStats.cancelled}</div>
              <div className="text-sm text-muted-foreground">Menunggu/Pending</div>
            </motion.div>
          </div>

          {/* Success Rate */}
          {currentStats.total > 0 && (
            <div className="bg-[#63D25F] rounded-xl p-6 mb-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-6 w-6" />
                    <span className="text-lg font-medium">Tingkat Keberhasilan</span>
                  </div>
                  <div className="text-4xl font-bold">
                    {((currentStats.completed / currentStats.total) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm opacity-90 mt-1">
                    {currentStats.completed} dari {currentStats.total} pengiriman berhasil
                  </div>
                </div>
                <BarChart3 className="h-20 w-20 opacity-20" />
              </div>
            </div>
          )}

          {/* History List */}
          <div className="bg-white rounded-xl border border-border">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">Riwayat Pengiriman</h2>
            </div>
            {activeDeliveries.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">Tidak ada histori pengiriman untuk periode ini.</div>
            ) : (
              <div className="divide-y divide-border">
                {activeDeliveries.map((delivery, index) => {
                  const isDone = delivery.status.includes('Terkirim') || delivery.status === 'Selesai' || delivery.status === 'Sampai Tujuan';
                  const isFail = delivery.status === 'Pending';
                  const Icon = isDone ? CheckCircle2 : isFail ? XCircle : TruckIcon;
                  return (
                    <motion.div
                      key={delivery.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          <div className={`${delivery.bgColor} p-3 rounded-lg h-fit`}>
                            <Icon className={`h-6 w-6 ${delivery.statusColor}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="font-bold">{delivery.resiNumber}</div>
                              <div className={`text-sm font-medium px-3 py-1 rounded-full ${delivery.bgColor} ${delivery.statusColor}`}>
                                {delivery.status}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground mb-1">
                              Penerima: <span className="font-medium text-foreground">{delivery.recipient}</span>
                            </div>
                            <div className="text-sm text-muted-foreground mb-1">
                              Tujuan: <span className="font-medium text-foreground">{delivery.destination}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(delivery.date).toLocaleString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground mb-1">Berat Paket</div>
                          <div className="font-bold text-lg text-primary">{delivery.weight}</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
