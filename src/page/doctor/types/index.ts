export interface DoctorFormData {
  email: string;
  phoneNumber: string;
  password: string;
  displayName: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: number;
  address: string;
  imageURL?: string;
  imageFile?: File;
  facilityId: string;
  doctorTitle: string;
  bio: string;
  examinationFee: number;
  yearsOfExperience: number;
  licenseNumber: string;
  isActive: boolean;
  specialtyIds: string[];
  timeSlots: DoctorTimeSlot[];
}

export interface DoctorTimeSlot {
  id?: string;
  timeSlotId: string;
  dayOfWeek: number;
  isActive: boolean;
}

export interface TimeSlotSelection {
  timeSlotId: string;
  timeSlotText: string;
  dayOfWeek: number;
  dayName: string;
}

export interface FacilityOption {
  id: string;
  facilityName: string;
  address: string;
  city: string;
}

export interface SpecialtyOption {
  id: string;
  specialtyName: string;
  description?: string;
}
