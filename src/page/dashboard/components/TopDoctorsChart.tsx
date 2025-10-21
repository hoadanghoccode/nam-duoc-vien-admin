import React, { useEffect } from "react";
import { Card, Spin, Alert, Select, Button, Table, Tag } from "antd";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../store/Store";
import { fetchTopDoctors } from "../../../store/dashboard/adminTopDoctorsSlice";

const { Option } = Select;

interface TopDoctorsChartProps {
  title?: string;
  height?: number;
  showFilters?: boolean;
}

const TopDoctorsChart: React.FC<TopDoctorsChartProps> = ({
  title = "Top bác sĩ có doanh thu cao nhất",
  height = 400,
  showFilters = true,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.adminTopDoctors);

  useEffect(() => {
    // Load data on component mount with default parameters (today to 1 month later)
    dispatch(fetchTopDoctors({}));
  }, [dispatch]);

  const handlePeriodChange = (_period: string) => {
    // For top doctors, we don't need period parameter, just refresh with default date range
    dispatch(fetchTopDoctors({}));
  };

  const handleRefresh = () => {
    dispatch(fetchTopDoctors({}));
  };

  // Format data for chart
  const chartData = data?.items?.map((item, index) => ({
    doctorName: item.doctorName,
    revenue: item.totalRevenue,
    formattedRevenue: new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(item.totalRevenue),
    appointmentCount: item.totalCompletedAppointments,
    rank: index + 1,
  })) || [];

  // Table columns
  const columns = [
    {
      title: "Xếp hạng",
      dataIndex: "rank",
      key: "rank",
      width: 80,
      render: (rank: number) => (
        <Tag color={rank <= 3 ? "gold" : rank <= 5 ? "silver" : "blue"}>
          #{rank}
        </Tag>
      ),
    },
    {
      title: "Tên bác sĩ",
      dataIndex: "doctorName",
      key: "doctorName",
      ellipsis: true,
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      render: (value: number) => value.toLocaleString("vi-VN") + " VNĐ",
      sorter: (a: any, b: any) => a.revenue - b.revenue,
    },
    {
      title: "Số ca khám",
      dataIndex: "appointmentCount",
      key: "appointmentCount",
      sorter: (a: any, b: any) => a.appointmentCount - b.appointmentCount,
    },
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'white', padding: '12px', border: '1px solid #d9d9d9', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>{`Bác sĩ: ${label}`}</p>
          <p style={{ color: '#1890ff', margin: '0 0 4px 0' }}>{`Doanh thu: ${payload[0].value?.toLocaleString("vi-VN")} VNĐ`}</p>
          {payload[1] && (
            <p style={{ color: '#52c41a', margin: '0' }}>{`Số ca khám: ${payload[1].value}`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card
      title={title}
      extra={
        showFilters && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Select
              defaultValue="month"
              onChange={handlePeriodChange}
              style={{ width: 120 }}
            >
              <Option value="week">Tuần</Option>
              <Option value="month">Tháng</Option>
              <Option value="year">Năm</Option>
            </Select>
            <Button onClick={handleRefresh}>Làm mới</Button>
          </div>
        )
      }
    >
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
        />
      ) : chartData.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
          <p style={{ color: '#999' }}>Không có dữ liệu</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Chart */}
          <div style={{ height: height * 0.6 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="doctorName" 
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
                <Bar
                  dataKey="revenue"
                  fill="#1890ff"
                  name="Doanh thu (VNĐ)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="appointmentCount"
                  fill="#52c41a"
                  name="Số ca khám"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <Table
            dataSource={chartData}
            columns={columns}
            pagination={false}
            size="small"
            scroll={{ y: 200 }}
          />
        </div>
      )}
    </Card>
  );
};

export default TopDoctorsChart;
