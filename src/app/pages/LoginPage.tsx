import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Lock, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import cargoLiteLogo from '../../imports/cargolite-logo.png';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const authenticatedUser = await login(username, password);

      if (authenticatedUser) {
        if (authenticatedUser.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError('Username atau password salah');
      }
    } catch {
      setError('Terjadi kesalahan, silakan coba lagi');
    } finally {
      setIsLoading(false);
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
            <img
              src={cargoLiteLogo}
              alt="CargoLite"
              className="h-24 w-auto object-contain"
            />
          </div>
          <p className="text-muted-foreground">Login ke akun Anda</p>
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
                  onChange={(e) => setUsername(e.target.value)}
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 border-t border-border pt-6">
            <p className="mb-3 text-center text-xs text-muted-foreground">
              Demo Credentials:
            </p>
            <div className="space-y-2 text-xs">
              <div className="rounded-lg bg-secondary/50 p-3">
                <div className="mb-1 font-medium">Customer:</div>
                <div>
                  Username: <span className="font-mono">andi</span> atau{' '}
                  <span className="font-mono">siti</span>
                </div>
                <div>
                  Password: <span className="font-mono">andi123</span> atau{' '}
                  <span className="font-mono">siti123</span>
                </div>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3">
                <div className="mb-1 font-medium">Admin:</div>
                <div>
                  Username: <span className="font-mono">admin_maya</span> atau{' '}
                  <span className="font-mono">admin_raka</span>
                </div>
                <div>
                  Password: <span className="font-mono">maya123</span> atau{' '}
                  <span className="font-mono">raka123</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
