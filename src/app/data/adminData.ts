export type PackageStatus = 'Sudah Dikirim' | 'Lagi Dikirim';
export type EmployeeStatus = 'Aktif' | 'Nonaktif';
export type PresenceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Alpha';
export type ShipmentHistoryType = 'Mengirim' | 'Menerima';

export interface AdminPackage {
  id: string;
  monthKey: string;
  week: string;
  resi: string;
  senderName: string;
  recipientName: string;
  courierId: string;
  courierName: string;
  origin: string;
  destination: string;
  currentLocation: string;
  service: string;
  weightKg: number;
  declaredValue: number;
  shippedAt: string;
  deliveredAt?: string;
  status: PackageStatus;
}

export interface Employee {
  id: string;
  name: string;
  origin: string;
  age: number;
  yearsWorking: number;
  salary: number;
  status: EmployeeStatus;
  division: string;
  position: string;
  phone: string;
  performanceScore: number;
}

export interface AttendanceRecord {
  id: string;
  monthKey: string;
  employeeId: string;
  employeeName: string;
  division: string;
  presentDays: number;
  absentDays: number;
  sickDays: number;
  permitDays: number;
  lateCount: number;
  todayStatus: PresenceStatus;
  lastAbsentDate: string;
}

export interface ShipmentHistoryItem {
  id: string;
  type: ShipmentHistoryType;
  resi: string;
  route: string;
  status: string;
  date: string;
}

export interface CustomerAccount {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  totalSent: number;
  totalReceived: number;
  lastActivity: string;
  histories: ShipmentHistoryItem[];
}

export interface DeliveryChartPoint {
  week: string;
  terkirim: number;
  diproses: number;
}

export const monthOptions = [
  { value: '2026-01', label: 'Januari 2026' },
  { value: '2026-02', label: 'Februari 2026' },
  { value: '2026-03', label: 'Maret 2026' },
  { value: '2026-04', label: 'April 2026' },
];

export const packageStatusOptions: PackageStatus[] = ['Lagi Dikirim', 'Sudah Dikirim'];
export const presenceStatusOptions: PresenceStatus[] = ['Hadir', 'Izin', 'Sakit', 'Alpha'];

const padValue = (value: number, length = 4) => String(value).padStart(length, '0');

export const employees: Employee[] = [
  {
    id: 'EMP-001',
    name: 'Budi Santoso',
    origin: 'Bandung',
    age: 31,
    yearsWorking: 4,
    salary: 6500000,
    status: 'Aktif',
    division: 'Operasional',
    position: 'Senior Kurir',
    phone: '08234567890',
    performanceScore: 96,
  },
  {
    id: 'EMP-002',
    name: 'Joko Widodo',
    origin: 'Surabaya',
    age: 34,
    yearsWorking: 6,
    salary: 7200000,
    status: 'Aktif',
    division: 'Operasional',
    position: 'Koordinator Kurir',
    phone: '08345678901',
    performanceScore: 94,
  },
  {
    id: 'EMP-003',
    name: 'Arif Maulana',
    origin: 'Tasikmalaya',
    age: 28,
    yearsWorking: 3,
    salary: 5900000,
    status: 'Aktif',
    division: 'Operasional',
    position: 'Kurir Area Barat',
    phone: '081278909876',
    performanceScore: 89,
  },
  {
    id: 'EMP-004',
    name: 'Rina Permata',
    origin: 'Yogyakarta',
    age: 29,
    yearsWorking: 5,
    salary: 6700000,
    status: 'Aktif',
    division: 'Operasional',
    position: 'Kurir Area Tengah',
    phone: '08456789012',
    performanceScore: 93,
  },
  {
    id: 'EMP-005',
    name: 'Fikri Aditya',
    origin: 'Cirebon',
    age: 26,
    yearsWorking: 2,
    salary: 5200000,
    status: 'Nonaktif',
    division: 'Operasional',
    position: 'Kurir Cadangan',
    phone: '081376543219',
    performanceScore: 76,
  },
  {
    id: 'EMP-006',
    name: 'Devi Nirmala',
    origin: 'Bogor',
    age: 30,
    yearsWorking: 4,
    salary: 6100000,
    status: 'Aktif',
    division: 'Operasional',
    position: 'Kurir Area Timur',
    phone: '081390998877',
    performanceScore: 91,
  },
  {
    id: 'EMP-007',
    name: 'Sari Puspitasari',
    origin: 'Depok',
    age: 27,
    yearsWorking: 3,
    salary: 5600000,
    status: 'Aktif',
    division: 'Gudang',
    position: 'Admin Gudang',
    phone: '081344556677',
    performanceScore: 88,
  },
  {
    id: 'EMP-008',
    name: 'Reza Mahendra',
    origin: 'Semarang',
    age: 33,
    yearsWorking: 5,
    salary: 7050000,
    status: 'Aktif',
    division: 'Distribusi',
    position: 'Supervisor Hub',
    phone: '081355667788',
    performanceScore: 92,
  },
  {
    id: 'EMP-009',
    name: 'Nanda Prakoso',
    origin: 'Malang',
    age: 29,
    yearsWorking: 4,
    salary: 5750000,
    status: 'Aktif',
    division: 'Layanan Pelanggan',
    position: 'Staff Customer Care',
    phone: '081366778899',
    performanceScore: 87,
  },
  {
    id: 'EMP-010',
    name: 'Wulan Safitri',
    origin: 'Solo',
    age: 32,
    yearsWorking: 5,
    salary: 6950000,
    status: 'Aktif',
    division: 'Distribusi',
    position: 'Dispatcher Nasional',
    phone: '081377889900',
    performanceScore: 90,
  },
];

