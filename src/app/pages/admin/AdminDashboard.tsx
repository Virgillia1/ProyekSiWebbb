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
import { toast } from 'sonner';
import { AdminTablePagination } from '../../components/admin/AdminTablePagination';
import { AdminTableToolbar } from '../../components/admin/AdminTableToolbar';
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
  employees,
  monthOptions,
  packageStatusOptions,
  shippingLocationOptions,
  shippingServiceOptions,
  type AdminPackage,
  type PackageStatus,
} from '../../data/adminData';

const ITEMS_PER_PAGE = 5;
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

const padValue = (value: number, length = 4) => String(value).padStart(length, '0');

const getPackageSearchText = (item: AdminPackage) =>
  [
    item.id,
    item.resi,
    item.senderName,
    item.recipientName,
    item.courierId,
    item.courierName,
    item.origin,
    item.destination,
    item.currentLocation,
    item.service,
    item.status,
  ]
    .join(' ')
    .toLowerCase();

const buildNewPackageDraft = (
  monthKey: string,
  packages: AdminPackage[],
  defaultCourierId: string
): AdminPackage => {
  const sameMonthPackages = packages.filter((item) => item.monthKey === monthKey);
  const nextIdNumber =
    Math.max(0, ...packages.map((item) => Number(item.id.replace(/\D/g, '')) || 0)) + 1;
  const nextResiNumber =
    Math.max(0, ...sameMonthPackages.map((item) => Number(item.resi.slice(-4)) || 0)) + 1;
  const packageCount = sameMonthPackages.length;
  const shipmentDay = Math.min(28, packageCount + 6);
  const defaultCourier = employees.find((employee) => employee.id === defaultCourierId);
  const defaultLocation = shippingLocationOptions[0] ?? 'Jakarta Selatan';

  return {
    id: `PKT-${padValue(nextIdNumber, 3)}`,
    monthKey,
    week: `M${Math.min(4, Math.floor(packageCount / 2) + 1)}`,
    resi: `CKL${monthKey.replace('-', '')}${padValue(nextResiNumber)}`,
    senderName: '',
    recipientName: '',
    courierId: defaultCourierId,
    courierName: defaultCourier?.name ?? '',
    origin: defaultLocation,
    destination: defaultLocation,
    currentLocation: defaultLocation,
    service: shippingServiceOptions[0] ?? 'CargoKu Reguler',
    weightKg: 1,
    declaredValue: 250000,
    shippedAt: `${monthKey}-${padValue(shipmentDay, 2)}T09:00:00`,
    status: 'Lagi Dikirim',
  };
};

const normalizePackageDraft = (draftPackage: AdminPackage, isHistoricalMonth: boolean) => {
  const normalizedStatus: PackageStatus = isHistoricalMonth ? 'Sudah Dikirim' : draftPackage.status;
  const currentLocation =
    normalizedStatus === 'Sudah Dikirim'
      ? draftPackage.destination
      : draftPackage.currentLocation;

  return {
    ...draftPackage,
    weightKg: Number(draftPackage.weightKg),
    declaredValue: Number(draftPackage.declaredValue),
    status: normalizedStatus,
    currentLocation,
    deliveredAt: normalizedStatus === 'Sudah Dikirim'
      ? draftPackage.deliveredAt ?? draftPackage.shippedAt
      : undefined,
  };
};

