export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'kurir' | 'pelanggan';
}

export interface HistoryLog {
  id: string;
  deliveryId: string;
  status: string;
  location: string;
  timestamp: string;
  description: string;
  photoUrl?: string; // Photo proof of delivery
}

export interface ChatMessage {
  id: string;
  deliveryId: string;
  senderId: string;
  senderName: string;
  senderRole: 'kurir' | 'pelanggan';
  message: string;
  timestamp: string;
}

export interface Delivery {
  id: string;
  resiNumber: string;
  senderName: string;
  recipientName: string;
  origin: string;
  destination: string;
  currentStatus: string;
  weight: number;
  estimatedDelivery: string;
  historyLogs: HistoryLog[];
  courierName?: string;
  courierPhone?: string;
  courierRating?: number;
  chatMessages?: ChatMessage[];
}