const employeeDirectory = new Map(employees.map((employee) => [employee.id, employee]));

type PackagePlan = Omit<AdminPackage, 'id' | 'monthKey' | 'week' | 'resi' | 'courierName'>;

const packagePlans: Record<string, PackagePlan[]> = {
  '2026-01': [
    {
      senderName: 'PT Nusantara Ritel',
      recipientName: 'Bunga Citra',
      courierId: 'EMP-001',
      origin: 'Jakarta Selatan',
      destination: 'Bandung',
      currentLocation: 'Bandung',
      service: 'CargoKu Reguler',
      weightKg: 8.5,
      declaredValue: 1250000,
      shippedAt: '2026-01-07T08:10:00',
      deliveredAt: '2026-01-08T16:20:00',
      status: 'Sudah Dikirim',
    },
    {
      senderName: 'CV Sinar Jaya',
      recipientName: 'Aldi Saputra',
      courierId: 'EMP-004',
      origin: 'Depok',
      destination: 'Yogyakarta',
      currentLocation: 'Yogyakarta',
      service: 'CargoKu Express',
      weightKg: 3.2,
      declaredValue: 640000,
      shippedAt: '2026-01-13T09:40:00',
      deliveredAt: '2026-01-14T11:05:00',
      status: 'Sudah Dikirim',
    },
    {
      senderName: 'Toko Mebel Abadi',
      recipientName: 'Dina Larasati',
      courierId: 'EMP-010',
      origin: 'Bekasi',
      destination: 'Semarang',
      currentLocation: 'Gerbang Tol Kalikangkung',
      service: 'CargoKu Cargo',
      weightKg: 22.1,
      declaredValue: 2850000,
      shippedAt: '2026-01-17T17:25:00',
      status: 'Lagi Dikirim',
    },
    {
      senderName: 'PT Maju Digital',
      recipientName: 'Siska Melati',
      courierId: 'EMP-002',
      origin: 'Jakarta Barat',
      destination: 'Surabaya',
      currentLocation: 'Surabaya Barat',
      service: 'CargoKu Express',
      weightKg: 5.4,
      declaredValue: 920000,
      shippedAt: '2026-01-19T10:15:00',
      deliveredAt: '2026-01-20T14:50:00',
      status: 'Sudah Dikirim',
    },
    {
      senderName: 'Toko Kertas Sentosa',
      recipientName: 'Riko Maulana',
      courierId: 'EMP-006',
      origin: 'Bogor',
      destination: 'Malang',
      currentLocation: 'Hub Malang',
      service: 'CargoKu Reguler',
      weightKg: 11.7,
      declaredValue: 480000,
      shippedAt: '2026-01-22T07:45:00',
      deliveredAt: '2026-01-24T15:15:00',
      status: 'Sudah Dikirim',
    },
    {
      senderName: 'PT Agrilog',
      recipientName: 'Hendra Wijaya',
      courierId: 'EMP-008',
      origin: 'Tangerang',
      destination: 'Solo',
      currentLocation: 'Rest Area Salatiga',
      service: 'CargoKu Cargo',
      weightKg: 18.6,
      declaredValue: 1540000,
      shippedAt: '2026-01-24T18:00:00',
      status: 'Lagi Dikirim',
    },
    {
      senderName: 'PT Lestari Pangan',
      recipientName: 'Mega Puspita',
      courierId: 'EMP-003',
      origin: 'Jakarta Utara',
      destination: 'Cirebon',
      currentLocation: 'Cirebon',
      service: 'CargoKu Same Day',
      weightKg: 2.1,
      declaredValue: 265000,
      shippedAt: '2026-01-27T08:30:00',
      deliveredAt: '2026-01-27T18:40:00',
      status: 'Sudah Dikirim',
    },
    {
      senderName: 'Toko Buku Bina Ilmu',
      recipientName: 'Anita Yuliana',
      courierId: 'EMP-001',
      origin: 'Bandung',
      destination: 'Tasikmalaya',
      currentLocation: 'Tasikmalaya',
      service: 'CargoKu Reguler',
      weightKg: 6.3,
      declaredValue: 390000,
      shippedAt: '2026-01-29T09:25:00',
      deliveredAt: '2026-01-30T12:10:00',
      status: 'Sudah Dikirim',
    },
  ],
  '2026-02': [
    {
      senderName: 'CV Borneo Teknik',
      recipientName: 'Reza Pratama',
      courierId: 'EMP-004',
      origin: 'Karawang',
      destination: 'Purwokerto',
      currentLocation: 'Purwokerto',
      service: 'CargoKu Express',
      weightKg: 4.8,
      declaredValue: 780000,
      shippedAt: '2026-02-03T13:15:00',
      deliveredAt: '2026-02-04T10:20:00',
      status: 'Sudah Dikirim',
    },
    {
      senderName: 'PT Cipta Kemasan',
      recipientName: 'Rafli Kurniawan',
      courierId: 'EMP-003',
      origin: 'Tangerang',
      destination: 'Semarang',
      currentLocation: 'Kendal',
      service: 'CargoKu Cargo',
      weightKg: 16.4,
      declaredValue: 1330000,
      shippedAt: '2026-02-05T07:30:00',
      status: 'Lagi Dikirim',
    },
    {
      senderName: 'CV Pangan Prima',
      recipientName: 'Wulan Safitri',
      courierId: 'EMP-006',
      origin: 'Bogor',
      destination: 'Cirebon',
      currentLocation: 'Cirebon',
      service: 'CargoKu Reguler',
      weightKg: 7.8,
      declaredValue: 540000,
      shippedAt: '2026-02-10T12:45:00',
      deliveredAt: '2026-02-11T15:10:00',
      status: 'Sudah Dikirim',
    },
    {
      senderName: 'Toko Bunga Mawar',
      recipientName: 'Siti Rahayu',
      courierId: 'EMP-001',
      origin: 'Jakarta Selatan',
      destination: 'Bandung',
      currentLocation: 'Gudang Bandung',
      service: 'CargoKu Reguler',
      weightKg: 5.1,
      declaredValue: 350000,
      shippedAt: '2026-02-12T08:00:00',
      deliveredAt: '2026-02-13T11:40:00',
      status: 'Sudah Dikirim',
    },
    {
      senderName: 'UD Maju Jaya',
      recipientName: 'Budi Santoso',
      courierId: 'EMP-002',
      origin: 'Surabaya',
      destination: 'Malang',
      currentLocation: 'Malang',
      service: 'CargoKu Express',
      weightKg: 10,
      declaredValue: 875000,
      shippedAt: '2026-02-17T09:00:00',
      deliveredAt: '2026-02-18T10:00:00',
      status: 'Sudah Dikirim',
    },
    {
      senderName: 'Toko Elektronik Jaya',
      recipientName: 'Linda Kusuma',
      courierId: 'EMP-010',
      origin: 'Jakarta Barat',
      destination: 'Bekasi',
      currentLocation: 'Cawang',
      service: 'CargoKu Same Day',
      weightKg: 3,
      declaredValue: 1225000,
      shippedAt: '2026-02-20T16:00:00',
      status: 'Lagi Dikirim',
    },
    {
      senderName: 'PT Sumber Tekstil',
      recipientName: 'Nadia Putri',
      courierId: 'EMP-008',
      origin: 'Bandung',
      destination: 'Cirebon',
      currentLocation: 'Cirebon',
      service: 'CargoKu Reguler',
      weightKg: 9.4,
      declaredValue: 730000,
      shippedAt: '2026-02-24T09:10:00',
      deliveredAt: '2026-02-25T17:25:00',
      status: 'Sudah Dikirim',
    },
    {
      senderName: 'CV Mebel Sentra',
      recipientName: 'Yusuf Hamdan',
      courierId: 'EMP-003',
      origin: 'Semarang',
      destination: 'Solo',
      currentLocation: 'Solo',
      service: 'CargoKu Express',
      weightKg: 6.8,
      declaredValue: 985000,
      shippedAt: '2026-02-26T11:50:00',
      deliveredAt: '2026-02-26T21:10:00',
      status: 'Sudah Dikirim',
    },
  ],
  '2026-03': [
    {
      senderName: 'PT Prima Medika',
      recipientName: 'Dewi Lestari',
      courierId: 'EMP-001',
      origin: 'Jakarta Selatan',
      destination: 'Bandung',
      currentLocation: 'Bandung',
      service: 'CargoKu Express',
      weightKg: 4.2,
      declaredValue: 690000,
      shippedAt: '2026-03-03T08:20:00',
      deliveredAt: '2026-03-03T17:10:00',
      status: 'Sudah Dikirim',
    },
    {
      senderName: 'CV Berkah Pangan',
      recipientName: 'Rama Saputra',
      courierId: 'EMP-006',
      origin: 'Bogor',
      destination: 'Yogyakarta',
      currentLocation: 'Klaten',
      service: 'CargoKu Cargo',
      weightKg: 14.6,
      declaredValue: 1180000,
      shippedAt: '2026-03-06T07:35:00',
      status: 'Lagi Dikirim',
    },
    {
      senderName: 'Toko Furnika',
      recipientName: 'Tia Maharani',
      courierId: 'EMP-004',
      origin: 'Bekasi',
      destination: 'Semarang',
      currentLocation: 'Hub Semarang',
      service: 'CargoKu Reguler',
      weightKg: 12.4,
      declaredValue: 1475000,
      shippedAt: '2026-03-10T10:05:00',
      deliveredAt: '2026-03-11T18:25:00',
      status: 'Sudah Dikirim',
    },
    {
      senderName: 'PT Kreasi Digital',
      recipientName: 'Galih Pramana',
      courierId: 'EMP-002',
      origin: 'Jakarta Barat',
      destination: 'Surabaya',
      currentLocation: 'Nganjuk',
      service: 'CargoKu Express',
      weightKg: 7.2,
      declaredValue: 1060000,
      shippedAt: '2026-03-12T13:50:00',
      status: 'Lagi Dikirim',
    },
    {
      senderName: 'Toko Bahan Kue Sari',
      recipientName: 'Mira Anggraini',
      courierId: 'EMP-003',
      origin: 'Bandung',
      destination: 'Tasikmalaya',
      currentLocation: 'Tasikmalaya',
      service: 'CargoKu Same Day',
      weightKg: 2.7,
      declaredValue: 310000,
      shippedAt: '2026-03-17T07:45:00',
      deliveredAt: '2026-03-17T16:30:00',
      status: 'Sudah Dikirim',
    },
    {
      senderName: 'PT Mandala Farm',
      recipientName: 'Haris Setiawan',
      courierId: 'EMP-008',
      origin: 'Tangerang',
      destination: 'Solo',
      currentLocation: 'Boyolali',
      service: 'CargoKu Cargo',
      weightKg: 17.3,
      declaredValue: 1680000,
      shippedAt: '2026-03-20T18:20:00',
      status: 'Lagi Dikirim',
    },
    {
      senderName: 'CV Sinar Kulit',
      recipientName: 'Aulia Putri',
      courierId: 'EMP-010',
      origin: 'Karawang',
      destination: 'Cirebon',
      currentLocation: 'Cirebon',
      service: 'CargoKu Reguler',
      weightKg: 8.1,
      declaredValue: 615000,
      shippedAt: '2026-03-24T09:35:00',
      deliveredAt: '2026-03-25T14:45:00',
      status: 'Sudah Dikirim',
    },
    {
      senderName: 'PT Pertiwi Office',
      recipientName: 'Nina Rahma',
      courierId: 'EMP-001',
      origin: 'Depok',
      destination: 'Bekasi',
      currentLocation: 'Bekasi',
      service: 'CargoKu Same Day',
      weightKg: 3.4,
      declaredValue: 450000,
      shippedAt: '2026-03-28T11:20:00',
      deliveredAt: '2026-03-28T18:55:00',
      status: 'Sudah Dikirim',
    },
  ],
  '2026-04': [
    {
      senderName: 'Toko Roti Melati',
      recipientName: 'Sinta Aulia',
      courierId: 'EMP-001',
      origin: 'Jakarta Selatan',
      destination: 'Bandung',
      currentLocation: 'Cikampek',
      service: 'CargoKu Reguler',
      weightKg: 5,
      declaredValue: 350000,
      shippedAt: '2026-04-02T08:00:00',
      status: 'Lagi Dikirim',
    },
    {
      senderName: 'UD Maju Jaya',
      recipientName: 'Budi Santoso',
      courierId: 'EMP-002',
      origin: 'Surabaya',
      destination: 'Malang',
      currentLocation: 'Malang',
      service: 'CargoKu Express',
      weightKg: 10,
      declaredValue: 875000,
      shippedAt: '2026-04-04T09:00:00',
      deliveredAt: '2026-04-05T10:00:00',
      status: 'Sudah Dikirim',
    },
    {
      senderName: 'Toko Elektronik Jaya',
      recipientName: 'Linda Kusuma',
      courierId: 'EMP-004',
      origin: 'Jakarta Barat',
      destination: 'Bekasi',
      currentLocation: 'Jakarta Barat',
      service: 'CargoKu Same Day',
      weightKg: 3,
      declaredValue: 1225000,
      shippedAt: '2026-04-06T16:00:00',
      status: 'Lagi Dikirim',
    },
    {
      senderName: 'PT Cipta Kemasan',
      recipientName: 'Rafli Kurniawan',
      courierId: 'EMP-003',
      origin: 'Tangerang',
      destination: 'Semarang',
      currentLocation: 'Hub Semarang',
      service: 'CargoKu Cargo',
      weightKg: 16.4,
      declaredValue: 1330000,
      shippedAt: '2026-04-09T07:30:00',
      deliveredAt: '2026-04-11T09:45:00',
      status: 'Sudah Dikirim',
    },
    {
      senderName: 'CV Pangan Prima',
      recipientName: 'Wulan Safitri',
      courierId: 'EMP-006',
      origin: 'Bogor',
      destination: 'Cirebon',
      currentLocation: 'Tol Cipali KM 112',
      service: 'CargoKu Reguler',
      weightKg: 7.8,
      declaredValue: 540000,
      shippedAt: '2026-04-12T12:45:00',
      status: 'Lagi Dikirim',
    },
    {
      senderName: 'PT Graha Mode',
      recipientName: 'Nadia Putri',
      courierId: 'EMP-008',
      origin: 'Bandung',
      destination: 'Yogyakarta',
      currentLocation: 'Yogyakarta',
      service: 'CargoKu Express',
      weightKg: 6.6,
      declaredValue: 960000,
      shippedAt: '2026-04-14T08:35:00',
      deliveredAt: '2026-04-15T17:25:00',
      status: 'Sudah Dikirim',
    },
    {
      senderName: 'Toko Herbal Nusantara',
      recipientName: 'Andi Wijaya',
      courierId: 'EMP-010',
      origin: 'Tasikmalaya',
      destination: 'Jakarta Barat',
      currentLocation: 'Cipularang KM 88',
      service: 'CargoKu Reguler',
      weightKg: 4.4,
      declaredValue: 415000,
      shippedAt: '2026-04-17T06:55:00',
      status: 'Lagi Dikirim',
    },
    {
      senderName: 'CV Sentra Plastik',
      recipientName: 'Maya Pratama',
      courierId: 'EMP-001',
      origin: 'Depok',
      destination: 'Cirebon',
      currentLocation: 'Cirebon',
      service: 'CargoKu Cargo',
      weightKg: 13.5,
      declaredValue: 1490000,
      shippedAt: '2026-04-19T09:45:00',
      deliveredAt: '2026-04-20T18:00:00',
      status: 'Sudah Dikirim',
    },
  ],
};

