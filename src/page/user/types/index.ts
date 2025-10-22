export interface UserFormData {
  id?: string;
  email: string;
  phoneNumber: string;
  password?: string;
  displayName: string;
  dateOfBirth?: string;
  gender?: number;
  address?: string;
  imageUrl?: string;
  imageFile?: File;
  role: "Admin" | "User";
  isActive: boolean;
}

export interface UserFormSubmit {
  email: string;
  phoneNumber: string;
  password?: string;
  displayName: string;
  dateOfBirth?: string;
  gender?: number;
  address?: string;
  imageUrl?: string;
  roles: string[];
  isActive: boolean;
  status?: number;
}
