import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CalendarDays, CheckCircle2, Clock3 } from 'lucide-react';
import { AdminTablePagination } from '../../components/admin/AdminTablePagination';
import { ExpandableSearch } from '../../components/admin/ExpandableSearch';
import { useAdminData } from '../../contexts/AdminDataContext';
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
import { monthOptions } from '../../data/adminData';
import { useMetadata } from '../../lib/useMetadata';

const ITEMS_PER_PAGE = 5;
const statusBadgeClass: Record<string, string> = {
  Hadir: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  Alpha: 'bg-red-100 text-red-700 hover:bg-red-100',
  Sakit: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  Izin: 'bg-sky-100 text-sky-700 hover:bg-sky-100',
};

const getAttendanceSearchText = (record: {
  id: string;
  employeeId: string;
  employeeName: string;
  division: string;
  todayStatus: string;
  lastAbsentDate: string;
}) =>
  [
    record.id,
    record.employeeId,
    record.employeeName,
    record.division,
    record.todayStatus,
    record.lastAbsentDate,
  ]
    .join(' ')
    .toLowerCase();

export function AdminAttendance() {
  useMetadata(
    'Rekap Presensi Karyawan (Admin)',
    'Pantau status kehadiran karyawan, total sakit, izin, alpha, keterlambatan, dan detail absensi tinggi di CargoLite.'
  );

  const { attendanceRecords } = useAdminData();
  const [selectedMonth, setSelectedMonth] = useState('2026-04');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAbsentDetailOpen, setIsAbsentDetailOpen] = useState(false);

  const monthRecords = useMemo(
    () => attendanceRecords.filter((item) => item.monthKey === selectedMonth),
    [selectedMonth]
  );

  const filteredRecords = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return monthRecords;
    }

    return monthRecords.filter((record) =>
      getAttendanceSearchText(record).includes(normalizedQuery)
    );
  }, [monthRecords, searchQuery]);

  const totals = useMemo(() => {
    const totalPresent = monthRecords.reduce((sum, item) => sum + item.presentDays, 0);
    const totalAbsent = monthRecords.reduce((sum, item) => sum + item.absentDays, 0);
    const totalLate = monthRecords.reduce((sum, item) => sum + item.lateCount, 0);

    return {
      totalPresent,
      totalAbsent,
      totalLate,
    };
  }, [monthRecords]);

  const flaggedEmployees = monthRecords.filter((item) => item.absentDays > 3);
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / ITEMS_PER_PAGE));
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const currentMonthLabel =
    monthOptions.find((item) => item.value === selectedMonth)?.label ?? selectedMonth;

  useEffect(() => {
    setCurrentPage((previousPage) => Math.min(previousPage, totalPages));
  }, [totalPages]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/80 bg-white/90 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Hadir</p>
                <p className="mt-2 text-3xl font-semibold">{totals.totalPresent}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-white/90 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Absen</p>
                <p className="mt-2 text-3xl font-semibold">{totals.totalAbsent}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-white/90 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Terlambat</p>
                <p className="mt-2 text-3xl font-semibold">{totals.totalLate}</p>
              </div>
              <Clock3 className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-white/90 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Absen {'>'} 3 Hari</p>
                <p className="mt-2 text-3xl font-semibold">{flaggedEmployees.length}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-sky-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 bg-white/90 shadow-sm">
        <CardHeader className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <CardTitle>Rekap Presensi</CardTitle>
            <CardDescription>
              Status kehadiran setiap karyawan pada {currentMonthLabel}.
            </CardDescription>
          </div>

          <div className="flex w-full flex-col gap-3 xl:w-auto xl:items-end">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center xl:justify-end">
              <Select
                value={selectedMonth}
                onValueChange={(value) => {
                  setSelectedMonth(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="sm:w-48">
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

              <Button variant="outline" onClick={() => setIsAbsentDetailOpen(true)}>
                Detail Absen Tinggi
              </Button>
            </div>

            <ExpandableSearch
              value={searchQuery}
              onChange={(value) => {
                setSearchQuery(value);
                setCurrentPage(1);
              }}
              placeholder="Cari ID, nama, divisi, status..."
            />
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Divisi</TableHead>
                <TableHead>Hadir</TableHead>
                <TableHead>Absen</TableHead>
                <TableHead>Sakit/Izin</TableHead>
                <TableHead>Terlambat</TableHead>
                <TableHead>Status Hari Ini</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.employeeId}</TableCell>
                    <TableCell>{record.employeeName}</TableCell>
                    <TableCell>{record.division}</TableCell>
                    <TableCell>{record.presentDays} hari</TableCell>
                    <TableCell>{record.absentDays} hari</TableCell>
                    <TableCell>
                      {record.sickDays} sakit / {record.permitDays} izin
                    </TableCell>
                    <TableCell>{record.lateCount} kali</TableCell>
                    <TableCell>
                      <Badge className={statusBadgeClass[record.todayStatus]}>
                        {record.todayStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                    Tidak ada data presensi yang cocok dengan pencarian saat ini.
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

      <Dialog open={isAbsentDetailOpen} onOpenChange={setIsAbsentDetailOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Karyawan Melebihi 3 Hari Absen</DialogTitle>
            <DialogDescription>
              Daftar karyawan yang perlu ditinjau oleh admin atau HR operasional.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {flaggedEmployees.length > 0 ? (
              flaggedEmployees.map((employee) => (
                <div key={employee.id} className="rounded-2xl border border-red-200 bg-red-50/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{employee.employeeName}</p>
                      <p className="text-sm text-muted-foreground">
                        {employee.employeeId} - {employee.division}
                      </p>
                    </div>
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                      {employee.absentDays} hari
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Absen terakhir pada{' '}
                    {new Date(employee.lastAbsentDate).toLocaleDateString('id-ID')}.
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
                Tidak ada karyawan dengan absen di atas tiga hari pada {currentMonthLabel}.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsAbsentDetailOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
