import authorizedAxiosInstance from "../services/Axios";

export const authen = {
  login: (credentials: { email: string; password: string }) => {
    return authorizedAxiosInstance.post("/Authentication/Login", credentials);
  },
  role: () => {
    return authorizedAxiosInstance.get("/Role/GetRoles");
  },

  // Đăng ký tài khoản
  register: (data: {
    displayName: string;
    password: string;
    email: string;
    phone: string;
    date_of_birth: string;
    gender: string;
  }) => {
    return authorizedAxiosInstance.post("/auth/register", data);
  },

  refreshToken: (refreshToken: string) => {
    return authorizedAxiosInstance.post("/auth/refresh-token", {
      refreshToken,
    });
  },
};

// Content Management API
export const contentApi = {
  // Lấy nội dung trang theo pageKey
  getContentPage: (pageKey: number) => {
    return authorizedAxiosInstance.get(`/admin/content-pages/${pageKey}`);
  },

  // Cập nhật nội dung trang
  updateContentPage: (
    pageKey: number,
    data: {
      pageTitle: string;
      contentHTML: string;
      isActive: boolean;
    }
  ) => {
    return authorizedAxiosInstance.put(`/admin/content-pages/${pageKey}`, data);
  },
};

// ===== Types =====
export interface Specialty {
  id: string;
  specialtyName: string;
  specialtyCode: string;
  description: string;
  imageURL: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SpecialtyPaging {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  orderColumn: string | null;
  orderDirection: "asc" | "desc" | string | null;
  items: Specialty[];
}

export type CreateSpecialtyDto = {
  specialtyName: string;
  description?: string;
  imageURL?: string;
  displayOrder?: number;
  isActive?: boolean;
};

export interface PublicSpecialty {
  id: string;
  specialtyName: string;
  specialtyCode: string;
  description: string;
  imageURL: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicSpecialtyPaging {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  orderColumn: string | null;
  orderDirection: "asc" | "desc" | string | null;
  items: PublicSpecialty[];
}

export const specialtyApi = {
  getListSpecialties: (params: {
    page?: number;
    limit?: number;
    orderColumn?: string;
    orderDirection?: "asc" | "desc" | string;
    search?: string; // nếu backend sau này hỗ trợ
  }) => {
    const q = {
      PageIndex: params?.page ?? 1,
      PageSize: params?.limit ?? 10,
      OrderColumn: params?.orderColumn ?? "",
      OrderDirection: params?.orderDirection ?? "",
      Search: params?.search ?? "",
    };
    return authorizedAxiosInstance.get<SpecialtyPaging>("/admin/specialties", {
      params: q,
    });
  },

  getSpecialtyById: (id: string) => {
    return authorizedAxiosInstance.get<Specialty>(`/admin/specialties/${id}`);
  },

  createSpecialty: (payload: CreateSpecialtyDto) => {
    // Swagger gợi ý application/json (hoặc application/json-patch+json)
    return authorizedAxiosInstance.post<Specialty>(
      "/admin/specialties",
      payload
    );
  },

  updateSpecialty: (id: string, payload: CreateSpecialtyDto) => {
    return authorizedAxiosInstance.put<Specialty>(
      `/admin/specialties/${id}`,
      payload
    );
  },
  deleteSpecialty: (id: string) => {
    return authorizedAxiosInstance.delete<void>(`/admin/specialties/${id}`);
  },
};

// PageKey mapping theo API documentation
export const PAGE_KEY_MAP = {
  ABOUT_US: 1, // AboutUs (Giới thiệu)
  DONG_Y_INTRO: 2, // DongYIntro (Giới thiệu Đông Y)
  TERMS_OF_SERVICE: 3, // TermsOfService (Điều khoản dịch vụ)
  PRIVACY_POLICY: 4, // PrivacyPolicy (Chính sách bảo mật)
  CONTACT_INFO: 5, // ContactInfo (Thông tin liên hệ)
  FAQ: 6, // FAQ (Câu hỏi thường gặp)
  USER_GUIDE: 7, // UserGuide (Hướng dẫn sử dụng)
} as const;

export type PageKeyType = (typeof PAGE_KEY_MAP)[keyof typeof PAGE_KEY_MAP];

// Interface cho response từ API
export interface ContentPageResponse {
  pageKey: string;
  pageTitle: string;
  contentHTML: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  id: string;
}

/** ===== Types ===== */
export type CreateMedicalFacilityDto = {
  facilityName: string;
  address?: string;
  city?: string;
  district?: string;
  ward?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  imageURL?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
  specialtyIds?: string[]; // danh sách Specialty UUID
};

// (tuỳ BE, thường trả về record vừa tạo)
export type MedicalFacility = {
  id: string;
  facilityName: string;
  facilityCode: string; // auto-generate từ facilityName
  address: string;
  city: string;
  district: string;
  ward: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  imageURL: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  specialties: Array<{
    id: string; // id quan hệ
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
  }>;
};

export type FacilitySpecialty = {
  id: string; // id quan hệ
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

export type MedicalFacilityPaging = {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  orderColumn: string | null;
  orderDirection: "asc" | "desc" | string | null;
  items: MedicalFacility[];
};

export type UpdateMedicalFacilityDto = {
  facilityName: string;
  address?: string;
  city?: string;
  district?: string;
  ward?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  imageURL?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
  specialties?: { id: string; specialtyId: string }[]; // theo swagger
};

export const medicalFacilityAdminApi = {
  createFacility: (payload: CreateMedicalFacilityDto) => {
    return authorizedAxiosInstance.post<MedicalFacility>(
      "/admin/medical-facilities",
      payload
    );
  },
  getFacilities: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    city?: string;
    district?: string;
    isActive?: boolean;
    specialtyId?: string;
    orderColumn?: string;
    orderDirection?: "asc" | "desc" | string;
  }) => {
    const q = {
      SearchTerm: params?.search ?? "",
      City: params?.city ?? "",
      District: params?.district ?? "",
      IsActive:
        typeof params?.isActive === "boolean" ? params?.isActive : undefined,
      SpecialtyId: params?.specialtyId ?? "",
      PageIndex: params?.page ?? 1,
      PageSize: params?.limit ?? 10,
      OrderColumn: params?.orderColumn ?? "",
      OrderDirection: params?.orderDirection ?? "",
    };
    return authorizedAxiosInstance.get<MedicalFacilityPaging>(
      "/admin/medical-facilities",
      { params: q }
    );
  },
  deleteFacility: (id: string) => {
    // 204 No Content khi thành công
    return authorizedAxiosInstance.delete<void>(
      `/admin/medical-facilities/${id}`
    );
  },
  getFacilityById: (id: string) => {
    return authorizedAxiosInstance.get<MedicalFacility>(
      `/admin/medical-facilities/${id}`
    );
  },
  updateFacility: (id: string, payload: UpdateMedicalFacilityDto) => {
    return authorizedAxiosInstance.put(
      `/admin/medical-facilities/${id}`,
      payload
    );
  },
};
