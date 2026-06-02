import { useEffect, useState } from 'react';
import { Calendar, Package, TruckIcon, CheckCircle2, XCircle, TrendingUp, BarChart3, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchCourierPackages, type CourierDelivery } from '../../lib/trackingApi';
import { toast } from 'sonner';

export function CourierHistory() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [deliveries, setDeliveries] = useState<CourierDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCourierPackages(user?.employeeId);
      setDeliveries(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memuat histori pengiriman.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.employeeId) {
      void loadHistory();
    }
  }, [user?.employeeId]);

  const getFilteredDeliveries = () => {
    const now = new Date();
    let cutoff = new Date();
    if (selectedPeriod === 'week') {
      cutoff.setDate(now.getDate() - 7);
    } else if (selectedPeriod === 'month') {
      cutoff.setMonth(now.getMonth() - 1);
    } else {
      cutoff.setFullYear(now.getFullYear() - 1);
    }

    return deliveries.filter(d => {
      const lastEvent = d.history && d.history.length > 0 ? d.history[d.history.length - 1] : null;
      const dateStr = lastEvent?.timestamp || now.toISOString();
      const date = new Date(dateStr);
      return date >= cutoff;
    });
  };

  const filtered = getFilteredDeliveries();

  const total = filtered.length;
  const completed = filtered.filter(d => 
    d.status.includes('Terkirim') || 
    d.status === 'Selesai' || 
    d.status === 'Sampai Tujuan'
  ).length;
  const cancelled = filtered.filter(d => 
    d.status === 'Dibatalkan' || 
    d.status === 'Gagal'
  ).length;
  const inProgress = total - completed - cancelled;

  const successRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '100.0';

  const periods = [
    { value: 'week', label: 'Minggu Ini' },
    { value: 'month', label: 'Bulan Ini' },
    { value: 'year', label: 'Tahun Ini' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Histori Pengiriman</h1>
        <p className="text-muted-foreground">Lihat statistik dan riwayat pengiriman Anda</p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 mb-6">
        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => setSelectedPeriod(period.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedPeriod === period.value
                ? 'bg-primary text-white font-semibold'
                : 'bg-white border border-border hover:bg-secondary text-muted-foreground'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat data histori...</div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 border border-border shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-500 p-3 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{total}</div>
              <div className="text-sm text-muted-foreground">Total Pengiriman</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 border border-border shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-green-500 p-3 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{completed}</div>
              <div className="text-sm text-muted-foreground">Selesai</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 border border-border shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-primary p-3 rounded-lg">
                  <TruckIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{inProgress}</div>
              <div className="text-sm text-muted-foreground">Dalam Proses</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 border border-border shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-red-500 p-3 rounded-lg">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{cancelled}</div>
              <div className="text-sm text-muted-foreground">Dibatalkan</div>
            </motion.div>
          </div>

          {/* Success Rate */}
          <div className="bg-[#63D25F] rounded-xl p-6 mb-8 text-white shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-6 w-6" />
                  <span className="text-lg font-medium">Tingkat Keberhasilan</span>
                </div>
                <div className="text-4xl font-bold">
                  {successRate}%
                </div>
                <div className="text-sm opacity-90 mt-1">
                  {completed} dari {total} pengiriman berhasil diselesaikan
                </div>
              </div>
              <BarChart3 className="h-20 w-20 opacity-20" />
            </div>
            <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
          </div>

          {/* History List */}
          <div className="bg-white rounded-xl border border-border shadow-sm">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">Riwayat Pengiriman</h2>
            </div>
            <div className="divide-y divide-border">
              {filtered.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-60" />
                  Belum ada riwayat pengiriman untuk periode ini.
                </div>
              ) : (
                filtered.map((delivery, index) => {
                  const isCompleted = delivery.status.includes('Terkirim') || delivery.status === 'Selesai' || delivery.status === 'Sampai Tujuan';
                  const isCancelled = delivery.status === 'Dibatalkan' || delivery.status === 'Gagal';
                  const Icon = isCompleted ? CheckCircle2 : isCancelled ? XCircle : TruckIcon;
                  
                  const lastEvent = delivery.history && delivery.history.length > 0 ? delivery.history[delivery.history.length - 1] : null;
                  const formattedDate = lastEvent 
                    ? new Date(lastEvent.timestamp).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Baru saja';

                  return (
                    <motion.div
                      key={delivery.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4 flex-1 min-w-0">
                          <div className={`${delivery.bgColor} p-3 rounded-lg h-fit shrink-0`}>
                            <Icon className={`h-6 w-6 ${delivery.statusColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <div className="font-bold text-foreground">{delivery.resiNumber}</div>
                              <div className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${delivery.bgColor} ${delivery.statusColor}`}>
                                {delivery.status}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground mb-1">
                              Penerima: <span className="font-semibold text-foreground">{delivery.recipient}</span>
                            </div>
                            <div className="text-sm text-muted-foreground mb-1">
                              Tujuan: <span className="font-semibold text-foreground">{delivery.destination}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {formattedDate}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs text-muted-foreground mb-1">Berat Paket</div>
                          <div className="font-bold text-lg text-primary">{delivery.weight}</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
