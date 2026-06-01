import { useState } from 'react';
import { Calendar, Package, TruckIcon, CheckCircle2, XCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';

export function CourierHistory() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const stats = {
    week: {
      total: 45,
      completed: 42,
      cancelled: 3,
      inProgress: 0,
    },
    month: {
      total: 156,
      completed: 128,
      cancelled: 5,
      inProgress: 23,
    },
    year: {
      total: 1842,
      completed: 1756,
      cancelled: 63,
      inProgress: 23,
    },
  };

  const currentStats = stats[selectedPeriod as keyof typeof stats];

  const deliveryHistory = [
    {
      id: '1',
      resiNumber: 'CKL2026040001',
      recipient: 'Siti Rahayu',
      destination: 'Bandung',
      date: '2026-04-15 14:30',
      status: 'Selesai',
      statusColor: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: CheckCircle2,
      payment: 'Rp 75.000',
    },
    {
      id: '2',
      resiNumber: 'CKL2026040002',
      recipient: 'Budi Santoso',
      destination: 'Malang',
      date: '2026-04-15 10:00',
      status: 'Selesai',
      statusColor: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: CheckCircle2,
      payment: 'Rp 50.000',
    },
    {
      id: '3',
      resiNumber: 'CKL2026040003',
      recipient: 'Linda Kusuma',
      destination: 'Bekasi',
      date: '2026-04-14 16:45',
      status: 'Selesai',
      statusColor: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: CheckCircle2,
      payment: 'Rp 35.000',
    },
    {
      id: '4',
      resiNumber: 'CKL2026040004',
      recipient: 'Rina Permata',
      destination: 'Depok',
      date: '2026-04-14 11:20',
      status: 'Dibatalkan',
      statusColor: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: XCircle,
      payment: 'Rp 0',
    },
    {
      id: '5',
      resiNumber: 'CKL2026040005',
      recipient: 'Ahmad Fauzi',
      destination: 'Surabaya',
      date: '2026-04-13 09:15',
      status: 'Selesai',
      statusColor: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: CheckCircle2,
      payment: 'Rp 120.000',
    },
  ];

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
          <div className="text-sm text-muted-foreground">Dibatalkan</div>
        </motion.div>
      </div>

      {/* Success Rate */}
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

      {/* History List */}
      <div className="bg-white rounded-xl border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold">Riwayat Pengiriman</h2>
        </div>
        <div className="divide-y divide-border">
          {deliveryHistory.map((delivery, index) => {
            const Icon = delivery.icon;
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
                        {delivery.date}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">Pembayaran</div>
                    <div className="font-bold text-lg text-primary">{delivery.payment}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
