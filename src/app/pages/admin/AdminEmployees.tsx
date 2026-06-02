import { useEffect, useMemo, useState } from 'react';
import { PencilLine, Save, Trash2, Truck, User, Lock } from 'lucide-react';
import {
  getCourierAccountInfoRequest,
  createCourierAccountRequest,
  type CourierAccountInfo,
} from '../../lib/adminApi';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
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
import type { Courier, CourierStatus } from '../../data/adminData';

const ITEMS_PER_PAGE = 5;
const courierStatusOptions: CourierStatus[] = ['Aktif', 'Nonaktif'];
const fallbackVehicleTypeOptions = ['Motor', 'Mobil Box', 'Van', 'Truck Ringan'];

const padValue = (value: number, length = 3) => String(value).padStart(length, '0');

const getCourierSearchText = (courier: Courier) =>
  [
    courier.id,
    courier.name,
    courier.baseArea,
    courier.coverageArea,
    courier.vehicleType,
    courier.vehiclePlate,
    courier.phone,
    courier.status,
  ]
    .join(' ')
    .toLowerCase();

const buildNewCourierDraft = (couriers: Courier[]): Courier => {
  const nextSequence =
    Math.max(0, ...couriers.map((courier) => Number(courier.id.replace(/\D/g, '')) || 0)) + 1;

  return {
    id: `CUR-${padValue(nextSequence)}`,
    name: '',
    baseArea: '',
    coverageArea: '',
    vehicleType: fallbackVehicleTypeOptions[0],
    vehiclePlate: '',
    phone: '',
    status: 'Aktif',
    completedDeliveries: 0,
    performanceScore: 80,
  };
};

import { useMetadata } from '../../lib/useMetadata';

