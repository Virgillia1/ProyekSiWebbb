export type UserRole = 'customer' | 'admin' | 'courier';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  employeeId?: string;
  courierId?: string;
  address?: string;
  customerId?: string;
}

export interface RegisterCustomerPayload {
  name: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  password: string;
}

export interface RegisterAdminPayload {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  verificationCode: string;
}

export interface ResetPasswordPayload {
  username: string;
  password: string;
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
    const fallbackMessage = 'Permintaan autentikasi gagal.';
    const responseText = await response.text();
    let errorMessage = responseText || fallbackMessage;

    try {
      const errorBody = JSON.parse(responseText) as { message?: string };
      errorMessage = errorBody.message || fallbackMessage;
    } catch {
      errorMessage = responseText || fallbackMessage;
    }

    throw new Error(errorMessage);
  }

  return (await response.json()) as T;
};

export const loginRequest = (username: string, password: string) =>
  requestJson<AuthUser>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

export const registerCustomerRequest = (payload: RegisterCustomerPayload) =>
  requestJson<AuthUser>('/api/auth/register/customer', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const registerAdminRequest = (payload: RegisterAdminPayload) =>
  requestJson<AuthUser>('/api/auth/register/admin', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const resetPasswordRequest = (payload: ResetPasswordPayload) =>
  requestJson<{ ok: boolean; message: string }>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export interface UpdateCustomerProfilePayload {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export const updateCustomerProfileRequest = (customerId: string, payload: UpdateCustomerProfilePayload) =>
  requestJson<AuthUser>(`/api/customer/profile/${customerId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
