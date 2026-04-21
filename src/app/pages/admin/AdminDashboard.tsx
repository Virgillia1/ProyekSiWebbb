import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  MapPin,
  Package,
  PackageSearch,
  PencilLine,
  Save,
  Truck,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../../components/ui/chart';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  adminPackages,
  deliveryChartByMonth,
  monthOptions,
  type AdminPackage,
  type PackageStatus,
} from '../../data/adminData';

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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

const formatDateTime = (value?: string) =>
  value
    ? new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : 'Belum tersedia';

export function AdminDashboard() {
  const [packages, setPackages] = useState(adminPackages);
  const [selectedMonth, setSelectedMonth] = useState('2026-04');
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [isEditingPackage, setIsEditingPackage] = useState(false);
  const [draftPackage, setDraftPackage] = useState<AdminPackage | null>(null);
  const isHistoricalMonth = selectedMonth < '2026-04';

  const monthPackages = useMemo(
    () => packages.filter((item) => item.monthKey === selectedMonth),
    [packages, selectedMonth]
  );

  const filteredPackages = useMemo(() => {
    if (!isHistoricalMonth) {
      return monthPackages;
    }

    return monthPackages.map((item) => ({
      ...item,
      status: 'Sudah Dikirim' as const,
      currentLocation: item.destination,
      deliveredAt: item.deliveredAt ?? item.shippedAt,
    }));
  }, [isHistoricalMonth, monthPackages]);

  const chartData = useMemo(() => {
    const monthChart = deliveryChartByMonth[selectedMonth] ?? [];

    if (!isHistoricalMonth) {
      return monthChart;
    }

    return monthChart.map((item) => ({
      ...item,
      terkirim: item.terkirim + item.diproses,
      diproses: 0,
    }));
  }, [isHistoricalMonth, selectedMonth]);

  const activeLocations = useMemo(
    () => filteredPackages.filter((item) => item.status === 'Lagi Dikirim'),
    [filteredPackages]
  );

  const summary = useMemo(() => {
    const delivered = filteredPackages.filter((item) => item.status === 'Sudah Dikirim');
    const inTransit = filteredPackages.filter((item) => item.status === 'Lagi Dikirim');
    const totalValue = filteredPackages.reduce((sum, item) => sum + item.declaredValue, 0);

    return {
      total: filteredPackages.length,
      delivered: delivered.length,
      inTransit: inTransit.length,
      totalValue,
    };
  }, [filteredPackages]);

  const selectedPackage = useMemo(
    () => filteredPackages.find((item) => item.id === selectedPackageId) ?? null,
    [filteredPackages, selectedPackageId]
  );

  useEffect(() => {
    if (selectedPackageId && !filteredPackages.some((item) => item.id === selectedPackageId)) {
      setPackageDialogOpen(false);
      setSelectedPackageId(null);
      setIsEditingPackage(false);
      setDraftPackage(null);
    }
  }, [filteredPackages, selectedPackageId]);

  const currentMonthLabel =
    monthOptions.find((item) => item.value === selectedMonth)?.label ?? selectedMonth;

  const summaryCards = [
    {
      title: 'Total Paket',
      value: summary.total,
      icon: Package,
      description: 'Paket masuk bulan ini',
      accent: 'bg-emerald-500',
    },
    {
      title: 'Sudah Dikirim',
      value: summary.delivered,
      icon: CheckCircle2,
      description: 'Paket selesai terkirim',
      accent: 'bg-teal-600',
    },
    {
      title: 'Lagi Dikirim',
      value: summary.inTransit,
      icon: Truck,
      description: isHistoricalMonth
        ? 'Bulan ini sudah selesai seluruhnya.'
        : 'Pantau paket yang masih dalam perjalanan.',
      accent: 'bg-lime-500',
    },
  ];

  const openPackageDetail = (packageId: string) => {
    setSelectedPackageId(packageId);
    setDraftPackage(null);
    setIsEditingPackage(false);
    setPackageDialogOpen(true);
  };

  const handlePackageDialogChange = (open: boolean) => {
    setPackageDialogOpen(open);

    if (!open) {
      setSelectedPackageId(null);
      setDraftPackage(null);
      setIsEditingPackage(false);
    }
  };

  const handleStartEditPackage = () => {
    if (!selectedPackage) {
      return;
    }

    setDraftPackage({ ...selectedPackage });
    setIsEditingPackage(true);
  };

  const handleSavePackage = () => {
    if (!draftPackage) {
      return;
    }

    const normalizedStatus: PackageStatus = isHistoricalMonth
      ? 'Sudah Dikirim'
      : draftPackage.status;
    const normalizedLocation =
      normalizedStatus === 'Sudah Dikirim'
        ? draftPackage.destination
        : draftPackage.currentLocation;
    const fallbackDeliveredAt =
      draftPackage.deliveredAt ??
      packages.find((item) => item.id === draftPackage.id)?.deliveredAt ??
      draftPackage.shippedAt;

    const nextPackage: AdminPackage = {
      ...draftPackage,
      weightKg: Number(draftPackage.weightKg),
      declaredValue: Number(draftPackage.declaredValue),
      status: normalizedStatus,
      currentLocation: normalizedLocation,
      deliveredAt: normalizedStatus === 'Sudah Dikirim' ? fallbackDeliveredAt : undefined,
    };

    setPackages((previous) =>
      previous.map((item) => (item.id === nextPackage.id ? nextPackage : item))
    );
    setDraftPackage(null);
    setIsEditingPackage(false);
  };

  const trackingStops = selectedPackage
    ? [
        {
          title: 'Paket dibuat',
          description: `${selectedPackage.senderName} mengirim dari ${selectedPackage.origin}`,
          meta: formatDateTime(selectedPackage.shippedAt),
        },
        {
          title:
            selectedPackage.status === 'Sudah Dikirim'
              ? 'Paket sudah sampai'
              : 'Posisi terakhir paket',
          description: selectedPackage.currentLocation,
          meta:
            selectedPackage.status === 'Sudah Dikirim'
              ? `Diterima di ${selectedPackage.destination}`
              : `Menuju ${selectedPackage.destination}`,
        },
        {
          title: 'Status pengiriman',
          description: selectedPackage.status,
          meta:
            selectedPackage.status === 'Sudah Dikirim'
              ? formatDateTime(selectedPackage.deliveredAt)
              : 'Masih dipantau admin',
        },
      ]
    : [];

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
            <p className="text-sm text-white/80">Akumulasi nominal paket untuk bulan yang dipilih.</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((item, index) => {
          const Icon = item.icon;
          const showDetailAction = item.title === 'Lagi Dikirim';

          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="h-full"
            >
              <Card className="h-full border-border/80 bg-white/90 shadow-sm">
                <CardContent className="flex h-full min-h-[176px] flex-col justify-between p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <p className="text-sm text-muted-foreground">{item.title}</p>
                        {showDetailAction && (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => setLocationDialogOpen(true)}
                            className="h-7 rounded-full bg-[#63D25F]/15 px-3 text-[#2F8A2E] hover:bg-[#63D25F]/25"
                          >
                            Detail
                          </Button>
                        )}
                      </div>
                      <p className="text-3xl font-semibold">{item.value}</p>
                    </div>
                    <div className={`rounded-2xl ${item.accent} p-3 text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <p className="max-w-[16rem] text-sm leading-6 text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="border-border/80 bg-white/90 shadow-sm">
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
        <CardHeader>
          <CardTitle>Daftar Pengiriman</CardTitle>
          <CardDescription>
            Admin dapat membuka detail, meninjau tracking lokasi paket, lalu mengedit data maupun status pengiriman bila diperlukan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resi</TableHead>
                <TableHead>Pengirim</TableHead>
                <TableHead>Penerima</TableHead>
                <TableHead>Kurir</TableHead>
                <TableHead>Lokasi Pengiriman</TableHead>
                <TableHead>Layanan</TableHead>
                <TableHead>Berat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPackages.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.resi}</TableCell>
                  <TableCell>{item.senderName}</TableCell>
                  <TableCell>{item.recipientName}</TableCell>
                  <TableCell>
                    <div>{item.courierName}</div>
                    <div className="text-xs text-muted-foreground">{item.courierId}</div>
                  </TableCell>
                  <TableCell>
                    <div>{item.currentLocation}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.origin} - {item.destination}
                    </div>
                  </TableCell>
                  <TableCell>{item.service}</TableCell>
                  <TableCell>{item.weightKg} kg</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        item.status === 'Sudah Dikirim'
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button type="button" variant="outline" size="sm" onClick={() => openPackageDetail(item.id)}>
                      Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lokasi Aktif</DialogTitle>
            <DialogDescription>
              Posisi terakhir paket yang masih berjalan pada {currentMonthLabel}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {activeLocations.length > 0 ? (
              activeLocations.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border bg-secondary/25 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.resi}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.origin} - {item.destination}
                      </p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                      {item.status}
                    </Badge>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Kurir</p>
                      <p className="mt-1 font-medium">
                        {item.courierName} ({item.courierId})
                      </p>
                    </div>
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Lokasi Terakhir</p>
                      <div className="mt-1 flex items-center gap-2 font-medium">
                        <MapPin className="h-4 w-4 text-primary" />
                        {item.currentLocation}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
                Tidak ada paket yang sedang berjalan pada {currentMonthLabel}. Semua paket sudah terkirim.
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Tutup
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={packageDialogOpen} onOpenChange={handlePackageDialogChange}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{isEditingPackage ? 'Edit Data Paket' : 'Detail Pengiriman'}</DialogTitle>
            <DialogDescription>
              {isEditingPackage
                ? 'Perbarui data paket dan status pengiriman dari panel admin.'
                : 'Lihat informasi lengkap dan tracking lokasi paket sebelum melakukan perubahan.'}
            </DialogDescription>
          </DialogHeader>

          {selectedPackage && (
            <>
              {!isEditingPackage ? (
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_320px]">
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-border bg-secondary/20 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Resi</p>
                          <p className="mt-1 text-xl font-semibold">{selectedPackage.resi}</p>
                        </div>
                        <Badge
                          className={
                            selectedPackage.status === 'Sudah Dikirim'
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                          }
                        >
                          {selectedPackage.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border bg-white p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Pengirim</p>
                        <p className="mt-2 font-semibold">{selectedPackage.senderName}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{selectedPackage.origin}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-white p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Penerima</p>
                        <p className="mt-2 font-semibold">{selectedPackage.recipientName}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{selectedPackage.destination}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-white p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Kurir</p>
                        <p className="mt-2 font-semibold">{selectedPackage.courierName}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{selectedPackage.courierId}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-white p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Layanan & Nilai</p>
                        <p className="mt-2 font-semibold">{selectedPackage.service}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {selectedPackage.weightKg} kg · {formatCurrency(selectedPackage.declaredValue)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-secondary/20 p-4">
                    <div className="flex items-center gap-2">
                      <PackageSearch className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Tracking Lokasi Paket</h3>
                    </div>

                    <div className="mt-4 space-y-3">
                      {trackingStops.map((stop, index) => (
                        <div key={stop.title} className="rounded-xl bg-white p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#63D25F]/15 text-sm font-semibold text-[#2F8A2E]">
                              {index + 1}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium">{stop.title}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{stop.description}</p>
                              <p className="mt-2 text-xs text-muted-foreground">{stop.meta}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {isHistoricalMonth && (
                    <div className="rounded-2xl border border-[#63D25F]/25 bg-[#63D25F]/10 p-4 text-sm text-muted-foreground">
                      Untuk bulan sebelum April 2026, status pengiriman dikunci sebagai <span className="font-medium text-foreground">Sudah Dikirim</span> sesuai aturan dashboard.
                    </div>
                  )}

                  {draftPackage && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="edit-resi">Resi</Label>
                        <Input
                          id="edit-resi"
                          value={draftPackage.resi}
                          onChange={(e) =>
                            setDraftPackage((prev) =>
                              prev ? { ...prev, resi: e.target.value } : prev
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-service">Layanan</Label>
                        <Input
                          id="edit-service"
                          value={draftPackage.service}
                          onChange={(e) =>
                            setDraftPackage((prev) =>
                              prev ? { ...prev, service: e.target.value } : prev
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-sender">Nama Pengirim</Label>
                        <Input
                          id="edit-sender"
                          value={draftPackage.senderName}
                          onChange={(e) =>
                            setDraftPackage((prev) =>
                              prev ? { ...prev, senderName: e.target.value } : prev
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-recipient">Nama Penerima</Label>
                        <Input
                          id="edit-recipient"
                          value={draftPackage.recipientName}
                          onChange={(e) =>
                            setDraftPackage((prev) =>
                              prev ? { ...prev, recipientName: e.target.value } : prev
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-courier-id">ID Kurir</Label>
                        <Input
                          id="edit-courier-id"
                          value={draftPackage.courierId}
                          onChange={(e) =>
                            setDraftPackage((prev) =>
                              prev ? { ...prev, courierId: e.target.value } : prev
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-courier-name">Nama Kurir</Label>
                        <Input
                          id="edit-courier-name"
                          value={draftPackage.courierName}
                          onChange={(e) =>
                            setDraftPackage((prev) =>
                              prev ? { ...prev, courierName: e.target.value } : prev
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-origin">Asal Pengiriman</Label>
                        <Input
                          id="edit-origin"
                          value={draftPackage.origin}
                          onChange={(e) =>
                            setDraftPackage((prev) =>
                              prev ? { ...prev, origin: e.target.value } : prev
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-destination">Tujuan Pengiriman</Label>
                        <Input
                          id="edit-destination"
                          value={draftPackage.destination}
                          onChange={(e) =>
                            setDraftPackage((prev) =>
                              prev ? { ...prev, destination: e.target.value } : prev
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-location">Lokasi Saat Ini</Label>
                        <Input
                          id="edit-location"
                          value={draftPackage.currentLocation}
                          disabled={isHistoricalMonth || draftPackage.status === 'Sudah Dikirim'}
                          onChange={(e) =>
                            setDraftPackage((prev) =>
                              prev ? { ...prev, currentLocation: e.target.value } : prev
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Status Pengiriman</Label>
                        <Select
                          value={isHistoricalMonth ? 'Sudah Dikirim' : draftPackage.status}
                          onValueChange={(value: PackageStatus) =>
                            setDraftPackage((prev) =>
                              prev ? { ...prev, status: value } : prev
                            )
                          }
                          disabled={isHistoricalMonth}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Lagi Dikirim">Lagi Dikirim</SelectItem>
                            <SelectItem value="Sudah Dikirim">Sudah Dikirim</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-weight">Berat (kg)</Label>
                        <Input
                          id="edit-weight"
                          type="number"
                          min="0"
                          step="0.1"
                          value={draftPackage.weightKg}
                          onChange={(e) =>
                            setDraftPackage((prev) =>
                              prev ? { ...prev, weightKg: Number(e.target.value) } : prev
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-value">Nilai Paket</Label>
                        <Input
                          id="edit-value"
                          type="number"
                          min="0"
                          step="1000"
                          value={draftPackage.declaredValue}
                          onChange={(e) =>
                            setDraftPackage((prev) =>
                              prev ? { ...prev, declaredValue: Number(e.target.value) } : prev
                            )
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter>
                {isEditingPackage ? (
                  <>
                    <Button type="button" onClick={handleSavePackage}>
                      <Save className="h-4 w-4" />
                      Simpan Perubahan
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setDraftPackage(null);
                        setIsEditingPackage(false);
                      }}
                    >
                      Kembali
                    </Button>
                  </>
                ) : (
                  <>
                    <Button type="button" onClick={handleStartEditPackage}>
                      <PencilLine className="h-4 w-4" />
                      Edit
                    </Button>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        Kembali
                      </Button>
                    </DialogClose>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
