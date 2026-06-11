import { useEffect, useState } from 'react';
import { Loader2, Mail, MapPin, Phone, Save, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { useAdminData } from '../../contexts/AdminDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { managerProfile } from '../../data/adminData';

import { useMetadata } from '../../lib/useMetadata';
import { validateRequiredEmail } from '../../lib/emailValidation';
import { validateRequiredPhone } from '../../lib/phoneValidation';
import { scrollToFirstFieldError } from '../../lib/scrollToFieldError';

export function AdminProfile() {
  useMetadata(
    'Profil Admin',
    'Informasi profil dan pengaturan biodata diri admin CargoLite.'
  );

  const { user, updateUser } = useAuth();
  const {
    managerProfile: managerProfileData,
    updateManagerProfile,
  } = useAdminData();
  const activeManagerProfile = managerProfileData ?? managerProfile;
  const [formData, setFormData] = useState({
    employeeId: activeManagerProfile.employeeId,
    name: user?.name || activeManagerProfile.name,
    email: user?.email || activeManagerProfile.email,
    phone: user?.phone || activeManagerProfile.phone,
    address: activeManagerProfile.address,
    department: activeManagerProfile.department,
    startDate: activeManagerProfile.startDate,
    bio: activeManagerProfile.bio,
  });
  const [phoneError, setPhoneError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    setFormData({
      employeeId: activeManagerProfile.employeeId,
      name: user?.name || activeManagerProfile.name,
      email: user?.email || activeManagerProfile.email,
      phone: user?.phone || activeManagerProfile.phone,
      address: activeManagerProfile.address,
      department: activeManagerProfile.department,
      startDate: activeManagerProfile.startDate,
      bio: activeManagerProfile.bio,
    });
    setPhoneError('');
    setFieldErrors({});
  }, [activeManagerProfile, user?.email, user?.name, user?.phone]);

  const handleSave = async () => {
    const errors: Record<string, string> = {};
    if (!formData.name?.trim()) {
      errors.name = 'Nama wajib diisi.';
    }
    const emailError = validateRequiredEmail(formData.email);
    if (emailError) {
      errors.email = emailError;
    }
    const nextPhoneError = validateRequiredPhone(
      formData.phone,
      'Nomor telepon manager wajib diisi.',
      'Nomor telepon manager'
    );
    if (nextPhoneError) {
      errors.phone = nextPhoneError;
    }
    if (!formData.address?.trim()) {
      errors.address = 'Alamat wajib diisi.';
    }

    setFieldErrors(errors);
    setPhoneError(nextPhoneError);

    if (Object.keys(errors).length > 0) {
      scrollToFirstFieldError();
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateManagerProfile(formData);
      updateUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });

      toast.success('Profil manager diperbarui', {
        description: 'Perubahan identitas manager sudah tersimpan ke database.',
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan profil manager.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/80 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle>Informasi Manager</CardTitle>
            <CardDescription>Perbarui data utama manager operasional CargoLite.</CardDescription>
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
                    disabled
                    onChange={(event) => {
                      setFormData((prev) => ({ ...prev, name: event.target.value }));
                      setFieldErrors((prev) => ({ ...prev, name: '' }));
                    }}
                    className={`pl-10 ${fieldErrors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                </div>
                {fieldErrors.name && (
                  <p data-field-error="true" className="text-sm font-medium text-red-600">
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="manager-email"
                    type="email"
                    value={formData.email}
                    onChange={(event) => {
                      setFormData((prev) => ({ ...prev, email: event.target.value }));
                      setFieldErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    className={`pl-10 ${fieldErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                </div>
                {fieldErrors.email && (
                  <p data-field-error="true" className="text-sm font-medium text-red-600">
                    {fieldErrors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager-phone">Nomor Telepon</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="manager-phone"
                  value={formData.phone}
                  inputMode="tel"
                  onChange={(event) => {
                    setFormData((prev) => ({ ...prev, phone: event.target.value.replace(/\D/g, '') }));
                    setFieldErrors((prev) => ({ ...prev, phone: '' }));
                    setPhoneError('');
                  }}
                  className={`pl-10 ${phoneError || fieldErrors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
              </div>
              {(phoneError || fieldErrors.phone) && (
                <p data-field-error="true" className="text-sm font-medium text-red-600">
                  {phoneError || fieldErrors.phone}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager-address">Alamat Kantor</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="manager-address"
                  value={formData.address}
                  disabled
                  onChange={(event) => {
                    setFormData((prev) => ({ ...prev, address: event.target.value }));
                    setFieldErrors((prev) => ({ ...prev, address: '' }));
                  }}
                  className={`pl-10 ${fieldErrors.address ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
              </div>
              {fieldErrors.address && (
                <p data-field-error="true" className="text-sm font-medium text-red-600">
                  {fieldErrors.address}
                </p>
              )}
            </div>





            <Button onClick={handleSave} disabled={isSavingProfile}>
              {isSavingProfile ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSavingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
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
                <p className="mt-1 font-semibold">{formData.employeeId}</p>
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
                Meninjau performa operasional dan tindak lanjut paket yang membutuhkan perhatian.
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
