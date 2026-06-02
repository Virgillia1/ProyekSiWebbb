import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import {
  CheckCircle2,
  Package,
  PackageSearch,
  PencilLine,
  Save,
  Trash2,
  Truck,
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminTablePagination } from '../../components/admin/AdminTablePagination';
import { AdminTableToolbar } from '../../components/admin/AdminTableToolbar';
import { useAdminData } from '../../contexts/AdminDataContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
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
  monthOptions,
  packageStatusOptions,
  itemStatusOptions,
  transactionStatusOptions,
  shippingServiceOptions,
  type AdminPackage,
  type PackageStatus,
  type ItemStatus,
  type TransactionStatus,
} from '../../data/adminData';

const ITEMS_PER_PAGE = 5;
const DEFAULT_COURIER_ID = 'COURIER-POOL';
const DEFAULT_COURIER_NAME = 'Semua Kurir';

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

const calculateShippingCost = (weightKg: number) => {
  const normalizedWeight = Math.max(0, Number(weightKg) || 0);

  return normalizedWeight > 0 ? Math.round(normalizedWeight * 12500 + 10000) : 0;
};

const isDeliveredStatus = (status: PackageStatus) =>
  status === 'Selesai' || status === 'Sampai Tujuan';

const isShippingCostLocked = (status: PackageStatus) =>
  status === 'Dalam Pengiriman' || status === 'Sampai Tujuan' || status === 'Selesai';

const normalizeTransactionStatusForUi = (status?: string): 'Belum Bayar' | 'Bayar' =>
  status === 'Bayar' || status === 'Lunas' ? 'Bayar' : 'Belum Bayar';

const normalizeTransactionStatusForSave = (status?: string): TransactionStatus =>
  normalizeTransactionStatusForUi(status) as TransactionStatus;

const getTransactionStatusClass = (status?: string) =>
  normalizeTransactionStatusForUi(status) === 'Bayar'
    ? 'text-emerald-600'
    : 'text-rose-600';

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'Selesai':
      return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border border-emerald-200';
    case 'Sampai Tujuan':
      return 'bg-teal-100 text-teal-700 hover:bg-teal-100 border border-teal-200';
    case 'Dalam Pengiriman':
      return 'bg-blue-100 text-blue-700 hover:bg-blue-100 border border-blue-200';
    case 'Diproses':
      return 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border border-indigo-200';
    case 'Pending':
      return 'bg-amber-100 text-amber-700 hover:bg-amber-100 border border-amber-200';
    default:
      return 'bg-gray-100 text-gray-700 hover:bg-gray-100 border border-gray-200';
  }
};

const getPackageSearchText = (item: AdminPackage) =>
  [
    item.id,
    item.resi,
    item.senderName,
    item.recipientName,
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
  defaultService: string,
  defaultLocation: string
): AdminPackage => {
  const sameMonthPackages = packages.filter((item) => item.monthKey === monthKey);
  const nextIdNumber =
    Math.max(0, ...packages.map((item) => Number(item.id.replace(/\D/g, '')) || 0)) + 1;
  const nextResiNumber =
    Math.max(0, ...sameMonthPackages.map((item) => Number(item.resi.slice(-4)) || 0)) + 1;
  const packageCount = sameMonthPackages.length;
  const shipmentDay = Math.min(28, packageCount + 6);

  return {
    id: `PKT-${padValue(nextIdNumber, 3)}`,
    monthKey,
    week: `M${Math.min(4, Math.floor(packageCount / 2) + 1)}`,
    resi: `CKL${monthKey.replace('-', '')}${padValue(nextResiNumber)}`,
    senderName: '',
    recipientName: '',
    courierId: '',
    courierName: 'Kurir Belum Dipilih',
    origin: defaultLocation,
    destination: defaultLocation,
    currentLocation: defaultLocation,
    service: defaultService,
    weightKg: 1,
    declaredValue: 0,
    shippedAt: `${monthKey}-${padValue(shipmentDay, 2)}T09:00:00`,
    status: 'Diproses',
    recipientPhone: '',
    itemType: '',
    shippingCost: calculateShippingCost(1),
    vehicleType: 'Motor',
    deliveryType: 'Reguler',
    description: '',
    itemStatus: 'Baik',
    transactionStatus: 'Belum Bayar',
  };
};

const normalizePackageDraft = (draftPackage: AdminPackage, isHistoricalMonth: boolean) => {
  const normalizedStatus: PackageStatus = isHistoricalMonth ? 'Selesai' : draftPackage.status;
  const currentLocation =
    isDeliveredStatus(normalizedStatus)
      ? draftPackage.destination
      : draftPackage.currentLocation;

  return {
    ...draftPackage,
    weightKg: Number(draftPackage.weightKg),
    declaredValue: Number(draftPackage.declaredValue),
    shippingCost: Number(draftPackage.shippingCost || 0),
    status: normalizedStatus,
    transactionStatus: normalizeTransactionStatusForSave(draftPackage.transactionStatus),
    currentLocation,
    deliveredAt: isDeliveredStatus(normalizedStatus)
      ? draftPackage.deliveredAt ?? draftPackage.shippedAt
      : undefined,
  };
};

