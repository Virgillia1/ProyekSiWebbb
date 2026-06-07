import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { motion } from 'motion/react';
import { useMetadata } from '../lib/useMetadata';
import { toast } from 'sonner';

export function ContactPage() {
  useMetadata(
    'Hubungi Kami',
    'Ada pertanyaan atau keluhan mengenai pengiriman kargo Anda? Hubungi tim support CargoLite melalui form kontak ini.'
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Nama lengkap wajib diisi.';
    if (!email.trim()) newErrors.email = 'Alamat email wajib diisi.';
    if (!subject.trim()) newErrors.subject = 'Subjek pesan wajib diisi.';
    if (!message.trim()) newErrors.message = 'Isi pesan wajib diisi.';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengirim pesan.');
      }

      toast.success('Pesan Anda berhasil terkirim!', {
        description: 'Tim support kami akan segera menindaklanjuti pesan Anda.',
      });

      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengirim pesan.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-green-100 max-w-2xl">
              Hubungi tim layanan kami. Kami siap membantu pertanyaan dan keluhan Anda secara cepat!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6">Kirim Pesan</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-foreground">Nama Lengkap</label>
                    <Input
                      placeholder="Nama Anda"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setErrors((prev) => ({ ...prev, name: '' }));
                      }}
                      className={errors.name ? 'border-red-600 focus-visible:ring-red-600' : 'border-border'}
                    />
                    {errors.name && (
                      <p data-field-error="true" className="text-sm font-medium text-red-600">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-foreground">Email</label>
                    <Input
                      type="email"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      className={errors.email ? 'border-red-600 focus-visible:ring-red-600' : 'border-border'}
                    />
                    {errors.email && (
                      <p data-field-error="true" className="text-sm font-medium text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground">Subjek</label>
                  <Input
                    placeholder="Mengenai hal apa pesan ini?"
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setErrors((prev) => ({ ...prev, subject: '' }));
                    }}
                    className={errors.subject ? 'border-red-600 focus-visible:ring-red-600' : 'border-border'}
                  />
                  {errors.subject && (
                    <p data-field-error="true" className="text-sm font-medium text-red-600">
                      {errors.subject}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground">Pesan</label>
                  <Textarea
                    placeholder="Tuliskan pertanyaan atau keluhan Anda secara detail di sini..."
                    rows={6}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      setErrors((prev) => ({ ...prev, message: '' }));
                    }}
                    className={errors.message ? 'border-red-600 focus-visible:ring-red-600' : 'border-border'}
                  />
                  {errors.message && (
                    <p data-field-error="true" className="text-sm font-medium text-red-600">
                      {errors.message}
                    </p>
                  )}
                </div>
                <Button type="submit" size="lg" className="w-full gap-2 rounded-xl" disabled={isSending}>
                  <Send className="h-4 w-4" />
                  {isSending ? 'Mengirim...' : 'Kirim Pesan'}
                </Button>
              </form>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold mb-6">Informasi Kontak</h2>
                <p className="text-muted-foreground mb-8">
                  Hubungi kami melalui saluran berikut. Tim layanan pelanggan kami siap membantu menyelesaikan kendala logistik Anda.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Kantor Pusat</h3>
                    <p className="text-muted-foreground text-sm">
                      Jl. Sudirman Kav. 52-53<br />
                      Jakarta Selatan, 12190<br />
                      Indonesia
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Telepon & Fax</h3>
                    <p className="text-muted-foreground text-sm">
                      +62 21 1234 5678<br />
                      +62 21 8765 4321 (Fax)
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email Support</h3>
                    <p className="text-muted-foreground text-sm">
                      info@cargolite.com<br />
                      support@cargolite.com
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Jam Operasional</h3>
                    <p className="text-muted-foreground text-sm">
                      Senin - Jumat: 08:00 - 18:00 WIB<br />
                      Sabtu: 09:00 - 15:00 WIB<br />
                      Minggu: Libur
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="pt-6 border-t">
                <h3 className="font-semibold mb-4">Ikuti Kami</h3>
                <div className="flex gap-4">
                  {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map((social) => (
                    <button
                      key={social}
                      className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary hover:text-white transition-all flex items-center justify-center text-sm font-medium"
                    >
                      {social[0]}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6 text-center">Lokasi Kami</h2>
            <div className="bg-card rounded-xl overflow-hidden h-96 flex items-center justify-center border-2 border-dashed">
              <div className="text-center text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4" />
                <p className="font-semibold">Peta Lokasi Kantor CargoLite</p>
                <p className="text-sm">Jl. Sudirman Kav. 52-53, Jakarta Selatan</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
