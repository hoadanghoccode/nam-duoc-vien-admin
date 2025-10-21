import React from "react";
import { Card, Spin, Alert } from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import dayjs from "dayjs";

interface PeriodRevenue {
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

interface RevenueStatisticsChartProps {
  data: PeriodRevenue[];
  periodType: "daily" | "monthly" | "yearly";
  title: string;
  loading?: boolean;
  error?: string;
}

const RevenueStatisticsChart: React.FC<RevenueStatisticsChartProps> = ({
  data,
  periodType,
  title,
  loading = false,
  error,
}) => {
  // Format data for chart
  const chartData = data?.map((item) => ({
    period: item.period,
    formattedPeriod: formatPeriod(item.period, periodType),
    totalRevenue: item.totalRevenue,
    commission: item.commission,
    doctorEarnings: item.doctorEarnings,
    completedAppointments: item.completedAppointments,
    cancelledAppointments: item.cancelledAppointments,
    commissionRate: item.commissionRate,
  })) || [];

  // Format period for display
  function formatPeriod(period: string, type: "daily" | "monthly" | "yearly"): string {
    switch (type) {
      case "daily":
        return dayjs(period).format("DD/MM");
      case "monthly":
        return dayjs(period).format("MM/YYYY");
      case "yearly":
        return dayjs(period).format("YYYY");
      default:
        return period;
    }
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '12px', 
          border: '1px solid #d9d9d9', 
          borderRadius: '6px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
        }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>{`Kỳ: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ margin: '0 0 4px 0', color: entry.color }}>
              {`${entry.name}: ${entry.value?.toLocaleString("vi-VN")}${entry.name.includes('Revenue') || entry.name.includes('commission') || entry.name.includes('Earnings') ? ' VNĐ' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card title={title}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={title}>
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
        />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card title={title}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <p style={{ color: '#999' }}>Không có dữ liệu</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title={title}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Revenue Chart */}
        <div style={{ height: 400 }}>
          <h4 style={{ marginBottom: '16px' }}>Doanh thu theo thời gian</h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="formattedPeriod" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalRevenue"
                stroke="#3f8600"
                strokeWidth={3}
                name="Tổng doanh thu (VNĐ)"
                dot={{ fill: '#3f8600', strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="commission"
                stroke="#1890ff"
                strokeWidth={2}
                name="Hoa hồng (VNĐ)"
                dot={{ fill: '#1890ff', strokeWidth: 2, r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="doctorEarnings"
                stroke="#722ed1"
                strokeWidth={2}
                name="Thu nhập bác sĩ (VNĐ)"
                dot={{ fill: '#722ed1', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Appointments Chart */}
        <div style={{ height: 400 }}>
          <h4 style={{ marginBottom: '16px' }}>Số ca khám theo thời gian</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="formattedPeriod" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="completedAppointments"
                fill="#52c41a"
                name="Ca khám hoàn thành"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="cancelledAppointments"
                fill="#ff4d4f"
                name="Ca khám bị hủy"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Commission Rate Chart */}
        <div style={{ height: 300 }}>
          <h4 style={{ marginBottom: '16px' }}>Tỷ lệ hoa hồng theo thời gian</h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="formattedPeriod" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="commissionRate"
                stroke="#fa8c16"
                strokeWidth={3}
                name="Tỷ lệ hoa hồng (%)"
                dot={{ fill: '#fa8c16', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export default RevenueStatisticsChart;
