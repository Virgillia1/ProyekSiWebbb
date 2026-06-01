import type {
  AdminPackage,
  AttendanceRecord,
  CustomerAccount,
  Employee,
  ManagerProfile,
  Vehicle,
} from '../data/adminData';

export interface AdminBootstrapData {
  employees: Employee[];
  packages: AdminPackage[];
  attendanceRecords: AttendanceRecord[];
  customers: CustomerAccount[];
  managerProfile: ManagerProfile | null;
  vehicles: Vehicle[];
}

const requestJson = async <T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const fallbackMessage = 'Gagal mengambil data admin.';
    const responseText = await response.text();

    try {
      const errorBody = JSON.parse(responseText) as { message?: string };
      throw new Error(errorBody.message || fallbackMessage);
    } catch {
      throw new Error(responseText || fallbackMessage);
    }
  }

  return (await response.json()) as T;
};

export const fetchAdminBootstrap = () =>
  requestJson<AdminBootstrapData>('/api/admin/bootstrap');

export const createEmployeeRequest = (employee: Employee) =>
  requestJson<Employee>('/api/admin/employees', {
    method: 'POST',
    body: JSON.stringify(employee),
  });

export const updateEmployeeRequest = (employee: Employee) =>
  requestJson<Employee>(`/api/admin/employees/${employee.id}`, {
    method: 'PUT',
    body: JSON.stringify(employee),
  });

export const deleteEmployeeRequest = (employeeId: string) =>
  requestJson<Employee>(`/api/admin/employees/${employeeId}`, {
    method: 'DELETE',
  });

export const createPackageRequest = (packageData: AdminPackage) =>
  requestJson<AdminPackage>('/api/admin/packages', {
    method: 'POST',
    body: JSON.stringify(packageData),
  });

export const updatePackageRequest = (packageData: AdminPackage) =>
  requestJson<AdminPackage>(`/api/admin/packages/${packageData.id}`, {
    method: 'PUT',
    body: JSON.stringify(packageData),
  });

export const deletePackageRequest = (packageId: string) =>
  requestJson<AdminPackage>(`/api/admin/packages/${packageId}`, {
    method: 'DELETE',
  });

export const createCustomerRequest = (customer: CustomerAccount) =>
  requestJson<CustomerAccount>('/api/admin/customers', {
    method: 'POST',
    body: JSON.stringify(customer),
  });

export const updateCustomerRequest = (customer: CustomerAccount) =>
  requestJson<CustomerAccount>(`/api/admin/customers/${customer.id}`, {
    method: 'PUT',
    body: JSON.stringify(customer),
  });

export const deleteCustomerRequest = (customerId: string) =>
  requestJson<CustomerAccount>(`/api/admin/customers/${customerId}`, {
    method: 'DELETE',
  });

export const updateManagerProfileRequest = (profile: ManagerProfile) =>
  requestJson<ManagerProfile>('/api/admin/manager-profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
  });

export const createVehicleRequest = (vehicle: Vehicle) =>
  requestJson<Vehicle>('/api/admin/vehicles', {
    method: 'POST',
    body: JSON.stringify(vehicle),
  });

export const updateVehicleRequest = (vehicle: Vehicle) =>
  requestJson<Vehicle>(`/api/admin/vehicles/${vehicle.id}`, {
    method: 'PUT',
    body: JSON.stringify(vehicle),
  });

export const deleteVehicleRequest = (vehicleId: string) =>
  requestJson<Vehicle>(`/api/admin/vehicles/${vehicleId}`, {
    method: 'DELETE',
  });

export interface CourierAccountPayload {
  username: string;
  email: string;
  phone: string;
  password: string;
}

export interface CourierAccountInfo {
  hasCourierAccount: boolean;
  id?: string;
  username?: string;
  email?: string;
  phone?: string;
  created_at?: string;
}

export const createCourierAccountRequest = (employeeId: string, payload: CourierAccountPayload) =>
  requestJson<CourierAccountInfo>(`/api/admin/employees/${employeeId}/courier-account`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const getCourierAccountInfoRequest = (employeeId: string) =>
  requestJson<CourierAccountInfo>(`/api/admin/employees/${employeeId}/courier-account`);

