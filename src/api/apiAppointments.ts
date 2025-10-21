import authorizedAxiosInstance from "../services/Axios";

/* ====== Types ====== */
export type AdminAppointmentItem = {
  id: string;

  // Patient
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;

  // Doctor
  doctorId: string;
  doctorName: string;
  doctorTitle: string;
  doctorImageUrl: string;

  // Time
  appointmentDate: string; // ISO
  dayOfWeekName: string;
  startTime: string;
  endTime: string;
  timeSlotDisplay: string;

  // Facility & Specialty
  facilityName: string;
  facilityAddress: string;
  specialtyId: string;
  specialtyName: string;

  // Status & payment
  status: number;
  statusDisplay: string;
  fee: number;
  paymentStatus: number;
  paymentStatusDisplay: string;
  paymentMethod: number;

  // Misc
  reason?: string;
  notes?: string;
  createdAt: string;
  confirmedDate?: string;
  completedDate?: string;
  cancelledDate?: string;
  cancelReason?: string;
};

export type PagingResponse<T> = {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  orderColumn?: string;
  orderDirection?: string;
  items: T[];
};

/** Query params cho /api/admin/appointments */
export type AdminAppointmentsQuery = {
  searchTerm?: string;
  patientId?: string;
  doctorId?: string;
  facilityId?: string;
  specialtyId?: string;
  status?: 1 | 2 | 3 | 4 | 5;
  paymentStatus?: 1 | 2 | 3;
  fromDate?: string;
  toDate?: string;
  patientName?: string;
  doctorName?: string;
  pageIndex?: number;
  pageSize?: number;
  orderColumn?: string;
  orderDirection?: "ASC" | "DESC";
};

export type AdminAppointmentDetail = {
  id: string;

  // Patient
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  patientDateOfBirth: string;
  patientGender: string;
  patientAddress: string;

  // Doctor
  doctorId: string;
  doctorName: string;
  doctorTitle: string;
  doctorImageUrl: string;
  doctorPhone: string;
  doctorBio: string;
  doctorYearsOfExperience: number;

  // Time
  appointmentDate: string;
  dayOfWeekName: string;
  startTime: string;
  endTime: string;
  timeSlotDisplay: string;

  // Facility & Specialty
  facilityId: string;
  facilityName: string;
  facilityAddress: string;
  facilityPhone: string;
  specialtyId: string;
  specialty: {
    specialtyName: string;
    specialtyCode: string;
    description: string;
    imageURL: string;
    displayOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    id: string;
  };

  // Status & payment
  status: number;
  statusDisplay: string;
  fee: number;
  paymentStatus: number;
  paymentStatusDisplay: string;
  paymentMethod: number;
  paymentMethodDisplay: string;

  // Misc
  reason?: string;
  notes?: string;
  createdAt: string;
  confirmedDate?: string;
  completedDate?: string;
  cancelledDate?: string;
  cancelReason?: string;
  cancelledBy?: string;
  cancelledByName?: string;
};

export type ConfirmAppointmentRequest = {
  appointmentId: string; // id lịch hẹn
  notes?: string; // ghi chú (optional)
};

export type CompleteAppointmentRequest = {
  appointmentId: string; // id lịch hẹn
  notes?: string; // ghi chú (optional)
};

export type AdminCancelAppointmentRequest = {
  appointmentId: string; // id lịch hẹn
  cancelReason?: string; // lý do huỷ (optional)
};

export const adminAppointmentsApi = {
  getAppointments: (params: AdminAppointmentsQuery) =>
    authorizedAxiosInstance.get<PagingResponse<AdminAppointmentItem>>(
      "/admin/appointments",
      { params }
    ),
  getAppointmentDetail: (id: string) =>
    authorizedAxiosInstance.get<AdminAppointmentDetail>(
      `/admin/appointments/${id}`
    ),
  confirmAppointment: (id: string, payload: ConfirmAppointmentRequest) =>
    authorizedAxiosInstance.put<void>(
      `/admin/appointments/${id}/confirm`,
      payload
    ),
  completeAppointment: (id: string, payload: CompleteAppointmentRequest) =>
    authorizedAxiosInstance.put<void>(
      `/admin/appointments/${id}/complete`,
      payload
    ),
  cancelAppointment: (id: string, payload: AdminCancelAppointmentRequest) =>
    authorizedAxiosInstance.put<void>(
      `/admin/appointments/${id}/cancel`,
      payload
    ),
};
