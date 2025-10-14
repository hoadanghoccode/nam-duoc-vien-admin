// services/roleService.ts
import authorizedAxiosInstance from "../../services/Axios";

// ========================================
// TYPE DEFINITIONS MATCHING ACTUAL API
// ========================================

export interface Permission {
  actionCode: string;
  resourceCode: string;
  name: string;
}

// Role interface matching API response
export interface Role {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;  // Optional vì GetRoles không có field này
  isActive: boolean;
  permissions?: Permission[];  // Optional vì GetRoles không có field này
}

// Paginated response for GetRoles API
export interface PaginatedRolesResponse {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  orderColumn: string | null;
  orderDirection: string | null;
  items: Role[];
}

// Resource and Action structure from GetResourceActions API
export interface Action {
  code: string;
  name: string;
}

export interface Resource {
  code: string;
  name: string;
}

export interface ResourceAction {
  resource: Resource;
  actions: Action[];
}

// For backward compatibility with component
export interface SimpleResourceAction {
  resourceCode: string;
  actions: string[];
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions?: Permission[];
}

export interface UpdateRoleRequest {
  name: string;
  description?: string;
  permissions?: Permission[];
}

// ========================================
// API SERVICE CLASS
// ========================================

export class RoleService {
  // GET /api/Role/GetRoles - Returns paginated response
//   static async getRoles(pageIndex = 1, pageSize = 20): Promise<Role[]> {
//     try {
//       const response = await authorizedAxiosInstance.get<PaginatedRolesResponse>('/Role/GetRoles', {
//         params: { pageIndex, pageSize }
//       });      
//       const data = response.data;

//       // Validate response structure
//       if (!data || !Array.isArray(data.items)) {
//         console.warn('getRoles: Invalid response structure', data);
//         return [];
//       }

//       return data.items;
//     } catch (error: any) {
//       console.error('Error fetching roles:', error);
//       const message = error.response?.data?.message || error.message || 'Không thể lấy danh sách vai trò';
//       throw new Error(message);
//     }
//   }

// services/roleService.ts
static async getRoles(pageIndex = 1, pageSize = 20): Promise<Role[]> {
  try {
   
    const response = await authorizedAxiosInstance.get<PaginatedRolesResponse>('/Role/GetRoles', {
      params: { pageIndex, pageSize }
    }); 
    const data = response.data;
    
    if (!data || !Array.isArray(data.items)) {
      console.warn('⚠️ Invalid response structure:', data);
      return [];
    }
    
    return data.items;
    
  } catch (error: any) {
    console.error('❌ Error in getRoles:', error);
    console.log('Request details:', error.config);
    throw error;
  }
}


  // GET /api/Role/GetRole/{roleId} - Returns role with permissions
  static async getRoleById(roleId: string): Promise<Role> {
    try {
      if (!roleId) {
        throw new Error('Role ID is required');
      }

      const response = await authorizedAxiosInstance.get<Role>(`/Role/GetRole/${roleId}`);
      
      if (!response.data) {
        throw new Error('No role data received');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error fetching role:', error);
      const message = error.response?.data?.messages || error.message || 'Không thể lấy thông tin vai trò';
      throw new Error(message);
    }
  }

  // GET /api/Role/GetResourceActions - Returns complex nested structure
  static async getResourceActions(): Promise<SimpleResourceAction[]> {
    try {
      const response = await authorizedAxiosInstance.get<ResourceAction[]>('/Role/GetResourceActions');

      
      const data = response.data;

      // Validate response structure
      if (!Array.isArray(data)) {
        console.warn('getResourceActions: Expected array but got:', typeof data);
        return [];
      }

      // Transform complex API response to simple format for component
      const simplifiedResourceActions: SimpleResourceAction[] = data.map(item => ({
        resourceCode: item.resource.code,
        actions: item.actions.map(action => action.code)
      }));

      return simplifiedResourceActions;
    } catch (error: any) {
      console.error('Error fetching resource actions:', error);
      const message = error.response?.data?.messages || error.message || 'Không thể lấy danh sách hành động tài nguyên';
      throw new Error(message);
    }
  }

  // GET /api/Role/GetResourceActions - Raw format với tên tiếng Việt
  static async getResourceActionsWithNames(): Promise<ResourceAction[]> {
    try {
      const response = await authorizedAxiosInstance.get<ResourceAction[]>('/Role/GetResourceActions');

      console.log("getResourceActionsWithNames", response.data);
      
      const data = response.data;
      if (!Array.isArray(data)) {
        console.warn('getResourceActionsWithNames: Invalid response structure');
        return [];
      }

      return data;
    } catch (error: any) {
      console.error('Error fetching resource actions with names:', error);
      throw new Error('Không thể lấy danh sách resource actions với tên');
    }
  }

  // POST /api/Role/CreateRole - Create new role
 static async createRole(roleData: CreateRoleRequest): Promise<boolean> {
  try {
    if (!roleData.name) {
      throw new Error('Role name is required');
    }

    const response = await authorizedAxiosInstance.post('/Role/CreateRole', {
      ...roleData,
      permissions: roleData.permissions || []
    });

    // Chỉ trả về true/false dựa trên status code
    return response.status >= 200 && response.status < 300;

  } catch (error: any) {
    console.error('Error creating role:', error);
    const message = error.response?.data?.messages || error.message || 'Không thể tạo vai trò mới';
    throw new Error(message);
  }
}


  // PUT /api/Role/UpdateRole/{roleId} - Update existing role
  static async updateRole(roleId: string, roleData: UpdateRoleRequest): Promise<boolean> {
  try {
    if (!roleId) {
      throw new Error('Role ID is required');
    }

    if (!roleData.name) {
      throw new Error('Role name is required');
    }

    const response = await authorizedAxiosInstance.put(`/Role/UpdateRole/${roleId}`, {
      ...roleData,
      permissions: roleData.permissions || []
    });

    // console.log("updateRole", response);
    
    // Kiểm tra status code thành công (2xx) - PUT thường trả về 200 hoặc 204
    return response.status >= 200 && response.status < 300;

  } catch (error: any) {
    console.error('Error updating role:', error);
    const message = error.response?.data?.messages || error.message || 'Không thể cập nhật vai trò';

    console.log("updateRole", message);
    
    throw new Error(message);  
  }
}


  // DELETE /api/Role/DeleteRole/{roleId} - Delete role
  static async deleteRole(roleId: string): Promise<void> {
    try {
      if (!roleId) {
        throw new Error('Role ID is required');
      }

      await authorizedAxiosInstance.delete(`/Role/DeleteRole/${roleId}`);
    } catch (error: any) {
      console.error('Error deleting role:', error);
      const message = error.response?.data?.messages || error.message || 'Không thể xóa vai trò';
      throw new Error(message);
    }
  }

  // Utility method để lấy tất cả roles (handle pagination)
  static async getAllRoles(): Promise<Role[]> {
    try {
      // Có thể implement pagination loop nếu cần
      // Hiện tại chỉ lấy page đầu tiên với size lớn
      return await this.getRoles(1, 100);
    } catch (error) {
      console.error('Error getting all roles:', error);
      return [];
    }
  }
}

export default RoleService;