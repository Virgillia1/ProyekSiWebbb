import express from 'express';
import {
  appendTrackingEvent,
  NotFoundError,
  createCustomer,
  createEmployee,
  createPackage,
  createVehicle,
  deleteCustomer,
  deleteEmployee,
  deletePackage,
  deleteVehicle,
  getBootstrapData,
  getCourierDeliveries,
  getTrackingDeliveryByResi,
  updateCustomer,
  updateEmployee,
  updateManagerProfile,
  updatePackage,
  updateVehicle,
  getCustomerPackages,
} from './admin-data.mjs';
import {
  loginWithAccount,
  registerAdminAccount,
  registerCustomerAccount,
  registerCourierAccount,
  getAuthUserByCustomerId,
  ensureAuthInfrastructure,
} from './auth-data.mjs';
import { BadRequestError, ConflictError } from './errors.mjs';
import { pool } from './db.mjs';

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(express.json({ limit: '50mb' }));

app.get('/api/health', (_request, response) => {
  response.json({ ok: true });
});

app.post('/api/auth/login', async (request, response) => {
  const user = await loginWithAccount(request.body?.username, request.body?.password);
  response.json(user);
});

app.post('/api/auth/register/customer', async (request, response) => {
  const user = await registerCustomerAccount(request.body);
  response.status(201).json(user);
});

app.post('/api/auth/register/admin', async (request, response) => {
  const user = await registerAdminAccount(request.body);
  response.status(201).json(user);
});

app.get('/api/admin/bootstrap', async (_request, response) => {
  const data = await getBootstrapData();
  response.json(data);
});

app.get('/api/tracking/:resi', async (request, response) => {
  const delivery = await getTrackingDeliveryByResi(request.params.resi);

  if (!delivery) {
    response.status(404).json({ message: 'Nomor resi tidak ditemukan.' });
    return;
  }

  response.json(delivery);
});

app.get('/api/courier/packages', async (request, response) => {
  const { employeeId, status } = request.query;
  const deliveries = await getCourierDeliveries(
    typeof employeeId === 'string' ? employeeId : undefined,
    typeof status === 'string' ? status : undefined
  );
  response.json(deliveries);
});

app.post('/api/courier/packages/:id/tracking-events', async (request, response) => {
  const delivery = await appendTrackingEvent(request.params.id, request.body);
  response.status(201).json(delivery);
});

app.get('/api/customer/packages', async (request, response) => {
  const { username } = request.query;
  const deliveries = await getCustomerPackages(
    typeof username === 'string' ? username : ''
  );
  response.json(deliveries);
});

const createCourierHandler = async (request, response) => {
  const employee = await createEmployee(request.body);
  response.status(201).json(employee);
};

app.post('/api/admin/couriers', createCourierHandler);
app.post('/api/admin/employees', createCourierHandler);

const createCourierAccountHandler = async (request, response) => {
  const account = await registerCourierAccount({
    courierId: request.params.id,
    ...request.body,
  });
  response.status(201).json(account);
};

app.post('/api/admin/couriers/:id/courier-account', createCourierAccountHandler);
app.post('/api/admin/employees/:id/courier-account', createCourierAccountHandler);

const getCourierAccountHandler = async (request, response) => {
  const { pool: dbPool } = await import('./db.mjs');
  const { rows } = await dbPool.query(
    'SELECT id, username, email, phone, created_at FROM courier_accounts WHERE courier_id = $1 LIMIT 1',
    [request.params.id]
  );
  if (!rows[0]) {
    response.status(404).json({ hasCourierAccount: false });
    return;
  }
  response.json({ hasCourierAccount: true, ...rows[0] });
};

app.get('/api/admin/couriers/:id/courier-account', getCourierAccountHandler);
app.get('/api/admin/employees/:id/courier-account', getCourierAccountHandler);

const updateCourierHandler = async (request, response) => {
  const employee = await updateEmployee(request.params.id, request.body);
  response.json(employee);
};

app.put('/api/admin/couriers/:id', updateCourierHandler);
app.put('/api/admin/employees/:id', updateCourierHandler);

