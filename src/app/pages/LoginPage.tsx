import { useState } from 'react';
import { useNavigate } from 'react-router';
import { TruckIcon, User, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password);
      
      if (success) {
        // Check if user is courier based on username
        const isCourier = username.toLowerCase().startsWith('kurir_');
        
        // Navigate based on role
        if (isCourier) {
          navigate('/courier/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError('Username atau password salah');
      }
    } catch (err) {
      setError('Terjadi kesalahan, silakan coba lagi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-primary p-3 rounded-lg">
              <TruckIcon className="h-10 w-10 text-white" />
            </div>
            <span className="text-3xl font-bold text-primary">CargoKu</span>
          </div>
          <p className="text-muted-foreground">Login ke akun Anda</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-border">
          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Login'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Demo Credentials:
            </p>
            <div className="space-y-2 text-xs">
              <div className="bg-secondary/50 p-3 rounded-lg">
                <div className="font-medium mb-1">Customer:</div>
                <div>Username: <span className="font-mono">andi</span> atau <span className="font-mono">siti</span></div>
                <div>Password: <span className="font-mono">andi123</span> atau <span className="font-mono">siti123</span></div>
              </div>
              <div className="bg-secondary/50 p-3 rounded-lg">
                <div className="font-medium mb-1">Kurir:</div>
                <div>Username: <span className="font-mono">kurir_budi</span> atau <span className="font-mono">kurir_joko</span></div>
                <div>Password: <span className="font-mono">budi123</span> atau <span className="font-mono">joko123</span></div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">
              💡 Username yang dimulai dengan "kurir_" akan login sebagai kurir
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}