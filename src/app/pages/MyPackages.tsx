import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchCustomerPackages, CourierDelivery } from '../lib/trackingApi';
import { useMetadata } from '../lib/useMetadata';
import {
  Package,
  MapPin,
  Clock,
  ArrowRight,
  RefreshCw,
  Phone,
  Camera,
  Calendar,
  AlertCircle,
  Truck,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export function MyPackages() {
  useMetadata(
    'Paket Saya',
    'Pantau dan lacak seluruh paket kargo yang Anda kirim secara realtime. Riwayat lengkap, status pengantaran, dan bukti penerimaan ada di sini.'
  );

  const { user } = useAuth();
  const [packages, setPackages] = useState<CourierDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<CourierDelivery | null>(null);

  const loadPackages = async (silent = false) => {
    if (!user?.username) return;
    if (!silent) setIsLoading(true);
    try {
      const data = await fetchCustomerPackages(user.username);
      setPackages(data);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Gagal memuat paket Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, [user]);

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('selesai') || s.includes('terkirim') || s.includes('sampai')) {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 gap-1 font-medium px-2.5 py-1 rounded-full">
          <CheckCircle2 className="h-3 w-3" /> {status}
        </Badge>
      );
    }
    if (s.includes('perjalanan') || s.includes('kirim') || s.includes('kurir')) {
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border border-blue-200 gap-1 font-medium px-2.5 py-1 rounded-full">
          <Truck className="h-3 w-3 animate-pulse" /> {status}
        </Badge>
      );
    }
    if (s.includes('proses') || s.includes('sortir')) {
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border border-amber-200 gap-1 font-medium px-2.5 py-1 rounded-full">
          <Clock className="h-3 w-3 animate-spin-slow" /> {status}
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border border-gray-200 gap-1 font-medium px-2.5 py-1 rounded-full">
        <Clock className="h-3 w-3" /> {status}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Paket Saya
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Daftar paket pengiriman aktif dan riwayat kargo yang Anda kirim dengan username{' '}
            <span className="font-semibold text-primary font-mono">{user?.username}</span>.
          </p>
        </div>
        <Button
          onClick={() => loadPackages(true)}
          variant="outline"
          className="self-start sm:self-center border-primary/20 hover:bg-primary/5 hover:text-primary gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <RefreshCw className="h-10 w-10 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Menghubungkan ke Neon DB...</p>
        </div>
      ) : packages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-dashed border-border/80 p-8 text-center bg-white shadow-sm rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="h-16 w-16 rounded-full bg-[#63D25F]/10 flex items-center justify-center text-[#2F8A2E]">
                <Package className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-lg">Belum Ada Paket</CardTitle>
                <CardDescription className="max-w-md mx-auto mt-2">
                  Akun Anda belum memiliki riwayat pengiriman kargo. Saat admin membuat paket baru untuk Anda, pastikan mereka mencantumkan username pengirim <span className="font-semibold font-mono text-primary">{user?.username}</span> agar otomatis tertaut ke halaman ini.
                </CardDescription>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {packages.map((pkg, idx) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Card className="h-full border-border/60 hover:border-primary/40 hover:shadow-md transition-all duration-300 rounded-2xl flex flex-col justify-between overflow-hidden bg-white shadow-sm">
                  <div>
                    {/* Card Top / Resi Header */}
                    <div className="bg-secondary/20 p-4 border-b border-border/40 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">No. Resi</p>
                        <p className="font-mono font-bold text-sm text-foreground">{pkg.resiNumber}</p>
                      </div>
                      {getStatusBadge(pkg.status)}
                    </div>

                    <CardContent className="p-5 space-y-4">
                      {/* Destination Details */}
                      <div className="space-y-3">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Tujuan Penerima</p>
                            <p className="text-sm font-semibold truncate text-foreground">{pkg.recipient}</p>
                            <p className="text-xs text-muted-foreground truncate">{pkg.destination}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Lokasi Terkini</p>
                            <p className="text-xs font-medium text-foreground truncate">{pkg.currentLocation || 'Kantor Pusat'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Weight and service */}
                      <div className="pt-3 border-t border-border/40 grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-muted-foreground">Berat Kargo</p>
                          <p className="font-bold text-foreground mt-0.5">{pkg.weight}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Estimasi Sampai</p>
                          <p className="font-bold text-foreground mt-0.5 truncate">{pkg.estimatedTime}</p>
                        </div>
                      </div>
                    </CardContent>
                  </div>

                  {/* Action Footer */}
                  <div className="p-4 border-t border-border/40 bg-secondary/5 flex items-center">
                    <Button
                      onClick={() => setSelectedPackage(pkg)}
                      className="w-full bg-[#2F8A2E] hover:bg-[#256c24] text-white font-semibold rounded-xl gap-2 transition-all"
                    >
                      Lacak Paket Realtime
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Tracking Modal Detail */}
      <Dialog open={selectedPackage !== null} onOpenChange={(open) => !open && setSelectedPackage(null)}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl">
          {selectedPackage && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between flex-wrap gap-2 pr-6">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Detail Resi</p>
                    <DialogTitle className="font-mono font-bold text-lg">{selectedPackage.resiNumber}</DialogTitle>
                  </div>
                  {getStatusBadge(selectedPackage.status)}
                </div>
                <DialogDescription>
                  Status kargo realtime dan riwayat log kurir CargoLite.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 my-4">
                {/* Info Card Ringkas */}
                <div className="rounded-2xl border border-border/80 bg-secondary/20 p-4 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block font-medium">Penerima</span>
                    <span className="font-bold text-foreground block mt-0.5">{selectedPackage.recipient}</span>
                    {selectedPackage.recipientPhone && selectedPackage.recipientPhone !== '-' && (
                      <span className="text-muted-foreground flex items-center gap-1 mt-1 font-mono">
                        <Phone className="h-3 w-3" /> {selectedPackage.recipientPhone}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-medium">Alamat Tujuan</span>
                    <span className="font-bold text-foreground block mt-0.5 leading-tight">{selectedPackage.destination}</span>
                  </div>
                </div>

                {/* Timeline Pelacakan */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                    <FileText className="h-4 w-4 text-primary" />
                    Riwayat Perjalanan Paket
                  </h3>

                  {selectedPackage.history && selectedPackage.history.length > 0 ? (
                    <div className="relative pl-6 border-l-2 border-primary/20 space-y-6 py-2 ml-3">
                      {selectedPackage.history.map((event, idx) => (
                        <div key={idx} className="relative">
                          {/* Timeline dot */}
                          <div className={`absolute -left-[31px] mt-1 h-4 w-4 rounded-full border-2 border-white flex items-center justify-center ${
                            idx === selectedPackage.history.length - 1 ? 'bg-primary animate-ping' : 'bg-primary'
                          }`}>
                            <div className="h-1.5 w-1.5 bg-white rounded-full" />
                          </div>
                          
                          {/* Event body */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-xs font-bold text-foreground">{event.status}</p>
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap bg-secondary px-2 py-0.5 rounded-full font-medium">
                                {formatDate(event.timestamp)}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-primary shrink-0" />
                              {event.location}
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {event.description}
                            </p>
                            
                            {/* Attachment Photo */}
                            {event.photoUrl && (
                              <div className="mt-2 rounded-xl overflow-hidden border border-border/60 bg-muted/20 p-1.5 max-w-[200px]">
                                <p className="text-[9px] font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                                  <Camera className="h-3 w-3" /> Bukti Foto Kurir
                                </p>
                                <img
                                  src={event.photoUrl}
                                  alt="Bukti Pengiriman"
                                  className="rounded-lg max-h-[140px] w-full object-cover shadow-sm hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2 bg-white">
                      <AlertCircle className="h-5 w-5 text-amber-500 animate-pulse" />
                      <span>Belum ada log pergerakan. Paket saat ini masih dipersiapkan oleh admin dan kurir yang ditugaskan.</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
