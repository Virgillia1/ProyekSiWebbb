import { useState, useRef } from 'react';
import { Camera, Upload, X, MapPin, TruckIcon, CheckCircle2, Clock, Package as PackageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

interface UpdateStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  delivery: any;
  onUpdateStatus: (statusData: any) => void;
}

const statusOptions = [
  { value: 'menunggu_pickup', label: 'Menunggu Pickup', icon: Clock, needsPhoto: false },
  { value: 'paket_diterima', label: 'Paket Diterima di Gudang', icon: PackageIcon, needsPhoto: false },
  { value: 'dalam_sortir', label: 'Dalam Proses Sortir', icon: PackageIcon, needsPhoto: false },
  { value: 'transit', label: 'Transit ke Lokasi', icon: TruckIcon, needsPhoto: false },
  { value: 'dalam_pengiriman', label: 'Dalam Pengiriman', icon: TruckIcon, needsPhoto: false },
  { value: 'menuju_alamat', label: 'Menuju ke Alamat Penerima', icon: MapPin, needsPhoto: false },
  { value: 'terkirim', label: 'Paket Terkirim', icon: CheckCircle2, needsPhoto: true },
];

export function UpdateStatusModal({ open, onOpenChange, delivery, onUpdateStatus }: UpdateStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedStatusOption = statusOptions.find(opt => opt.value === selectedStatus);
  const needsPhoto = selectedStatusOption?.needsPhoto || false;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (!selectedStatus) {
      toast.error('Pilih status terlebih dahulu');
      return;
    }

    if (!location.trim()) {
      toast.error('Masukkan lokasi');
      return;
    }

    if (needsPhoto && !photoPreview) {
      toast.error('Upload foto bukti pengiriman');
      return;
    }

    const statusLabel = statusOptions.find(opt => opt.value === selectedStatus)?.label || selectedStatus;

    const statusData = {
      status: statusLabel,
      location: location.trim(),
      description: description.trim() || `Paket telah ${statusLabel.toLowerCase()}`,
      timestamp: new Date().toISOString(),
      photoUrl: photoPreview,
    };

    onUpdateStatus(statusData);

    // Reset form
    setSelectedStatus('');
    setLocation('');
    setDescription('');
    setPhotoPreview(null);
    setPhotoFile(null);

    toast.success('Status paket berhasil diupdate');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Status Paket</DialogTitle>
          <DialogDescription>
            Update status pengiriman untuk resi {delivery?.resiNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status">Status Paket</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih status paket..." />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Location Input */}
          <div className="space-y-2">
            <Label htmlFor="location">Lokasi</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="location"
                placeholder="Contoh: Jakarta Selatan, Cikampek, dll."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="description">Keterangan (Opsional)</Label>
            <Input
              id="description"
              placeholder="Tambahkan keterangan tambahan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Photo Upload (only for delivered status) */}
          {needsPhoto && (
            <div className="space-y-2">
              <Label>Foto Bukti Pengiriman *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleRemovePhoto}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="flex justify-center gap-4 mb-4">
                      <Camera className="h-12 w-12 text-muted-foreground" />
                      <Upload className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload foto bukti bahwa paket telah diterima
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="photo-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Pilih Foto
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Foto harus menunjukkan paket yang telah diterima oleh penerima
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit}>
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