const weekSlots = ['M1', 'M1', 'M2', 'M2', 'M3', 'M3', 'M4', 'M4'];

export const adminPackages: AdminPackage[] = monthOptions.flatMap(({ value: monthKey }, monthIndex) =>
  (packagePlans[monthKey] ?? []).map((plan, planIndex) => {
    const assignedCourier = employeeDirectory.get(plan.courierId);

    return {
      ...plan,
      id: `PKT-${padValue(monthIndex * 8 + planIndex + 101, 3)}`,
      monthKey,
      week: weekSlots[planIndex] ?? 'M4',
      resi: `CKL${monthKey.replace('-', '')}${padValue(planIndex + 1)}`,
      courierName: assignedCourier?.name ?? 'Kurir Belum Diatur',
    };
  })
);

export const shippingServiceOptions = Array.from(new Set(adminPackages.map((item) => item.service)));

export const shippingLocationOptions = Array.from(
  new Set(
    adminPackages.flatMap((item) => [item.origin, item.destination, item.currentLocation])
  )
).sort();

export const deliveryChartByMonth = monthOptions.reduce<Record<string, DeliveryChartPoint[]>>(
  (accumulator, { value: monthKey }) => {
    accumulator[monthKey] = ['M1', 'M2', 'M3', 'M4'].map((week) => {
      const weekPackages = adminPackages.filter(
        (item) => item.monthKey === monthKey && item.week === week
      );

      return {
        week,
        terkirim: weekPackages.filter((item) => item.status === 'Sudah Dikirim').length,
        diproses: weekPackages.filter((item) => item.status === 'Lagi Dikirim').length,
      };
    });

    return accumulator;
  },
  {}
);

