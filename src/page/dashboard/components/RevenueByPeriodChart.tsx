import { Alert, Button, Card, Col, DatePicker, Row, Select, Spin } from "antd";
import dayjs from "dayjs";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dispatch, RootState } from "../../../store/Store";
import { fetchRevenueByPeriod } from "../../../store/dashboard/adminRevenueByPeriodSlice";

const { RangePicker } = DatePicker;
const { Option } = Select;

interface RevenueByPeriodChartProps {
  title?: string;
  height?: number;
  showFilters?: boolean;
}

const RevenueByPeriodChart: React.FC<RevenueByPeriodChartProps> = ({
  title = "Báo cáo doanh thu theo kỳ",
  height = 400,
  showFilters = true,
}) => {
  const { data, loading, error } = useSelector(
    (state: RootState) => state.adminRevenueByPeriod
  );

  // Default query params
  useEffect(() => {
    // Load data on component mount with default date range (today to 1 month later)
    dispatch(fetchRevenueByPeriod({ PeriodType: "daily" }));
  }, []);

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      const params = {
        FromDate: dates[0].format("YYYY-MM-DD"),
        ToDate: dates[1].format("YYYY-MM-DD"),
        PeriodType: "daily" as const,
      };
      dispatch(fetchRevenueByPeriod(params));
    }
  };

  const handlePeriodTypeChange = (periodType: string) => {
    dispatch(
      fetchRevenueByPeriod({
        PeriodType: periodType as "daily" | "monthly" | "yearly",
      })
    );
  };

  const handleRefresh = () => {
    dispatch(fetchRevenueByPeriod({}));
  };

  // Format data for chart
  const chartData =
    data?.map((item) => ({
      period: item.period,
      revenue: item.totalRevenue,
      formattedRevenue: new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(item.totalRevenue),
      appointmentCount: item.completedAppointments,
      commission: item.commission,
    })) || [];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold">{`Kỳ: ${label}`}</p>
          <p className="text-blue-600">{`Doanh thu: ${payload[0].value?.toLocaleString(
            "vi-VN"
          )} VNĐ`}</p>
          {payload[1] && (
            <p className="text-green-600">{`Số ca khám: ${payload[1].value}`}</p>
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
          <div className="flex gap-2 items-center">
            <RangePicker
              defaultValue={[dayjs().subtract(30, "days"), dayjs()]}
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
            />
            <Select
              defaultValue="day"
              onChange={handlePeriodTypeChange}
              style={{ width: 100 }}
            >
              <Option value="day">Ngày</Option>
              <Option value="week">Tuần</Option>
              <Option value="month">Tháng</Option>
            </Select>
            <Button onClick={handleRefresh}>Làm mới</Button>
          </div>
        )
      }
    >
      {loading ? (
        <div className="flex justify-center items-center" style={{ height }}>
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
        <div className="flex justify-center items-center" style={{ height }}>
          <p className="text-gray-500">Không có dữ liệu</p>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <ResponsiveContainer width="100%" height={height}>
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1890ff"
                  strokeWidth={2}
                  name="Doanh thu (VNĐ)"
                  dot={{ fill: "#1890ff", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Col>

          {/* Additional Bar Chart for Appointment Count */}
          <Col span={24}>
            <ResponsiveContainer width="100%" height={height * 0.6}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="appointmentCount"
                  fill="#52c41a"
                  name="Số ca khám"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default RevenueByPeriodChart;
