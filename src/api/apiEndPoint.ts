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
