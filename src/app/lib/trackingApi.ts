import type { Delivery } from '../types';

export interface CourierTrackingHistoryItem {
  status: string;
  location: string;
  timestamp: string;
  description: string;
  photoUrl?: string;
}

export interface CourierDelivery {
  id: string;
  resiNumber: string;
  recipient: string;
  recipientPhone: string;
  destination: string;
  currentLocation: string;
  status: string;
  estimatedTime: string;
  weight: string;
  statusColor: string;
  bgColor: string;
  history: CourierTrackingHistoryItem[];
}

export interface CourierTrackingEventPayload {
  status: string;
  location: string;
  description: string;
  timestamp: string;
  photoUrl?: string;
}

const requestJson = async <T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const responseText = await response.text();

  if (!response.ok) {
    try {
      const errorBody = JSON.parse(responseText) as { message?: string };
      throw new Error(errorBody.message || 'Gagal mengambil data tracking.');
    } catch {
      throw new Error(responseText || 'Gagal mengambil data tracking.');
    }
  }

  return JSON.parse(responseText) as T;
};

export const fetchTrackingByResi = (resi: string) =>
  requestJson<Delivery>(`/api/tracking/${encodeURIComponent(resi)}`);

export const fetchCourierPackages = (employeeId?: string) => {
  const url = employeeId
    ? `/api/courier/packages?employeeId=${encodeURIComponent(employeeId)}`
    : '/api/courier/packages';
  return requestJson<CourierDelivery[]>(url);
};

export const createCourierTrackingEvent = (
  packageId: string,
  payload: CourierTrackingEventPayload
) =>
  requestJson<Delivery>(`/api/courier/packages/${packageId}/tracking-events`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
