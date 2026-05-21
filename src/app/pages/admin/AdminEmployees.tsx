import { useEffect, useMemo, useState } from 'react';
import { PencilLine, Save, Trash2, Wallet } from 'lucide-react';
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
import type { Employee, EmployeeStatus } from '../../data/adminData';

const ITEMS_PER_PAGE = 5;
const employeeStatusOptions: EmployeeStatus[] = ['Aktif', 'Nonaktif'];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

const padValue = (value: number, length = 3) => String(value).padStart(length, '0');

const getEmployeeSearchText = (employee: Employee) =>
  [
    employee.id,
    employee.name,
    employee.origin,
    employee.division,
    employee.position,
    employee.phone,
    employee.status,
  ]
    .join(' ')
    .toLowerCase();

const buildNewEmployeeDraft = (employees: Employee[], defaultDivision: string): Employee => {
  const nextSequence =
    Math.max(0, ...employees.map((employee) => Number(employee.id.replace(/\D/g, '')) || 0)) + 1;

  return {
    id: `EMP-${padValue(nextSequence)}`,
    name: '',
    origin: '',
    age: 25,
    yearsWorking: 0,
    salary: 4500000,
    status: 'Aktif',
    division: defaultDivision,
    position: '',
    phone: '',
    performanceScore: 80,
  };
};

