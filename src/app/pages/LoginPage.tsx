import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Lock, ShieldCheck, User, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import {
  registerAdminRequest,
  registerCustomerRequest,
  type RegisterAdminPayload,
  type RegisterCustomerPayload,
} from '../lib/authApi';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import cargoLiteLogo from '../../imports/cargolite-logo.png';

const ADMIN_VERIFICATION_CODE = 'ADMCARGOLITE';

type RegistrationMode = 'customer' | 'admin' | null;

const buildInitialCustomerForm = (): RegisterCustomerPayload => ({
  name: '',
  username: '',
  email: '',
  phone: '',
  address: '',
  password: '',
});

const buildInitialAdminForm = (): RegisterAdminPayload => ({
  name: '',
  username: 'admin_',
  email: '',
  phone: '',
  password: '',
  verificationCode: '',
});

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [registrationMode, setRegistrationMode] = useState<RegistrationMode>(null);
  const [registrationError, setRegistrationError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [customerForm, setCustomerForm] = useState<RegisterCustomerPayload>(
    buildInitialCustomerForm()
  );
  const [adminForm, setAdminForm] = useState<RegisterAdminPayload>(buildInitialAdminForm());

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/');
  };

  const openRegistration = (mode: Exclude<RegistrationMode, null>) => {
    setRegistrationMode(mode);
    setRegistrationError('');
    setError('');
    setNotice('');
  };

  const closeRegistration = () => {
    setRegistrationMode(null);
    setRegistrationError('');
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setIsLoading(true);

    try {
      const authenticatedUser = await login(username, password);

      if (authenticatedUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (authenticatedUser.role === 'courier') {
        navigate('/courier/dashboard');
      } else {
        navigate('/');
      }
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Terjadi kesalahan saat login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerRegistration = async (event: React.FormEvent) => {
    event.preventDefault();
    setRegistrationError('');
    setIsRegistering(true);

    try {
      await registerCustomerRequest(customerForm);
      const normalizedUsername = customerForm.username.trim().toLowerCase();

      setUsername(normalizedUsername);
      setPassword('');
      setNotice(
        `Akun customer berhasil dibuat dan tersimpan di database. Silakan login dengan username ${normalizedUsername}.`
      );
      setCustomerForm(buildInitialCustomerForm());
      closeRegistration();
    } catch (registrationIssue) {
      setRegistrationError(
        registrationIssue instanceof Error
          ? registrationIssue.message
          : 'Gagal membuat akun customer.'
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const handleAdminRegistration = async (event: React.FormEvent) => {
    event.preventDefault();
    setRegistrationError('');
    setIsRegistering(true);

    try {
      await registerAdminRequest(adminForm);
      const normalizedUsername = adminForm.username.trim().toLowerCase();

      setUsername(normalizedUsername);
      setPassword('');
      setNotice(
        `Akun admin berhasil dibuat dan tersimpan di database. Silakan login dengan username ${normalizedUsername}.`
      );
      setAdminForm(buildInitialAdminForm());
      closeRegistration();
    } catch (registrationIssue) {
      setRegistrationError(
        registrationIssue instanceof Error
          ? registrationIssue.message
          : 'Gagal membuat akun admin.'
      );
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-white to-primary/10 px-4">
      <Button
        type="button"
        variant="outline"
        onClick={handleBack}
        className="absolute right-6 top-6 border-[#63D25F]/30 bg-white/90 text-foreground shadow-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <img src={cargoLiteLogo} alt="CargoLite" className="h-24 w-auto object-contain" />
          </div>
          <p className="text-muted-foreground">Login ke akun Anda atau buat akun baru dari sini</p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="pl-10"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {notice && (
              <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
                {notice}
              </div>
            )}

            {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Login'}
            </Button>
          </form>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Button type="button" variant="outline" onClick={() => openRegistration('customer')}>
              <UserPlus className="h-4 w-4" />
              Buat Akun Customer
            </Button>
            <Button type="button" variant="outline" onClick={() => openRegistration('admin')}>
              <ShieldCheck className="h-4 w-4" />
              Buat Akun Admin
            </Button>
          </div>

        </div>
      </motion.div>

      <Dialog open={registrationMode === 'customer'} onOpenChange={(open) => !open && closeRegistration()}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Buat Akun Customer</DialogTitle>
            <DialogDescription>
              Data akun customer akan langsung disimpan ke database yang aktif.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCustomerRegistration} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customer-name">Nama</Label>
                <Input
                  id="customer-name"
                  value={customerForm.name}
                  onChange={(event) =>
                    setCustomerForm((previousForm) => ({
                      ...previousForm,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Nama customer"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-username">Username</Label>
                <Input
                  id="customer-username"
                  value={customerForm.username}
                  onChange={(event) =>
                    setCustomerForm((previousForm) => ({
                      ...previousForm,
                      username: event.target.value,
                    }))
                  }
                  placeholder="contoh: pelangganbaru"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-email">Email</Label>
                <Input
                  id="customer-email"
                  type="email"
                  value={customerForm.email}
                  onChange={(event) =>
                    setCustomerForm((previousForm) => ({
                      ...previousForm,
                      email: event.target.value,
                    }))
                  }
                  placeholder="nama@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-phone">No. Telepon</Label>
                <Input
                  id="customer-phone"
                  value={customerForm.phone}
                  onChange={(event) =>
                    setCustomerForm((previousForm) => ({
                      ...previousForm,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="08xxxxxxxxxx"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="customer-address">Alamat</Label>
                <Textarea
                  id="customer-address"
                  value={customerForm.address}
                  onChange={(event) =>
                    setCustomerForm((previousForm) => ({
                      ...previousForm,
                      address: event.target.value,
                    }))
                  }
                  placeholder="Alamat lengkap customer"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="customer-password">Password</Label>
                <Input
                  id="customer-password"
                  type="password"
                  value={customerForm.password}
                  onChange={(event) =>
                    setCustomerForm((previousForm) => ({
                      ...previousForm,
                      password: event.target.value,
                    }))
                  }
                  placeholder="Minimal 6 karakter"
                  required
                />
              </div>
            </div>

            {registrationError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {registrationError}
              </div>
            )}

            <DialogFooter>
              <Button type="submit" disabled={isRegistering}>
                {isRegistering ? 'Menyimpan...' : 'Simpan Akun Customer'}
              </Button>
              <Button type="button" variant="outline" onClick={closeRegistration}>
                Batal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={registrationMode === 'admin'} onOpenChange={(open) => !open && closeRegistration()}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Buat Akun Admin</DialogTitle>
            <DialogDescription>
              Username admin tetap wajib diawali <span className="font-mono">admin_</span> dan
              harus memakai kode verifikasi resmi.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAdminRegistration} className="space-y-4">
            <div className="rounded-xl border border-[#63D25F]/30 bg-[#63D25F]/8 p-4 text-sm text-foreground">
              <div className="font-semibold">KODE VERIFIKASI ADMIN: {ADMIN_VERIFICATION_CODE}</div>
              <div className="mt-1 text-muted-foreground">
                Gunakan kode ini persis sama saat membuat akun admin baru.
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="admin-name">Nama</Label>
                <Input
                  id="admin-name"
                  value={adminForm.name}
                  onChange={(event) =>
                    setAdminForm((previousForm) => ({
                      ...previousForm,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Nama admin"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-username">Username Admin</Label>
                <Input
                  id="admin-username"
                  value={adminForm.username}
                  onChange={(event) =>
                    setAdminForm((previousForm) => ({
                      ...previousForm,
                      username: event.target.value,
                    }))
                  }
                  placeholder="admin_namaanda"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={adminForm.email}
                  onChange={(event) =>
                    setAdminForm((previousForm) => ({
                      ...previousForm,
                      email: event.target.value,
                    }))
                  }
                  placeholder="admin@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-phone">No. Telepon</Label>
                <Input
                  id="admin-phone"
                  value={adminForm.phone}
                  onChange={(event) =>
                    setAdminForm((previousForm) => ({
                      ...previousForm,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="08xxxxxxxxxx"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={adminForm.password}
                  onChange={(event) =>
                    setAdminForm((previousForm) => ({
                      ...previousForm,
                      password: event.target.value,
                    }))
                  }
                  placeholder="Minimal 6 karakter"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-verification-code">Kode Verifikasi Admin</Label>
                <Input
                  id="admin-verification-code"
                  value={adminForm.verificationCode}
                  onChange={(event) =>
                    setAdminForm((previousForm) => ({
                      ...previousForm,
                      verificationCode: event.target.value,
                    }))
                  }
                  placeholder={ADMIN_VERIFICATION_CODE}
                  required
                />
              </div>
            </div>

            {registrationError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {registrationError}
              </div>
            )}

            <DialogFooter>
              <Button type="submit" disabled={isRegistering}>
                {isRegistering ? 'Menyimpan...' : 'Simpan Akun Admin'}
              </Button>
              <Button type="button" variant="outline" onClick={closeRegistration}>
                Batal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
