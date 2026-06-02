import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle2, Package, Truck } from 'lucide-react';
import { motion } from 'motion/react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import { useAdminData } from '../../contexts/AdminDataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../../components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { monthOptions, type PackageStatus } from '../../data/adminData';

const chartConfig = {
  terkirim: {
    label: 'Sudah Dikirim',
    color: 'var(--color-chart-1)',
  },
  diproses: {
    label: 'Lagi Dikirim',
    color: '#0f766e',
  },
};

const incomeChartConfig = {
  penghasilan: {
    label: 'Penghasilan',
    color: '#10b981',
  },
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

const isDeliveredStatus = (status: PackageStatus) =>
  status === 'Selesai' || status === 'Sampai Tujuan';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { packages } = useAdminData();
  const [selectedMonth, setSelectedMonth] = useState('2026-04');
  const isHistoricalMonth = selectedMonth < '2026-04';

  const monthPackages = useMemo(
    () => packages.filter((item) => item.monthKey === selectedMonth),
    [packages, selectedMonth]
  );

  const displayPackages = useMemo(() => {
    if (!isHistoricalMonth) {
      return monthPackages;
    }

    return monthPackages.map((item) => ({
      ...item,
      status: 'Selesai' as const,
      currentLocation: item.destination,
      deliveredAt: item.deliveredAt ?? item.shippedAt,
    }));
  }, [isHistoricalMonth, monthPackages]);

  const chartData = useMemo(() => {
    const baseChart = ['M1', 'M2', 'M3', 'M4'].map((week) => {
      const weekPackages = monthPackages.filter((item) => item.week === week);

      return {
        week,
        terkirim: weekPackages.filter((item) => isDeliveredStatus(item.status)).length,
        diproses: weekPackages.filter((item) => !isDeliveredStatus(item.status)).length,
      };
    });

    if (!isHistoricalMonth) {
      return baseChart;
    }

    return baseChart.map((item) => ({
      ...item,
      terkirim: item.terkirim + item.diproses,
      diproses: 0,
    }));
  }, [isHistoricalMonth, monthPackages]);

  const incomeChartData = useMemo(
    () =>
      ['M1', 'M2', 'M3', 'M4'].map((week) => {
        const weekPackages = monthPackages.filter((item) => item.week === week);
        const totalIncome = weekPackages.reduce((sum, item) => sum + (item.shippingCost ?? 0), 0);

        return {
          week,
          penghasilan: totalIncome,
        };
      }),
    [monthPackages]
  );

  const summary = useMemo(() => {
    const delivered = displayPackages.filter((item) => isDeliveredStatus(item.status));
    const inTransit = displayPackages.filter((item) => !isDeliveredStatus(item.status));
    const totalValue = displayPackages.reduce((sum, item) => sum + item.declaredValue, 0);

    return {
      total: displayPackages.length,
      delivered: delivered.length,
      inTransit: inTransit.length,
      totalValue,
    };
  }, [displayPackages]);

  const currentMonthLabel =
    monthOptions.find((item) => item.value === selectedMonth)?.label ?? selectedMonth;

  const openShipmentList = () => {
    navigate(`/admin/shipments?month=${selectedMonth}`);
  };

  const summaryCards = [
    {
      title: 'Total Paket',
      value: summary.total,
      icon: Package,
      description: 'Total paket pada bulan yang sedang dipilih.',
      accent: 'bg-emerald-500',
    },
    {
      title: 'Sudah Dikirim',
      value: summary.delivered,
      icon: CheckCircle2,
      description: 'Paket selesai dan sudah diterima pelanggan.',
      accent: 'bg-teal-600',
    },
    {
      title: 'Lagi Dikirim',
      value: summary.inTransit,
      icon: Truck,
      description: isHistoricalMonth
        ? 'Untuk bulan ini seluruh paket dianggap sudah selesai.'
        : 'Paket yang masih aktif dalam perjalanan.',
      accent: 'bg-lime-500',
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-[#63D25F]/20 bg-[#63D25F] text-white shadow-sm">
        <CardContent className="grid gap-6 p-5 md:grid-cols-[minmax(240px,320px)_minmax(0,1fr)] md:items-end">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-white/80">Filter bulan</p>
              <p className="mt-1 text-2xl font-semibold">{currentMonthLabel}</p>
            </div>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="border-white/20 bg-white text-foreground">
                <SelectValue placeholder="Pilih bulan" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex min-h-[126px] flex-col justify-between rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-white/80">Total nilai paket</p>
                <p className="mt-3 text-2xl font-semibold">{formatCurrency(summary.totalValue)}</p>
              </div>
              <div className="rounded-2xl bg-white/20 p-3 text-white">
                <Package className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-white/80">
              Akumulasi nominal paket untuk bulan yang sedang dipilih.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="h-full"
            >
              <Card
                role="button"
                tabIndex={0}
                onClick={openShipmentList}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openShipmentList();
                  }
                }}
                className="h-full cursor-pointer border-border/80 bg-white/90 shadow-sm transition hover:-translate-y-0.5 hover:border-[#63D25F]/50 hover:shadow-md"
              >
                <CardContent className="flex h-full min-h-[176px] flex-col justify-between p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">{item.title}</p>
                      <p className="text-3xl font-semibold">{item.value}</p>
                    </div>
                    <div className={`rounded-2xl ${item.accent} p-3 text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <p className="max-w-[16rem] text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card
          role="button"
          tabIndex={0}
          onClick={openShipmentList}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openShipmentList();
            }
          }}
          className="cursor-pointer border-border/80 bg-white/90 shadow-sm transition hover:-translate-y-0.5 hover:border-[#63D25F]/50 hover:shadow-md"
        >
          <CardHeader className="pb-2">
            <CardTitle>Grafik Pengiriman Bulanan</CardTitle>
            <CardDescription>
              Perbandingan paket sudah dikirim dan lagi dikirim setiap minggu di {currentMonthLabel}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="terkirim" fill="var(--color-terkirim)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="diproses" fill="var(--color-diproses)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-white/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>Grafik Penghasilan Bulanan</CardTitle>
            <CardDescription>
              Akumulasi penghasilan harga pengiriman setiap minggu di {currentMonthLabel}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={incomeChartConfig} className="aspect-auto h-[220px] w-full">
              <LineChart data={incomeChartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="penghasilan"
                  stroke="var(--color-penghasilan)"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
