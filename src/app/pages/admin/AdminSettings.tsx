import { useState } from 'react';
import { DatabaseBackup, Download, LockKeyhole, RefreshCw, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';

export function AdminSettings() {
  const [settings, setSettings] = useState({
    automaticBackup: true,
    encryption: true,
    twoFactorReview: true,
    anomalyAlert: true,
    weeklyBackupCopy: false,
  });

  const toggleSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const runBackup = () => {
    toast.success('Backup data dimulai', {
      description: 'Simulasi backup berhasil dijalankan dan disimpan ke storage aman.',
    });
  };

  const exportLog = () => {
    toast.success('Log keamanan disiapkan', {
      description: 'Audit log siap diunduh untuk kebutuhan review internal.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-border/80 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle>Proteksi Data</CardTitle>
            <CardDescription>Kelola pengamanan inti untuk data pengiriman, karyawan, dan customer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                key: 'automaticBackup',
                title: 'Backup Otomatis Harian',
                description: 'Menyimpan snapshot data utama setiap malam.',
              },
              {
                key: 'encryption',
                title: 'Enkripsi Data Sensitif',
                description: 'Melindungi data customer, payroll, dan riwayat pengiriman.',
              },
              {
                key: 'twoFactorReview',
                title: 'Review 2FA Admin',
                description: 'Memastikan akses admin diperiksa berlapis secara berkala.',
              },
              {
                key: 'anomalyAlert',
                title: 'Alert Aktivitas Tidak Wajar',
                description: 'Notifikasi saat ada pola login atau perubahan data mencurigakan.',
              },
              {
                key: 'weeklyBackupCopy',
                title: 'Salinan Backup Mingguan',
                description: 'Buat arsip tambahan untuk kebutuhan audit dan recovery.',
              },
            ].map((item) => (
              <div key={item.key} className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-secondary/20 p-4">
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Switch
                  checked={settings[item.key as keyof typeof settings]}
                  onCheckedChange={(checked) => toggleSetting(item.key as keyof typeof settings, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/80 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle>Backup Center</CardTitle>
              <CardDescription>Aksi cepat untuk menjaga cadangan data tetap aman dan siap dipakai.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-[#63D25F] p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">Status Backup</p>
                    <p className="mt-2 text-2xl font-semibold">Aman & Tersinkron</p>
                  </div>
                  <DatabaseBackup className="h-10 w-10 text-white/90" />
                </div>
                <p className="mt-3 text-sm text-white/85">
                  Backup terakhir: 20 April 2026, 02:15 WIB.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Button onClick={runBackup}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Jalankan Backup
                </Button>
                <Button variant="outline" onClick={exportLog}>
                  <Download className="mr-2 h-4 w-4" />
                  Unduh Audit Log
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle>Poin Keamanan</CardTitle>
              <CardDescription>Checklist keamanan data untuk admin POV.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3 rounded-2xl bg-secondary/40 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                Akses halaman settings difokuskan untuk pengawasan backup, audit, dan perlindungan data sensitif.
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-secondary/40 p-4">
                <LockKeyhole className="mt-0.5 h-5 w-5 text-primary" />
                Simulasi ini menampilkan kontrol enkripsi dan review 2FA agar alur admin terasa realistis.
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-secondary/40 p-4">
                <DatabaseBackup className="mt-0.5 h-5 w-5 text-primary" />
                Backup dan audit log diposisikan sebagai fitur inti untuk menjaga keberlanjutan operasional.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