export function AdminEmployees() {
  useMetadata(
    'Kelola Karyawan (Admin)',
    'Kelola database karyawan dan kurir aktif, daftarkan akun baru, serta pantau status penugasan mereka di CargoLite.'
  );

  const {
    employees: couriers,
    createEmployee: createCourier,
    updateEmployee: updateCourier,
    deleteEmployee: deleteCourierRequest,
  } = useAdminData();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create' | null>(null);
  const [activeCourierId, setActiveCourierId] = useState<string | null>(null);
  const [draftCourier, setDraftCourier] = useState<Courier | null>(null);
  const [courierToDelete, setCourierToDelete] = useState<Courier | null>(null);

  const [courierAccount, setCourierAccount] = useState<CourierAccountInfo | null>(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);
  const [accountUsername, setAccountUsername] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPhone, setAccountPhone] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const vehicleTypeOptions = useMemo(
    () =>
      Array.from(
        new Set([
          ...fallbackVehicleTypeOptions,
          ...couriers.map((courier) => courier.vehicleType).filter(Boolean),
        ])
      ),
    [couriers]
  );

  const filteredCouriers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return couriers;
    }

    return couriers.filter((courier) => getCourierSearchText(courier).includes(normalizedQuery));
  }, [couriers, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredCouriers.length / ITEMS_PER_PAGE));
  const paginatedCouriers = filteredCouriers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const activeCount = couriers.filter((item) => item.status === 'Aktif').length;
  const totalDeliveries = couriers.reduce((sum, item) => sum + item.completedDeliveries, 0);
  const averagePerformance = useMemo(() => {
    if (!couriers.length) return 0;
    return (
      couriers.reduce((sum, item) => sum + item.performanceScore, 0) / couriers.length
    ).toFixed(1);
  }, [couriers]);

  const selectedCourier = couriers.find((courier) => courier.id === activeCourierId) ?? null;

  useEffect(() => {
    setCurrentPage((previousPage) => Math.min(previousPage, totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (dialogMode === 'create') {
      return;
    }

    if (activeCourierId && !couriers.some((courier) => courier.id === activeCourierId)) {
      setDialogMode(null);
      setActiveCourierId(null);
      setDraftCourier(null);
    }
  }, [activeCourierId, dialogMode, couriers]);

  const resetDialog = () => {
    setDialogMode(null);
    setActiveCourierId(null);
    setDraftCourier(null);
    setCourierAccount(null);
    setAccountUsername('');
    setAccountEmail('');
    setAccountPhone('');
    setAccountPassword('');
  };

  const fetchCourierAccount = async (id: string) => {
    setIsLoadingAccount(true);
    try {
      const info = await getCourierAccountInfoRequest(id);
      setCourierAccount(info);
    } catch (err) {
      setCourierAccount(null);
    } finally {
      setIsLoadingAccount(false);
    }
  };

  const openCourierDetail = (courierId: string) => {
    setActiveCourierId(courierId);
    setDraftCourier(null);
    setDialogMode('view');
    setAccountUsername('kurir_');
    void fetchCourierAccount(courierId);
  };

  const handleCreateCourierAccount = async () => {
    if (!activeCourierId) return;
    if (!accountUsername || !accountEmail || !accountPassword) {
      toast.error('Lengkapi data akun terlebih dahulu.', {
        description: 'Username, Email, dan Password wajib diisi.',
      });
      return;
    }
    
    setIsCreatingAccount(true);
    try {
      await createCourierAccountRequest(activeCourierId, {
        username: accountUsername,
        email: accountEmail,
        phone: accountPhone,
        password: accountPassword,
      });
      toast.success('Akun login kurir berhasil dibuat!', {
        description: `Akun dengan username ${accountUsername} siap digunakan.`,
      });
      await fetchCourierAccount(activeCourierId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal membuat akun login kurir.');
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const openCourierUpdate = (courierId: string) => {
    const targetCourier = couriers.find((courier) => courier.id === courierId);

    if (!targetCourier) {
      return;
    }

    setActiveCourierId(courierId);
    setDraftCourier({ ...targetCourier });
    setDialogMode('edit');
  };

  const openCreateCourier = () => {
    setActiveCourierId(null);
    setDraftCourier(buildNewCourierDraft(couriers));
    setDialogMode('create');
  };

  const updateDraftCourier = <Key extends keyof Courier>(key: Key, value: Courier[Key]) => {
    setDraftCourier((previousDraft) =>
      previousDraft
        ? {
            ...previousDraft,
            [key]: value,
          }
        : previousDraft
    );
  };

  const handleSaveCourier = async () => {
    if (!draftCourier) {
      return;
    }

    if (!draftCourier.name || !draftCourier.baseArea || !draftCourier.coverageArea || !draftCourier.phone) {
      toast.error('Lengkapi data kurir terlebih dahulu.', {
        description: 'Nama, area basis, area tugas, dan nomor telepon wajib diisi.',
      });
      return;
    }

    try {
      if (dialogMode === 'create') {
        await createCourier(draftCourier);
        toast.success('Kurir baru ditambahkan', {
          description: `${draftCourier.name || draftCourier.id} masuk ke daftar kurir.`,
        });
      } else {
        await updateCourier(draftCourier);
        toast.success('Data kurir diperbarui', {
          description: `Perubahan untuk ${draftCourier.name} berhasil disimpan.`,
        });
      }

      resetDialog();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan data kurir.');
    }
  };

  const deleteCourier = async () => {
    if (!courierToDelete) return;

    try {
      await deleteCourierRequest(courierToDelete.id);
      toast.success('Data kurir dihapus', {
        description: `${courierToDelete.name} berhasil dihapus dari daftar kurir.`,
      });

      if (activeCourierId === courierToDelete.id) {
        resetDialog();
      }

      setCourierToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus data kurir.');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-[#63D25F]/25 bg-white/95 shadow-sm">
        <CardHeader>
          <CardTitle>Operasional Kurir</CardTitle>
          <CardDescription>Ringkasan performa, area tugas, dan kesiapan armada kurir.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 xl:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))]">
            <div className="rounded-2xl bg-[#63D25F] p-5 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-white/80">Total Pengiriman Kurir</p>
                  <p className="mt-2 text-3xl font-semibold">{totalDeliveries}</p>
                </div>
                <Truck className="h-9 w-9 text-white/90" />
              </div>
              <p className="mt-4 text-sm text-white/85">
                Akumulasi pengiriman dari seluruh kurir yang terdaftar di sistem admin.
              </p>
            </div>

            {couriers.slice(0, 3).map((courier) => (
              <div
                key={courier.id}
                className="flex h-full flex-col justify-between rounded-2xl border border-border bg-secondary/30 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{courier.name}</p>
                    <p className="text-sm text-muted-foreground">{courier.coverageArea}</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                    {courier.performanceScore}/100
                  </Badge>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Kendaraan:{' '}
                  <span className="font-medium text-foreground">
                    {courier.vehicleType} - {courier.vehiclePlate || 'Belum diisi'}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="border-border/70 bg-secondary/30">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Kurir</p>
            <p className="mt-2 text-2xl font-semibold">{couriers.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-secondary/30">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Kurir Aktif</p>
            <p className="mt-2 text-2xl font-semibold">{activeCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-secondary/30">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Rata-rata Performa</p>
            <p className="mt-2 text-2xl font-semibold">{averagePerformance}/100</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 bg-white/90 shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Daftar Kurir</CardTitle>
            <CardDescription>
              Kelola data kurir, area tugas, kendaraan, nomor kontak, dan performa dari satu tempat.
            </CardDescription>
          </div>

          <div className="flex w-full flex-col gap-3 lg:w-auto lg:items-end">
            <AdminTableToolbar
              addLabel="Tambah Kurir"
              searchPlaceholder="Cari ID, nama, area, kendaraan, status..."
              searchValue={searchQuery}
              onSearchChange={(value) => {
                setSearchQuery(value);
                setCurrentPage(1);
              }}
              onAdd={openCreateCourier}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Area Tugas</TableHead>
                <TableHead>Kendaraan</TableHead>
                <TableHead>No. Telepon</TableHead>
                <TableHead>Total Kirim</TableHead>
                <TableHead>Performa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCouriers.length > 0 ? (
                paginatedCouriers.map((courier) => (
                  <TableRow key={courier.id}>
                    <TableCell className="font-medium">{courier.id}</TableCell>
                    <TableCell>{courier.name}</TableCell>
                    <TableCell>
                      <div className="font-medium">{courier.coverageArea}</div>
                      <div className="text-xs text-muted-foreground">{courier.baseArea}</div>
                    </TableCell>
                    <TableCell>
                      <div>{courier.vehicleType}</div>
                      <div className="text-xs text-muted-foreground">{courier.vehiclePlate || '-'}</div>
                    </TableCell>
                    <TableCell>{courier.phone}</TableCell>
                    <TableCell>{courier.completedDeliveries}</TableCell>
                    <TableCell>{courier.performanceScore}/100</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          courier.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-200'
                        }
                      >
                        {courier.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCourierDetail(courier.id)}
                        >
                          Detail
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-destructive/30 text-destructive hover:bg-destructive/10"
                          onClick={() => setCourierToDelete(courier)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                    Tidak ada data kurir yang cocok dengan pencarian saat ini.
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

      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && resetDialog()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create'
                ? 'Tambah Data Kurir'
                : dialogMode === 'edit'
                  ? 'Update Data Kurir'
                  : 'Detail Kurir'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'view'
                ? 'Data lengkap kurir, area operasional, kendaraan, dan performanya.'
                : 'Isi data operasional kurir agar penugasan paket tetap akurat.'}
            </DialogDescription>
          </DialogHeader>

          {dialogMode === 'view' && selectedCourier && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['ID Kurir', selectedCourier.id],
                  ['Nama Kurir', selectedCourier.name],
                  ['Area Basis', selectedCourier.baseArea],
                  ['Area Tugas', selectedCourier.coverageArea],
                  ['Tipe Kendaraan', selectedCourier.vehicleType],
                  ['Nomor Kendaraan', selectedCourier.vehiclePlate || '-'],
                  ['No. Telepon', selectedCourier.phone],
                  ['Total Pengiriman', `${selectedCourier.completedDeliveries} paket`],
                  ['Skor Performa', `${selectedCourier.performanceScore}/100`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-border bg-secondary/20 p-4">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-1 font-semibold">{value}</p>
                  </div>
                ))}

                <div className="rounded-2xl border border-border bg-white p-4 md:col-span-2">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    className={
                      selectedCourier.status === 'Aktif'
                        ? 'mt-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                        : 'mt-2 bg-slate-200 text-slate-700 hover:bg-slate-200'
                    }
                  >
                    {selectedCourier.status}
                  </Badge>
                </div>

                {/* Login Account Section */}
                <div className="rounded-2xl border border-border bg-white p-6 md:col-span-2 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 border-b pb-3">
                    <User className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-lg text-foreground">Akun Login Kurir</h3>
                  </div>

                  {isLoadingAccount ? (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                      Memuat informasi akun login...
                    </div>
                  ) : courierAccount?.hasCourierAccount ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl bg-emerald-50/50 border border-emerald-100 p-4">
                        <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Status Akun</p>
                        <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Aktif & Siap Login</Badge>
                        </div>
                      </div>
                      
                      <div className="rounded-xl bg-secondary/10 border border-border p-4">
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Username</p>
                        <p className="mt-1 font-semibold text-foreground text-sm">{courierAccount.username}</p>
                      </div>

                      <div className="rounded-xl bg-secondary/10 border border-border p-4">
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Email Akun</p>
                        <p className="mt-1 font-semibold text-foreground text-sm">{courierAccount.email}</p>
                      </div>

                      <div className="rounded-xl bg-secondary/10 border border-border p-4">
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">No. Telepon</p>
                        <p className="mt-1 font-semibold text-foreground text-sm">{courierAccount.phone || '-'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-xl bg-amber-50/50 border border-amber-100 p-4 text-amber-800 text-xs sm:text-sm">
                        Kurir ini belum memiliki akun untuk login ke aplikasi / page kurir. Gunakan form di bawah untuk membuatkannya akun.
                      </div>
                      
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="account-username">Username Login</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            <Input
                              id="account-username"
                              value={accountUsername}
                              onChange={(e) => setAccountUsername(e.target.value)}
                              placeholder="Masukkan username"
                              className="pl-9 text-sm"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="account-email">Email Kurir</Label>
                          <Input
                            id="account-email"
                            type="email"
                            value={accountEmail}
                            onChange={(e) => setAccountEmail(e.target.value)}
                            placeholder="nama@cargolite.com"
                            className="text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="account-phone">No. Telepon Akun (Opsional)</Label>
                          <Input
                            id="account-phone"
                            value={accountPhone}
                            onChange={(e) => setAccountPhone(e.target.value)}
                            placeholder="08xxxxxxxxxx"
                            className="text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="account-password">Password Login</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            <Input
                              id="account-password"
                              type="password"
                              value={accountPassword}
                              onChange={(e) => setAccountPassword(e.target.value)}
                              placeholder="Minimal 6 karakter"
                              className="pl-9 text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button
                          type="button"
                          onClick={handleCreateCourierAccount}
                          disabled={isCreatingAccount}
                          className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-sm transition-all"
                        >
                          {isCreatingAccount ? 'Mendaftarkan Akun...' : 'Buat Akun Login Kurir'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => setCourierToDelete(selectedCourier)}
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus Data
                </Button>
                <Button type="button" onClick={() => openCourierUpdate(selectedCourier.id)}>
                  <PencilLine className="h-4 w-4" />
                  Update
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Tutup
                  </Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}

          {(dialogMode === 'edit' || dialogMode === 'create') && draftCourier && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="courier-id">ID Kurir</Label>
                  <Input id="courier-id" value={draftCourier.id} readOnly className="bg-muted/40" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courier-name">Nama Kurir</Label>
                  <Input
                    id="courier-name"
                    value={draftCourier.name}
                    onChange={(event) => updateDraftCourier('name', event.target.value)}
                    placeholder="Tulis nama kurir"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courier-base-area">Area Basis</Label>
                  <Input
                    id="courier-base-area"
                    value={draftCourier.baseArea}
                    onChange={(event) => updateDraftCourier('baseArea', event.target.value)}
                    placeholder="Contoh: Hub Bandung"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courier-coverage-area">Area Tugas</Label>
                  <Input
                    id="courier-coverage-area"
                    value={draftCourier.coverageArea}
                    onChange={(event) => updateDraftCourier('coverageArea', event.target.value)}
                    placeholder="Contoh: Bandung Raya"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courier-vehicle-type">Tipe Kendaraan</Label>
                  <Select
                    value={draftCourier.vehicleType}
                    onValueChange={(value) => updateDraftCourier('vehicleType', value)}
                  >
                    <SelectTrigger id="courier-vehicle-type">
                      <SelectValue placeholder="Pilih kendaraan" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypeOptions.map((vehicleType) => (
                        <SelectItem key={vehicleType} value={vehicleType}>
                          {vehicleType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courier-vehicle-plate">Nomor Kendaraan</Label>
                  <Input
                    id="courier-vehicle-plate"
                    value={draftCourier.vehiclePlate}
                    onChange={(event) => updateDraftCourier('vehiclePlate', event.target.value)}
                    placeholder="Contoh: D 4210 BDS"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courier-phone">No. Telepon</Label>
                  <Input
                    id="courier-phone"
                    value={draftCourier.phone}
                    onChange={(event) => updateDraftCourier('phone', event.target.value)}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courier-status">Status</Label>
                  <Select
                    value={draftCourier.status}
                    onValueChange={(value: CourierStatus) => updateDraftCourier('status', value)}
                  >
                    <SelectTrigger id="courier-status">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      {courierStatusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courier-completed-deliveries">Total Pengiriman</Label>
                  <Input
                    id="courier-completed-deliveries"
                    type="number"
                    min="0"
                    value={draftCourier.completedDeliveries}
                    onChange={(event) =>
                      updateDraftCourier('completedDeliveries', Number(event.target.value))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courier-performance">Skor Performa</Label>
                  <Input
                    id="courier-performance"
                    type="number"
                    min="0"
                    max="100"
                    value={draftCourier.performanceScore}
                    onChange={(event) =>
                      updateDraftCourier('performanceScore', Number(event.target.value))
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" onClick={handleSaveCourier}>
                  <Save className="h-4 w-4" />
                  Simpan Perubahan
                </Button>
                <Button type="button" variant="outline" onClick={resetDialog}>
                  Kembali
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!courierToDelete}
        onOpenChange={(open) => !open && setCourierToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus data kurir?</AlertDialogTitle>
            <AlertDialogDescription>
              Data {courierToDelete?.name} akan dihapus langsung dari Neon. Jika kurir ini masih
              dipakai pada data pengiriman, hapus akan ditolak sampai paket terkait dipindahkan ke
              kurir lain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={deleteCourier}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
