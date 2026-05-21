import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  AdminPackage,
  AttendanceRecord,
  CustomerAccount,
  Employee,
  ManagerProfile,
} from '../data/adminData';
import {
  adminPackages,
  attendanceRecords,
  customers,
  employees,
  managerProfile,
} from '../data/adminData';
import {
  createCustomerRequest,
  createEmployeeRequest,
  createPackageRequest,
  deleteCustomerRequest,
  fetchAdminBootstrap,
  updateCustomerRequest,
  updateEmployeeRequest,
  updateManagerProfileRequest,
  updatePackageRequest,
  deleteEmployeeRequest,
  deletePackageRequest,
  type AdminBootstrapData,
} from '../lib/adminApi';

interface AdminDataContextValue extends AdminBootstrapData {
  loading: boolean;
  error: string | null;
  notice: string | null;
  isUsingFallback: boolean;
  refreshData: () => Promise<void>;
  createEmployee: (employee: Employee) => Promise<Employee>;
  updateEmployee: (employee: Employee) => Promise<Employee>;
  deleteEmployee: (employeeId: string) => Promise<Employee>;
  createPackage: (packageData: AdminPackage) => Promise<AdminPackage>;
  updatePackage: (packageData: AdminPackage) => Promise<AdminPackage>;
  deletePackage: (packageId: string) => Promise<AdminPackage>;
  createCustomer: (customer: CustomerAccount) => Promise<CustomerAccount>;
  updateCustomer: (customer: CustomerAccount) => Promise<CustomerAccount>;
  deleteCustomer: (customerId: string) => Promise<CustomerAccount>;
  updateManagerProfile: (profile: ManagerProfile) => Promise<ManagerProfile>;
}

const fallbackData: AdminBootstrapData = {
  employees,
  packages: adminPackages,
  attendanceRecords,
  customers,
  managerProfile,
};

const adminApiHint =
  'Jalankan `pnpm api:dev` atau `pnpm dev:full` agar admin kembali tersambung ke Neon.';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Gagal memuat data admin.';

const isConnectionError = (error: unknown) =>
  /failed to fetch|fetch failed|networkerror|load failed/i.test(getErrorMessage(error));

const buildFallbackNotice = (error: unknown) =>
  isConnectionError(error)
    ? `API admin belum aktif, menampilkan data dummy lokal sementara. ${adminApiHint}`
    : `${getErrorMessage(error)} Menampilkan data dummy lokal sementara. ${adminApiHint}`;

const AdminDataContext = createContext<AdminDataContextValue | undefined>(undefined);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AdminBootstrapData>(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextData = await fetchAdminBootstrap();
      setData(nextData);
      setNotice(null);
      setIsUsingFallback(false);
    } catch (fetchError) {
      setData(fallbackData);
      setNotice(buildFallbackNotice(fetchError));
      setIsUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const mutateAndRefresh = useCallback(
    async <T,>(request: Promise<T>) => {
      try {
        const result = await request;
        const nextData = await fetchAdminBootstrap();
        setData(nextData);
        setError(null);
        setNotice(null);
        setIsUsingFallback(false);
        return result;
      } catch (mutationError) {
        if (isConnectionError(mutationError)) {
          setNotice(buildFallbackNotice(mutationError));
          setIsUsingFallback(true);
          throw new Error(
            'API admin belum aktif. Jalankan `pnpm api:dev` atau `pnpm dev:full` agar perubahan tersimpan ke Neon.'
          );
        }

        throw mutationError instanceof Error
          ? mutationError
          : new Error('Gagal menyimpan perubahan data admin.');
      }
    },
    []
  );

  const contextValue = useMemo<AdminDataContextValue>(
    () => ({
      ...data,
      loading,
      error,
      notice,
      isUsingFallback,
      refreshData,
      createEmployee: (employee) => mutateAndRefresh(createEmployeeRequest(employee)),
      updateEmployee: (employee) => mutateAndRefresh(updateEmployeeRequest(employee)),
      deleteEmployee: (employeeId) => mutateAndRefresh(deleteEmployeeRequest(employeeId)),
      createPackage: (packageData) => mutateAndRefresh(createPackageRequest(packageData)),
      updatePackage: (packageData) => mutateAndRefresh(updatePackageRequest(packageData)),
      deletePackage: (packageId) => mutateAndRefresh(deletePackageRequest(packageId)),
      createCustomer: (customer) => mutateAndRefresh(createCustomerRequest(customer)),
      updateCustomer: (customer) => mutateAndRefresh(updateCustomerRequest(customer)),
      deleteCustomer: (customerId) => mutateAndRefresh(deleteCustomerRequest(customerId)),
      updateManagerProfile: (profile) => mutateAndRefresh(updateManagerProfileRequest(profile)),
    }),
    [data, loading, error, notice, isUsingFallback, refreshData, mutateAndRefresh]
  );

  return <AdminDataContext.Provider value={contextValue}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
  const context = useContext(AdminDataContext);

  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }

  return context;
}
