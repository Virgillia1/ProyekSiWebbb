import { useEffect, useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router';
import { TruckIcon, Package, Map, User, LogOut, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from './ui/sheet';

const navItems = [
  { name: 'Dashboard', path: '/courier/dashboard', icon: TruckIcon },
  { name: 'Tracking Resi', path: '/courier/tracking', icon: Package },
  { name: 'Histori Pengiriman', path: '/courier/history', icon: Map },
  { name: 'Profile', path: '/courier/profile', icon: User },
];

export function CourierLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true });
    } else if (user.role !== 'courier') {
      navigate('/404', { replace: true });
    }
  }, [user, navigate]);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setMobileNavOpen(false);
    logout();
    navigate('/');
  };

  const renderSidebarContent = (onNavigate?: () => void) => (
    <div className="h-full flex flex-col bg-white">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg">
            <TruckIcon className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-primary">CargoLite</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">Kurir Dashboard</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              <User className="h-6 w-6 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{user?.name}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'bg-primary text-white'
                  : 'hover:bg-secondary text-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-border mt-auto">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-white lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={mobileNavOpen ? 'Tutup menu kurir' : 'Buka menu kurir'}
                >
                  {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[88vw] max-w-80 overflow-y-auto border-r border-border/70 p-0 sm:max-w-sm"
              >
                <SheetTitle className="sr-only">Menu Kurir</SheetTitle>
                {renderSidebarContent(() => setMobileNavOpen(false))}
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <div className="bg-primary p-1 rounded-md">
                <TruckIcon className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-primary">CargoLite</span>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-border fixed h-full flex-col">
        {renderSidebarContent()}
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 w-full">
        <Outlet />
      </main>
    </div>
  );
}
