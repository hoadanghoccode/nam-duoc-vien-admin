import authorizedAxiosInstance from "../services/Axios";

// Appointment Status Enum
export const AppointmentStatus = {
  Pending: 1,
  Confirmed: 2,
  Completed: 3,
  Cancelled: 4,
  NoShow: 5,
} as const;

// Payment Status Enum
export const PaymentStatus = {
  Unpaid: 1,
  Paid: 2,
  Refunded: 3,
} as const;

// Appointment Types
export interface Appointment {
  id: string;
  appointmentDate: string;
  appointmentTime: string;
  status: typeof AppointmentStatus[keyof typeof AppointmentStatus];
  paymentStatus: typeof PaymentStatus[keyof typeof PaymentStatus];
  notes?: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  doctorTitle: string;
  doctorImageUrl?: string;
  facilityId: string;
  facilityName: string;
  specialtyName: string;
  examinationFee: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentQuery {
  search?: string;
  appointmentStatus?: typeof AppointmentStatus[keyof typeof AppointmentStatus];
  paymentStatus?: typeof PaymentStatus[keyof typeof PaymentStatus];
  doctorId?: string;
  facilityId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PagingResponse<T> {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  orderColumn: string;
  orderDirection: string;
  items: T[];
}

export interface UpdateAppointmentStatusPayload {
  id: string;
  status: typeof AppointmentStatus[keyof typeof AppointmentStatus];
  notes?: string;
}

// API Functions
export const appointmentApi = {
  getAppointments: (params: AppointmentQuery) =>
    authorizedAxiosInstance.get<PagingResponse<Appointment>>(
      "/admin/appointments",
      { params }
    ),
  
  getAppointmentDetail: (id: string) =>
    authorizedAxiosInstance.get<Appointment>(`/admin/appointments/${id}`),
  
  updateAppointmentStatus: (payload: UpdateAppointmentStatusPayload) =>
    authorizedAxiosInstance.put<Appointment>(
      `/admin/appointments/${payload.id}/status`,
      { status: payload.status, notes: payload.notes }
    ),
};
