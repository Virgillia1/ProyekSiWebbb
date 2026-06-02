import { pool, withTransaction } from './db.mjs';
import { ConflictError, NotFoundError } from './errors.mjs';

const pad = (value) => String(value).padStart(2, '0');

const formatDateValue = (date) =>
  [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-');

const formatTimestampValue = (date) =>
  `${formatDateValue(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

const isDateOnlyString = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const toDateString = (value) => {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return isDateOnlyString(value) ? value : value.slice(0, 10);
  }

  return formatDateValue(new Date(value));
};

const toTimestampString = (value) => {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().replace(' ', 'T');

    if (isDateOnlyString(normalized)) {
      return `${normalized}T00:00:00`;
    }

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(normalized)) {
      return normalized;
    }

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+$/.test(normalized)) {
      return normalized.slice(0, 19);
    }

    return formatTimestampValue(new Date(normalized));
  }

  return formatTimestampValue(new Date(value));
};

const mapPackageStatusToTrackingStatus = (status) =>
  status === 'Selesai' ? 'Paket Terkirim' : 'Dalam Pengiriman';

const normalizeTransactionStatusForApi = (status) =>
  status === 'Bayar' || status === 'Lunas' ? 'Bayar' : 'Belum Bayar';

const normalizeTransactionStatusForStorage = (status) =>
  status === 'Bayar' || status === 'Lunas' ? 'Lunas' : 'Belum Bayar';

const buildPackageTrackingDescription = (packageData) =>
  packageData.status === 'Selesai'
    ? `Paket telah diterima di ${packageData.destination}.`
    : `Paket sedang berada di ${packageData.currentLocation} menuju ${packageData.destination}.`;

const mapEmployeeRow = (row) => ({
  id: row.id,
  name: row.name,
  baseArea: row.base_area,
  coverageArea: row.coverage_area,
  vehicleType: row.vehicle_type,
  vehiclePlate: row.vehicle_plate ?? '',
  phone: row.phone,
  status: row.status,
  completedDeliveries: Number(row.completed_deliveries ?? 0),
  performanceScore: Number(row.performance_score),
});

const mapPackageRow = (row) => ({
  id: row.id,
  monthKey: row.month_key,
  week: row.week,
  resi: row.resi,
  senderName: row.sender_name,
  recipientName: row.recipient_name,
  courierId: row.courier_id,
  courierName: row.courier_name,
  origin: row.origin,
  destination: row.destination,
  currentLocation: row.current_location,
  service: row.service,
  weightKg: Number(row.weight_kg),
  declaredValue: Number(row.declared_value),
  shippedAt: toTimestampString(row.shipped_at),
  deliveredAt: row.delivered_at ? toTimestampString(row.delivered_at) : undefined,
  status: row.status,
  recipientPhone: row.recipient_phone,
  itemType: row.item_type,
  shippingCost: Number(row.shipping_cost),
  vehicleType: row.vehicle_type,
  deliveryType: row.delivery_type,
  description: row.description,
  itemStatus: row.item_status,
  transactionStatus: normalizeTransactionStatusForApi(row.transaction_status),
});

const mapAttendanceRow = (row) => ({
  id: row.id,
  monthKey: row.month_key,
  employeeId: row.employee_id,
  employeeName: row.employee_name,
  division: row.division,
  presentDays: Number(row.present_days),
  absentDays: Number(row.absent_days),
  sickDays: Number(row.sick_days),
  permitDays: Number(row.permit_days),
  lateCount: Number(row.late_count),
  todayStatus: row.today_status,
  lastAbsentDate: toDateString(row.last_absent_date),
});

const mapHistoryRow = (row) => ({
  id: row.id,
  type: row.type,
  resi: row.resi,
  route: row.route,
  status: row.status,
  date: toDateString(row.date),
});

const mapTrackingEventRow = (row) => ({
  id: row.id,
  deliveryId: row.package_id,
  status: row.status,
  location: row.location,
  timestamp: toTimestampString(row.timestamp),
  description: row.description,
  photoUrl: row.photo_url ?? undefined,
});

const mapCustomerRow = (row, histories) => ({
  id: row.id,
  name: row.name,
  address: row.address,
  email: row.email,
  phone: row.phone,
  totalSent: Number(row.total_sent),
  totalReceived: Number(row.total_received),
  lastActivity: toDateString(row.last_activity),
  histories,
});

const mapManagerProfileRow = (row) => ({
  employeeId: row.employee_id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  address: row.address,
  department: row.department,
  startDate: toDateString(row.start_date),
  bio: row.bio,
});

const formatCourierRating = (performanceScore) =>
  Number(Math.max(0, Math.min(5, performanceScore / 20)).toFixed(1));

const estimateDeliveryDate = (packageItem) => {
  if (packageItem.deliveredAt) {
    return packageItem.deliveredAt;
  }

  const baseDate = new Date(packageItem.shippedAt);
  const service = packageItem.service.toLowerCase();

  if (service.includes('same day')) {
    baseDate.setHours(baseDate.getHours() + 8);
  } else if (service.includes('express')) {
    baseDate.setDate(baseDate.getDate() + 1);
  } else if (service.includes('cargo')) {
    baseDate.setDate(baseDate.getDate() + 3);
  } else {
    baseDate.setDate(baseDate.getDate() + 2);
  }

  return formatTimestampValue(baseDate);
};

const findCustomerByName = (customers, name) =>
  customers.find((customer) => customer.name.toLowerCase() === name.toLowerCase()) ?? null;

const insertPackageTrackingSnapshot = async (client, packageData, timestamp) => {
  const eventTimestamp =
    toTimestampString(timestamp) ??
    toTimestampString(packageData.deliveredAt ?? packageData.shippedAt ?? new Date());

  await client.query(
    `
      INSERT INTO package_tracking_events (
        id, package_id, resi, status, location, timestamp, description, photo_url
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8
      )
    `,
    [
      `EVT-${packageData.id}-${Date.now()}`,
      packageData.id,
      packageData.resi,
      mapPackageStatusToTrackingStatus(packageData.status),
      packageData.currentLocation,
      eventTimestamp,
      buildPackageTrackingDescription(packageData),
      null,
    ]
  );
};

const mapPackageToTrackingDelivery = (packageItem, trackingEvents, courier, recipientCustomer) => ({
  id: packageItem.id,
  resiNumber: packageItem.resi,
  senderName: packageItem.senderName,
  recipientName: packageItem.recipientName,
  origin: packageItem.origin,
  destination: packageItem.destination,
  currentStatus:
    trackingEvents[trackingEvents.length - 1]?.status ??
    (packageItem.status === 'Selesai' ? 'Paket Terkirim' : 'Dalam Pengiriman'),
  weight: packageItem.weightKg,
  estimatedDelivery: estimateDeliveryDate(packageItem),
  historyLogs: trackingEvents,
  courierName: packageItem.courierName,
  courierPhone: courier?.phone,
  courierRating: courier ? formatCourierRating(courier.performanceScore) : undefined,
  chatMessages: [],
  recipientPhone: recipientCustomer?.phone,
});

const mapPackageToCourierDelivery = (packageItem, trackingEvents, recipientCustomer) => ({
  id: packageItem.id,
  resiNumber: packageItem.resi,
  recipient: packageItem.recipientName,
  recipientPhone: recipientCustomer?.phone ?? '-',
  destination: packageItem.destination,
  currentLocation: packageItem.currentLocation,
  status: trackingEvents[trackingEvents.length - 1]?.status ?? packageItem.status,
  estimatedTime:
    packageItem.status === 'Selesai'
      ? 'Terkirim'
      : new Date(estimateDeliveryDate(packageItem)).toLocaleString('id-ID', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
  weight: `${packageItem.weightKg} kg`,
  statusColor:
    (trackingEvents[trackingEvents.length - 1]?.status ?? '').includes('Terkirim')
      ? 'text-green-600'
      : 'text-primary',
  bgColor:
    (trackingEvents[trackingEvents.length - 1]?.status ?? '').includes('Terkirim')
      ? 'bg-green-50'
      : 'bg-primary/10',
  history: trackingEvents.map((event) => ({
    status: event.status,
    location: event.location,
    timestamp: event.timestamp,
    description: event.description,
    photoUrl: event.photoUrl,
  })),
});

const getTrackingEvents = async (client = pool) => {
  const { rows } = await client.query(
    'SELECT * FROM package_tracking_events ORDER BY package_id, timestamp, id'
  );
  return rows.map(mapTrackingEventRow);
};

const getEmployees = async (client = pool) => {
  const { rows } = await client.query('SELECT * FROM couriers ORDER BY id');
  return rows.map(mapEmployeeRow);
};

const getPackages = async (client = pool) => {
  const { rows } = await client.query('SELECT * FROM packages ORDER BY month_key, id');
  return rows.map(mapPackageRow);
};

const getAttendanceRecords = async (client = pool) => {
  const { rows } = await client.query(
    'SELECT * FROM attendance_records ORDER BY month_key, employee_id, id'
  );

  return rows.map(mapAttendanceRow);
};

const getCustomers = async (client = pool) => {
  const [{ rows: customerRows }, { rows: historyRows }] = await Promise.all([
    client.query('SELECT * FROM customers ORDER BY id'),
    client.query('SELECT * FROM customer_histories ORDER BY customer_id, id'),
  ]);

  const historiesByCustomerId = new Map();

  for (const row of historyRows) {
    const histories = historiesByCustomerId.get(row.customer_id) ?? [];
    histories.push(mapHistoryRow(row));
    historiesByCustomerId.set(row.customer_id, histories);
  }

  return customerRows.map((row) =>
    mapCustomerRow(row, historiesByCustomerId.get(row.id) ?? [])
  );
};

const getManagerProfile = async (client = pool) => {
  const { rows } = await client.query('SELECT * FROM manager_profiles ORDER BY employee_id LIMIT 1');
  return rows[0] ? mapManagerProfileRow(rows[0]) : null;
};

const getEmployeeById = async (id, client = pool) => {
  const { rows } = await client.query('SELECT * FROM couriers WHERE id = $1 LIMIT 1', [id]);
  if (!rows[0]) throw new NotFoundError('Data kurir tidak ditemukan.');
  return mapEmployeeRow(rows[0]);
};

const getPackageById = async (id, client = pool) => {
  const { rows } = await client.query('SELECT * FROM packages WHERE id = $1 LIMIT 1', [id]);
  if (!rows[0]) throw new NotFoundError('Data pengiriman tidak ditemukan.');
  return mapPackageRow(rows[0]);
};

const getCustomerById = async (id, client = pool) => {
  const customers = await getCustomers(client);
  const customer = customers.find((item) => item.id === id);

  if (!customer) {
    throw new NotFoundError('Data customer tidak ditemukan.');
  }

  return customer;
};

const syncCustomerPackageNames = async (client, customerId, customerName) => {
  const { rows } = await client.query(
    'SELECT type, resi FROM customer_histories WHERE customer_id = $1 ORDER BY id',
    [customerId]
  );

  const sentResis = rows.filter((row) => row.type === 'Mengirim').map((row) => row.resi);
  const receivedResis = rows.filter((row) => row.type === 'Menerima').map((row) => row.resi);

  if (sentResis.length) {
    await client.query('UPDATE packages SET sender_name = $1 WHERE resi = ANY($2::text[])', [
      customerName,
      sentResis,
    ]);
  }

  if (receivedResis.length) {
    await client.query(
      'UPDATE packages SET recipient_name = $1 WHERE resi = ANY($2::text[])',
      [customerName, receivedResis]
    );
  }
};

const syncPackageHistories = async (client, packageData, previousResi = packageData.resi) => {
  await client.query(
    `
      UPDATE customer_histories
      SET resi = $1, route = $2, status = $3, date = $4
      WHERE resi = $5
    `,
    [
      packageData.resi,
      `${packageData.origin} - ${packageData.destination}`,
      packageData.status,
      toDateString(packageData.deliveredAt ?? packageData.shippedAt),
      previousResi,
    ]
  );
};

const ensureEmployeeCanBeDeleted = async (client, employeeId) => {
  const { rowCount } = await client.query(
    'SELECT 1 FROM packages WHERE courier_id = $1 LIMIT 1',
    [employeeId]
  );

  if (rowCount) {
    throw new ConflictError(
      'Kurir masih dipakai pada data pengiriman. Ganti kurir paket terkait terlebih dahulu sebelum menghapus data ini.'
    );
  }
};

export const getBootstrapData = async () => {
  const [employees, packages, attendanceRecords, customers, managerProfile, vehicles] = await Promise.all([
    getEmployees(),
    getPackages(),
    getAttendanceRecords(),
    getCustomers(),
    getManagerProfile(),
    getVehicles(),
  ]);

  return {
    employees,
    packages,
    attendanceRecords,
    customers,
    managerProfile,
    vehicles,
  };
};

export const getTrackingDeliveryByResi = async (resi, client = pool) => {
  // 1. Fetch only the specific package matching the resi
  const { rows: packageRows } = await client.query(
    'SELECT * FROM packages WHERE LOWER(resi) = LOWER($1) LIMIT 1',
    [resi]
  );

  if (!packageRows[0]) {
    return null;
  }

  const packageItem = mapPackageRow(packageRows[0]);

  // 2. Fetch specific tracking events, courier, and recipient details in parallel
  const [eventResult, courierResult, customerResult] = await Promise.all([
    client.query(
      'SELECT * FROM package_tracking_events WHERE package_id = $1 ORDER BY timestamp, id',
      [packageItem.id]
    ),
    packageItem.courierId
      ? client.query('SELECT * FROM couriers WHERE id = $1 LIMIT 1', [packageItem.courierId])
      : Promise.resolve({ rows: [] }),
    client.query(
      'SELECT phone FROM customers WHERE LOWER(name) = LOWER($1) LIMIT 1',
      [packageItem.recipientName]
    ),
  ]);

  const trackingEvents = eventResult.rows.map(mapTrackingEventRow);
  const courier = courierResult.rows[0] ? mapEmployeeRow(courierResult.rows[0]) : null;
  const recipientCustomer = customerResult.rows[0] ? { phone: customerResult.rows[0].phone } : null;

  return mapPackageToTrackingDelivery(packageItem, trackingEvents, courier, recipientCustomer);
};

export const getCourierDeliveries = async (courierId, statusFilter, client = pool) => {
  // If the first argument is pool/client instead of courierId, handle gracefully
  let actualCourierId = typeof courierId === 'string' ? courierId : undefined;
  let actualStatusFilter = typeof statusFilter === 'string' ? statusFilter : undefined;
  let actualClient = typeof statusFilter === 'object' ? statusFilter : (typeof courierId === 'object' ? courierId : client);

  let queryText = 'SELECT * FROM packages';
  let queryParams = [];

  if (actualStatusFilter === 'unclaimed' && actualCourierId) {
    // Paket yang sudah ditugaskan ke kurir ini tapi belum diambil (masih Diproses)
    queryText += " WHERE courier_id = $1 AND status = 'Diproses'";
    queryParams.push(actualCourierId);
  } else if (actualStatusFilter === 'unclaimed') {
    // Tanpa courierId: tampilkan semua paket unclaimed (belum ada kurir)
    queryText += " WHERE (courier_id IS NULL OR courier_id = '') AND status = 'Diproses'";
  } else if (actualCourierId) {
    // Paket milik kurir tertentu yang sudah dalam pengiriman (bukan Diproses)
    queryText += " WHERE courier_id = $1 AND status != 'Diproses'";
    queryParams.push(actualCourierId);
  }

  queryText += ' ORDER BY shipped_at DESC';

  const { rows: packageRows } = await actualClient.query(queryText, queryParams);
  const packages = packageRows.map(mapPackageRow);

  if (packages.length === 0) {
    return [];
  }

  const packageIds = packages.map((p) => p.id);
  
  // Fetch tracking events for these specific packages
  const [eventResult, phoneResult] = await Promise.all([
    actualClient.query(
      'SELECT * FROM package_tracking_events WHERE package_id = ANY($1) ORDER BY timestamp, id',
      [packageIds]
    ),
    // Fetch only the phone numbers of the specific recipients in these packages
    actualClient.query(
      'SELECT name, phone FROM customers WHERE name = ANY($1)',
      [[...new Set(packages.map((p) => p.recipientName))]]
    ),
  ]);

  const trackingEvents = eventResult.rows.map(mapTrackingEventRow);
  const phonesByName = new Map(phoneResult.rows.map((row) => [row.name.toLowerCase(), row.phone]));

  return packages.map((packageItem) => {
    const phone = phonesByName.get(packageItem.recipientName.toLowerCase()) ?? '-';
    const events = trackingEvents.filter((event) => event.deliveryId === packageItem.id);
    return mapPackageToCourierDelivery(packageItem, events, { phone });
  });
};

export const createEmployee = async (employee) =>
  withTransaction(async (client) => {
    await client.query(
      `
        INSERT INTO couriers (
          id, name, base_area, coverage_area, vehicle_type, vehicle_plate, phone, status, completed_deliveries, performance_score
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        )
      `,
      [
        employee.id,
        employee.name,
        employee.baseArea,
        employee.coverageArea,
        employee.vehicleType,
        employee.vehiclePlate ?? null,
        employee.phone,
        employee.status,
        Number(employee.completedDeliveries ?? 0),
        Number(employee.performanceScore ?? 80),
      ]
    );

    return getEmployeeById(employee.id, client);
  });

export const updateEmployee = async (id, employee) =>
  withTransaction(async (client) => {
    const result = await client.query(
      `
        UPDATE couriers
        SET
          name = $2,
          base_area = $3,
          coverage_area = $4,
          vehicle_type = $5,
          vehicle_plate = $6,
          phone = $7,
          status = $8,
          completed_deliveries = $9,
          performance_score = $10
        WHERE id = $1
      `,
      [
        id,
        employee.name,
        employee.baseArea,
        employee.coverageArea,
        employee.vehicleType,
        employee.vehiclePlate ?? null,
        employee.phone,
        employee.status,
        Number(employee.completedDeliveries ?? 0),
        Number(employee.performanceScore ?? 80),
      ]
    );

    if (!result.rowCount) {
      throw new NotFoundError('Data kurir tidak ditemukan.');
    }

    await client.query('UPDATE packages SET courier_name = $1 WHERE courier_id = $2', [
      employee.name,
      id,
    ]);
    await client.query(
      'UPDATE attendance_records SET employee_name = $1, division = $2 WHERE employee_id = $3',
      [employee.name, employee.coverageArea, id]
    );

    return getEmployeeById(id, client);
  });

export const deleteEmployee = async (id) =>
  withTransaction(async (client) => {
    const existingEmployee = await getEmployeeById(id, client);
    await ensureEmployeeCanBeDeleted(client, id);
    await client.query('DELETE FROM couriers WHERE id = $1', [id]);
    return existingEmployee;
  });

export const createPackage = async (packageData) =>
  withTransaction(async (client) => {
    const courierRows = await client.query('SELECT name FROM couriers WHERE id = $1 LIMIT 1', [
      packageData.courierId,
    ]);
    const courierName = courierRows.rows[0]?.name ?? packageData.courierName ?? 'Kurir Belum Diatur';
    const nextPackage = { ...packageData, courierName };

    await client.query(
      `
        INSERT INTO packages (
          id, month_key, week, resi, sender_name, recipient_name, courier_id, courier_name,
          origin, destination, current_location, service, weight_kg, declared_value, shipped_at, delivered_at, status,
          recipient_phone, item_type, shipping_cost, vehicle_type, delivery_type, description,
          item_status, transaction_status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, $14, $15, $16, $17,
          $18, $19, $20, $21, $22, $23,
          $24, $25
        )
      `,
      [
        nextPackage.id,
        nextPackage.monthKey,
        nextPackage.week,
        nextPackage.resi,
        nextPackage.senderName,
        nextPackage.recipientName,
        nextPackage.courierId,
        courierName,
        nextPackage.origin,
        nextPackage.destination,
        nextPackage.currentLocation,
        nextPackage.service,
        nextPackage.weightKg,
        nextPackage.declaredValue,
        toTimestampString(nextPackage.shippedAt),
        toTimestampString(nextPackage.deliveredAt),
        nextPackage.status,
        nextPackage.recipientPhone ?? null,
        nextPackage.itemType ?? null,
        nextPackage.shippingCost ?? 0,
        nextPackage.vehicleType ?? null,
        nextPackage.deliveryType ?? 'Reguler',
        nextPackage.description ?? null,
        nextPackage.itemStatus ?? 'Baik',
        normalizeTransactionStatusForStorage(nextPackage.transactionStatus),
      ]
    );

    await insertPackageTrackingSnapshot(
      client,
      nextPackage,
      nextPackage.status === 'Selesai'
        ? nextPackage.deliveredAt ?? nextPackage.shippedAt
        : nextPackage.shippedAt
    );

    return getPackageById(nextPackage.id, client);
  });

export const updatePackage = async (id, packageData) =>
  withTransaction(async (client) => {
    const existingPackage = await getPackageById(id, client);
    const courierRows = await client.query('SELECT name FROM couriers WHERE id = $1 LIMIT 1', [
      packageData.courierId,
    ]);
    const courierName = courierRows.rows[0]?.name ?? packageData.courierName ?? 'Kurir Belum Diatur';
    const nextPackage = { ...packageData, courierName };

    const result = await client.query(
      `
        UPDATE packages
        SET
          month_key = $2,
          week = $3,
          resi = $4,
          sender_name = $5,
          recipient_name = $6,
          courier_id = $7,
          courier_name = $8,
          origin = $9,
          destination = $10,
          current_location = $11,
          service = $12,
          weight_kg = $13,
          declared_value = $14,
          shipped_at = $15,
          delivered_at = $16,
          status = $17,
          recipient_phone = $18,
          item_type = $19,
          shipping_cost = $20,
          vehicle_type = $21,
          delivery_type = $22,
          description = $23,
          item_status = $24,
          transaction_status = $25
        WHERE id = $1
      `,
      [
        id,
        nextPackage.monthKey,
        nextPackage.week,
        nextPackage.resi,
        nextPackage.senderName,
        nextPackage.recipientName,
        nextPackage.courierId,
        courierName,
        nextPackage.origin,
        nextPackage.destination,
        nextPackage.currentLocation,
        nextPackage.service,
        nextPackage.weightKg,
        nextPackage.declaredValue,
        toTimestampString(nextPackage.shippedAt),
        toTimestampString(nextPackage.deliveredAt),
        nextPackage.status,
        nextPackage.recipientPhone ?? null,
        nextPackage.itemType ?? null,
        nextPackage.shippingCost ?? 0,
        nextPackage.vehicleType ?? null,
        nextPackage.deliveryType ?? 'Reguler',
        nextPackage.description ?? null,
        nextPackage.itemStatus ?? 'Baik',
        normalizeTransactionStatusForStorage(nextPackage.transactionStatus),
      ]
    );

    if (!result.rowCount) {
      throw new NotFoundError('Data pengiriman tidak ditemukan.');
    }

    await client.query('UPDATE package_tracking_events SET resi = $1 WHERE package_id = $2', [
      nextPackage.resi,
      id,
    ]);
    await syncPackageHistories(client, nextPackage, existingPackage.resi);

    const shouldCreateTrackingSnapshot =
      existingPackage.resi !== nextPackage.resi ||
      existingPackage.origin !== nextPackage.origin ||
      existingPackage.destination !== nextPackage.destination ||
      existingPackage.currentLocation !== nextPackage.currentLocation ||
      existingPackage.shippedAt !== nextPackage.shippedAt ||
      (existingPackage.deliveredAt ?? null) !== (nextPackage.deliveredAt ?? null) ||
      existingPackage.status !== nextPackage.status;

    if (shouldCreateTrackingSnapshot) {
      await insertPackageTrackingSnapshot(
        client,
        nextPackage,
        nextPackage.status === 'Selesai'
          ? nextPackage.deliveredAt ?? new Date()
          : new Date()
      );
    }

    return getPackageById(id, client);
  });

export const appendTrackingEvent = async (packageId, trackingEvent) =>
  withTransaction(async (client) => {
    const packageData = await getPackageById(packageId, client);
    const eventId = `EVT-${packageId}-${Date.now()}`;
    const timestamp = trackingEvent.timestamp ?? new Date();
    const nextPackageStatus =
      trackingEvent.status === 'Paket Terkirim' ? 'Selesai' : 'Dalam Pengiriman';
    const deliveredAt =
      trackingEvent.status === 'Paket Terkirim'
        ? toTimestampString(timestamp)
        : packageData.deliveredAt
          ? toTimestampString(packageData.deliveredAt)
          : null;

    await client.query(
      `
        INSERT INTO package_tracking_events (
          id, package_id, resi, status, location, timestamp, description, photo_url
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8
        )
      `,
      [
        eventId,
        packageId,
        packageData.resi,
        trackingEvent.status,
        trackingEvent.location,
        toTimestampString(timestamp),
        trackingEvent.description,
        trackingEvent.photoUrl ?? null,
      ]
    );

    await client.query(
      `
        UPDATE packages
        SET
          current_location = $2,
          status = $3,
          delivered_at = $4
        WHERE id = $1
      `,
      [packageId, trackingEvent.location, nextPackageStatus, deliveredAt]
    );

    await syncPackageHistories(client, {
      ...packageData,
      currentLocation: trackingEvent.location,
      status: nextPackageStatus,
      deliveredAt: trackingEvent.status === 'Paket Terkirim' ? timestamp : packageData.deliveredAt,
    });

    const trackingDelivery = await getTrackingDeliveryByResi(packageData.resi, client);
    return trackingDelivery;
  });

export const deletePackage = async (id) =>
  withTransaction(async (client) => {
    const existingPackage = await getPackageById(id, client);
    await client.query('DELETE FROM customer_histories WHERE resi = $1', [existingPackage.resi]);
    await client.query('DELETE FROM packages WHERE id = $1', [id]);
    return existingPackage;
  });

export const createCustomer = async (customer) =>
  withTransaction(async (client) => {
    await client.query(
      `
        INSERT INTO customers (
          id, name, address, email, phone, total_sent, total_received, last_activity
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8
        )
      `,
      [
        customer.id,
        customer.name,
        customer.address,
        customer.email,
        customer.phone,
        customer.totalSent,
        customer.totalReceived,
        toDateString(customer.lastActivity),
      ]
    );

    return getCustomerById(customer.id, client);
  });

export const updateCustomer = async (id, customer) => {
  throw new ConflictError('Data customer tidak bisa diedit setelah dibuat.');
};

export const deleteCustomer = async (id) =>
  withTransaction(async (client) => {
    const existingCustomer = await getCustomerById(id, client);
    await client.query('DELETE FROM customers WHERE id = $1', [id]);
    return existingCustomer;
  });

export const updateManagerProfile = async (profile) =>
  withTransaction(async (client) => {
    const existingResult = await client.query(
      'SELECT employee_id FROM manager_profiles WHERE employee_id = $1 LIMIT 1',
      [profile.employeeId]
    );

    if (existingResult.rowCount) {
      await client.query(
        `
          UPDATE manager_profiles
          SET
            name = $2,
            email = $3,
            phone = $4,
            address = $5,
            department = $6,
            start_date = $7,
            bio = $8
          WHERE employee_id = $1
        `,
        [
          profile.employeeId,
          profile.name,
          profile.email,
          profile.phone,
          profile.address,
          profile.department,
          toDateString(profile.startDate),
          profile.bio,
        ]
      );
    } else {
      await client.query(
        `
          INSERT INTO manager_profiles (
            employee_id, name, email, phone, address, department, start_date, bio
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8
          )
        `,
        [
          profile.employeeId,
          profile.name,
          profile.email,
          profile.phone,
          profile.address,
          profile.department,
          toDateString(profile.startDate),
          profile.bio,
        ]
      );
    }

    return getManagerProfile(client);
  });

const mapVehicleRow = (row) => ({
  id: row.id,
  name: row.name,
  type: row.type,
  plateNumber: row.plate_number,
  capacity: row.capacity,
  status: row.status,
});

export const getVehicles = async (client = pool) => {
  const { rows } = await client.query('SELECT * FROM vehicles ORDER BY id');
  return rows.map(mapVehicleRow);
};

export const getVehicleById = async (id, client = pool) => {
  const { rows } = await client.query('SELECT * FROM vehicles WHERE id = $1 LIMIT 1', [id]);
  if (!rows[0]) throw new NotFoundError('Data kendaraan tidak ditemukan.');
  return mapVehicleRow(rows[0]);
};

export const createVehicle = async (vehicle) =>
  withTransaction(async (client) => {
    await client.query(
      `
        INSERT INTO vehicles (
          id, name, type, plate_number, capacity, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6
        )
      `,
      [
        vehicle.id,
        vehicle.name,
        vehicle.type,
        vehicle.plateNumber,
        vehicle.capacity,
        vehicle.status,
      ]
    );

    return getVehicleById(vehicle.id, client);
  });

export const updateVehicle = async (id, vehicle) =>
  withTransaction(async (client) => {
    const result = await client.query(
      `
        UPDATE vehicles
        SET
          name = $2,
          type = $3,
          plate_number = $4,
          capacity = $5,
          status = $6
        WHERE id = $1
      `,
      [
        id,
        vehicle.name,
        vehicle.type,
        vehicle.plateNumber,
        vehicle.capacity,
        vehicle.status,
      ]
    );

    if (!result.rowCount) {
      throw new NotFoundError('Data kendaraan tidak ditemukan.');
    }

    return getVehicleById(id, client);
  });

export const deleteVehicle = async (id) =>
  withTransaction(async (client) => {
    const existingVehicle = await getVehicleById(id, client);
    await client.query('DELETE FROM vehicles WHERE id = $1', [id]);
    return existingVehicle;
  });

export { ConflictError, NotFoundError };
