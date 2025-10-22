import authorizedAxiosInstance from "../services/Axios";

// ========== Types ==========
export interface RoleItem {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface AdminUserItem {
  id: string;
  email: string;
  phoneNumber: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: number;
  address?: string;
  imageUrl?: string;
  role?: "Admin" | "User"; // For display purposes (derived from roles array)
  roles?: RoleItem[]; // Actual roles from API (array of objects)
  status?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserDetail extends AdminUserItem {
  // Doctor-specific fields
  facilityId?: string;
  doctorTitle?: string;
  bio?: string;
  examinationFee?: number;
  yearsOfExperience?: number;
  licenseNumber?: string;
}

export interface AdminUsersQuery {
  PageIndex?: number;
  PageSize?: number;
  OrderColumn?: string;
  OrderDirection?: "asc" | "desc";
  Role?: "Admin" | "User";
  SearchTerm?: string;
  IsActive?: boolean;
}

export interface PagingResponse<T> {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  orderColumn?: string;
  orderDirection?: string;
  items: T[];
}

export interface CreateAdminUserRequest {
  email: string;
  phoneNumber: string;
  password: string;
  displayName: string;
  isActive: boolean;
  status?: number;
  dateOfBirth?: string;
  gender?: number;
  address?: string;
  imageUrl?: string;
  roles: string[];
  // Doctor-specific fields (optional)
  facilityId?: string;
  doctorTitle?: string;
  bio?: string;
  examinationFee?: number;
  yearsOfExperience?: number;
  licenseNumber?: string;
}

export interface UpdateAdminUserRequest {
  email: string;
  displayName: string;
  phoneNumber: string;
  isActive: boolean;
  status?: number;
  dateOfBirth?: string;
  gender?: number;
  address?: string;
  imageUrl?: string;
  roles: string[];
  // Doctor-specific fields (optional)
  facilityId?: string;
  doctorTitle?: string;
  bio?: string;
  examinationFee?: number;
  yearsOfExperience?: number;
  licenseNumber?: string;
}

export interface ResetPasswordRequest {
  userId: string;
  newPassword?: string;
}

export interface DeleteAdminUserResponse {
  success: boolean;
  message?: string;
}

export interface ResetUserPasswordResponse {
  success: boolean;
  message?: string;
}

// ========== API ==========
export const adminUsersApi = {
  // Get list with pagination
  getList: (query: AdminUsersQuery) => {
    const params = new URLSearchParams();
    if (query.PageIndex) params.append("PageIndex", query.PageIndex.toString());
    if (query.PageSize) params.append("PageSize", query.PageSize.toString());
    if (query.OrderColumn) params.append("OrderColumn", query.OrderColumn);
    if (query.OrderDirection) params.append("OrderDirection", query.OrderDirection);
    if (query.Role) params.append("Role", query.Role);
    if (query.SearchTerm) params.append("SearchTerm", query.SearchTerm);
    if (query.IsActive !== undefined) params.append("IsActive", query.IsActive.toString());

    return authorizedAxiosInstance.get<PagingResponse<AdminUserItem>>(
      `/admin/users?${params.toString()}`
    );
  },

  // Get by ID
  getById: (id: string) => {
    return authorizedAxiosInstance.get<AdminUserDetail>(`/admin/users/${id}`);
  },

  // Create
  create: (data: CreateAdminUserRequest) => {
    return authorizedAxiosInstance.post<AdminUserDetail>("/admin/users", data);
  },

  // Update
  update: (id: string, data: UpdateAdminUserRequest) => {
    return authorizedAxiosInstance.put<AdminUserDetail>(`/admin/users/${id}`, data);
  },

  // Delete
  delete: (id: string) => {
    return authorizedAxiosInstance.delete(`/admin/users/${id}`);
  },

  // Reset password
  resetPassword: (data: ResetPasswordRequest) => {
    return authorizedAxiosInstance.post<ResetUserPasswordResponse>(
      `/admin/users/reset-password`,
      data.newPassword ? { newPassword: data.newPassword } : {}
    );
  },
};
