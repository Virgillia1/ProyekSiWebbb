import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router';
import { Menu, X, LogOut, User } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from './ui/sheet';
import { useAuth } from '../contexts/AuthContext';
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

export function Layout() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
                  {navItems.map((item) => (
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
                  ))}
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
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              )}
              <Link to={user ? '#' : '/login'}>
                {user ? (
                  <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="text-right">
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">Customer</div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-6 w-6 text-white" />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors cursor-pointer">
                    <User className="h-6 w-6 text-white" />
                  </div>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
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
                <li>Email: info@cargoku.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 CargoKu. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
