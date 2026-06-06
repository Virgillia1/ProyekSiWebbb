import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Lock, User, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import {
  registerCustomerRequest,
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
import { useMetadata } from '../lib/useMetadata';
import { validateRequiredPhone } from '../lib/phoneValidation';
import { scrollToFirstFieldError } from '../lib/scrollToFieldError';
import { toast } from 'sonner';

type RegistrationMode = 'customer' | null;
type LoginFieldErrors = Partial<Record<'username' | 'password', string>>;

const buildInitialCustomerForm = (): RegisterCustomerPayload => ({
  name: '',
  username: '',
  email: '',
  phone: '',
  address: '',
  password: '',
});

export function LoginPage() {
  useMetadata(
    'Login Akun',
    'Masuk ke akun CargoLite Anda untuk mengelola pengiriman, memantau riwayat paket, dan mengedit profil Anda.'
  );

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginFieldErrors, setLoginFieldErrors] = useState<LoginFieldErrors>({});
  const [notice, setNotice] = useState('');
  const [registrationMode, setRegistrationMode] = useState<RegistrationMode>(null);
  const [registrationError, setRegistrationError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [customerForm, setCustomerForm] = useState<RegisterCustomerPayload>(
    buildInitialCustomerForm()
  );
  const [customerFieldErrors, setCustomerFieldErrors] = useState<Record<string, string>>({});

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
    setCustomerFieldErrors({});
  };

  const closeRegistration = () => {
    setRegistrationMode(null);
    setRegistrationError('');
    setCustomerFieldErrors({});
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');

    const nextFieldErrors: LoginFieldErrors = {};

    if (!username.trim()) {
      nextFieldErrors.username = 'Username harus diisi!';
    }

    if (!password.trim()) {
      nextFieldErrors.password = 'Password harus diisi!';
    }

    setLoginFieldErrors(nextFieldErrors);

    if (Object.keys(nextFieldErrors).length > 0) {
      scrollToFirstFieldError();
      return;
    }

    setIsLoading(true);

    try {
      const authenticatedUser = await login(username, password);

      toast.success('Login Berhasil!', {
        description: `Selamat datang kembali, ${authenticatedUser.name}!`,
      });

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

    const errors: Record<string, string> = {};
    if (!customerForm.name.trim()) {
      errors.name = 'Nama customer wajib diisi.';
    }
    if (!customerForm.username.trim()) {
      errors.username = 'Username customer wajib diisi.';
    }
    if (!customerForm.email.trim()) {
      errors.email = 'Email customer wajib diisi.';
    }
    const phoneError = validateRequiredPhone(
      customerForm.phone,
      'Nomor telepon customer wajib diisi.',
      'Nomor telepon customer'
    );
    if (phoneError) {
      errors.phone = phoneError;
    }
    if (!customerForm.address.trim()) {
      errors.address = 'Alamat customer wajib diisi.';
    }
    if (!customerForm.password.trim()) {
      errors.password = 'Password customer wajib diisi.';
    } else if (customerForm.password.length < 6) {
      errors.password = 'Password minimal 6 karakter.';
    }

    setCustomerFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      scrollToFirstFieldError();
      return;
    }

    setIsRegistering(true);

    try {
      await registerCustomerRequest(customerForm);
      const normalizedUsername = customerForm.username.trim().toLowerCase();

      setUsername(normalizedUsername);
      setPassword('');
      toast.success('Akun Customer Dibuat!', {
        description: `Silakan login dengan username ${normalizedUsername}.`,
      });
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
                  onChange={(event) => {
                    setUsername(event.target.value);
                    setLoginFieldErrors((previousErrors) => ({
                      ...previousErrors,
                      username: '',
                    }));
                  }}
                  className="pl-10"
                  aria-invalid={!!loginFieldErrors.username}
                  autoFocus
                />
              </div>
              {loginFieldErrors.username && (
                <p data-field-error="true" className="text-sm font-medium text-red-600">
                  {loginFieldErrors.username}
                </p>
              )}
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
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setLoginFieldErrors((previousErrors) => ({
                      ...previousErrors,
                      password: '',
                    }));
                  }}
                  className="pl-10"
                  aria-invalid={!!loginFieldErrors.password}
                />
              </div>
              {loginFieldErrors.password && (
                <p data-field-error="true" className="text-sm font-medium text-red-600">
                  {loginFieldErrors.password}
                </p>
              )}
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

          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => openRegistration('customer')}
              className="w-full flex items-center justify-center gap-2 rounded-xl"
            >
              <UserPlus className="h-4 w-4" />
              Daftar
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
                  onChange={(event) => {
                    setCustomerForm((previousForm) => ({
                      ...previousForm,
                      name: event.target.value,
                    }));
                    setCustomerFieldErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  className={customerFieldErrors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  placeholder="Nama customer"
                />
                {customerFieldErrors.name && (
                  <p data-field-error="true" className="text-sm font-medium text-red-600">
                    {customerFieldErrors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-username">Username</Label>
                <Input
                  id="customer-username"
                  value={customerForm.username}
                  onChange={(event) => {
                    setCustomerForm((previousForm) => ({
                      ...previousForm,
                      username: event.target.value,
                    }));
                    setCustomerFieldErrors((prev) => ({ ...prev, username: '' }));
                  }}
                  className={customerFieldErrors.username ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  placeholder="contoh: pelangganbaru"
                />
                {customerFieldErrors.username && (
                  <p data-field-error="true" className="text-sm font-medium text-red-600">
                    {customerFieldErrors.username}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-email">Email</Label>
                <Input
                  id="customer-email"
                  type="email"
                  value={customerForm.email}
                  onChange={(event) => {
                    setCustomerForm((previousForm) => ({
                      ...previousForm,
                      email: event.target.value,
                    }));
                    setCustomerFieldErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  className={customerFieldErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  placeholder="nama@email.com"
                />
                {customerFieldErrors.email && (
                  <p data-field-error="true" className="text-sm font-medium text-red-600">
                    {customerFieldErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-phone">No. Telepon</Label>
                <Input
                  id="customer-phone"
                  value={customerForm.phone}
                  inputMode="tel"
                  onChange={(event) => {
                    setCustomerForm((previousForm) => ({
                      ...previousForm,
                      phone: event.target.value.replace(/\D/g, ''),
                    }));
                    setCustomerFieldErrors((prev) => ({ ...prev, phone: '' }));
                  }}
                  className={customerFieldErrors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  placeholder="08xxxxxxxxxx"
                />
                {customerFieldErrors.phone && (
                  <p data-field-error="true" className="text-sm font-medium text-red-600">
                    {customerFieldErrors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="customer-address">Alamat</Label>
                <Textarea
                  id="customer-address"
                  value={customerForm.address}
                  onChange={(event) => {
                    setCustomerForm((previousForm) => ({
                      ...previousForm,
                      address: event.target.value,
                    }));
                    setCustomerFieldErrors((prev) => ({ ...prev, address: '' }));
                  }}
                  className={customerFieldErrors.address ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  placeholder="Alamat lengkap customer"
                />
                {customerFieldErrors.address && (
                  <p data-field-error="true" className="text-sm font-medium text-red-600">
                    {customerFieldErrors.address}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="customer-password">Password</Label>
                <Input
                  id="customer-password"
                  type="password"
                  value={customerForm.password}
                  onChange={(event) => {
                    setCustomerForm((previousForm) => ({
                      ...previousForm,
                      password: event.target.value,
                    }));
                    setCustomerFieldErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  className={customerFieldErrors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  placeholder="Minimal 6 karakter"
                />
                {customerFieldErrors.password && (
                  <p data-field-error="true" className="text-sm font-medium text-red-600">
                    {customerFieldErrors.password}
                  </p>
                )}
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


    </div>
  );
}
