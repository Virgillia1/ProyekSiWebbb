import { useState } from 'react';
import { PackageCheck, SendToBack, Users } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { customers, CustomerAccount } from '../../data/adminData';

export function AdminCustomers() {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerAccount | null>(null);

  const totalAccounts = customers.length;
  const totalSent = customers.reduce((sum, item) => sum + item.totalSent, 0);
  const totalReceived = customers.reduce((sum, item) => sum + item.totalReceived, 0);

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
        <CardHeader>
          <CardTitle>Daftar Akun Customer</CardTitle>
          <CardDescription>
            Klik tombol detail untuk membuka profil customer dan seluruh riwayat transaksinya.
          </CardDescription>
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
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.id}</TableCell>
                  <TableCell>
                    <div>{customer.name}</div>
                    <div className="text-xs text-muted-foreground">{customer.email}</div>
                  </TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>{customer.totalSent} paket</TableCell>
                  <TableCell>{customer.totalReceived} paket</TableCell>
                  <TableCell>
                    {new Date(customer.lastActivity).toLocaleDateString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(customer)}>
                      Lihat Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="max-w-3xl">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle>Profil Customer</DialogTitle>
                <DialogDescription>
                  Ringkasan akun dan riwayat pengiriman atau penerimaan paket.
                </DialogDescription>
              </DialogHeader>

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
                  {selectedCustomer.histories.map((history) => (
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
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
