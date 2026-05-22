import express from 'express';
import {
  appendTrackingEvent,
  ConflictError,
  NotFoundError,
  createCustomer,
  createEmployee,
  createPackage,
  deleteCustomer,
  deleteEmployee,
  deletePackage,
  getBootstrapData,
  getCourierDeliveries,
  getTrackingDeliveryByResi,
  updateCustomer,
  updateEmployee,
  updateManagerProfile,
  updatePackage,
} from './admin-data.mjs';

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_request, response) => {
  response.json({ ok: true });
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

app.get('/api/courier/packages', async (_request, response) => {
  const deliveries = await getCourierDeliveries();
  response.json(deliveries);
});

app.post('/api/courier/packages/:id/tracking-events', async (request, response) => {
  const delivery = await appendTrackingEvent(request.params.id, request.body);
  response.status(201).json(delivery);
});

app.post('/api/admin/employees', async (request, response) => {
  const employee = await createEmployee(request.body);
  response.status(201).json(employee);
});

app.put('/api/admin/employees/:id', async (request, response) => {
  const employee = await updateEmployee(request.params.id, request.body);
  response.json(employee);
});

app.delete('/api/admin/employees/:id', async (request, response) => {
  const employee = await deleteEmployee(request.params.id);
  response.json(employee);
});

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

  if (error instanceof ConflictError) {
    response.status(409).json({ message: error.message });
    return;
  }

  if (error?.code === '23505') {
    response.status(409).json({ message: 'Data dengan ID atau nilai unik yang sama sudah ada.' });
    return;
  }

  console.error(error);
  response.status(500).json({ message: 'Terjadi kesalahan saat mengakses data admin.' });
});

export default app;