const deleteCourierHandler = async (request, response) => {
  const employee = await deleteEmployee(request.params.id);
  response.json(employee);
};

app.delete('/api/admin/couriers/:id', deleteCourierHandler);
app.delete('/api/admin/employees/:id', deleteCourierHandler);

app.post('/api/admin/packages', async (request, response) => {
  const packageData = await createPackage(request.body);
  response.status(201).json(packageData);
});

app.put('/api/admin/packages/:id', async (request, response) => {
  const packageData = await updatePackage(request.params.id, request.body);
  response.json(packageData);
});

app.delete('/api/admin/packages/:id', async (request, response) => {
  const packageData = await deletePackage(request.params.id);
  response.json(packageData);
});

app.post('/api/admin/vehicles', async (request, response) => {
  const vehicle = await createVehicle(request.body);
  response.status(201).json(vehicle);
});

app.put('/api/admin/vehicles/:id', async (request, response) => {
  const vehicle = await updateVehicle(request.params.id, request.body);
  response.json(vehicle);
});

app.delete('/api/admin/vehicles/:id', async (request, response) => {
  const vehicle = await deleteVehicle(request.params.id);
  response.json(vehicle);
});

app.post('/api/admin/customers', async (request, response) => {
  const customer = await createCustomer(request.body);
  response.status(201).json(customer);
});

app.put('/api/admin/customers/:id', async (request, response) => {
  const customer = await updateCustomer(request.params.id, request.body);
  response.json(customer);
});

app.put('/api/customer/profile/:id', async (request, response) => {
  const updatedCustomer = await updateCustomer(request.params.id, request.body);
  const authUser = await getAuthUserByCustomerId(request.params.id);
  if (authUser) {
    response.json(authUser);
  } else {
    response.json({
      id: request.body.id || '',
      name: updatedCustomer.name,
      email: updatedCustomer.email,
      phone: updatedCustomer.phone,
      address: updatedCustomer.address,
      role: 'customer',
      customerId: request.params.id
    });
  }
});

app.delete('/api/admin/customers/:id', async (request, response) => {
  const customer = await deleteCustomer(request.params.id);
  response.json(customer);
});

app.put('/api/admin/manager-profile', async (request, response) => {
  const profile = await updateManagerProfile(request.body);
  response.json(profile);
});

app.post('/api/contact', async (request, response) => {
  await ensureAuthInfrastructure();
  const { name, email, subject, message } = request.body;

  if (!name?.trim()) return response.status(400).json({ message: 'Nama wajib diisi.' });
  if (!email?.trim()) return response.status(400).json({ message: 'Email wajib diisi.' });
  if (!subject?.trim()) return response.status(400).json({ message: 'Subjek wajib diisi.' });
  if (!message?.trim()) return response.status(400).json({ message: 'Pesan wajib diisi.' });

  const id = `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  await pool.query(
    'INSERT INTO contact_messages (id, name, email, subject, message) VALUES ($1, $2, $3, $4, $5)',
    [id, name.trim(), email.trim(), subject.trim(), message.trim()]
  );

  response.status(201).json({ ok: true, message: 'Pesan berhasil dikirim.' });
});

app.delete('/api/admin/messages/:id', async (request, response) => {
  await ensureAuthInfrastructure();
  await pool.query('DELETE FROM contact_messages WHERE id = $1', [request.params.id]);
  response.json({ ok: true, message: 'Pesan berhasil dihapus.' });
});

app.use((error, _request, response, _next) => {
  if (error instanceof NotFoundError) {
    response.status(404).json({ message: error.message });
    return;
  }

  if (error instanceof BadRequestError) {
    response.status(400).json({ message: error.message });
    return;
  }

  if (error instanceof ConflictError) {
    response.status(409).json({ message: error.message });
    return;
  }

  if (error?.code === '23505') {
    response.status(409).json({ message: 'Data dengan ID atau nilai unik yang sama sudah ada.' });
    return;
  }

  console.error(error);
  response.status(500).json({ message: 'Terjadi kesalahan saat memproses permintaan.' });
});

export default app;
