import { Package, TruckIcon, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export function CourierDashboard() {
  const stats = [
    {
      title: 'Total Pengiriman',
      value: '156',
      icon: Package,
      color: 'bg-blue-500',
      trend: '+12%',
    },
    {
      title: 'Dalam Pengiriman',
      value: '23',
      icon: TruckIcon,
      color: 'bg-primary',
      trend: '+5%',
    },
    {
      title: 'Selesai',
      value: '128',
      icon: CheckCircle2,
      color: 'bg-green-500',
      trend: '+8%',
    },
    {
      title: 'Menunggu',
      value: '5',
      icon: Clock,
      color: 'bg-orange-500',
      trend: '-2%',
    },
  ];

  const recentDeliveries = [
    {
      id: '1',
      resiNumber: 'CKL2026040001',
      recipient: 'Siti Rahayu',
      destination: 'Bandung',
      status: 'Dalam Pengiriman',
      statusColor: 'text-primary',
    },
    {
      id: '2',
      resiNumber: 'CKL2026040005',
      recipient: 'Ahmad Fauzi',
      destination: 'Surabaya',
      status: 'Dalam Pengiriman',
      statusColor: 'text-primary',
    },
    {
      id: '3',
      resiNumber: 'CKL2026040008',
      recipient: 'Dewi Lestari',
      destination: 'Yogyakarta',
      status: 'Menunggu Pickup',
      statusColor: 'text-orange-500',
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Selamat datang kembali, Budi Santoso</p>
      </div>

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
      </div>
    </div>
  );
}
