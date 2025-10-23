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
  Roles?: "Admin" | "User";
  SearchingKeyWord?: string;
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
  confirmPassword: string;
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

export type UserProfile = {
  id: string;
  userName: string;
  email: string;
  displayName: string;
  phoneNumber: string;
  title: string | null;
  status: string;
  isActive: boolean;
  dateOfBirth: string | null;
  gender: number | null; // 1 = Male, 2 = Female, 3 = Other
  address: string | null;
  imageUrl: string | null;
  isEmailVerified: boolean;
  facilityId: string | null;
  facilityName: string | null;
  doctorTitle: string | null;
  bio: string | null;
  examinationFee: number | null;
  yearsOfExperience: number | null;
  licenseNumber: string | null;
  roles?: Array<{
    id: string;
    name: string;
    description: string;
    isActive: boolean;
  }>;
  userHistories?: Array<{
    action: string;
    environment: string;
    ipConnected: string;
    deviceName: string;
  }>;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

// ========== API ==========
export const adminUsersApi = {
  // Get list with pagination
  getList: (query: AdminUsersQuery) => {
    const params = new URLSearchParams();
    if (query.PageIndex) params.append("PageIndex", query.PageIndex.toString());
    if (query.PageSize) params.append("PageSize", query.PageSize.toString());
    if (query.OrderColumn) params.append("OrderColumn", query.OrderColumn);
    if (query.OrderDirection)
      params.append("OrderDirection", query.OrderDirection);
    if (query.Roles) params.append("Roles", query.Roles);
    if (query.SearchingKeyWord)
      params.append("SearchingKeyWord", query.SearchingKeyWord);
    if (query.IsActive !== undefined)
      params.append("IsActive", query.IsActive.toString());

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
    return authorizedAxiosInstance.put<AdminUserDetail>(
      `/admin/users/${id}`,
      data
    );
  },

  changePassword: (data: ChangePasswordRequest) => {
    return authorizedAxiosInstance.post(
      "/public/users/me/change-password",
      data
    );
  },

  // Delete
  delete: (id: string) => {
    return authorizedAxiosInstance.delete(`/admin/users/${id}`);
  },

  // Reset password
  resetPassword: (data: ResetPasswordRequest) => {
    return authorizedAxiosInstance.post<ResetUserPasswordResponse>(
      `/admin/users/reset-password`,
      {
        userId: data.userId,
      }
    );
  },
  getMyProfile: () => {
    return authorizedAxiosInstance.get<UserProfile>("/public/users/me");
  },

  updateMyProfile: (data: Partial<UserProfile>) => {
    return authorizedAxiosInstance.put<UserProfile>("/public/users/me", data);
  },
};
