import { User, Delivery, HistoryLog, ChatMessage } from './types';

// Mock user data
export const mockUser: User = {
  id: '1',
  name: 'Andi Wijaya',
  email: 'andi.wijaya@example.com',
  phone: '08123456789',
  role: 'pelanggan',
};

// Mock deliveries data
export const mockDeliveries: Delivery[] = [
  {
    id: '1',
    resiNumber: 'CKL2026040001',
    senderName: 'Toko Bunga Mawar',
    recipientName: 'Siti Rahayu',
    origin: 'Jakarta Selatan',
    destination: 'Bandung',
    currentStatus: 'Dalam Pengiriman',
    weight: 5,
    estimatedDelivery: '2026-04-07',
    courierName: 'Budi Santoso',
    courierPhone: '08234567890',
    courierRating: 4.8,
    historyLogs: [
      {
        id: '1',
        deliveryId: '1',
        status: 'Paket Diterima',
        location: 'Jakarta Selatan',
        timestamp: '2026-04-06T08:00:00',
        description: 'Paket telah diterima di gudang CargoKu Jakarta Selatan',
      },
      {
        id: '2',
        deliveryId: '1',
        status: 'Dalam Proses Sortir',
        location: 'Jakarta Selatan',
        timestamp: '2026-04-06T10:30:00',
        description: 'Paket sedang dalam proses sortir',
      },
      {
        id: '3',
        deliveryId: '1',
        status: 'Dalam Pengiriman',
        location: 'Cikampek',
        timestamp: '2026-04-06T14:00:00',
        description: 'Paket sedang dalam perjalanan menuju Bandung',
      },
    ],
    chatMessages: [
      {
        id: '1',
        deliveryId: '1',
        senderId: '1',
        senderName: 'Andi Wijaya',
        senderRole: 'pelanggan',
        message: 'Halo pak, paket saya sudah sampai mana ya?',
        timestamp: '2026-04-06T15:00:00',
      },
      {
        id: '2',
        deliveryId: '1',
        senderId: '2',
        senderName: 'Budi Santoso',
        senderRole: 'kurir',
        message: 'Halo pak, paket sedang dalam perjalanan. InsyaAllah besok pagi sudah sampai.',
        timestamp: '2026-04-06T15:05:00',
      },
      {
        id: '3',
        deliveryId: '1',
        senderId: '1',
        senderName: 'Andi Wijaya',
        senderRole: 'pelanggan',
        message: 'Baik pak, terima kasih infonya!',
        timestamp: '2026-04-06T15:07:00',
      },
    ],
  },
  {
    id: '2',
    resiNumber: 'CKL2026040002',
    senderName: 'UD Maju Jaya',
    recipientName: 'Budi Santoso',
    origin: 'Surabaya',
    destination: 'Malang',
    currentStatus: 'Terkirim',
    weight: 10,
    estimatedDelivery: '2026-04-05',
    courierName: 'Joko Widodo',
    courierPhone: '08345678901',
    courierRating: 5.0,
    historyLogs: [
      {
        id: '4',
        deliveryId: '2',
        status: 'Paket Diterima',
        location: 'Surabaya',
        timestamp: '2026-04-04T09:00:00',
        description: 'Paket telah diterima di gudang CargoKu Surabaya',
      },
      {
        id: '5',
        deliveryId: '2',
        status: 'Dalam Pengiriman',
        location: 'Surabaya',
        timestamp: '2026-04-04T14:00:00',
        description: 'Paket sedang dalam perjalanan menuju Malang',
      },
      {
        id: '6',
        deliveryId: '2',
        status: 'Terkirim',
        location: 'Malang',
        timestamp: '2026-04-05T10:00:00',
        description: 'Paket telah diterima oleh Budi Santoso',
        photoUrl: 'https://images.unsplash.com/photo-1607687441809-dd332b5b9c18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWxpdmVyeSUyMHBhY2thZ2UlMjBib3glMjBoYW5kc3xlbnwxfHx8fDE3NzU0Njg2NjF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      },
    ],
    chatMessages: [
      {
        id: '4',
        deliveryId: '2',
        senderId: '3',
        senderName: 'Joko Widodo',
        senderRole: 'kurir',
        message: 'Paket sudah sampai tujuan, terima kasih!',
        timestamp: '2026-04-05T10:05:00',
      },
    ],
  },
  {
    id: '3',
    resiNumber: 'CKL2026040003',
    senderName: 'Toko Elektronik Jaya',
    recipientName: 'Linda Kusuma',
    origin: 'Jakarta Barat',
    destination: 'Bekasi',
    currentStatus: 'Menunggu Pickup',
    weight: 3,
    estimatedDelivery: '2026-04-07',
    courierName: 'Rina Permata',
    courierPhone: '08456789012',
    historyLogs: [
      {
        id: '7',
        deliveryId: '3',
        status: 'Menunggu Pickup',
        location: 'Jakarta Barat',
        timestamp: '2026-04-06T16:00:00',
        description: 'Pesanan menunggu penjemputan dari pengirim',
      },
    ],
    chatMessages: [],
  },
];

export const findDeliveryByResi = (resiNumber: string): Delivery | undefined => {
  return mockDeliveries.find(
    (delivery) => delivery.resiNumber.toLowerCase() === resiNumber.toLowerCase()
  );
};