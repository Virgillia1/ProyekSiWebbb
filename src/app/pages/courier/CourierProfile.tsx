import { useState } from 'react';
import { User, Mail, Phone, MapPin, Star, Award, Calendar, Edit2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';

export function CourierProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: 'Jl. Sudirman No. 123, Jakarta Selatan',
  });

  const handleSave = () => {
    // Save logic here
    setIsEditing(false);
  };

  const achievements = [
    {
      title: 'Kurir Terbaik',
      description: 'Top 10 kurir bulan ini',
      icon: Award,
      color: 'bg-yellow-500',
    },
    {
      title: '1000+ Pengiriman',
      description: 'Sudah menyelesaikan 1000+ pengiriman',
      icon: Star,
      color: 'bg-blue-500',
    },
    {
      title: '2 Tahun Bergabung',
      description: 'Member sejak April 2024',
      icon: Calendar,
      color: 'bg-purple-500',
    },
  ];

  const performanceStats = [
    { label: 'Rating', value: '4.9', max: '5.0' },
    { label: 'Pengiriman Selesai', value: '1,842', max: '' },
    { label: 'Tingkat Keberhasilan', value: '98.5%', max: '' },
    { label: 'Waktu Rata-rata', value: '2.3 jam', max: '' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Kelola informasi profil Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Profile */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-xl font-bold">Informasi Pribadi</h2>
              <Button
                variant={isEditing ? 'default' : 'outline'}
                size="sm"
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              >
                {isEditing ? 'Simpan' : <><Edit2 className="h-4 w-4 mr-2" /> Edit</>}
              </Button>
            </div>

            {/* Profile Picture */}
            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-border">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-primary" />
                )}
              </div>
              <div>
                <div className="font-bold text-2xl mb-1">{user?.name}</div>
                <div className="text-sm text-muted-foreground mb-2">Kurir CargoKu</div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">4.9</span>
                  <span className="text-sm text-muted-foreground">(1,234 ulasan)</span>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-xl font-bold mb-6">Pencapaian</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <motion.div
                    key={achievement.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-secondary/50 rounded-lg p-4 text-center"
                  >
                    <div className={`${achievement.color} p-3 rounded-lg w-fit mx-auto mb-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="font-medium mb-1">{achievement.title}</div>
                    <div className="text-xs text-muted-foreground">{achievement.description}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-xl font-bold mb-6">Statistik Performa</h2>
            <div className="space-y-6">
              {performanceStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                    {stat.max && (
                      <div className="text-sm text-muted-foreground">/ {stat.max}</div>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  {index < performanceStats.length - 1 && (
                    <div className="mt-4 border-b border-border"></div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-gradient-to-br from-primary to-green-500 rounded-xl p-6 text-white">
            <h3 className="font-bold text-lg mb-2">Status Akun</h3>
            <div className="text-sm opacity-90 mb-4">Akun Terverifikasi ✓</div>
            <div className="bg-white/20 rounded-lg p-3 text-sm">
              Anda adalah bagian dari 10% kurir terbaik di CargoKu!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
