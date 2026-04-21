import { useState } from 'react';
import { Building2, Mail, MapPin, Phone, Save, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { useAuth } from '../../contexts/AuthContext';
import { managerProfile } from '../../data/adminData';

export function AdminProfile() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || managerProfile.name,
    email: user?.email || managerProfile.email,
    phone: user?.phone || managerProfile.phone,
    address: managerProfile.address,
    department: managerProfile.department,
    startDate: managerProfile.startDate,
    bio: managerProfile.bio,
  });

  const handleSave = () => {
    updateUser({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    });

    toast.success('Profil manager diperbarui', {
      description: 'Perubahan identitas manager sudah diterapkan pada sesi ini.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/80 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle>Informasi Manager</CardTitle>
            <CardDescription>Perbarui data utama manager operasional CargoKu.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="manager-name">Nama</Label>
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="manager-name"
                    value={formData.name}
                    onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="manager-email"
                    type="email"
                    value={formData.email}
                    onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="manager-phone">Nomor Telepon</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="manager-phone"
                    value={formData.phone}
                    onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager-start">Mulai Menjabat</Label>
                <Input
                  id="manager-start"
                  type="date"
                  value={formData.startDate}
                  onChange={(event) => setFormData((prev) => ({ ...prev, startDate: event.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager-address">Alamat Kantor</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="manager-address"
                  value={formData.address}
                  onChange={(event) => setFormData((prev) => ({ ...prev, address: event.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager-department">Departemen</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="manager-department"
                  value={formData.department}
                  onChange={(event) => setFormData((prev) => ({ ...prev, department: event.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager-bio">Ringkasan Profil</Label>
              <Textarea
                id="manager-bio"
                value={formData.bio}
                onChange={(event) => setFormData((prev) => ({ ...prev, bio: event.target.value }))}
                className="min-h-32"
              />
            </div>

            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Simpan Perubahan
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/80 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle>Ringkasan Akun</CardTitle>
              <CardDescription>Identitas manager yang sedang aktif di sesi admin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-[#63D25F] p-6 text-white">
                <p className="text-sm text-white/80">Manager Operasional</p>
                <p className="mt-2 text-2xl font-semibold">{formData.name}</p>
                <p className="mt-2 text-sm text-white/80">{formData.department}</p>
              </div>
              <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                <p className="text-sm text-muted-foreground">ID Manager</p>
                <p className="mt-1 font-semibold">{managerProfile.employeeId}</p>
              </div>
              <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                <p className="text-sm text-muted-foreground">Masa Jabatan</p>
                <p className="mt-1 font-semibold">
                  Sejak {new Date(formData.startDate).toLocaleDateString('id-ID')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle>Catatan Tanggung Jawab</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-2xl bg-secondary/40 p-4">
                Mengawasi arus pengiriman dan performa kurir lintas area.
              </div>
              <div className="rounded-2xl bg-secondary/40 p-4">
                Meninjau presensi dan tindak lanjut karyawan dengan absen tinggi.
              </div>
              <div className="rounded-2xl bg-secondary/40 p-4">
                Menjaga kualitas data customer dan keamanan backup operasional.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