type AttendanceProfile = Omit<
  AttendanceRecord,
  'id' | 'monthKey' | 'employeeName' | 'division'
>;

const attendanceProfiles: Record<string, AttendanceProfile[]> = {
  '2026-01': [
    {
      employeeId: 'EMP-001',
      presentDays: 21,
      absentDays: 1,
      sickDays: 0,
      permitDays: 0,
      lateCount: 1,
      todayStatus: 'Hadir',
      lastAbsentDate: '2026-01-10',
    },
    {
      employeeId: 'EMP-002',
      presentDays: 20,
      absentDays: 1,
      sickDays: 1,
      permitDays: 0,
      lateCount: 1,
      todayStatus: 'Hadir',
      lastAbsentDate: '2026-01-16',
    },
    {
      employeeId: 'EMP-003',
      presentDays: 17,
      absentDays: 3,
      sickDays: 1,
      permitDays: 1,
      lateCount: 2,
      todayStatus: 'Izin',
      lastAbsentDate: '2026-01-27',
    },
    {
      employeeId: 'EMP-004',
      presentDays: 20,
      absentDays: 1,
      sickDays: 0,
      permitDays: 1,
      lateCount: 0,
      todayStatus: 'Hadir',
      lastAbsentDate: '2026-01-13',
    },
    {
      employeeId: 'EMP-005',
      presentDays: 15,
      absentDays: 4,
      sickDays: 1,
      permitDays: 2,
      lateCount: 3,
      todayStatus: 'Alpha',
      lastAbsentDate: '2026-01-29',
    },
    {
      employeeId: 'EMP-006',
      presentDays: 19,
      absentDays: 2,
      sickDays: 0,
      permitDays: 1,
      lateCount: 1,
      todayStatus: 'Hadir',
      lastAbsentDate: '2026-01-18',
    },
    {
      employeeId: 'EMP-007',
      presentDays: 20,
      absentDays: 1,
      sickDays: 0,
      permitDays: 0,
      lateCount: 0,
      todayStatus: 'Hadir',
      lastAbsentDate: '2026-01-22',
    },
    {
      employeeId: 'EMP-008',
      presentDays: 18,
      absentDays: 2,
      sickDays: 0,
      permitDays: 1,
      lateCount: 1,
      todayStatus: 'Hadir',
      lastAbsentDate: '2026-01-11',
    },
    {
      employeeId: 'EMP-009',
      presentDays: 19,
      absentDays: 1,
      sickDays: 1,
      permitDays: 0,
      lateCount: 2,
      todayStatus: 'Sakit',
      lastAbsentDate: '2026-01-20',
    },
    {
      employeeId: 'EMP-010',
      presentDays: 21,
      absentDays: 0,
      sickDays: 0,
      permitDays: 0,
      lateCount: 1,
      todayStatus: 'Hadir',
      lastAbsentDate: '2026-01-07',
    },
  ],
  '2026-02': [
    {
      employeeId: 'EMP-001',
      presentDays: 19,
      absentDays: 1,
      sickDays: 1,
      permitDays: 0,
      lateCount: 0,
      todayStatus: 'Hadir',
      lastAbsentDate: '2026-02-08',
    },
    {
      employeeId: 'EMP-002',
      presentDays: 18,
      absentDays: 2,
      sickDays: 0,
      permitDays: 1,
      lateCount: 2,
      todayStatus: 'Hadir',
      lastAbsentDate: '2026-02-21',
    },
    {
      employeeId: 'EMP-003',
      presentDays: 14,
      absentDays: 5,
      sickDays: 1,
      permitDays: 0,
      lateCount: 3,
      todayStatus: 'Alpha',
      lastAbsentDate: '2026-02-24',
    },
    {
      employeeId: 'EMP-004',
      presentDays: 19,
      absentDays: 1,
      sickDays: 0,
      permitDays: 1,
      lateCount: 0,
      todayStatus: 'Hadir',
      lastAbsentDate: '2026-02-14',
    },
    {
      employeeId: 'EMP-005',
      presentDays: 13,
      absentDays: 5,
      sickDays: 1,
      permitDays: 1,
      lateCount: 2,
      todayStatus: 'Sakit',
      lastAbsentDate: '2026-02-25',
    },
    {
      employeeId: 'EMP-006',
      presentDays: 18,
      absentDays: 1,
      sickDays: 0,
      permitDays: 1,
      lateCount: 1,
      todayStatus: 'Hadir',
      lastAbsentDate: '2026-02-11',
    },
    {
      employeeId: 'EMP-007',
      presentDays: 19,
      absentDays: 0,
      sickDays: 1,
      permitDays: 0,
      lateCount: 0,
      todayStatus: 'Hadir',
      lastAbsentDate: '2026-02-06',
    },
    {
      employeeId: 'EMP-008',
      presentDays: 17,
      absentDays: 3,
      sickDays: 0,
      permitDays: 1,
      lateCount: 1,
      todayStatus: 'Izin',
      lastAbsentDate: '2026-02-18',
    },
    {
      employeeId: 'EMP-009',
      presentDays: 18,
      absentDays: 2,
      sickDays: 0,
      permitDays: 0,
      lateCount: 2,
      todayStatus: 'Hadir',
      lastAbsentDate: '2026-02-09',
    },
    {
      employeeId: 'EMP-010',
      presentDays: 20,
      absentDays: 0,
      sickDays: 0,
      permitDays: 0,
      lateCount: 1,
      todayStatus: 'Hadir',
      lastAbsentDate: '2026-02-03',
    },
  ],
  '2026-03': [
    {
      employeeId: 'EMP-001',
      presentDays: 20,
      absentDays: 0,
      sickDays: 1,
      permitDays: 0,
      lateCount: 1,
      todayStatus: 'Hadir',
      lastAbsentDate: '2026-03-04',
    },
    {
      employeeId: 'EMP-002',
      presentDays: 19,
      absentDays: 1,
      sickDays: 0,
      permitDays: 1,
      lateCount: 1,
      todayStatus: 'Hadir',
      lastAbsentDate: '2026-03-19',
    },
    {
      employeeId: 'EMP-003',
      presentDays: 16,
      absentDays: 4,
      sickDays: 1,
      permitDays: 0,
      lateCount: 2,
      todayStatus: 'Alpha',
      lastAbsentDate: '2026-03-26',
    },
    {
      employeeId: 'EMP-004',
      presentDays: 18,
      absentDays: 2,
      sickDays: 0,
      permitDays: 1,
      lateCount: 0,
      todayStatus: 'Hadir',
      lastAbsentDate: '2026-03-15',
    },
    {
      employeeId: 'EMP-005',
      presentDays: 12,
      absentDays: 6,
      sickDays: 1,
      permitDays: 1,
      lateCount: 4,
      todayStatus: 'Alpha',
      lastAbsentDate: '2026-03-28',
    },
    {
      employeeId: 'EMP-006',
      presentDays: 19,
      absentDays: 1,
      sickDays: 0,
      permitDays: 1,
      lateCount: 1,
      todayStatus: 'Hadir',
      lastAbsentDate: '2026-03-12',
    },
    {
      employeeId: 'EMP-007',
      presentDays: 20,
      absentDays: 0,
      sickDays: 0,
      permitDays: 1,
      lateCount: 0,
      todayStatus: 'Hadir',
      lastAbsentDate: '2026-03-08',
    },
    {
      employeeId: 'EMP-008',
      presentDays: 17,
      absentDays: 2,
      sickDays: 1,
      permitDays: 1,
      lateCount: 2,
      todayStatus: 'Sakit',
      lastAbsentDate: '2026-03-17',
    },
    {
      employeeId: 'EMP-009',
      presentDays: 18,
      absentDays: 1,
      sickDays: 0,
      permitDays: 1,
      lateCount: 1,
      todayStatus: 'Hadir',
      lastAbsentDate: '2026-03-10',
    },
    {
      employeeId: 'EMP-010',
      presentDays: 19,
      absentDays: 1,
      sickDays: 0,
      permitDays: 0,
      lateCount: 1,
      todayStatus: 'Hadir',
      lastAbsentDate: '2026-03-05',
    },
  ],
  '2026-04': [
    {
      employeeId: 'EMP-001',
      presentDays: 19,
      absentDays: 1,
      sickDays: 0,
      permitDays: 1,
      lateCount: 0,
      todayStatus: 'Hadir',
      lastAbsentDate: '2026-04-04',
    },
    {
      employeeId: 'EMP-002',
      presentDays: 18,
      absentDays: 0,
      sickDays: 1,
      permitDays: 1,
      lateCount: 1,
      todayStatus: 'Hadir',
      lastAbsentDate: '2026-04-08',
    },
    {
      employeeId: 'EMP-003',
      presentDays: 15,
      absentDays: 4,
      sickDays: 1,
      permitDays: 0,
      lateCount: 2,
      todayStatus: 'Alpha',
      lastAbsentDate: '2026-04-19',
    },
    {
      employeeId: 'EMP-004',
      presentDays: 16,
      absentDays: 2,
      sickDays: 0,
      permitDays: 2,
      lateCount: 0,
      todayStatus: 'Hadir',
      lastAbsentDate: '2026-04-11',
    },
    {
      employeeId: 'EMP-005',
      presentDays: 11,
      absentDays: 6,
      sickDays: 1,
      permitDays: 2,
      lateCount: 3,
      todayStatus: 'Alpha',
      lastAbsentDate: '2026-04-18',
    },
    {
      employeeId: 'EMP-006',
      presentDays: 18,
      absentDays: 1,
      sickDays: 0,
      permitDays: 1,
      lateCount: 1,
      todayStatus: 'Hadir',
      lastAbsentDate: '2026-04-05',
    },
    {
      employeeId: 'EMP-007',
      presentDays: 19,
      absentDays: 0,
      sickDays: 0,
      permitDays: 1,
      lateCount: 0,
      todayStatus: 'Hadir',
      lastAbsentDate: '2026-04-09',
    },
    {
      employeeId: 'EMP-008',
      presentDays: 16,
      absentDays: 3,
      sickDays: 0,
      permitDays: 1,
      lateCount: 2,
      todayStatus: 'Izin',
      lastAbsentDate: '2026-04-16',
    },
    {
      employeeId: 'EMP-009',
      presentDays: 17,
      absentDays: 2,
      sickDays: 0,
      permitDays: 1,
      lateCount: 1,
      todayStatus: 'Hadir',
      lastAbsentDate: '2026-04-12',
    },
    {
      employeeId: 'EMP-010',
      presentDays: 18,
      absentDays: 1,
      sickDays: 0,
      permitDays: 0,
      lateCount: 1,
      todayStatus: 'Hadir',
      lastAbsentDate: '2026-04-02',
    },
  ],
};

