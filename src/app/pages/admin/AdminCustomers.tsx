import { useEffect, useMemo, useState } from 'react';
import { PackageCheck, PencilLine, Save, SendToBack, Users } from 'lucide-react';
import { toast } from 'sonner';
import { AdminTablePagination } from '../../components/admin/AdminTablePagination';
import { AdminTableToolbar } from '../../components/admin/AdminTableToolbar';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { customers, type CustomerAccount } from '../../data/adminData';

const ITEMS_PER_PAGE = 5;
const padValue = (value: number, length = 3) => String(value).padStart(length, '0');

const getCustomerSearchText = (customer: CustomerAccount) =>
  [customer.id, customer.name, customer.address, customer.email, customer.phone]
    .join(' ')
    .toLowerCase();

const buildNewCustomerDraft = (customerList: CustomerAccount[]): CustomerAccount => {
  const nextSequence =
    Math.max(0, ...customerList.map((customer) => Number(customer.id.replace(/\D/g, '')) || 0)) + 1;

  return {
    id: `CUS-${padValue(nextSequence)}`,
    name: '',
    address: '',
    email: '',
    phone: '',
    totalSent: 0,
    totalReceived: 0,
    lastActivity: '2026-04-20',
    histories: [],
  };
};

export function AdminCustomers() {
  const [customerList, setCustomerList] = useState(customers);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create' | null>(null);
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);
  const [draftCustomer, setDraftCustomer] = useState<CustomerAccount | null>(null);

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return customerList;
    }

    return customerList.filter((customer) =>
      getCustomerSearchText(customer).includes(normalizedQuery)
    );
  }, [customerList, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE));
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const selectedCustomer = customerList.find((customer) => customer.id === activeCustomerId) ?? null;

  const totalAccounts = customerList.length;
  const totalSent = customerList.reduce((sum, item) => sum + item.totalSent, 0);
  const totalReceived = customerList.reduce((sum, item) => sum + item.totalReceived, 0);

  useEffect(() => {
    setCurrentPage((previousPage) => Math.min(previousPage, totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (dialogMode === 'create') {
      return;
    }

    if (activeCustomerId && !customerList.some((customer) => customer.id === activeCustomerId)) {
      setDialogMode(null);
      setActiveCustomerId(null);
      setDraftCustomer(null);
    }
  }, [activeCustomerId, customerList, dialogMode]);

  const resetDialog = () => {
    setDialogMode(null);
    setActiveCustomerId(null);
    setDraftCustomer(null);
  };

  const openDetail = (customerId: string) => {
    setActiveCustomerId(customerId);
    setDraftCustomer(null);
    setDialogMode('view');
  };

  const openUpdate = (customerId: string) => {
    const targetCustomer = customerList.find((customer) => customer.id === customerId);

    if (!targetCustomer) {
      return;
    }

    setActiveCustomerId(customerId);
    setDraftCustomer({ ...targetCustomer });
    setDialogMode('edit');
  };

  const openCreate = () => {
    setActiveCustomerId(null);
    setDraftCustomer(buildNewCustomerDraft(customerList));
    setDialogMode('create');
  };

  const updateDraftCustomer = <Key extends keyof CustomerAccount>(
    key: Key,
    value: CustomerAccount[Key]
  ) => {
    setDraftCustomer((previousDraft) =>
      previousDraft
        ? {
            ...previousDraft,
            [key]: value,
          }
        : previousDraft
    );
  };

  const handleSaveCustomer = () => {
    if (!draftCustomer) {
      return;
    }

    if (dialogMode === 'create') {
      setCustomerList((previousCustomers) => [draftCustomer, ...previousCustomers]);
      toast.success('Customer baru ditambahkan', {
        description: `${draftCustomer.name || draftCustomer.id} masuk ke daftar akun customer.`,
      });
    } else {
      setCustomerList((previousCustomers) =>
        previousCustomers.map((customer) =>
          customer.id === draftCustomer.id ? draftCustomer : customer
        )
      );
      toast.success('Data customer diperbarui', {
        description: `Perubahan untuk ${draftCustomer.name} berhasil disimpan.`,
      });
    }

    resetDialog();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/80 bg-white/90 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Akun Customer</p>
                <p className="mt-2 text-3xl font-semibold">{totalAccounts}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-white/90 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Riwayat Kirim</p>
                <p className="mt-2 text-3xl font-semibold">{totalSent}</p>
              </div>
              <SendToBack className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-white/90 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Riwayat Terima</p>
                <p className="mt-2 text-3xl font-semibold">{totalReceived}</p>
              </div>
              <PackageCheck className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 bg-white/90 shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Daftar Akun Customer</CardTitle>
            <CardDescription>
              Cari akun customer lebih cepat, buka detail riwayatnya, lalu update data dari
              pop-up tanpa meninggalkan halaman ini.
            </CardDescription>
          </div>
          <AdminTableToolbar
            addLabel="Tambah Customer"
            searchPlaceholder="Cari ID, nama, email, alamat, telepon..."
            searchValue={searchQuery}
            onSearchChange={(value) => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
            onAdd={openCreate}
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Total Mengirim</TableHead>
                <TableHead>Total Menerima</TableHead>
                <TableHead>Aktivitas Terakhir</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.id}</TableCell>
                    <TableCell>
                      <div>{customer.name}</div>
                      <div className="text-xs text-muted-foreground">{customer.email}</div>
                    </TableCell>
                    <TableCell>{customer.address}</TableCell>
                    <TableCell>{customer.totalSent} paket</TableCell>
                    <TableCell>{customer.totalReceived} paket</TableCell>
                    <TableCell>{new Date(customer.lastActivity).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openDetail(customer.id)}>
                          Detail
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    Tidak ada data customer yang cocok dengan pencarian saat ini.
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
                ? 'Tambah Data Customer'
                : dialogMode === 'edit'
                  ? 'Update Data Customer'
                  : 'Profil Customer'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'view'
                ? 'Ringkasan akun dan riwayat pengiriman atau penerimaan paket.'
                : 'Sesuaikan data customer yang dibutuhkan di tabel agar daftar tetap rapi dan mudah dicari.'}
            </DialogDescription>
          </DialogHeader>

          {dialogMode === 'view' && selectedCustomer && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['ID', selectedCustomer.id],
                  ['Nama', selectedCustomer.name],
                  ['Alamat', selectedCustomer.address],
                  ['Email', selectedCustomer.email],
                  ['Nomor Telepon', selectedCustomer.phone],
                  ['Riwayat Mengirim', `${selectedCustomer.totalSent} paket`],
                  ['Riwayat Menerima', `${selectedCustomer.totalReceived} paket`],
                  ['Aktivitas Terakhir', new Date(selectedCustomer.lastActivity).toLocaleDateString('id-ID')],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-border bg-secondary/20 p-4">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-1 font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-border bg-white p-4">
                <p className="mb-4 font-semibold">Riwayat Paket</p>
                <div className="space-y-3">
                  {selectedCustomer.histories.length > 0 ? (
                    selectedCustomer.histories.map((history) => (
                      <div key={history.id} className="rounded-2xl border border-border bg-secondary/20 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold">{history.resi}</p>
                            <p className="text-sm text-muted-foreground">{history.route}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                              {history.type}
                            </Badge>
                            <Badge
                              className={
                                history.status === 'Sudah Dikirim'
                                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                              }
                            >
                              {history.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">
                          Tanggal: {new Date(history.date).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border bg-secondary/15 p-4 text-sm text-muted-foreground">
                      Belum ada riwayat paket untuk customer ini.
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => openUpdate(selectedCustomer.id)}
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

          {(dialogMode === 'edit' || dialogMode === 'create') && draftCustomer && (
            <>
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="customer-id">ID Customer</Label>
                    <Input id="customer-id" value={draftCustomer.id} readOnly className="bg-muted/40" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer-name">Nama</Label>
                    <Input
                      id="customer-name"
                      value={draftCustomer.name}
                      onChange={(event) => updateDraftCustomer('name', event.target.value)}
                      placeholder="Tulis nama customer"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="customer-address">Alamat</Label>
                    <Input
                      id="customer-address"
                      value={draftCustomer.address}
                      onChange={(event) => updateDraftCustomer('address', event.target.value)}
                      placeholder="Tulis alamat customer"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer-email">Email</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      value={draftCustomer.email}
                      onChange={(event) => updateDraftCustomer('email', event.target.value)}
                      placeholder="email@contoh.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer-phone">Nomor Telepon</Label>
                    <Input
                      id="customer-phone"
                      value={draftCustomer.phone}
                      onChange={(event) => updateDraftCustomer('phone', event.target.value)}
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer-sent">Total Mengirim</Label>
                    <Input
                      id="customer-sent"
                      type="number"
                      min="0"
                      value={draftCustomer.totalSent}
                      onChange={(event) =>
                        updateDraftCustomer('totalSent', Number(event.target.value))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer-received">Total Menerima</Label>
                    <Input
                      id="customer-received"
                      type="number"
                      min="0"
                      value={draftCustomer.totalReceived}
                      onChange={(event) =>
                        updateDraftCustomer('totalReceived', Number(event.target.value))
                      }
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="customer-last-activity">Aktivitas Terakhir</Label>
                    <Input
                      id="customer-last-activity"
                      type="date"
                      value={draftCustomer.lastActivity}
                      onChange={(event) =>
                        updateDraftCustomer('lastActivity', event.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-secondary/15 p-4 text-sm text-muted-foreground">
                  Riwayat paket akan tetap mengikuti data yang sudah ada. Untuk customer baru,
                  riwayat akan dimulai dari kondisi kosong sampai ada aktivitas dummy berikutnya.
                </div>
              </div>

              <DialogFooter>
                <Button type="button" onClick={handleSaveCustomer}>
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
    </div>
  );
}
