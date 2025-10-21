import authorizedAxiosInstance from "../services/Axios";

/** ===== Types ===== */
export type AdminTimeSlot = {
  id: string;
  startTime: string; // "HH:mm" hoặc ISO theo BE
  endTime: string; // "HH:mm" hoặc ISO theo BE
  displayOrder: number;
  isActive: boolean;
  displayText: string; // vd: "05:00 - 06:00"
};

export type AdminDoctorTimeSlotUpsert = {
  id?: string; // optional (khi update), create thì có thể bỏ
  timeSlotId: string; // id khung giờ (bắt buộc)
  dayOfWeek: number; // 1 (Mon) -> 7 (Sun)
  isActive: boolean;
};

export type CreateAdminDoctorPayload = {
  email: string;
  phoneNumber: string;
  password: string;

  displayName: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO string, vd: "1990-01-15T00:00:00Z"
  gender: number; // 0/1/2 theo BE
  address: string;
  imageUrl?: string;

  facilityId: string;
  doctorTitle: string;
  bio?: string;
  examinationFee: number;
  yearsOfExperience: number;
  licenseNumber: string;
  isActive: boolean;

  specialtyIds: string[];
  timeSlots: AdminDoctorTimeSlotUpsert[];
};

/** BE có thể trả về full object hoặc {id}. Ta để kiểu generic cho an toàn */
export type CreateAdminDoctorResponse = {
  id?: string;
  [k: string]: any;
};

export type AdminDoctorSpecialtyLink = {
  id: string;
  specialty: {
    id: string;
    specialtyName: string;
    specialtyCode: string;
    description: string;
    imageURL: string;
    displayOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  isActive: boolean;
};

export type AdminDoctorTimeSlotLink = {
  id: string;
  timeSlot: {
    id: string;
    startTime: string;
    endTime: string;
    displayOrder: number;
    isActive: boolean;
    displayText: string;
  };
  dayOfWeek: number; // 1..7
  isActive: boolean;
};

export type AdminDoctorItem = {
  id: string;
  email: string;
  phoneNumber: string;
  displayName: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  imageUrl: string;
  facilityId: string;
  facilityName: string;
  doctorTitle: string;
  bio: string;
  examinationFee: number;
  yearsOfExperience: number;
  licenseNumber: string;
  isActive: boolean;
  createdAt: string;
  modifiedAt: string;
  specialties: AdminDoctorSpecialtyLink[];
  timeSlots: AdminDoctorTimeSlotLink[];
};

export type AdminDoctorPaging = {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  orderColumn: string | null;
  orderDirection: "asc" | "desc" | string | null;
  items: AdminDoctorItem[];
};

export type AdminDoctorSpecialtyUpsert = {
  id?: string | null; // null/undefined => tạo mới; có id => update
  specialtyId: string;
};

export type UpdateAdminDoctorPayload = {
  id: string; // doctor id (đồng bộ với path)
  email: string;
  phoneNumber: string;
  displayName: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO string
  gender: number;
  address: string;
  imageUrl?: string;

  facilityId: string;
  doctorTitle: string;
  bio?: string;
  examinationFee: number;
  yearsOfExperience: number;
  licenseNumber: string;
  isActive: boolean;

  specialties: AdminDoctorSpecialtyUpsert[]; // mục có id=null => create; không có trong mảng => delete
  timeSlots: AdminDoctorTimeSlotUpsert[]; // tương tự
};

export type UpdateAdminDoctorResponse = {
  id: string;
  [k: string]: any;
};

export type AdminDoctorSpecialtyDetail = {
  id: string; // link id
  isActive: boolean;
  specialty: {
    id: string;
    specialtyName: string;
    specialtyCode: string;
    description: string;
    imageURL: string;
    displayOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
};

export type AdminDoctorTimeSlotDetail = {
  id: string; // link id
  dayOfWeek: number; // 1..7
  isActive: boolean;
  timeSlot: {
    id: string;
    startTime: string;
    endTime: string;
    displayOrder: number;
    isActive: boolean;
    displayText: string;
  };
};

export type AdminDoctorDetail = {
  id: string;
  email: string;
  phoneNumber: string;
  displayName: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  imageUrl: string;
  facilityId: string;
  facilityName: string;
  doctorTitle: string;
  bio: string;
  examinationFee: number;
  yearsOfExperience: number;
  licenseNumber: string;
  isActive: boolean;
  createdAt: string;
  modifiedAt: string;
  specialties: AdminDoctorSpecialtyDetail[];
  timeSlots: AdminDoctorTimeSlotDetail[];
};

export type AdminSpecialty = {
  id: string;
  specialtyName: string;
  specialtyCode: string;
  description: string;
  imageURL: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

/** ===== API ===== */
export const adminTimeSlotApi = {
  getTimeSlots: (isActive?: boolean) =>
    authorizedAxiosInstance.get<AdminTimeSlot[]>("/admin/time-slots", {
      params: typeof isActive === "boolean" ? { isActive } : undefined,
    }),
};
export const adminDoctorsApi = {
  createDoctor: (payload: CreateAdminDoctorPayload) =>
    authorizedAxiosInstance.post<CreateAdminDoctorResponse>(
      "/admin/doctors",
      payload
    ),
  getDoctors: (params?: {
    searchTerm?: string;
    facilityId?: string;
    specialtyId?: string;
    isActive?: boolean; // nếu bỏ qua => không filter
    doctorTitle?: string;
    page?: number; // UI 1-based
    limit?: number;
    orderColumn?: string;
    orderDirection?: "asc" | "desc" | string;
  }) => {
    const q: any = {
      SearchTerm: params?.searchTerm ?? "",
      FacilityId: params?.facilityId ?? "",
      SpecialtyId: params?.specialtyId ?? "",
      DoctorTitle: params?.doctorTitle ?? "",
      PageIndex: params?.page ?? 1,
      PageSize: params?.limit ?? 10,
      OrderColumn: params?.orderColumn ?? "",
      OrderDirection: params?.orderDirection ?? "",
    };
    if (typeof params?.isActive === "boolean") q.IsActive = params.isActive;

    return authorizedAxiosInstance.get<AdminDoctorPaging>("/admin/doctors", {
      params: q,
    });
  },
  updateDoctor: (id: string, payload: UpdateAdminDoctorPayload) =>
    authorizedAxiosInstance.put<UpdateAdminDoctorResponse>(
      `/admin/doctors/${id}`,
      payload
    ),
  getDoctorById: (id: string) =>
    authorizedAxiosInstance.get<AdminDoctorDetail>(`/admin/doctors/${id}`),

  deleteDoctor: (id: string) =>
    authorizedAxiosInstance.delete<void>(`/admin/doctors/${id}`),

  getByFacility: (facilityId: string, isActive: boolean = true) =>
    authorizedAxiosInstance.get<AdminSpecialty[]>(
      `/admin/specialties/by-facility/${facilityId}`,
      { params: { isActive } }
    ),
};