export const attendanceRecords: AttendanceRecord[] = monthOptions.flatMap(({ value: monthKey }) =>
  (attendanceProfiles[monthKey] ?? []).map((profile, index) => {
    const employee = employeeDirectory.get(profile.employeeId);

    return {
      id: `ATT-${padValue(index + 1, 3)}-${monthKey.slice(-2)}`,
      monthKey,
      employeeId: profile.employeeId,
      employeeName: employee?.name ?? 'Karyawan',
      division: employee?.division ?? 'Operasional',
      presentDays: profile.presentDays,
      absentDays: profile.absentDays,
      sickDays: profile.sickDays,
      permitDays: profile.permitDays,
      lateCount: profile.lateCount,
      todayStatus: profile.todayStatus,
      lastAbsentDate: profile.lastAbsentDate,
    };
  })
);

const packageDirectory = new Map(adminPackages.map((item) => [item.resi, item]));

const buildHistoryItem = (
  id: string,
  type: ShipmentHistoryType,
  resi: string
): ShipmentHistoryItem => {
  const packageItem = packageDirectory.get(resi);

  return {
    id,
    type,
    resi,
    route: packageItem
      ? `${packageItem.origin} - ${packageItem.destination}`
      : 'Rute belum tersedia',
    status: packageItem?.status ?? 'Sudah Dikirim',
    date: (packageItem?.deliveredAt ?? packageItem?.shippedAt ?? '2026-04-01T08:00:00').slice(
      0,
      10
    ),
  };
};

