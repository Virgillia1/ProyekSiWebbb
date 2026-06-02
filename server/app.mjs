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
} from './admin-data.mjs';
import {
  loginWithAccount,
  registerAdminAccount,
  registerCustomerAccount,
  registerCourierAccount,
} from './auth-data.mjs';
import { BadRequestError, ConflictError } from './errors.mjs';

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(express.json({ limit: '1mb' }));

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

app.delete('/api/admin/customers/:id', async (request, response) => {
  const customer = await deleteCustomer(request.params.id);
  response.json(customer);
});

app.put('/api/admin/manager-profile', async (request, response) => {
  const profile = await updateManagerProfile(request.body);
  response.json(profile);
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
