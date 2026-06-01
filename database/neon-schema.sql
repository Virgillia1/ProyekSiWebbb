DROP TABLE IF EXISTS customer_histories;
DROP TABLE IF EXISTS user_accounts;
DROP TABLE IF EXISTS package_tracking_events;
DROP TABLE IF EXISTS attendance_records;
DROP TABLE IF EXISTS packages;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS manager_profiles;
DROP TABLE IF EXISTS vehicles;

CREATE TABLE vehicles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  plate_number TEXT NOT NULL UNIQUE,
  capacity TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Tersedia', 'Sedang Jalan', 'Servis'))
);

CREATE TABLE manager_profiles (
  employee_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  department TEXT NOT NULL,
  start_date DATE NOT NULL,
  bio TEXT NOT NULL
);

CREATE TABLE employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  origin TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 0),
  years_working INTEGER NOT NULL CHECK (years_working >= 0),
  salary BIGINT NOT NULL CHECK (salary >= 0),
  status TEXT NOT NULL CHECK (status IN ('Aktif', 'Nonaktif')),
  division TEXT NOT NULL,
  position TEXT NOT NULL,
  phone TEXT NOT NULL,
  performance_score INTEGER NOT NULL CHECK (performance_score BETWEEN 0 AND 100)
);

CREATE TABLE packages (
  id TEXT PRIMARY KEY,
  month_key TEXT NOT NULL,
  week TEXT NOT NULL,
  resi TEXT NOT NULL UNIQUE,
  sender_name TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  courier_id TEXT NOT NULL,
  courier_name TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  current_location TEXT NOT NULL,
  service TEXT NOT NULL,
  weight_kg NUMERIC(10, 2) NOT NULL CHECK (weight_kg >= 0),
  declared_value BIGINT NOT NULL CHECK (declared_value >= 0),
  shipped_at TIMESTAMP NOT NULL,
  delivered_at TIMESTAMP NULL,
  status TEXT NOT NULL CHECK (status IN ('Diproses', 'Dalam Pengiriman', 'Sampai Tujuan', 'Pending', 'Selesai')),
  recipient_phone TEXT NULL,
  item_type TEXT NULL,
  shipping_cost BIGINT NOT NULL DEFAULT 0,
  vehicle_type TEXT NULL,
  delivery_type TEXT NOT NULL DEFAULT 'Reguler' CHECK (delivery_type IN ('Vvip', 'Cepat', 'Reguler')),
  description TEXT NULL,
  item_status TEXT NOT NULL DEFAULT 'Baik' CHECK (item_status IN ('Baik', 'Rusak', 'Dalam Pemeriksaan')),
  transaction_status TEXT NOT NULL DEFAULT 'Belum Bayar' CHECK (transaction_status IN ('Belum Bayar', 'Lunas', 'Pending'))
);

CREATE TABLE package_tracking_events (
  id TEXT PRIMARY KEY,
  package_id TEXT NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  resi TEXT NOT NULL,
  status TEXT NOT NULL,
  location TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT NULL
);

CREATE TABLE attendance_records (
  id TEXT PRIMARY KEY,
  month_key TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  division TEXT NOT NULL,
  present_days INTEGER NOT NULL CHECK (present_days >= 0),
  absent_days INTEGER NOT NULL CHECK (absent_days >= 0),
  sick_days INTEGER NOT NULL CHECK (sick_days >= 0),
  permit_days INTEGER NOT NULL CHECK (permit_days >= 0),
  late_count INTEGER NOT NULL CHECK (late_count >= 0),
  today_status TEXT NOT NULL CHECK (today_status IN ('Hadir', 'Izin', 'Sakit', 'Alpha')),
  last_absent_date DATE NOT NULL
);

CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  total_sent INTEGER NOT NULL CHECK (total_sent >= 0),
  total_received INTEGER NOT NULL CHECK (total_received >= 0),
  last_activity DATE NOT NULL
);

CREATE TABLE user_accounts (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer', 'admin')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NULL,
  address TEXT NULL,
  avatar_url TEXT NULL,
  customer_id TEXT NULL UNIQUE REFERENCES customers(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer_histories (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Mengirim', 'Menerima')),
  resi TEXT NOT NULL,
  route TEXT NOT NULL,
  status TEXT NOT NULL,
  date DATE NOT NULL
);

CREATE INDEX idx_packages_month_key ON packages(month_key);
CREATE INDEX idx_packages_courier_id ON packages(courier_id);
CREATE INDEX idx_packages_status ON packages(status);
CREATE INDEX idx_package_tracking_events_package_id ON package_tracking_events(package_id);
CREATE INDEX idx_package_tracking_events_resi ON package_tracking_events(resi);
CREATE INDEX idx_attendance_records_month_key ON attendance_records(month_key);
CREATE INDEX idx_attendance_records_employee_id ON attendance_records(employee_id);
CREATE INDEX idx_user_accounts_role ON user_accounts(role);
CREATE INDEX idx_user_accounts_customer_id ON user_accounts(customer_id);
CREATE INDEX idx_customer_histories_customer_id ON customer_histories(customer_id);
CREATE INDEX idx_customer_histories_resi ON customer_histories(resi);
