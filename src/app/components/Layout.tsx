import { useState, useEffect, type ReactNode } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router';
import { Menu, X, LogOut, User, Mail, MapPin, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from './ui/sheet';
import { useAuth } from '../contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { updateCustomerProfileRequest } from '../lib/authApi';
import { validateRequiredEmail } from '../lib/emailValidation';
import { validateRequiredPhone } from '../lib/phoneValidation';
import { scrollToFirstFieldError } from '../lib/scrollToFieldError';
import { toast } from 'sonner';
import cargoLiteLogo from '../../imports/cargolite-logo.png';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'Information', path: '/information' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
  { name: 'Find Staff', path: '/staff' },
];

function BrandLogo({ className = '' }: { className?: string }) {
  return (
    <img
      src={cargoLiteLogo}
      alt="CargoLite"
      className={`w-auto object-contain ${className}`.trim()}
    />
  );
}

export function Layout({ children }: { children?: ReactNode } = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user, isProfileOpen]);

  const handleSaveProfile = async () => {
    if (!user?.customerId) {
      toast.error('ID Customer tidak ditemukan pada sesi Anda.');
      return;
    }

    const errors: Record<string, string> = {};
    if (!profileData.name.trim()) {
      errors.name = 'Nama lengkap wajib diisi.';
    }
    const emailError = validateRequiredEmail(profileData.email);
    if (emailError) {
      errors.email = emailError;
    }
    const nextPhoneError = validateRequiredPhone(
      profileData.phone,
      'Nomor telepon customer wajib diisi.',
      'Nomor telepon customer'
    );
    if (nextPhoneError) {
      errors.phone = nextPhoneError;
    }
    if (!profileData.address.trim()) {
      errors.address = 'Alamat wajib diisi.';
    }

    setProfileErrors(errors);
    setPhoneError(nextPhoneError);

    if (Object.keys(errors).length > 0 || nextPhoneError) {
      scrollToFirstFieldError();
      return;
    }

    setIsSavingProfile(true);
    try {
      const updatedUser = await updateCustomerProfileRequest(user.customerId, {
        name: profileData.name.trim(),
        email: profileData.email.trim(),
        phone: profileData.phone.trim(),
        address: profileData.address.trim(),
      });

      updateUser(updatedUser);
      toast.success('Profil berhasil diperbarui!');
      setIsProfileOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui profil.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const accountLink =
    user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'courier'
        ? '/courier/dashboard'
        : user?.role === 'customer'
          ? '/my-packages'
          : '#';
  const roleLabel =
    user?.role === 'admin'
      ? 'Admin'
      : user?.role === 'courier'
        ? 'Kurir'
        : 'Customer';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Hamburger Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <SheetTitle>
                  <Link to="/" onClick={() => setIsOpen(false)} className="mb-8 inline-flex">
                    <BrandLogo className="h-14" />
                  </Link>
                </SheetTitle>
                <nav className="flex flex-col gap-2">
                  {(() => {
                    const currentNavItems = [...navItems];
                    if (user?.role === 'customer') {
                      currentNavItems.push({ name: 'Paket Saya', path: '/my-packages' });
                    }
                    return currentNavItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          isActive(item.path)
                            ? 'bg-primary text-white'
                            : 'text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        {item.name}
                      </Link>
                    ));
                  })()}
                </nav>
              </SheetContent>
            </Sheet>

            {/* Center: Logo */}
            <Link
              to="/"
              aria-label="CargoLite"
              className="absolute left-1/2 -translate-x-1/2"
            >
              <BrandLogo className="h-14 sm:h-16" />
            </Link>

            {/* Right: Account Button */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 hover:opacity-85 transition-all focus:outline-none"
                    aria-label="Menu akun"
                  >
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-medium text-foreground">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{roleLabel}</div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center overflow-hidden border border-border/40 shadow-sm">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-6 w-6 text-white" />
                      )}
                    </div>
                  </button>

                  {isDropdownOpen && (
                    <>
                      {/* Click outside overlay */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-border bg-white p-2 shadow-lg z-20">
                        {user.role === 'customer' && (
                          <>
                            <Link
                              to="/my-packages"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                            >
                              Paket Saya
                            </Link>
                            <button
                              onClick={() => {
                                setIsDropdownOpen(false);
                                setIsProfileOpen(true);
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-secondary text-left transition-colors"
                            >
                              Edit Profil
                            </button>
                            <div className="my-1 border-t border-border" />
                          </>
                        )}
                        {(user.role === 'admin' || user.role === 'courier') && (
                          <>
                            <Link
                              to={accountLink}
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                            >
                              Dashboard
                            </Link>
                            <div className="my-1 border-t border-border" />
                          </>
                        )}
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            handleLogout();
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left transition-colors font-medium"
                        >
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link to="/login" aria-label="Login">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors cursor-pointer">
                    <User className="h-6 w-6 text-white" />
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children ?? <Outlet />}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link to="/" aria-label="CargoLite" className="mb-4 inline-flex">
                <BrandLogo className="h-20" />
              </Link>
              <p className="text-sm text-muted-foreground">
                Solusi pengiriman terpercaya untuk bisnis Anda
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                <li><Link to="/services" className="hover:text-primary transition-colors">Services</Link></li>
                <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/information" className="hover:text-primary transition-colors">FAQ</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link to="/staff" className="hover:text-primary transition-colors">Find Staff</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Jakarta, Indonesia</li>
                <li>Phone: +62 21 1234 5678</li>
                <li>Email: info@cargolite.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 CargoLite. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Edit Profile Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={(open) => {
        if (!open) {
          setIsProfileOpen(false);
          setProfileErrors({});
          setPhoneError('');
        }
      }}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-white p-6 max-h-[90vh] overflow-y-auto z-50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Edit Profil Saya
            </DialogTitle>
            <DialogDescription>
              Perbarui nama, email, nomor telepon, dan alamat Anda.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            {/* Name Field */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="profile-name"
                  placeholder="Masukkan nama lengkap"
                  value={profileData.name}
                  onChange={(e) => {
                    setProfileData({ ...profileData, name: e.target.value });
                    setProfileErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  className={`pl-9 rounded-xl ${
                    profileErrors.name ? 'border-red-600 focus-visible:ring-red-600' : 'border-border'
                  }`}
                />
              </div>
              {profileErrors.name && (
                <p data-field-error="true" className="text-sm font-medium text-red-600">{profileErrors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="profile-email"
                  type="email"
                  placeholder="nama@email.com"
                  value={profileData.email}
                  onChange={(e) => {
                    setProfileData({ ...profileData, email: e.target.value });
                    setProfileErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  className={`pl-9 rounded-xl ${
                    profileErrors.email ? 'border-red-600 focus-visible:ring-red-600' : 'border-border'
                  }`}
                />
              </div>
              {profileErrors.email && (
                <p data-field-error="true" className="text-sm font-medium text-red-600">{profileErrors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-phone">Nomor Telepon</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="profile-phone"
                  type="tel"
                  placeholder="Minimal 12 digit (contoh: 081234567890)"
                  value={profileData.phone}
                  onChange={(e) => {
                    setProfileData({ ...profileData, phone: e.target.value.replace(/\D/g, '') });
                    setProfileErrors((prev) => ({ ...prev, phone: '' }));
                    setPhoneError('');
                  }}
                  className={`pl-9 rounded-xl ${
                    phoneError || profileErrors.phone ? 'border-red-600 focus-visible:ring-red-600' : 'border-border'
                  }`}
                />
              </div>
              {(phoneError || profileErrors.phone) && (
                <p data-field-error="true" className="text-sm font-medium text-red-600">{phoneError || profileErrors.phone}</p>
              )}
            </div>

            {/* Address Field */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-address">Alamat Lengkap</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <textarea
                  id="profile-address"
                  placeholder="Masukkan alamat lengkap Anda"
                  value={profileData.address}
                  onChange={(e) => {
                    setProfileData({ ...profileData, address: e.target.value });
                    setProfileErrors((prev) => ({ ...prev, address: '' }));
                  }}
                  className={`w-full min-h-[80px] pl-9 pr-3 py-2 text-sm bg-background border rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    profileErrors.address ? 'border-red-600 focus-visible:ring-red-600' : 'border-border'
                  }`}
                />
              </div>
              {profileErrors.address && (
                <p data-field-error="true" className="text-sm font-medium text-red-600">{profileErrors.address}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <Button
              variant="outline"
              onClick={() => {
                setIsProfileOpen(false);
                setProfileErrors({});
                setPhoneError('');
              }}
              className="rounded-xl border-border hover:bg-secondary/50"
              disabled={isSavingProfile}
            >
              Batal
            </Button>
            <Button
              onClick={handleSaveProfile}
              className="bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl"
              disabled={isSavingProfile}
            >
              {isSavingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
