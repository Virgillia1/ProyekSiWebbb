import { useEffect, useMemo, useState } from 'react';
import { PencilLine, Save, Trash2, Truck, PlusCircle, Wrench, ShieldAlert } from 'lucide-react';
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
import type { Vehicle, VehicleStatus } from '../../data/adminData';

const ITEMS_PER_PAGE = 5;
const vehicleStatusOptions: VehicleStatus[] = ['Tersedia', 'Sedang Jalan', 'Servis'];

const padValue = (value: number, length = 3) => String(value).padStart(length, '0');

const getVehicleSearchText = (vehicle: Vehicle) =>
  [
    vehicle.id,
    vehicle.name,
    vehicle.type,
    vehicle.plateNumber,
    vehicle.capacity,
    vehicle.status,
  ]
    .join(' ')
    .toLowerCase();

const buildNewVehicleDraft = (vehicles: Vehicle[]): Vehicle => {
  const nextSequence =
    Math.max(0, ...vehicles.map((v) => Number(v.id.replace(/\D/g, '')) || 0)) + 1;

  return {
    id: `VHC-${padValue(nextSequence)}`,
    name: '',
    type: 'Mobil Box (Truck)',
    plateNumber: '',
    capacity: '1000 kg',
    status: 'Tersedia',
  };
};

