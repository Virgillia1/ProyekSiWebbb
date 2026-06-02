const port = process.env.PORT ?? '3001';
const baseUrl = process.env.ADMIN_API_URL ?? `http://localhost:${port}`;

const startEmbeddedApi = async () => {
  const { default: app } = await import('../server/app.mjs');

  return new Promise((resolve, reject) => {
    const server = app.listen(Number(port), () => resolve(server));
    server.once('error', reject);
  });
};

const stopEmbeddedApi = (server) =>
  new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

const requestJson = async (path, init = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    ...init,
  });

  const responseText = await response.text();

  if (!response.ok) {
    let message = responseText || `Request gagal ke ${path}.`;

    try {
      const parsed = JSON.parse(responseText);
      message = parsed.message ?? message;
    } catch {
      // Keep raw text when response is not JSON.
    }

    throw new Error(`${init.method ?? 'GET'} ${path} -> ${message}`);
  }

  return responseText ? JSON.parse(responseText) : null;
};

const ensure = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const run = async () => {
  const suffix = String(Date.now()).slice(-6);
  const employeeId = `CUR-T${suffix}`;
  const customerId = `CUS-T${suffix}`;
  const packageId = `PKT-T${suffix}`;
  const resi = `CKL209912${suffix.slice(-4)}`;
  let cleanupPackageId = null;
  let cleanupCustomerId = null;
  let cleanupEmployeeId = null;
  let originalManagerProfile = null;
  let managerProfileUpdated = false;
  let embeddedServer = null;

  try {
    try {
      await requestJson('/api/health');
    } catch (error) {
      if (process.env.ADMIN_API_URL) {
        throw error;
      }

      console.log(`API belum aktif di ${baseUrl}. Menyalakan API sementara untuk verifikasi...`);
      embeddedServer = await startEmbeddedApi();
      await requestJson('/api/health');
    }

    console.log(`API aktif di ${baseUrl}${embeddedServer ? ' (sementara)' : ''}`);

    const bootstrap = await requestJson('/api/admin/bootstrap');
    ensure(Array.isArray(bootstrap.employees) && bootstrap.employees.length > 0, 'Data bootstrap admin kosong.');
    originalManagerProfile = bootstrap.managerProfile;

    const courier = bootstrap.employees.find((employee) => employee.status === 'Aktif') ?? bootstrap.employees[0];
    ensure(courier, 'Tidak ada data kurir untuk verifikasi paket.');

    const employeePayload = {
      id: employeeId,
      name: `Tester Kurir ${suffix}`,
      baseArea: 'Hub Jakarta',
      coverageArea: 'Jakarta Selatan',
      vehicleType: 'Motor',
      vehiclePlate: `B ${suffix.slice(-4)} TST`,
      phone: `0812${suffix}`,
      status: 'Aktif',
      completedDeliveries: 12,
      performanceScore: 84,
    };

    const createdEmployee = await requestJson('/api/admin/couriers', {
      method: 'POST',
      body: JSON.stringify(employeePayload),
    });
    cleanupEmployeeId = createdEmployee.id;
    ensure(createdEmployee.id === employeeId, 'Create courier gagal.');
    console.log(`Courier create OK -> ${createdEmployee.id}`);

    const updatedEmployee = await requestJson(`/api/admin/couriers/${employeeId}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...employeePayload,
        name: `Tester Kurir Update ${suffix}`,
        performanceScore: 91,
      }),
    });
    ensure(updatedEmployee.name.includes('Update'), 'Update courier gagal.');
    console.log(`Courier update OK -> ${updatedEmployee.name}`);

    const deletedEmployee = await requestJson(`/api/admin/couriers/${employeeId}`, {
      method: 'DELETE',
    });
    ensure(deletedEmployee.id === employeeId, 'Delete courier gagal.');
    cleanupEmployeeId = null;
    console.log(`Courier delete OK -> ${deletedEmployee.id}`);

    const customerPayload = {
      id: customerId,
      name: `Tester Customer ${suffix}`,
      address: 'Jl. Verifikasi Neon No. 1',
      email: `tester-customer-${suffix}@example.com`,
      phone: `0813${suffix}`,
      totalSent: 2,
      totalReceived: 1,
      lastActivity: '2026-05-21',
      histories: [],
    };

    const createdCustomer = await requestJson('/api/admin/customers', {
      method: 'POST',
      body: JSON.stringify(customerPayload),
    });
    cleanupCustomerId = createdCustomer.id;
    ensure(createdCustomer.id === customerId, 'Create customer gagal.');
    console.log(`Customer create OK -> ${createdCustomer.id}`);

    try {
      await requestJson(`/api/admin/customers/${customerId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...customerPayload,
          name: `Tester Customer Update ${suffix}`,
          totalReceived: 3,
        }),
      });
      ensure(false, 'Update customer should have failed.');
    } catch (error) {
      ensure(
        error.message.includes('tidak bisa diedit setelah dibuat') || error.message.includes('409'),
        `Update customer did not fail as expected: ${error.message}`
      );
      console.log('Customer update forbidden OK (expected behavior)');
    }

    const deletedCustomer = await requestJson(`/api/admin/customers/${customerId}`, {
      method: 'DELETE',
    });
    ensure(deletedCustomer.id === customerId, 'Delete customer gagal.');
    cleanupCustomerId = null;
    console.log(`Customer delete OK -> ${deletedCustomer.id}`);

    const packagePayload = {
      id: packageId,
      monthKey: '2026-04',
      week: 'M4',
      resi,
      senderName: 'Verifikasi Sender',
      recipientName: 'Verifikasi Recipient',
      courierId: courier.id,
      courierName: courier.name,
      origin: 'Jakarta Selatan',
      destination: 'Bandung',
      currentLocation: 'Jakarta Selatan',
      service: 'CargoLite Express',
      weightKg: 3.5,
      declaredValue: 275000,
      shippedAt: '2026-04-21T08:00:00',
      status: 'Dalam Pengiriman',
    };

    const createdPackage = await requestJson('/api/admin/packages', {
      method: 'POST',
      body: JSON.stringify(packagePayload),
    });
    cleanupPackageId = createdPackage.id;
    ensure(createdPackage.id === packageId, 'Create package gagal.');
    console.log(`Package create OK -> ${createdPackage.resi}`);

    const trackingBeforeUpdate = await requestJson(`/api/tracking/${encodeURIComponent(resi)}`);
    ensure(
      Array.isArray(trackingBeforeUpdate.historyLogs) && trackingBeforeUpdate.historyLogs.length > 0,
      'Tracking awal belum terbentuk setelah create package.'
    );
    console.log(`Tracking create OK -> ${trackingBeforeUpdate.currentStatus}`);

    const updatedPackage = await requestJson(`/api/admin/packages/${packageId}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...packagePayload,
        recipientName: 'Verifikasi Recipient Update',
        currentLocation: 'Bandung',
        deliveredAt: '2026-04-22T10:30:00',
        status: 'Selesai',
      }),
    });
    ensure(updatedPackage.status === 'Selesai', 'Update package gagal.');
    console.log(`Package update OK -> ${updatedPackage.status}`);

    const trackingAfterUpdate = await requestJson(`/api/tracking/${encodeURIComponent(resi)}`);
    ensure(
      trackingAfterUpdate.currentStatus.toLowerCase().includes('terkirim'),
      'Tracking user belum ikut berubah setelah update package.'
    );
    ensure(
      trackingAfterUpdate.historyLogs.at(-1)?.location === 'Bandung',
      'Lokasi tracking terbaru belum sinkron setelah update package.'
    );
    console.log(`Tracking sync OK -> ${trackingAfterUpdate.currentStatus}`);

    if (originalManagerProfile) {
      const managerPayload = {
        ...originalManagerProfile,
        phone: `0899${suffix}`,
      };

      const updatedManagerProfile = await requestJson('/api/admin/manager-profile', {
        method: 'PUT',
        body: JSON.stringify(managerPayload),
      });
      managerProfileUpdated = true;
      ensure(updatedManagerProfile.phone === managerPayload.phone, 'Update manager profile gagal.');
      console.log(`Manager update OK -> ${updatedManagerProfile.phone}`);

      await requestJson('/api/admin/manager-profile', {
        method: 'PUT',
        body: JSON.stringify(originalManagerProfile),
      });
      managerProfileUpdated = false;
      console.log('Manager rollback OK');
    }

    const deletedPackage = await requestJson(`/api/admin/packages/${packageId}`, {
      method: 'DELETE',
    });
    ensure(deletedPackage.id === packageId, 'Delete package gagal.');
    cleanupPackageId = null;
    console.log(`Package delete OK -> ${deletedPackage.id}`);

    console.log('Semua verifikasi CRUD admin berhasil.');
  } catch (error) {
    console.error(
      error instanceof Error
        ? error.message
        : 'Verifikasi CRUD gagal karena kesalahan yang tidak diketahui.'
    );
    console.error('Pastikan API sudah aktif dengan menjalankan `pnpm api:dev` atau `pnpm dev:full`.');
    process.exitCode = 1;
  } finally {
    if (managerProfileUpdated && originalManagerProfile) {
      try {
        await requestJson('/api/admin/manager-profile', {
          method: 'PUT',
          body: JSON.stringify(originalManagerProfile),
        });
      } catch {
        // Ignore rollback failure in cleanup.
      }
    }

    if (cleanupPackageId) {
      try {
        await requestJson(`/api/admin/packages/${cleanupPackageId}`, {
          method: 'DELETE',
        });
      } catch {
        // Ignore cleanup failure.
      }
    }

    if (cleanupCustomerId) {
      try {
        await requestJson(`/api/admin/customers/${cleanupCustomerId}`, {
          method: 'DELETE',
        });
      } catch {
        // Ignore cleanup failure.
      }
    }

    if (cleanupEmployeeId) {
      try {
        await requestJson(`/api/admin/couriers/${cleanupEmployeeId}`, {
          method: 'DELETE',
        });
      } catch {
        // Ignore cleanup failure.
      }
    }

    if (embeddedServer) {
      try {
        await stopEmbeddedApi(embeddedServer);
      } catch {
        // Ignore shutdown failure.
      }
    }
  }
};

await run();
