import { useMemo, useState } from 'react';
import { Eye, Trash2, UserRoundCog, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
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
import { Switch } from '../../components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { employees as initialEmployees, Employee } from '../../data/adminData';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

export function AdminEmployees() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const activeCount = employees.filter((item) => item.status === 'Aktif').length;
  const payrollTotal = employees.reduce((sum, item) => sum + item.salary, 0);
  const averageTenure = useMemo(() => {
    if (!employees.length) return 0;
    return (
      employees.reduce((sum, item) => sum + item.yearsWorking, 0) / employees.length
    ).toFixed(1);
  }, [employees]);

  const openEmployeeDetail = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDetailOpen(true);
  };

  const updateEmployeeStatus = (employeeId: string, nextActive: boolean) => {
    const nextStatus = nextActive ? 'Aktif' : 'Nonaktif';

    setEmployees((prev) =>
      prev.map((item) =>
        item.id === employeeId
          ? {
              ...item,
              status: nextStatus,
            }
          : item
      )
    );

    setSelectedEmployee((prev) =>
      prev && prev.id === employeeId
        ? {
            ...prev,
            status: nextStatus,
          }
        : prev
    );

    toast.success('Status karyawan diperbarui', {
      description: `Karyawan sekarang berstatus ${nextStatus.toLowerCase()}.`,
    });
  };

  const deleteEmployee = () => {
    if (!employeeToDelete) return;

    setEmployees((prev) => prev.filter((item) => item.id !== employeeToDelete.id));
    toast.success('Data karyawan dihapus', {
      description: `${employeeToDelete.name} berhasil dihapus dari daftar karyawan.`,
    });

    if (selectedEmployee?.id === employeeToDelete.id) {
      setIsDetailOpen(false);
      setSelectedEmployee(null);
    }

    setEmployeeToDelete(null);
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
                  Gaji: <span className="font-medium text-foreground">{formatCurrency(employee.salary)}</span>
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
        <CardHeader>
          <CardTitle>Daftar Karyawan</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Asal</TableHead>
                <TableHead>Umur</TableHead>
                <TableHead>Lama Bekerja</TableHead>
                <TableHead>Gaji</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow
                  key={employee.id}
                  className="cursor-pointer"
                  onClick={() => openEmployeeDetail(employee)}
                >
                  <TableCell className="font-medium">{employee.id}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.origin}</TableCell>
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
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEmployeeDetail(employee);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Detail
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-destructive/30 text-destructive hover:bg-destructive/10"
                        onClick={(event) => {
                          event.stopPropagation();
                          setEmployeeToDelete(employee);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
              Gunakan tombol detail untuk mengganti status aktif tanpa pindah halaman.
            </div>
            <div className="rounded-2xl bg-secondary/40 p-4">
              Penghapusan data karyawan meminta konfirmasi agar tidak salah hapus.
            </div>
            <div className="rounded-2xl bg-secondary/40 p-4">
              Struktur gaji bisa dipantau dari panel payroll agar evaluasi tim lebih cepat.
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsNotesOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          {selectedEmployee && (
            <>
              <DialogHeader>
                <DialogTitle>Detail Karyawan</DialogTitle>
                <DialogDescription>
                  Data lengkap karyawan dan pengaturan status keaktifannya.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['ID Karyawan', selectedEmployee.id],
                  ['Nama', selectedEmployee.name],
                  ['Asal', selectedEmployee.origin],
                  ['Umur', `${selectedEmployee.age} tahun`],
                  ['Lama Bekerja', `${selectedEmployee.yearsWorking} tahun`],
                  ['Posisi', selectedEmployee.position],
                  ['No. Telepon', selectedEmployee.phone],
                  ['Jumlah Gaji', formatCurrency(selectedEmployee.salary)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-border bg-secondary/20 p-4">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-1 font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-border bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">Status Aktif</p>
                    <p className="text-sm text-muted-foreground">
                      Nonaktifkan bila karyawan sedang tidak bertugas atau keluar.
                    </p>
                  </div>
                  <Switch
                    checked={selectedEmployee.status === 'Aktif'}
                    onCheckedChange={(checked) => updateEmployeeStatus(selectedEmployee.id, checked)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => setEmployeeToDelete(selectedEmployee)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Data
                </Button>
                <Button onClick={() => setIsDetailOpen(false)}>
                  <UserRoundCog className="mr-2 h-4 w-4" />
                  Selesai
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
              Data {employeeToDelete?.name} akan dihapus dari daftar. Tindakan ini hanya untuk simulasi UI dan tidak bisa dibatalkan di sesi ini.
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