export function AdminVehicles() {
  const {
    vehicles = [],
    createVehicle,
    updateVehicle,
    deleteVehicle: deleteVehicleRequest,
  } = useAdminData();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create' | null>(null);
  const [activeVehicleId, setActiveVehicleId] = useState<string | null>(null);
  const [draftVehicle, setDraftVehicle] = useState<Vehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  const filteredVehicles = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return vehicles;
    }

    return vehicles.filter((v) =>
      getVehicleSearchText(v).includes(normalizedQuery)
    );
  }, [vehicles, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE));
  const paginatedVehicles = filteredVehicles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const stats = useMemo(() => {
    return {
      total: vehicles.length,
      available: vehicles.filter((v) => v.status === 'Tersedia').length,
      onRoad: vehicles.filter((v) => v.status === 'Sedang Jalan').length,
      service: vehicles.filter((v) => v.status === 'Servis').length,
    };
  }, [vehicles]);

  const selectedVehicle = vehicles.find((v) => v.id === activeVehicleId) ?? null;

  useEffect(() => {
    setCurrentPage((previousPage) => Math.min(previousPage, totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (dialogMode === 'create') {
      return;
    }

    if (activeVehicleId && !vehicles.some((v) => v.id === activeVehicleId)) {
      setDialogMode(null);
      setActiveVehicleId(null);
      setDraftVehicle(null);
    }
  }, [activeVehicleId, dialogMode, vehicles]);

  const resetDialog = () => {
    setDialogMode(null);
    setActiveVehicleId(null);
    setDraftVehicle(null);
  };

  const openVehicleDetail = (vehicleId: string) => {
    setActiveVehicleId(vehicleId);
    setDraftVehicle(null);
    setDialogMode('view');
  };

  const openVehicleUpdate = (vehicleId: string) => {
    const targetVehicle = vehicles.find((v) => v.id === vehicleId);

    if (!targetVehicle) {
      return;
    }

    setActiveVehicleId(vehicleId);
    setDraftVehicle({ ...targetVehicle });
    setDialogMode('edit');
  };

  const openCreateVehicle = () => {
    setActiveVehicleId(null);
    setDraftVehicle(buildNewVehicleDraft(vehicles));
    setDialogMode('create');
  };

  const updateDraftVehicle = <Key extends keyof Vehicle>(key: Key, value: Vehicle[Key]) => {
    setDraftVehicle((previousDraft) =>
      previousDraft
        ? {
            ...previousDraft,
            [key]: value,
          }
        : previousDraft
    );
  };

  const handleSaveVehicle = async () => {
    if (!draftVehicle) {
      return;
    }

    if (!draftVehicle.name.trim() || !draftVehicle.plateNumber.trim() || !draftVehicle.capacity.trim()) {
      toast.error('Harap lengkapi semua field yang wajib diisi.');
      return;
    }

    try {
      if (dialogMode === 'create') {
        await createVehicle(draftVehicle);
        toast.success('Kendaraan armada baru ditambahkan', {
          description: `${draftVehicle.name} (${draftVehicle.plateNumber}) siap beroperasi.`,
        });
      } else {
        await updateVehicle(draftVehicle);
        toast.success('Data kendaraan diperbarui', {
          description: `Perubahan untuk ${draftVehicle.name} berhasil disimpan.`,
        });
      }

      resetDialog();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan data kendaraan.');
    }
  };

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;

    try {
      await deleteVehicleRequest(vehicleToDelete.id);
      toast.success('Data kendaraan dihapus', {
        description: `Armada ${vehicleToDelete.name} (${vehicleToDelete.plateNumber}) berhasil dihapus dari database.`,
      });

      if (activeVehicleId === vehicleToDelete.id) {
        resetDialog();
      }

      setVehicleToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus data kendaraan.');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-[#63D25F]/20 bg-[#63D25F] text-white shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Truck className="h-6 w-6" />
                <h2 className="text-2xl font-bold">Manajemen Armada Kendaraan</h2>
              </div>
              <p className="text-sm text-white/80 max-w-xl">
                Pantau seluruh armada CargoLite, kelola status operasional (Tersedia, Sedang Jalan, Servis),
                dan perbarui kapasitas muatan kendaraan secara tersentralisasi.
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                onClick={openCreateVehicle}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Registrasi Armada
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Armada', value: stats.total, color: 'text-primary bg-primary/10', icon: Truck },
          { title: 'Siap Beroperasi (Tersedia)', value: stats.available, color: 'text-emerald-600 bg-emerald-100', icon: Truck },
          { title: 'Sedang Jalan', value: stats.onRoad, color: 'text-amber-600 bg-amber-100', icon: Truck },
          { title: 'Dalam Perawatan (Servis)', value: stats.service, color: 'text-rose-600 bg-rose-100', icon: Wrench },
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <Card key={index} className="border-border/70 bg-white/90 shadow-sm">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                  <p className="mt-2 text-3xl font-bold">{item.value}</p>
                </div>
                <div className={`rounded-2xl p-3.5 ${item.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-border/80 bg-white/90 shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Daftar Kendaraan & Status Operasional</CardTitle>
            <CardDescription>
              Gunakan bilah pencarian untuk menyaring armada berdasarkan nomor plat, nama model, jenis kendaraan, atau kapasitas muatan.
            </CardDescription>
          </div>
          <AdminTableToolbar
            addLabel="Registrasi Armada"
            searchPlaceholder="Cari plat nomor, model kendaraan, kapasitas..."
            searchValue={searchQuery}
            onSearchChange={(value) => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
            onAdd={openCreateVehicle}
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode Armada</TableHead>
                <TableHead>Nama Model</TableHead>
                <TableHead>Jenis Kendaraan</TableHead>
                <TableHead>Plat Nomor</TableHead>
                <TableHead>Kapasitas Muatan</TableHead>
                <TableHead>Status Operasional</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedVehicles.length > 0 ? (
                paginatedVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.id}</TableCell>
                    <TableCell className="font-semibold">{vehicle.name}</TableCell>
                    <TableCell>{vehicle.type}</TableCell>
                    <TableCell className="font-mono">{vehicle.plateNumber}</TableCell>
                    <TableCell>{vehicle.capacity}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          vehicle.status === 'Tersedia'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                            : vehicle.status === 'Sedang Jalan'
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                              : 'bg-rose-100 text-rose-700 hover:bg-rose-100'
                        }
                      >
                        {vehicle.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openVehicleDetail(vehicle.id)}
                        >
                          Detail
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-destructive/30 text-destructive hover:bg-destructive/10"
                          onClick={() => setVehicleToDelete(vehicle)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    Tidak ada data kendaraan yang cocok dengan pencarian saat ini.
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create'
                ? 'Tambah Data Armada Kendaraan'
                : dialogMode === 'edit'
                  ? 'Update Data Kendaraan'
                  : 'Detail Armada Kendaraan'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'view'
                ? 'Informasi lengkap spesifikasi armada serta status operasional saat ini.'
                : 'Lengkapi spesifikasi teknis dan nomor identifikasi kendaraan secara detail.'}
            </DialogDescription>
          </DialogHeader>

          {dialogMode === 'view' && selectedVehicle && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ['Kode Armada', selectedVehicle.id],
                  ['Nama Model Kendaraan', selectedVehicle.name],
                  ['Jenis Kendaraan', selectedVehicle.type],
                  ['Plat Nomor / Kode Registrasi', selectedVehicle.plateNumber],
                  ['Kapasitas Muatan', selectedVehicle.capacity],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-border bg-secondary/20 p-4">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 font-semibold">{value}</p>
                  </div>
                ))}

                <div className="rounded-2xl border border-border bg-white p-4 sm:col-span-2">
                  <p className="text-xs text-muted-foreground mb-2">Status Operasional</p>
                  <Badge
                    className={
                      selectedVehicle.status === 'Tersedia'
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                        : selectedVehicle.status === 'Sedang Jalan'
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                          : 'bg-rose-100 text-rose-700 hover:bg-rose-100'
                    }
                  >
                    {selectedVehicle.status}
                  </Badge>
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => setVehicleToDelete(selectedVehicle)}
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus Armada
                </Button>
                <Button
                  type="button"
                  onClick={() => openVehicleUpdate(selectedVehicle.id)}
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

          {(dialogMode === 'edit' || dialogMode === 'create') && draftVehicle && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="vehicle-id">Kode Armada</Label>
                  <Input id="vehicle-id" value={draftVehicle.id} readOnly className="bg-muted/40" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle-name">Nama Model Kendaraan</Label>
                  <Input
                    id="vehicle-name"
                    value={draftVehicle.name}
                    onChange={(event) => updateDraftVehicle('name', event.target.value)}
                    placeholder="Contoh: Isuzu Elf Box, Grand Max"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle-type">Jenis Kendaraan</Label>
                  <Select
                    value={draftVehicle.type}
                    onValueChange={(value) => updateDraftVehicle('type', value)}
                  >
                    <SelectTrigger id="vehicle-type">
                      <SelectValue placeholder="Pilih jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Motor">Motor</SelectItem>
                      <SelectItem value="Pick Up">Pick Up</SelectItem>
                      <SelectItem value="Engkel Box">Engkel Box</SelectItem>
                      <SelectItem value="Truck Fuso">Truck Fuso</SelectItem>
                      <SelectItem value="Double Box">Double Box</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle-plate">Plat Nomor / Kode Registrasi</Label>
                  <Input
                    id="vehicle-plate"
                    value={draftVehicle.plateNumber}
                    onChange={(event) => updateDraftVehicle('plateNumber', event.target.value)}
                    placeholder="Contoh: B 9021 UX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle-capacity">Kapasitas Muatan</Label>
                  <Input
                    id="vehicle-capacity"
                    value={draftVehicle.capacity}
                    onChange={(event) => updateDraftVehicle('capacity', event.target.value)}
                    placeholder="Contoh: 1500 kg, 8 ton"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle-status">Status Operasional</Label>
                  <Select
                    value={draftVehicle.status}
                    onValueChange={(value: VehicleStatus) => updateDraftVehicle('status', value)}
                  >
                    <SelectTrigger id="vehicle-status">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleStatusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" onClick={handleSaveVehicle}>
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

      <AlertDialog open={!!vehicleToDelete} onOpenChange={(open) => !open && setVehicleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-600">
              <ShieldAlert className="h-5 w-5" />
              Hapus armada kendaraan?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Armada <strong>{vehicleToDelete?.name}</strong> dengan plat nomor <strong>{vehicleToDelete?.plateNumber}</strong> akan dihapus permanen dari Neon. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDeleteVehicle}>
              Hapus Permanen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
