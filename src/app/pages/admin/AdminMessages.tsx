import { useState } from 'react';
import { Mail, Trash2, User, Clock, Inbox, AlertCircle, RefreshCw } from 'lucide-react';
import { useAdminData } from '../../contexts/AdminDataContext';
import { useMetadata } from '../../lib/useMetadata';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export function AdminMessages() {
  useMetadata(
    'Pesan Masuk (Admin)',
    'Daftar pesan dan pertanyaan yang dikirimkan oleh pengunjung melalui halaman kontak CargoLite.'
  );

  const { contactMessages, deleteContactMessage, refreshData, isUsingFallback } = useAdminData();
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteContactMessage(id);
      toast.success('Pesan berhasil dihapus!');
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghapus pesan.');
    } finally {
      setIsDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('id-ID', {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Pesan Masuk
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Kelola tanggapan, pertanyaan, dan umpan balik yang dikirim pengunjung melalui halaman Hubungi Kami.
          </p>
        </div>
        <Button
          onClick={() => void refreshData()}
          variant="outline"
          className="self-start sm:self-center border-primary/20 hover:bg-primary/5 hover:text-primary gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {isUsingFallback && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-amber-800 text-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <span className="font-semibold">Mode Simulasi Offline:</span> Server database API belum aktif atau koneksi gagal. Data di bawah ini berupa data dummy sementara. Jalankan API server untuk menyimpan perubahan ke database Neon.
          </div>
        </div>
      )}

      {/* Messages List */}
      {!contactMessages || contactMessages.length === 0 ? (
        <Card className="border-dashed border-border/80 p-8 text-center bg-white shadow-sm rounded-3xl">
          <CardContent className="flex flex-col items-center justify-center space-y-4 py-12">
            <div className="h-16 w-16 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground">
              <Inbox className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-lg">Tidak Ada Pesan</CardTitle>
              <CardDescription className="max-w-md mx-auto mt-2">
                Kotak masuk Anda bersih! Belum ada pesan atau pertanyaan baru yang dikirimkan oleh pengunjung.
              </CardDescription>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <AnimatePresence>
            {contactMessages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="h-full border-border/60 hover:border-primary/30 hover:shadow-md transition-all duration-300 rounded-3xl overflow-hidden bg-white shadow-sm flex flex-col justify-between">
                  <div>
                    <CardHeader className="p-5 pb-3 border-b border-border/30 bg-secondary/10">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                            {msg.subject || 'Pertanyaan Umum'}
                          </span>
                          <CardTitle className="text-base font-bold text-foreground mt-2 leading-snug">
                            {msg.subject}
                          </CardTitle>
                        </div>

                        {/* Delete Button */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setIsDeletingId(msg.id)}
                              className="text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-full h-8 w-8 transition-colors shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-3xl bg-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Pesan Kontak?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tindakan ini bersifat permanen. Pesan dari{' '}
                                <span className="font-semibold text-foreground">{msg.name}</span> dengan subjek "{msg.subject}" akan dihapus dari database.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => void handleDelete(msg.id)}
                                className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 space-y-4">
                      {/* Message Content */}
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed bg-secondary/20 p-3 rounded-2xl border border-border/40">
                        {msg.message}
                      </p>

                      {/* Sender details and Date */}
                      <div className="pt-3 border-t border-border/40 space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="font-medium text-foreground">{msg.name}</span>
                          <span className="text-muted-foreground/60">•</span>
                          <span className="font-mono text-muted-foreground">{msg.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>Dikirim pada {formatDate(msg.createdAt)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