export function AdminEmployees() {
  const {
    employees,
    createEmployee,
    updateEmployee,
    deleteEmployee: deleteEmployeeRequest,
  } = useAdminData();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create' | null>(null);
  const [activeEmployeeId, setActiveEmployeeId] = useState<string | null>(null);
  const [draftEmployee, setDraftEmployee] = useState<Employee | null>(null);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const divisionOptions = useMemo(
    () => Array.from(new Set(employees.map((employee) => employee.division))),
    [employees]
  );

  const filteredEmployees = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return employees;
    }

    return employees.filter((employee) =>
      getEmployeeSearchText(employee).includes(normalizedQuery)
    );
  }, [employees, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE));
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const activeCount = employees.filter((item) => item.status === 'Aktif').length;
  const payrollTotal = employees.reduce((sum, item) => sum + item.salary, 0);
  const averageTenure = useMemo(() => {
    if (!employees.length) return 0;
    return (
      employees.reduce((sum, item) => sum + item.yearsWorking, 0) / employees.length
    ).toFixed(1);
  }, [employees]);

  const selectedEmployee = employees.find((employee) => employee.id === activeEmployeeId) ?? null;

  useEffect(() => {
    setCurrentPage((previousPage) => Math.min(previousPage, totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (dialogMode === 'create') {
      return;
    }

    if (activeEmployeeId && !employees.some((employee) => employee.id === activeEmployeeId)) {
      setDialogMode(null);
      setActiveEmployeeId(null);
      setDraftEmployee(null);
    }
  }, [activeEmployeeId, dialogMode, employees]);

  const resetDialog = () => {
    setDialogMode(null);
    setActiveEmployeeId(null);
    setDraftEmployee(null);
  };

  const openEmployeeDetail = (employeeId: string) => {
    setActiveEmployeeId(employeeId);
    setDraftEmployee(null);
    setDialogMode('view');
  };

  const openEmployeeUpdate = (employeeId: string) => {
    const targetEmployee = employees.find((employee) => employee.id === employeeId);

    if (!targetEmployee) {
      return;
    }

    setActiveEmployeeId(employeeId);
    setDraftEmployee({ ...targetEmployee });
    setDialogMode('edit');
  };

  const openCreateEmployee = () => {
    const defaultDivision = divisionOptions[0] ?? 'Operasional';

    setActiveEmployeeId(null);
    setDraftEmployee(buildNewEmployeeDraft(employees, defaultDivision));
    setDialogMode('create');
  };

  const updateDraftEmployee = <Key extends keyof Employee>(key: Key, value: Employee[Key]) => {
    setDraftEmployee((previousDraft) =>
      previousDraft
        ? {
            ...previousDraft,
            [key]: value,
          }
        : previousDraft
    );
  };

  const handleSaveEmployee = async () => {
    if (!draftEmployee) {
      return;
    }

    try {
      if (dialogMode === 'create') {
        await createEmployee(draftEmployee);
        toast.success('Karyawan baru ditambahkan', {
          description: `${draftEmployee.name || draftEmployee.id} masuk ke daftar tim.`,
        });
      } else {
        await updateEmployee(draftEmployee);
        toast.success('Data karyawan diperbarui', {
          description: `Perubahan untuk ${draftEmployee.name} berhasil disimpan.`,
        });
      }

      resetDialog();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan data karyawan.');
    }
  };

  const deleteEmployee = async () => {
    if (!employeeToDelete) return;

    try {
      await deleteEmployeeRequest(employeeToDelete.id);
      toast.success('Data karyawan dihapus', {
        description: `${employeeToDelete.name} berhasil dihapus dari daftar karyawan.`,
      });

      if (activeEmployeeId === employeeToDelete.id) {
        resetDialog();
      }

      setEmployeeToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus data karyawan.');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-[#63D25F]/25 bg-white/95 shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Payroll Snapshot</CardTitle>
            <CardDescription>Total gaji dan struktur tim untuk bulan berjalan.</CardDescription>
          </div>
          <Button variant="outline" onClick={() => setIsNotesOpen(true)}>
            Catatan Admin
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 xl:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))]">
            <div className="rounded-2xl bg-[#63D25F] p-5 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-white/80">Total Payroll</p>
                  <p className="mt-2 text-3xl font-semibold">{formatCurrency(payrollTotal)}</p>
                </div>
                <Wallet className="h-9 w-9 text-white/90" />
              </div>
              <p className="mt-4 text-sm text-white/85">
                Snapshot gaji seluruh tim aktif dan nonaktif untuk evaluasi bulan berjalan.
              </p>
            </div>

            {employees.slice(0, 3).map((employee) => (
              <div
                key={employee.id}
                className="flex h-full flex-col justify-between rounded-2xl border border-border bg-secondary/30 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{employee.name}</p>
                    <p className="text-sm text-muted-foreground">{employee.position}</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                    {employee.performanceScore}/100
                  </Badge>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Gaji:{' '}
                  <span className="font-medium text-foreground">
                    {formatCurrency(employee.salary)}
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
            <p className="text-sm text-muted-foreground">Total Karyawan</p>
            <p className="mt-2 text-2xl font-semibold">{employees.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-secondary/30">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Status Aktif</p>
            <p className="mt-2 text-2xl font-semibold">{activeCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-secondary/30">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Rata-rata Masa Kerja</p>
            <p className="mt-2 text-2xl font-semibold">{averageTenure} th</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 bg-white/90 shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Daftar Karyawan</CardTitle>
            <CardDescription>
              Cari data tim lebih cepat, tambah anggota baru, lalu buka detail karyawan dan update
              datanya dari pop-up tanpa pindah halaman.
            </CardDescription>
          </div>

          <div className="flex w-full flex-col gap-3 lg:w-auto lg:items-end">
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsNotesOpen(true)}>
                Catatan Admin
              </Button>
            </div>
            <AdminTableToolbar
              addLabel="Tambah Karyawan"
              searchPlaceholder="Cari ID, nama, divisi, posisi, status..."
              searchValue={searchQuery}
              onSearchChange={(value) => {
                setSearchQuery(value);
                setCurrentPage(1);
              }}
              onAdd={openCreateEmployee}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Asal</TableHead>
                <TableHead>Divisi</TableHead>
                <TableHead>Umur</TableHead>
                <TableHead>Lama Bekerja</TableHead>
                <TableHead>Gaji</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.id}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.origin}</TableCell>
                    <TableCell>{employee.division}</TableCell>
                    <TableCell>{employee.age} tahun</TableCell>
                    <TableCell>{employee.yearsWorking} tahun</TableCell>
                    <TableCell>{formatCurrency(employee.salary)}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          employee.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-200'
                        }
                      >
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEmployeeDetail(employee.id)}
                        >
                          Detail
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-destructive/30 text-destructive hover:bg-destructive/10"
                          onClick={() => setEmployeeToDelete(employee)}
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
                    Tidak ada data karyawan yang cocok dengan pencarian saat ini.
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

      <Dialog open={isNotesOpen} onOpenChange={setIsNotesOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Catatan Admin</DialogTitle>
            <DialogDescription>Ringkasan aksi cepat untuk manajemen tim.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="rounded-2xl bg-secondary/40 p-4">
              Gunakan tombol detail lalu lanjutkan update dari pop-up untuk merapikan data
              karyawan.
            </div>
            <div className="rounded-2xl bg-secondary/40 p-4">
              Search baru membantu admin menemukan nama, posisi, atau divisi dengan animasi yang
              tetap ringan.
            </div>
            <div className="rounded-2xl bg-secondary/40 p-4">
              Penghapusan data karyawan tetap meminta konfirmasi agar tidak salah hapus.
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsNotesOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && resetDialog()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create'
                ? 'Tambah Data Karyawan'
                : dialogMode === 'edit'
                  ? 'Update Data Karyawan'
                  : 'Detail Karyawan'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'view'
                ? 'Data lengkap karyawan dan ringkasan status keaktifannya.'
                : 'Sesuaikan data karyawan yang ditampilkan pada tabel agar selalu sinkron dengan manajemen admin.'}
            </DialogDescription>
          </DialogHeader>

          {dialogMode === 'view' && selectedEmployee && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['ID Karyawan', selectedEmployee.id],
                  ['Nama', selectedEmployee.name],
                  ['Asal', selectedEmployee.origin],
                  ['Divisi', selectedEmployee.division],
                  ['Umur', `${selectedEmployee.age} tahun`],
                  ['Lama Bekerja', `${selectedEmployee.yearsWorking} tahun`],
                  ['Posisi', selectedEmployee.position],
                  ['No. Telepon', selectedEmployee.phone],
                  ['Jumlah Gaji', formatCurrency(selectedEmployee.salary)],
                  ['Performa', `${selectedEmployee.performanceScore}/100`],
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
                      selectedEmployee.status === 'Aktif'
                        ? 'mt-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                        : 'mt-2 bg-slate-200 text-slate-700 hover:bg-slate-200'
                    }
                  >
                    {selectedEmployee.status}
                  </Badge>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => setEmployeeToDelete(selectedEmployee)}
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus Data
                </Button>
                <Button
                  type="button"
                  onClick={() => openEmployeeUpdate(selectedEmployee.id)}
                >
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

          {(dialogMode === 'edit' || dialogMode === 'create') && draftEmployee && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="employee-id">ID Karyawan</Label>
                  <Input id="employee-id" value={draftEmployee.id} readOnly className="bg-muted/40" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employee-name">Nama</Label>
                  <Input
                    id="employee-name"
                    value={draftEmployee.name}
                    onChange={(event) => updateDraftEmployee('name', event.target.value)}
                    placeholder="Tulis nama karyawan"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employee-origin">Asal</Label>
                  <Input
                    id="employee-origin"
                    value={draftEmployee.origin}
                    onChange={(event) => updateDraftEmployee('origin', event.target.value)}
                    placeholder="Kota asal"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employee-division">Divisi</Label>
                  <Select
                    value={draftEmployee.division}
                    onValueChange={(value) => updateDraftEmployee('division', value)}
                  >
                    <SelectTrigger id="employee-division">
                      <SelectValue placeholder="Pilih divisi" />
                    </SelectTrigger>
                    <SelectContent>
                      {divisionOptions.map((division) => (
                        <SelectItem key={division} value={division}>
                          {division}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employee-position">Posisi</Label>
                  <Input
                    id="employee-position"
                    value={draftEmployee.position}
                    onChange={(event) => updateDraftEmployee('position', event.target.value)}
                    placeholder="Posisi pekerjaan"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employee-status">Status</Label>
                  <Select
                    value={draftEmployee.status}
                    onValueChange={(value: EmployeeStatus) => updateDraftEmployee('status', value)}
                  >
                    <SelectTrigger id="employee-status">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      {employeeStatusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employee-age">Umur</Label>
                  <Input
                    id="employee-age"
                    type="number"
                    min="18"
                    value={draftEmployee.age}
                    onChange={(event) => updateDraftEmployee('age', Number(event.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employee-tenure">Lama Bekerja</Label>
                  <Input
                    id="employee-tenure"
                    type="number"
                    min="0"
                    value={draftEmployee.yearsWorking}
                    onChange={(event) =>
                      updateDraftEmployee('yearsWorking', Number(event.target.value))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employee-salary">Gaji</Label>
                  <Input
                    id="employee-salary"
                    type="number"
                    min="0"
                    step="100000"
                    value={draftEmployee.salary}
                    onChange={(event) => updateDraftEmployee('salary', Number(event.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employee-phone">No. Telepon</Label>
                  <Input
                    id="employee-phone"
                    value={draftEmployee.phone}
                    onChange={(event) => updateDraftEmployee('phone', event.target.value)}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="employee-performance">Skor Performa</Label>
                  <Input
                    id="employee-performance"
                    type="number"
                    min="0"
                    max="100"
                    value={draftEmployee.performanceScore}
                    onChange={(event) =>
                      updateDraftEmployee('performanceScore', Number(event.target.value))
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" onClick={handleSaveEmployee}>
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

      <AlertDialog open={!!employeeToDelete} onOpenChange={(open) => !open && setEmployeeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus data karyawan?</AlertDialogTitle>
            <AlertDialogDescription>
              Data {employeeToDelete?.name} akan dihapus langsung dari Neon. Jika karyawan ini
              masih dipakai sebagai kurir pada data pengiriman, hapus akan ditolak sampai paket
              terkait dipindahkan ke kurir lain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={deleteEmployee}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
