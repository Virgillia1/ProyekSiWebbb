import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  adminPackages,
  attendanceRecords,
  customers,
  employees,
  managerProfile,
  vehicles,
} from '../src/app/data/adminData.ts';
import { createPasswordHash } from '../server/password-hash.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'database');
const outputPath = path.join(outputDir, 'neon-seed.sql');

const quote = (value) => {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : 'NULL';
  }

  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }

  return `'${String(value).replace(/'/g, "''")}'`;
};

const buildInsert = (tableName, columns, rows) => {
  if (!rows.length) {
    return '';
  }

  const valuesSql = rows
    .map((row) => `  (${columns.map((column) => quote(row[column])).join(', ')})`)
    .join(',\n');

  return `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES\n${valuesSql};`;
};

const pad = (value) => String(value).padStart(2, '0');

const formatTimestamp = (date) =>
  [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-') +
  `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

const parseTimestamp = (value) => {
  const normalized = String(value).trim().replace(' ', 'T');

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(normalized)) {
    const [datePart, timePart] = normalized.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds);
  }

  return new Date(normalized);
};

const addHours = (value, hours) => {
  const date = parseTimestamp(value);
  date.setHours(date.getHours() + hours);
  return formatTimestamp(date);
};

const trackingEvents = adminPackages.flatMap((item) => {
  const deliveredTimestamp = item.deliveredAt ?? addHours(item.shippedAt, 24);
  const baseEvents = [
    {
      id: `EVT-${item.id}-01`,
      package_id: item.id,
      resi: item.resi,
      status: 'Paket Diterima di Gudang',
      location: item.origin,
      timestamp: item.shippedAt,
      description: `Paket telah diterima di gudang CargoLite ${item.origin}`,
      photo_url: null,
    },
    {
      id: `EVT-${item.id}-02`,
      package_id: item.id,
      resi: item.resi,
      status: 'Dalam Proses Sortir',
      location: item.origin,
      timestamp: addHours(item.shippedAt, 2),
      description: 'Paket sedang dalam proses sortir sebelum diberangkatkan.',
      photo_url: null,
    },
  ];

  if (item.status === 'Sudah Dikirim') {
    return [
      ...baseEvents,
      {
        id: `EVT-${item.id}-03`,
        package_id: item.id,
        resi: item.resi,
        status: 'Dalam Pengiriman',
        location: item.destination,
        timestamp: addHours(item.shippedAt, 8),
        description: `Paket sedang dalam perjalanan menuju ${item.destination}.`,
        photo_url: null,
      },
      {
        id: `EVT-${item.id}-04`,
        package_id: item.id,
        resi: item.resi,
        status: 'Paket Terkirim',
        location: item.destination,
        timestamp: deliveredTimestamp,
        description: `Paket telah diterima oleh ${item.recipientName}.`,
        photo_url: null,
      },
    ];
  }

  return [
    ...baseEvents,
    {
      id: `EVT-${item.id}-03`,
      package_id: item.id,
      resi: item.resi,
      status: 'Dalam Pengiriman',
      location: item.currentLocation,
      timestamp: addHours(item.shippedAt, 8),
      description: `Paket sedang dalam perjalanan menuju ${item.destination}.`,
      photo_url: null,
    },
  ];
});

const customerHistories = customers.flatMap((customer) =>
  customer.histories.map((history) => ({
    id: history.id,
    customer_id: customer.id,
    type: history.type,
    resi: history.resi,
    route: history.route,
    status: history.status,
    date: history.date,
  }))
);

const andiCustomer =
  customers.find((customer) => customer.email.toLowerCase() === 'andi.wijaya@cargolite.com') ??
  customers[0];

const sitiCustomer =
  customers.find((customer) => customer.email.toLowerCase() === 'siti.rahayu@cargolite.com') ??
  customers[1];

const userAccounts = await Promise.all(
  [
    {
      id: 'USR-SEED-001',
      username: 'andi',
      password: 'andi123',
      role: 'customer',
      name: andiCustomer.name,
      email: andiCustomer.email,
      phone: andiCustomer.phone,
      address: andiCustomer.address,
      avatar_url: null,
      customer_id: andiCustomer.id,
    },
    {
      id: 'USR-SEED-002',
      username: 'siti',
      password: 'siti123',
      role: 'customer',
      name: sitiCustomer.name,
      email: sitiCustomer.email,
      phone: sitiCustomer.phone,
      address: sitiCustomer.address,
      avatar_url: null,
      customer_id: sitiCustomer.id,
    },
    {
      id: 'USR-SEED-003',
      username: 'admin_maya',
      password: 'maya123',
      role: 'admin',
      name: managerProfile.name,
      email: managerProfile.email,
      phone: managerProfile.phone,
      address: managerProfile.address,
      avatar_url: null,
      customer_id: null,
    },
    {
      id: 'USR-SEED-004',
      username: 'admin_raka',
      password: 'raka123',
      role: 'admin',
      name: 'Raka Adinata',
      email: 'raka.adinata@cargolite.com',
      phone: '081377665544',
      address: 'Jl. Sisingamangaraja No. 17, Jakarta',
      avatar_url: null,
      customer_id: null,
    },
  ].map(async (account) => ({
    ...account,
    password_hash: await createPasswordHash(account.password),
  }))
);

const sqlSections = [
  '-- Generated from src/app/data/adminData.ts',
  '-- Safe for local/dev dummy data refresh in Neon',
  'BEGIN;',
  'TRUNCATE TABLE courier_accounts, user_accounts, customer_histories, package_tracking_events, attendance_records, packages, customers, couriers, manager_profiles, vehicles RESTART IDENTITY CASCADE;',
  buildInsert(
    'vehicles',
    ['id', 'name', 'type', 'plate_number', 'capacity', 'status'],
    vehicles.map((vehicle) => ({
      id: vehicle.id,
      name: vehicle.name,
      type: vehicle.type,
      plate_number: vehicle.plateNumber,
      capacity: vehicle.capacity,
      status: vehicle.status,
    }))
  ),
  buildInsert(
    'couriers',
    [
      'id',
      'name',
      'base_area',
      'coverage_area',
      'vehicle_type',
      'vehicle_plate',
      'phone',
      'status',
      'completed_deliveries',
      'performance_score',
    ],
    employees.map((employee) => ({
      id: employee.id,
      name: employee.name,
      base_area: employee.baseArea,
      coverage_area: employee.coverageArea,
      vehicle_type: employee.vehicleType,
      vehicle_plate: employee.vehiclePlate || null,
      phone: employee.phone,
      status: employee.status,
      completed_deliveries: employee.completedDeliveries,
      performance_score: employee.performanceScore,
    }))
  ),
  buildInsert(
    'packages',
    [
      'id',
      'month_key',
      'week',
      'resi',
      'sender_name',
      'recipient_name',
      'courier_id',
      'courier_name',
      'origin',
      'destination',
      'current_location',
      'service',
      'weight_kg',
      'declared_value',
      'shipped_at',
      'delivered_at',
      'status',
      'recipient_phone',
      'item_type',
      'shipping_cost',
      'vehicle_type',
      'delivery_type',
      'description',
      'item_status',
      'transaction_status',
    ],
    adminPackages.map((item) => ({
      id: item.id,
      month_key: item.monthKey,
      week: item.week,
      resi: item.resi,
      sender_name: item.senderName,
      recipient_name: item.recipientName,
      courier_id: item.courierId,
      courier_name: item.courierName,
      origin: item.origin,
      destination: item.destination,
      current_location: item.currentLocation,
      service: item.service,
      weight_kg: item.weightKg,
      declared_value: item.declaredValue,
      shipped_at: item.shippedAt,
      delivered_at: item.deliveredAt ?? null,
      status: item.status,
      recipient_phone: item.recipientPhone ?? null,
      item_type: item.itemType ?? null,
      shipping_cost: item.shippingCost ?? 0,
      vehicle_type: item.vehicleType ?? null,
      delivery_type: item.deliveryType ?? 'Reguler',
      description: item.description ?? null,
      item_status: item.itemStatus ?? 'Baik',
      transaction_status: item.transactionStatus ?? 'Belum Bayar',
    }))
  ),
  buildInsert(
    'package_tracking_events',
    ['id', 'package_id', 'resi', 'status', 'location', 'timestamp', 'description', 'photo_url'],
    trackingEvents
  ),
  buildInsert(
    'attendance_records',
    [
      'id',
      'month_key',
      'employee_id',
      'employee_name',
      'division',
      'present_days',
      'absent_days',
      'sick_days',
      'permit_days',
      'late_count',
      'today_status',
      'last_absent_date',
    ],
    attendanceRecords.map((item) => ({
      id: item.id,
      month_key: item.monthKey,
      employee_id: item.employeeId,
      employee_name: item.employeeName,
      division: item.division,
      present_days: item.presentDays,
      absent_days: item.absentDays,
      sick_days: item.sickDays,
      permit_days: item.permitDays,
      late_count: item.lateCount,
      today_status: item.todayStatus,
      last_absent_date: item.lastAbsentDate,
    }))
  ),
  buildInsert(
    'customers',
    [
      'id',
      'name',
      'address',
      'email',
      'phone',
      'total_sent',
      'total_received',
      'last_activity',
    ],
    customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      address: customer.address,
      email: customer.email,
      phone: customer.phone,
      total_sent: customer.totalSent,
      total_received: customer.totalReceived,
      last_activity: customer.lastActivity,
    }))
  ),
  buildInsert(
    'user_accounts',
    [
      'id',
      'username',
      'password_hash',
      'role',
      'name',
      'email',
      'phone',
      'address',
      'avatar_url',
      'customer_id',
    ],
    userAccounts
  ),
  buildInsert(
    'customer_histories',
    ['id', 'customer_id', 'type', 'resi', 'route', 'status', 'date'],
    customerHistories
  ),
  buildInsert(
    'manager_profiles',
    ['employee_id', 'name', 'email', 'phone', 'address', 'department', 'start_date', 'bio'],
    [
      {
        employee_id: managerProfile.employeeId,
        name: managerProfile.name,
        email: managerProfile.email,
        phone: managerProfile.phone,
        address: managerProfile.address,
        department: managerProfile.department,
        start_date: managerProfile.startDate,
        bio: managerProfile.bio,
      },
    ]
  ),
  'COMMIT;',
].filter(Boolean);

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(outputPath, `${sqlSections.join('\n\n')}\n`, 'utf8');

console.log(`Seed SQL written to ${path.relative(rootDir, outputPath)}`);
console.log(
  [
    `couriers=${employees.length}`,
    `packages=${adminPackages.length}`,
    `package_tracking_events=${trackingEvents.length}`,
    `attendance_records=${attendanceRecords.length}`,
    `customers=${customers.length}`,
    `user_accounts=${userAccounts.length}`,
    `customer_histories=${customerHistories.length}`,
    `vehicles=${vehicles.length}`,
  ].join(', ')
);