type CustomerPlan = Omit<CustomerAccount, 'histories'> & {
  histories: Array<{
    id: string;
    type: ShipmentHistoryType;
    resi: string;
  }>;
};

const customerPlans: CustomerPlan[] = [
  {
    id: 'CUS-001',
    name: 'Andi Wijaya',
    address: 'Jl. Kenanga No. 12, Jakarta Selatan',
    email: 'andi.wijaya@cargoku.com',
    phone: '08123456789',
    totalSent: 12,
    totalReceived: 8,
    lastActivity: '2026-04-18',
    histories: [
      { id: 'HIS-001', type: 'Mengirim', resi: 'CKL2026040007' },
      { id: 'HIS-002', type: 'Menerima', resi: 'CKL2026040002' },
    ],
  },
  {
    id: 'CUS-002',
    name: 'Siti Rahayu',
    address: 'Jl. Merpati No. 8, Bandung',
    email: 'siti.rahayu@cargoku.com',
    phone: '08198765432',
    totalSent: 5,
    totalReceived: 14,
    lastActivity: '2026-04-15',
    histories: [
      { id: 'HIS-003', type: 'Menerima', resi: 'CKL2026040006' },
      { id: 'HIS-004', type: 'Mengirim', resi: 'CKL2026030003' },
    ],
  },
  {
    id: 'CUS-003',
    name: 'Linda Kusuma',
    address: 'Jl. Anggrek No. 24, Bekasi',
    email: 'linda.kusuma@example.com',
    phone: '081876543210',
    totalSent: 7,
    totalReceived: 6,
    lastActivity: '2026-04-06',
    histories: [
      { id: 'HIS-005', type: 'Menerima', resi: 'CKL2026040003' },
      { id: 'HIS-006', type: 'Mengirim', resi: 'CKL2026020006' },
    ],
  },
  {
    id: 'CUS-004',
    name: 'Rafli Kurniawan',
    address: 'Jl. Tidar No. 9, Semarang',
    email: 'rafli.kurniawan@example.com',
    phone: '081455667788',
    totalSent: 9,
    totalReceived: 11,
    lastActivity: '2026-04-11',
    histories: [
      { id: 'HIS-007', type: 'Menerima', resi: 'CKL2026040004' },
      { id: 'HIS-008', type: 'Mengirim', resi: 'CKL2026020002' },
    ],
  },
  {
    id: 'CUS-005',
    name: 'Wulan Safitri',
    address: 'Jl. Slamet Riyadi No. 16, Solo',
    email: 'wulan.safitri@example.com',
    phone: '081566778899',
    totalSent: 8,
    totalReceived: 10,
    lastActivity: '2026-04-12',
    histories: [
      { id: 'HIS-009', type: 'Menerima', resi: 'CKL2026040005' },
      { id: 'HIS-010', type: 'Mengirim', resi: 'CKL2026010006' },
    ],
  },
  {
    id: 'CUS-006',
    name: 'Nadia Putri',
    address: 'Jl. Diponegoro No. 4, Yogyakarta',
    email: 'nadia.putri@example.com',
    phone: '081622334455',
    totalSent: 6,
    totalReceived: 9,
    lastActivity: '2026-04-15',
    histories: [
      { id: 'HIS-011', type: 'Menerima', resi: 'CKL2026040006' },
      { id: 'HIS-012', type: 'Mengirim', resi: 'CKL2026020007' },
    ],
  },
  {
    id: 'CUS-007',
    name: 'Yusuf Hamdan',
    address: 'Jl. Adi Sucipto No. 20, Solo',
    email: 'yusuf.hamdan@example.com',
    phone: '081733445566',
    totalSent: 4,
    totalReceived: 7,
    lastActivity: '2026-02-26',
    histories: [
      { id: 'HIS-013', type: 'Menerima', resi: 'CKL2026020008' },
      { id: 'HIS-014', type: 'Mengirim', resi: 'CKL2026030006' },
    ],
  },
  {
    id: 'CUS-008',
    name: 'Mira Anggraini',
    address: 'Jl. Siliwangi No. 21, Tasikmalaya',
    email: 'mira.anggraini@example.com',
    phone: '081844556677',
    totalSent: 11,
    totalReceived: 5,
    lastActivity: '2026-03-17',
    histories: [
      { id: 'HIS-015', type: 'Menerima', resi: 'CKL2026030005' },
      { id: 'HIS-016', type: 'Mengirim', resi: 'CKL2026040001' },
    ],
  },
  {
    id: 'CUS-009',
    name: 'Galih Pramana',
    address: 'Jl. Darmo No. 5, Surabaya',
    email: 'galih.pramana@example.com',
    phone: '081955667788',
    totalSent: 10,
    totalReceived: 12,
    lastActivity: '2026-03-12',
    histories: [
      { id: 'HIS-017', type: 'Menerima', resi: 'CKL2026030004' },
      { id: 'HIS-018', type: 'Mengirim', resi: 'CKL2026020005' },
    ],
  },
  {
    id: 'CUS-010',
    name: 'Maya Pratama',
    address: 'Jl. Gatot Subroto No. 88, Jakarta',
    email: 'maya.pratama@cargoku.com',
    phone: '081299887766',
    totalSent: 13,
    totalReceived: 15,
    lastActivity: '2026-04-20',
    histories: [
      { id: 'HIS-019', type: 'Menerima', resi: 'CKL2026040008' },
      { id: 'HIS-020', type: 'Mengirim', resi: 'CKL2026010001' },
    ],
  },
];

export const customers: CustomerAccount[] = customerPlans.map((customer) => ({
  ...customer,
  histories: customer.histories.map((history) =>
    buildHistoryItem(history.id, history.type, history.resi)
  ),
}));

export const managerProfile = {
  employeeId: 'ADM-001',
  name: 'Maya Pratama',
  email: 'maya.pratama@cargoku.com',
  phone: '081299887766',
  address: 'Jl. Gatot Subroto No. 88, Jakarta',
  department: 'Manajemen Operasional',
  startDate: '2022-05-14',
  bio: 'Manager operasional yang fokus pada kestabilan SLA pengiriman, peningkatan keamanan data, dan pembinaan tim kurir lintas area.',
};