export function AdminDashboard() {
  const [packages, setPackages] = useState(adminPackages);
  const [selectedMonth, setSelectedMonth] = useState('2026-04');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [packageDialogMode, setPackageDialogMode] = useState<'view' | 'edit' | 'create' | null>(
    null
  );
  const [activePackageId, setActivePackageId] = useState<string | null>(null);
  const [draftPackage, setDraftPackage] = useState<AdminPackage | null>(null);

  const isHistoricalMonth = selectedMonth < '2026-04';
  const activeCouriers = useMemo(
    () => employees.filter((employee) => employee.status === 'Aktif'),
    []
  );

  const resetPackageDialog = () => {
    setPackageDialogMode(null);
    setActivePackageId(null);
    setDraftPackage(null);
  };

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
      status: 'Sudah Dikirim' as const,
      currentLocation: item.destination,
      deliveredAt: item.deliveredAt ?? item.shippedAt,
    }));
  }, [isHistoricalMonth, monthPackages]);

  const chartData = useMemo(() => {
    const baseChart = ['M1', 'M2', 'M3', 'M4'].map((week) => {
      const weekPackages = monthPackages.filter((item) => item.week === week);

      return {
        week,
        terkirim: weekPackages.filter((item) => item.status === 'Sudah Dikirim').length,
        diproses: weekPackages.filter((item) => item.status === 'Lagi Dikirim').length,
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

  const tablePackages = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return displayPackages;
    }

    return displayPackages.filter((item) => getPackageSearchText(item).includes(normalizedQuery));
  }, [displayPackages, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(tablePackages.length / ITEMS_PER_PAGE));
  const paginatedPackages = tablePackages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const activeLocations = useMemo(
    () => displayPackages.filter((item) => item.status === 'Lagi Dikirim'),
    [displayPackages]
  );

  const summary = useMemo(() => {
    const delivered = displayPackages.filter((item) => item.status === 'Sudah Dikirim');
    const inTransit = displayPackages.filter((item) => item.status === 'Lagi Dikirim');
    const totalValue = displayPackages.reduce((sum, item) => sum + item.declaredValue, 0);

    return {
      total: displayPackages.length,
      delivered: delivered.length,
      inTransit: inTransit.length,
      totalValue,
    };
  }, [displayPackages]);

  const selectedPackage = useMemo(
    () => displayPackages.find((item) => item.id === activePackageId) ?? null,
    [activePackageId, displayPackages]
  );

  const currentMonthLabel =
    monthOptions.find((item) => item.value === selectedMonth)?.label ?? selectedMonth;

  useEffect(() => {
    setCurrentPage((previousPage) => Math.min(previousPage, totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (packageDialogMode === 'create') {
      return;
    }

    if (activePackageId && !displayPackages.some((item) => item.id === activePackageId)) {
      resetPackageDialog();
    }
  }, [activePackageId, displayPackages, packageDialogMode]);

  const openPackageDetail = (packageId: string) => {
    setActivePackageId(packageId);
    setDraftPackage(null);
    setPackageDialogMode('view');
  };

  const openPackageUpdate = (packageId: string) => {
    const targetPackage = displayPackages.find((item) => item.id === packageId);

    if (!targetPackage) {
      return;
    }

    setActivePackageId(packageId);
    setDraftPackage({ ...targetPackage });
    setPackageDialogMode('edit');
  };

  const openCreatePackage = () => {
    const defaultCourierId = activeCouriers[0]?.id ?? employees[0]?.id ?? 'EMP-001';

    setActivePackageId(null);
    setDraftPackage(buildNewPackageDraft(selectedMonth, packages, defaultCourierId));
    setPackageDialogMode('create');
  };

  const updateDraftPackage = <Key extends keyof AdminPackage>(
    key: Key,
    value: AdminPackage[Key]
  ) => {
    setDraftPackage((previousDraft) =>
      previousDraft
        ? {
            ...previousDraft,
            [key]: value,
          }
        : previousDraft
    );
  };

  const handleCourierChange = (courierId: string) => {
    const courier = employees.find((employee) => employee.id === courierId);

    setDraftPackage((previousDraft) =>
      previousDraft
        ? {
            ...previousDraft,
            courierId,
            courierName: courier?.name ?? previousDraft.courierName,
          }
        : previousDraft
    );
  };

  const handleSavePackage = () => {
    if (!draftPackage) {
      return;
    }

    const nextPackage = normalizePackageDraft(draftPackage, isHistoricalMonth);

    if (packageDialogMode === 'create') {
      setPackages((previousPackages) => [nextPackage, ...previousPackages]);
      toast.success('Pengiriman baru ditambahkan', {
        description: `Resi ${nextPackage.resi} siap dipantau di dashboard.`,
      });
    } else {
      setPackages((previousPackages) =>
        previousPackages.map((item) => (item.id === nextPackage.id ? nextPackage : item))
      );
      toast.success('Data pengiriman diperbarui', {
        description: `Perubahan untuk resi ${nextPackage.resi} sudah tersimpan.`,
      });
    }

    resetPackageDialog();
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
            <Select
              value={selectedMonth}
              onValueChange={(value) => {
                setSelectedMonth(value);
                setCurrentPage(1);
                resetPackageDialog();
              }}
            >
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
                  <p className="max-w-[16rem] text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
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
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Daftar Pengiriman</CardTitle>
            <CardDescription>
              Admin bisa menambah pengiriman baru, mencari data lebih cepat, lalu membuka detail
              paket dan update datanya dari pop-up tanpa pindah halaman.
            </CardDescription>
          </div>
          <AdminTableToolbar
            addLabel="Tambah Pengiriman"
            searchPlaceholder="Cari resi, pengirim, penerima, kurir..."
            searchValue={searchQuery}
            onSearchChange={(value) => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
            onAdd={openCreatePackage}
          />
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
              {paginatedPackages.length > 0 ? (
                paginatedPackages.map((item) => (
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
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openPackageDetail(item.id)}
                        >
                          Detail
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                    Tidak ada data pengiriman yang cocok dengan pencarian saat ini.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <AdminTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
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
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Lokasi Terakhir
                      </p>
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
                Tidak ada paket yang sedang berjalan pada {currentMonthLabel}. Semua paket sudah
                terkirim.
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

      <Dialog open={packageDialogMode !== null} onOpenChange={(open) => !open && resetPackageDialog()}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {packageDialogMode === 'create'
                ? 'Tambah Pengiriman Baru'
                : packageDialogMode === 'edit'
                  ? 'Update Data Pengiriman'
                  : 'Detail Pengiriman'}
            </DialogTitle>
            <DialogDescription>
              {packageDialogMode === 'create'
                ? 'Nomor resi dibuat otomatis mengikuti pola bulan aktif. Lengkapi data pengiriman untuk menambahkan paket baru.'
                : packageDialogMode === 'edit'
                  ? 'Perbarui data paket dan status pengiriman dari panel admin.'
                  : 'Lihat informasi lengkap dan tracking lokasi paket sebelum melakukan perubahan.'}
            </DialogDescription>
          </DialogHeader>

          {packageDialogMode === 'view' && selectedPackage && (
            <>
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
                      <p className="mt-1 text-sm text-muted-foreground">
                        {selectedPackage.destination}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-white p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Kurir</p>
                      <p className="mt-2 font-semibold">{selectedPackage.courierName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{selectedPackage.courierId}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-white p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Layanan dan Nilai
                      </p>
                      <p className="mt-2 font-semibold">{selectedPackage.service}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {selectedPackage.weightKg} kg - {formatCurrency(selectedPackage.declaredValue)}
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

              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => openPackageUpdate(selectedPackage.id)}
                >
                  <PencilLine className="h-4 w-4" />
                  Update
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Kembali
                  </Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}

          {(packageDialogMode === 'edit' || packageDialogMode === 'create') && draftPackage && (
            <>
              <div className="space-y-5">
                {isHistoricalMonth && (
                  <div className="rounded-2xl border border-[#63D25F]/25 bg-[#63D25F]/10 p-4 text-sm text-muted-foreground">
                    Untuk bulan sebelum April 2026, status pengiriman dikunci sebagai{' '}
                    <span className="font-medium text-foreground">Sudah Dikirim</span> sesuai aturan dashboard.
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="package-resi">Nomor Resi</Label>
                    <Input id="package-resi" value={draftPackage.resi} readOnly className="bg-muted/40" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="package-service">Layanan</Label>
                    <Select
                      value={draftPackage.service}
                      onValueChange={(value) => updateDraftPackage('service', value)}
                    >
                      <SelectTrigger id="package-service">
                        <SelectValue placeholder="Pilih layanan" />
                      </SelectTrigger>
                      <SelectContent>
                        {shippingServiceOptions.map((service) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="package-sender">Nama Pengirim</Label>
                    <Input
                      id="package-sender"
                      value={draftPackage.senderName}
                      onChange={(event) => updateDraftPackage('senderName', event.target.value)}
                      placeholder="Tulis nama pengirim"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="package-recipient">Nama Penerima</Label>
                    <Input
                      id="package-recipient"
                      value={draftPackage.recipientName}
                      onChange={(event) => updateDraftPackage('recipientName', event.target.value)}
                      placeholder="Tulis nama penerima"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="package-courier">Kurir</Label>
                    <Select value={draftPackage.courierId} onValueChange={handleCourierChange}>
                      <SelectTrigger id="package-courier">
                        <SelectValue placeholder="Pilih kurir" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeCouriers.map((courier) => (
                          <SelectItem key={courier.id} value={courier.id}>
                            {courier.name} ({courier.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="package-status">Status</Label>
                    <Select
                      value={isHistoricalMonth ? 'Sudah Dikirim' : draftPackage.status}
                      onValueChange={(value: PackageStatus) => updateDraftPackage('status', value)}
                      disabled={isHistoricalMonth}
                    >
                      <SelectTrigger id="package-status">
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        {packageStatusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="package-origin">Asal Pengiriman</Label>
                    <Select
                      value={draftPackage.origin}
                      onValueChange={(value) => updateDraftPackage('origin', value)}
                    >
                      <SelectTrigger id="package-origin">
                        <SelectValue placeholder="Pilih asal" />
                      </SelectTrigger>
                      <SelectContent>
                        {shippingLocationOptions.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="package-destination">Tujuan Pengiriman</Label>
                    <Select
                      value={draftPackage.destination}
                      onValueChange={(value) => updateDraftPackage('destination', value)}
                    >
                      <SelectTrigger id="package-destination">
                        <SelectValue placeholder="Pilih tujuan" />
                      </SelectTrigger>
                      <SelectContent>
                        {shippingLocationOptions.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="package-location">Lokasi Pengiriman</Label>
                    <Select
                      value={
                        isHistoricalMonth || draftPackage.status === 'Sudah Dikirim'
                          ? draftPackage.destination
                          : draftPackage.currentLocation
                      }
                      onValueChange={(value) => updateDraftPackage('currentLocation', value)}
                      disabled={isHistoricalMonth || draftPackage.status === 'Sudah Dikirim'}
                    >
                      <SelectTrigger id="package-location">
                        <SelectValue placeholder="Pilih lokasi saat ini" />
                      </SelectTrigger>
                      <SelectContent>
                        {shippingLocationOptions.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="package-weight">Berat (kg)</Label>
                    <Input
                      id="package-weight"
                      type="number"
                      min="0"
                      step="0.1"
                      value={draftPackage.weightKg}
                      onChange={(event) => updateDraftPackage('weightKg', Number(event.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="package-value">Nilai Paket</Label>
                    <Input
                      id="package-value"
                      type="number"
                      min="0"
                      step="1000"
                      value={draftPackage.declaredValue}
                      onChange={(event) =>
                        updateDraftPackage('declaredValue', Number(event.target.value))
                      }
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-secondary/15 p-4 text-sm text-muted-foreground">
                  Pengiriman baru akan otomatis mengikuti bulan aktif <span className="font-medium text-foreground">{currentMonthLabel}</span> dan nomor resi dibentuk dari pola <span className="font-medium text-foreground">CKL-YYYYMM-urutan</span>.
                </div>
              </div>

              <DialogFooter>
                <Button type="button" onClick={handleSavePackage}>
                  <Save className="h-4 w-4" />
                  Simpan Perubahan
                </Button>
                <Button type="button" variant="outline" onClick={resetPackageDialog}>
                  Kembali
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
