import authorizedAxiosInstance from "../services/Axios";

// types/adminRevenueByDoctor.ts
export interface AdminRevenueByDoctorItem {
  doctorId: string;
  doctorName: string;
  doctorTitle: string;
  doctorEmail: string;
  doctorPhone: string;
  doctorImageUrl: string;
  facilityName: string;
  totalCompletedAppointments: number;
  totalCancelledAppointments: number;
  totalRevenue: number;
  commission: number;
  doctorEarnings: number;
  currentExaminationFee: number;
  totalPatients: number;
  commissionRate: number;
}

export interface PagingResponse<T> {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  orderColumn: string;
  orderDirection: string;
  items: T[];
}

export interface AdminRevenueByDoctorQuery {
  FromDate?: string;
  ToDate?: string;
  SearchTerm?: string;
  FacilityId?: string;
  SortBy?: string;
  SortOrder?: "asc" | "desc";
  PageIndex?: number;
  PageSize?: number;
  TopN?: number;
}

// types/adminRevenueStatistics.ts
export interface RevenueOverview {
  totalRevenue: number;
  totalCommission: number;
  totalDoctorEarnings: number;
  totalCompletedAppointments: number;
  totalCancelledAppointments: number;
  totalPendingAppointments: number;
  totalConfirmedAppointments: number;
  totalPatients: number;
  totalDoctors: number;
  commissionRate: number;
}

export interface PeriodRevenue {
  period: string;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  commission: number;
  doctorEarnings: number;
  completedAppointments: number;
  cancelledAppointments: number;
  commissionRate: number;
}

export interface TopDoctor {
  doctorId: string;
  doctorName: string;
  doctorTitle: string;
  doctorEmail: string;
  doctorPhone: string;
  doctorImageUrl: string;
  facilityName: string;
  totalCompletedAppointments: number;
  totalCancelledAppointments: number;
  totalRevenue: number;
  commission: number;
  doctorEarnings: number;
  currentExaminationFee: number;
  totalPatients: number;
  commissionRate: number;
}

export interface AdminRevenueStatisticsResponse {
  fromDate: string;
  toDate: string;
  overview: RevenueOverview;
  periodRevenues: PeriodRevenue[];
  topDoctors: TopDoctor[];
}

export interface AdminRevenueStatisticsQuery {
  FromDate?: string;
  ToDate?: string;
  PeriodType?: string;
  TopDoctorsCount?: number;
}

// types/adminTopDoctors.ts
export interface AdminTopDoctorItem {
  doctorId: string;
  doctorName: string;
  doctorTitle: string;
  doctorEmail: string;
  doctorPhone: string;
  doctorImageUrl: string;
  facilityName: string;
  totalCompletedAppointments: number;
  totalCancelledAppointments: number;
  totalRevenue: number;
  commission: number;
  doctorEarnings: number;
  currentExaminationFee: number;
  totalPatients: number;
  commissionRate: number;
}

export interface AdminTopDoctorQuery {
  topN?: number;
  fromDate?: string;
  toDate?: string;
}

export interface AdminRevenueByPeriodQuery {
  FromDate?: string;
  ToDate?: string;
  PeriodType?: "daily" | "monthly" | "yearly";
  DoctorId?: string;
  FacilityId?: string;
}

export interface AdminRevenueByPeriodItem {
  period: string;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  commission: number;
  doctorEarnings: number;
  completedAppointments: number;
  cancelledAppointments: number;
  commissionRate: number;
}

export type RevenueOverviewResponse = {
  totalRevenue: number;
  totalCommission: number;
  totalDoctorEarnings: number;
  totalCompletedAppointments: number;
  totalCancelledAppointments: number;
  totalPendingAppointments: number;
  totalConfirmedAppointments: number;
  totalPatients: number;
  totalDoctors: number;
  commissionRate: number;
};

export type RevenueOverviewQuery = {
  fromDate?: string; // ISO string (optional)
  toDate?: string; // ISO string (optional)
};

export const adminRevenueByDoctorApi = {
  getRevenueByDoctor: (params: AdminRevenueByDoctorQuery) =>
    authorizedAxiosInstance.get<PagingResponse<AdminRevenueByDoctorItem>>(
      "/admin/dashboard/revenue/by-doctor",
      { params }
    ),
  getRevenueStatistics: (params: AdminRevenueStatisticsQuery) =>
    authorizedAxiosInstance.get<AdminRevenueStatisticsResponse>(
      "/admin/dashboard/revenue/statistics",
      { params }
    ),
  getTopDoctors: (params: AdminTopDoctorQuery) =>
    authorizedAxiosInstance.get<PagingResponse<AdminTopDoctorItem>>(
      "/admin/dashboard/revenue/top-doctors",
      { params }
    ),
  getRevenueByPeriod: (params: AdminRevenueByPeriodQuery) =>
    authorizedAxiosInstance.get<AdminRevenueByPeriodItem[]>(
      "/admin/dashboard/revenue/by-period",
      { params }
    ),
  getRevenueOverview: (query?: RevenueOverviewQuery) =>
    authorizedAxiosInstance.get<RevenueOverviewResponse>(
      "/admin/dashboard/revenue/overview",
      { params: query }
    ),
};
