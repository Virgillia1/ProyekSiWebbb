import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import {
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  User,
  UserRoundCog,
  Users,
} from 'lucide-react';
import cargoLiteLogo from '../../imports/cargolite-logo.png';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from './ui/sheet';

const navItems = [
  { name: 'Beranda', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Manajemen Karyawan', path: '/admin/employees', icon: UserRoundCog },
  { name: 'Presensi Karyawan', path: '/admin/attendance', icon: ClipboardCheck },
  { name: 'Data Customer', path: '/admin/customers', icon: Users },
  { name: 'Profil Manager', path: '/admin/profile', icon: User },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

function BrandLogo({ className = '' }: { className?: string }) {
  return (
    <img
      src={cargoLiteLogo}
      alt="CargoKu"
      className={`w-auto object-contain ${className}`.trim()}
    />
  );
}

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navContent = (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all ${
              active
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-foreground hover:bg-secondary'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,210,95,0.14),_transparent_24%),linear-gradient(180deg,_#f7fdf9_0%,_#effcf5_100%)]">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-white/85 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetTitle className="mb-6 text-left">
                  <BrandLogo className="h-16" />
                </SheetTitle>
                <div className="space-y-6">
                  <div className="rounded-2xl border border-border bg-secondary/40 p-4">
                    <div className="text-sm font-semibold">{user?.name}</div>
                    <div className="text-sm text-muted-foreground">{user?.email}</div>
                  </div>
                  {navContent}
                </div>
              </SheetContent>
            </Sheet>
            <BrandLogo className="h-12" />
          </div>

          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1560px] gap-6 px-4 py-4 md:px-6 lg:px-8">
        <aside className="hidden w-80 shrink-0 lg:block">
          <div className="sticky top-6 space-y-6">
            <div className="rounded-[28px] border border-border/80 bg-white p-6 shadow-[0_20px_60px_rgba(99,210,95,0.08)]">
              <BrandLogo className="h-20" />
              <div className="mt-5 rounded-2xl bg-[#63D25F] p-5 text-white">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-semibold">Control Center</p>
                  <ShieldCheck className="h-8 w-8 text-white/90" />
                </div>
              </div>

              <div className="mt-6 border-t border-border/70 pt-4">
                {navContent}
              </div>
            </div>

            <div className="rounded-[28px] border border-border/80 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-primary/10">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{user?.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-secondary/40 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Mode Pengawasan</p>
                  <p className="text-xs text-muted-foreground">Aktif hari ini</p>
                </div>
                <Badge className="bg-primary/15 text-primary hover:bg-primary/15">Online</Badge>
              </div>

              <div className="mt-4">
                <Button className="w-full justify-start" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