export function AdminShipments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    packages,
    employees,
    createPackage,
    updatePackage,
    deletePackage: deletePackageRequest,
  } = useAdminData();
  const monthFromUrl = searchParams.get('month');
  const [selectedMonth, setSelectedMonth] = useState(
    monthOptions.some((month) => month.value === monthFromUrl) ? monthFromUrl! : '2026-04'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [packageDialogMode, setPackageDialogMode] = useState<'view' | 'edit' | 'create' | null>(
    null
  );
  const [activePackageId, setActivePackageId] = useState<string | null>(null);
  const [draftPackage, setDraftPackage] = useState<AdminPackage | null>(null);
  const [packageToDelete, setPackageToDelete] = useState<AdminPackage | null>(null);

  const isHistoricalMonth = selectedMonth < '2026-04';
  const activeCouriers = useMemo(
    () => employees.filter((employee) => employee.status === 'Aktif'),
    [employees]
  );

  const handleCourierChange = (courierId: string) => {
    const courier = employees.find((employee) => employee.id === courierId);
    setDraftPackage((previousDraft) =>
      previousDraft
        ? {
            ...previousDraft,
            courierId,
            courierName:
              courierId === 'UNASSIGNED'
                ? 'Kurir Belum Diatur'
                : (courier?.name ?? previousDraft.courierName),
          }
        : previousDraft
    );
  };

  const shippingLocationOptions = useMemo(
    () =>
      Array.from(
        new Set(packages.flatMap((item) => [item.origin, item.destination, item.currentLocation]))
      ).sort(),
    [packages]
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
      status: 'Selesai' as const,
      currentLocation: item.destination,
      deliveredAt: item.deliveredAt ?? item.shippedAt,
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

  const summary = useMemo(() => {
    const delivered = displayPackages.filter((item) => isDeliveredStatus(item.status));
    const inTransit = displayPackages.filter((item) => !isDeliveredStatus(item.status));
    return {
      total: displayPackages.length,
      delivered: delivered.length,
      inTransit: inTransit.length,
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
    setSearchParams({ month: selectedMonth }, { replace: true });
  }, [selectedMonth, setSearchParams]);

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
    const defaultService = shippingServiceOptions[0] ?? 'CargoLite REG';
    const defaultLocation = shippingLocationOptions[0] ?? 'Jakarta Selatan';

    setActivePackageId(null);
    setDraftPackage(
      buildNewPackageDraft(
        selectedMonth,
        packages,
        defaultService,
        defaultLocation
      )
    );
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
            ...(key === 'weightKg' && !isShippingCostLocked(previousDraft.status)
              ? { shippingCost: calculateShippingCost(Number(value)) }
              : {}),
          }
        : previousDraft
    );
  };

  const handleSavePackage = async () => {
    if (!draftPackage) {
      return;
    }

    // Validasi: kurir wajib dipilih saat membuat paket baru
    if (packageDialogMode === 'create' && !draftPackage.courierId) {
      toast.error('Pilih kurir terlebih dahulu', {
        description: 'Admin wajib memilih kurir yang bertugas untuk paket ini sebelum menyimpan.',
      });
      return;
    }

    const nextPackage = normalizePackageDraft(draftPackage, isHistoricalMonth);

    try {
      if (packageDialogMode === 'create') {
        await createPackage(nextPackage);
        toast.success('Pengiriman baru ditambahkan', {
          description: `Resi ${nextPackage.resi} telah ditugaskan ke ${nextPackage.courierName}. Kurir dapat mengambil paket dari halaman "Ambil Paket Baru".`,
        });
      } else {
        await updatePackage(nextPackage);
        toast.success('Data pengiriman diperbarui', {
          description: `Perubahan untuk resi ${nextPackage.resi} sudah tersimpan.`,
        });
      }

      resetPackageDialog();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan data pengiriman.');
    }
  };

  const deletePackage = async () => {
    if (!packageToDelete) {
      return;
    }

    try {
      await deletePackageRequest(packageToDelete.id);
      toast.success('Data pengiriman dihapus', {
        description: `Resi ${packageToDelete.resi} berhasil dihapus dari database.`,
      });

      if (activePackageId === packageToDelete.id) {
        resetPackageDialog();
      }

      setPackageToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus data pengiriman.');
    }
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
            selectedPackage.status === 'Selesai' || selectedPackage.status === 'Sampai Tujuan'
              ? 'Paket sudah sampai'
              : 'Posisi terakhir paket',
          description: selectedPackage.currentLocation,
          meta:
            selectedPackage.status === 'Selesai' || selectedPackage.status === 'Sampai Tujuan'
              ? `Diterima di ${selectedPackage.destination}`
              : `Menuju ${selectedPackage.destination}`,
        },
        {
          title: 'Status pengiriman',
          description: selectedPackage.status,
          meta:
            selectedPackage.status === 'Selesai' || selectedPackage.status === 'Sampai Tujuan'
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

          <div className="grid min-h-[126px] gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur sm:grid-cols-3">
            {summaryCards.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex min-h-24 items-center justify-between gap-3 rounded-xl bg-white/15 p-4"
                >
                  <div>
                    <p className="text-xs text-white/75">{item.title}</p>
                    <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                  </div>
                  <div className="rounded-xl bg-white/20 p-2 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-white/90 shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Daftar Pengiriman</CardTitle>
          </div>
          <AdminTableToolbar
            addLabel="Tambah Pengiriman"
            searchPlaceholder="Cari resi, pengirim, penerima, lokasi..."
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
                      <div className="font-medium">{item.courierName}</div>
                      <div className="text-xs text-muted-foreground font-mono">{item.courierId}</div>
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
                      <Badge className={getStatusBadgeClass(item.status)}>
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
                  {selectedPackage.status === 'Selesai' && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800 flex items-center gap-2.5">
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                      <span>Paket ini telah selesai dan diterima pelanggan. Untuk menjaga integritas data pengiriman, paket yang sudah selesai tidak dapat diubah atau dihapus.</span>
                    </div>
                  )}
                  <div className="rounded-2xl border border-border bg-secondary/20 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Resi</p>
                        <p className="mt-1 text-xl font-semibold">{selectedPackage.resi}</p>
                      </div>
                      <Badge className={getStatusBadgeClass(selectedPackage.status)}>
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
                      {selectedPackage.recipientPhone && (
                        <p className="mt-1 text-xs text-muted-foreground font-mono">
                          Telp: {selectedPackage.recipientPhone}
                        </p>
                      )}
                    </div>
                    <div className="rounded-2xl border border-border bg-white p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Layanan & Biaya
                      </p>
                      <p className="mt-2 font-semibold">
                        {selectedPackage.service} ({selectedPackage.deliveryType ?? 'Reguler'})
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {selectedPackage.weightKg} kg
                      </p>
                      <p className="mt-1 text-xs text-[#2F8A2E] font-semibold">
                        Harga Pengiriman: {formatCurrency(selectedPackage.shippingCost ?? 0)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-white p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Kurir Ditugaskan
                      </p>
                      <p className="mt-2 font-semibold">
                        {selectedPackage.courierName || 'Kurir Belum Diatur'}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground font-mono">
                        {selectedPackage.courierId || 'Belum Ditugaskan'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-white p-4 sm:col-span-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Detail Informasi Kargo</p>
                      <div className="mt-2 grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">Jenis Barang: </span>
                          <span className="font-semibold text-foreground">{selectedPackage.itemType || 'Umum'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Jenis Kendaraan: </span>
                          <span className="font-semibold text-foreground">{selectedPackage.vehicleType || 'Motor'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status Barang: </span>
                          <span className={`font-semibold ${selectedPackage.itemStatus === 'Rusak' ? 'text-rose-600' : selectedPackage.itemStatus === 'Dalam Pemeriksaan' ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {selectedPackage.itemStatus || 'Baik'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status Transaksi: </span>
                          <span className={`font-semibold ${getTransactionStatusClass(selectedPackage.transactionStatus)}`}>
                            {normalizeTransactionStatusForUi(selectedPackage.transactionStatus)}
                          </span>
                        </div>
                        <div className="col-span-2 border-t border-border/60 pt-2">
                          <span className="text-muted-foreground block font-medium mb-1">Catatan / Deskripsi Barang:</span>
                          <p className="rounded-xl bg-secondary/30 p-2.5 text-muted-foreground italic leading-relaxed">
                            {selectedPackage.description || 'Tidak ada catatan khusus.'}
                          </p>
                        </div>
                      </div>
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
                  variant="outline"
                  className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => setPackageToDelete(selectedPackage)}
                  disabled={selectedPackage.status === 'Selesai'}
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus
                </Button>
                <Button
                  type="button"
                  onClick={() => openPackageUpdate(selectedPackage.id)}
                  disabled={selectedPackage.status === 'Selesai'}
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
                    <span className="font-medium text-foreground">Selesai</span> sesuai aturan dashboard.
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
                    <Label htmlFor="package-recipient-phone">No Telepon Penerima</Label>
                    <Input
                      id="package-recipient-phone"
                      value={draftPackage.recipientPhone ?? ''}
                      onChange={(event) => updateDraftPackage('recipientPhone', event.target.value)}
                      placeholder="Contoh: 081234567890"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="package-courier">
                      Kurir {packageDialogMode === 'create' && <span className="text-red-500">*</span>}
                      {packageDialogMode === 'create' && (
                        <span className="ml-2 text-xs text-amber-600 font-normal">
                          (Wajib dipilih — paket akan dikirim ke halaman "Ambil Paket Baru" kurir)
                        </span>
                      )}
                    </Label>
                    <Select
                      value={draftPackage.courierId}
                      onValueChange={handleCourierChange}
                    >
                      <SelectTrigger
                        id="package-courier"
                        className={packageDialogMode === 'create' && !draftPackage.courierId ? 'border-amber-400 bg-amber-50' : ''}
                      >
                        <SelectValue placeholder="— Pilih Kurir (Wajib) —" />
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
                    <Label htmlFor="package-item-type">Jenis Barang</Label>
                    <Input
                      id="package-item-type"
                      value={draftPackage.itemType ?? ''}
                      onChange={(event) => updateDraftPackage('itemType', event.target.value)}
                      placeholder="Contoh: Pakaian, Alat Rumah Tangga, Kayu, dll."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="package-status">Status Pengiriman</Label>
                    <Select
                      value={isHistoricalMonth ? 'Selesai' : draftPackage.status}
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
                    <Label htmlFor="package-item-status">Status Barang</Label>
                    <Select
                      value={draftPackage.itemStatus ?? 'Baik'}
                      onValueChange={(value: ItemStatus) => updateDraftPackage('itemStatus', value)}
                    >
                      <SelectTrigger id="package-item-status">
                        <SelectValue placeholder="Pilih status barang" />
                      </SelectTrigger>
                      <SelectContent>
                        {itemStatusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="package-transaction-status">Status Transaksi</Label>
                    <Select
                      value={normalizeTransactionStatusForUi(draftPackage.transactionStatus)}
                      onValueChange={(value: TransactionStatus) => updateDraftPackage('transactionStatus', value)}
                    >
                      <SelectTrigger id="package-transaction-status">
                        <SelectValue placeholder="Pilih status transaksi" />
                      </SelectTrigger>
                      <SelectContent>
                        {transactionStatusOptions.map((status) => (
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
                        isHistoricalMonth || draftPackage.status === 'Selesai' || draftPackage.status === 'Sampai Tujuan'
                          ? draftPackage.destination
                          : draftPackage.currentLocation
                      }
                      onValueChange={(value) => updateDraftPackage('currentLocation', value)}
                      disabled={isHistoricalMonth || draftPackage.status === 'Selesai' || draftPackage.status === 'Sampai Tujuan'}
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
                    <Label htmlFor="package-shipping-cost">Harga Pengiriman (Rp)</Label>
                    <Input
                      id="package-shipping-cost"
                      type="number"
                      min="0"
                      step="1000"
                      value={draftPackage.shippingCost ?? 0}
                      readOnly
                      disabled={isShippingCostLocked(draftPackage.status)}
                      className="bg-muted/40"
                      placeholder="Harga otomatis mengikuti berat"
                    />
                    <p className="text-xs text-muted-foreground">
                      Harga otomatis mengikuti berat paket.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="package-vehicle-type">Jenis Kendaraan</Label>
                    <Select
                      value={draftPackage.vehicleType ?? 'Motor'}
                      onValueChange={(value) => updateDraftPackage('vehicleType', value)}
                    >
                      <SelectTrigger id="package-vehicle-type">
                        <SelectValue placeholder="Pilih jenis kendaraan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Motor">Motor</SelectItem>
                        <SelectItem value="Pick Up">Pick Up</SelectItem>
                        <SelectItem value="Mobil Box (Truck)">Mobil Box (Truck)</SelectItem>
                        <SelectItem value="Fuso Heavy Duty">Fuso Heavy Duty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="package-description">Deskripsi / Catatan Barang</Label>
                    <Input
                      id="package-description"
                      value={draftPackage.description ?? ''}
                      onChange={(event) => updateDraftPackage('description', event.target.value)}
                      placeholder="Contoh: Barang pecah belah, harap ditaruh teras jika kosong."
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

      <AlertDialog open={!!packageToDelete} onOpenChange={(open) => !open && setPackageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus data pengiriman?</AlertDialogTitle>
            <AlertDialogDescription>
              Resi {packageToDelete?.resi} akan dihapus dari Neon beserta tracking event dan
              riwayat customer yang terkait. Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={deletePackage}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
