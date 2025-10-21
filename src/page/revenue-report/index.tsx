import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  DatePicker,
  Select,
  Button,
  Space,
  Spin,
  Alert,
} from "antd";
import {
  DollarOutlined,
  UserOutlined,
  CalendarOutlined,
  BarChartOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/Store";
// import { fetchAdminRevenueStatisticsAsync } from "../../store/dashboard/adminRevenueStatisticsSlice";
import RevenueStatisticsChart from "./components/RevenueStatisticsChart";
import TopDoctorsTable from "./components/TopDoctorsTable";
import dayjs from "dayjs";
import { fetchRevenueStatistics } from "../../store/dashboard/adminRevenueStatisticsSlice";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const RevenueReportPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector(
    (state: RootState) => state.adminRevenueStatistics
  );

  // State for filters
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );
  const [periodType, setPeriodType] = useState<"daily" | "monthly" | "yearly">(
    "daily"
  );
  const [topDoctorsCount, setTopDoctorsCount] = useState<number>(10);

  // Load data on mount
  useEffect(() => {
    const defaultDateRange: [dayjs.Dayjs, dayjs.Dayjs] = [
      dayjs().subtract(1, "month"),
      dayjs(),
    ];
    setDateRange(defaultDateRange);

    dispatch(
      fetchRevenueStatistics({
        FromDate: defaultDateRange[0].format("YYYY-MM-DD"),
        ToDate: defaultDateRange[1].format("YYYY-MM-DD"),
        PeriodType: periodType,
        TopDoctorsCount: topDoctorsCount,
      })
    );
  }, [dispatch]);

  // Handle date range change
  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates);
    if (dates && dates.length === 2) {
      dispatch(
        fetchRevenueStatistics({
          FromDate: dates[0].format("YYYY-MM-DD"),
          ToDate: dates[1].format("YYYY-MM-DD"),
          PeriodType: periodType,
          TopDoctorsCount: topDoctorsCount,
        })
      );
    }
  };

  // Handle period type change
  const handlePeriodTypeChange = (value: "daily" | "monthly" | "yearly") => {
    setPeriodType(value);
    if (dateRange && dateRange.length === 2) {
      dispatch(
        fetchRevenueStatistics({
          FromDate: dateRange[0].format("YYYY-MM-DD"),
          ToDate: dateRange[1].format("YYYY-MM-DD"),
          PeriodType: value,
          TopDoctorsCount: topDoctorsCount,
        })
      );
    }
  };

  // Handle top doctors count change
  const handleTopDoctorsCountChange = (value: number) => {
    setTopDoctorsCount(value);
    if (dateRange && dateRange.length === 2) {
      dispatch(
        fetchRevenueStatistics({
          FromDate: dateRange[0].format("YYYY-MM-DD"),
          ToDate: dateRange[1].format("YYYY-MM-DD"),
          PeriodType: periodType,
          TopDoctorsCount: value,
        })
      );
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    if (dateRange && dateRange.length === 2) {
      dispatch(
        fetchRevenueStatistics({
          FromDate: dateRange[0].format("YYYY-MM-DD"),
          ToDate: dateRange[1].format("YYYY-MM-DD"),
          PeriodType: periodType,
          TopDoctorsCount: topDoctorsCount,
        })
      );
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
        <p style={{ marginTop: "16px" }}>Đang tải dữ liệu báo cáo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px" }}>
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={handleRefresh}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: "24px" }}>
        <Alert
          message="Không có dữ liệu"
          description="Không tìm thấy dữ liệu báo cáo cho khoảng thời gian đã chọn."
          type="info"
          showIcon
        />
      </div>
    );
  }

  const { overview, periodRevenues, topDoctors } = data;

  // Calculate growth rates
  const revenueGrowth =
    periodRevenues.length > 1
      ? ((periodRevenues[periodRevenues.length - 1].totalRevenue -
          periodRevenues[0].totalRevenue) /
          periodRevenues[0].totalRevenue) *
        100
      : 0;

  const appointmentGrowth =
    periodRevenues.length > 1
      ? ((periodRevenues[periodRevenues.length - 1].completedAppointments -
          periodRevenues[0].completedAppointments) /
          periodRevenues[0].completedAppointments) *
        100
      : 0;

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>Báo cáo doanh thu</Title>

      {/* Filters */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <span>Khoảng thời gian:</span>
              <RangePicker
                style={{ width: "100%" }}
                value={dateRange}
                onChange={handleDateRangeChange}
                format="DD/MM/YYYY"
                placeholder={["Từ ngày", "Đến ngày"]}
              />
            </Space>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <span>Loại báo cáo:</span>
              <Select
                value={periodType}
                onChange={handlePeriodTypeChange}
                style={{ width: "100%" }}
              >
                <Option value="daily">Theo ngày</Option>
                <Option value="monthly">Theo tháng</Option>
                <Option value="yearly">Theo năm</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <span>Số bác sĩ top:</span>
              <Select
                value={topDoctorsCount}
                onChange={handleTopDoctorsCountChange}
                style={{ width: "100%" }}
              >
                <Option value={5}>Top 5</Option>
                <Option value={10}>Top 10</Option>
                <Option value={20}>Top 20</Option>
                <Option value={50}>Top 50</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <span>Thao tác:</span>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
                style={{ width: "100%" }}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Overview Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={overview.totalRevenue}
              precision={0}
              valueStyle={{ color: "#3f8600" }}
              prefix={<DollarOutlined />}
              formatter={(value) => `${value?.toLocaleString("vi-VN")} VNĐ`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng hoa hồng"
              value={overview.totalCommission}
              precision={0}
              valueStyle={{ color: "#1890ff" }}
              prefix={<DollarOutlined />}
              formatter={(value) => `${value?.toLocaleString("vi-VN")} VNĐ`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Thu nhập bác sĩ"
              value={overview.totalDoctorEarnings}
              precision={0}
              valueStyle={{ color: "#722ed1" }}
              prefix={<UserOutlined />}
              formatter={(value) => `${value?.toLocaleString("vi-VN")} VNĐ`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tỷ lệ hoa hồng"
              value={overview.commissionRate}
              precision={2}
              suffix="%"
              valueStyle={{ color: "#fa8c16" }}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Appointment Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Ca khám hoàn thành"
              value={overview.totalCompletedAppointments}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Ca khám bị hủy"
              value={overview.totalCancelledAppointments}
              valueStyle={{ color: "#ff4d4f" }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Ca khám chờ xác nhận"
              value={overview.totalPendingAppointments}
              valueStyle={{ color: "#faad14" }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số bệnh nhân"
              value={overview.totalPatients}
              valueStyle={{ color: "#13c2c2" }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Growth Indicators */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tăng trưởng doanh thu"
              value={revenueGrowth}
              precision={2}
              suffix="%"
              valueStyle={{ color: revenueGrowth >= 0 ? "#3f8600" : "#cf1322" }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tăng trưởng ca khám"
              value={appointmentGrowth}
              precision={2}
              suffix="%"
              valueStyle={{
                color: appointmentGrowth >= 0 ? "#3f8600" : "#cf1322",
              }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số bác sĩ"
              value={overview.totalDoctors}
              valueStyle={{ color: "#1890ff" }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Ca khám đã xác nhận"
              value={overview.totalConfirmedAppointments}
              valueStyle={{ color: "#722ed1" }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col span={24}>
          <RevenueStatisticsChart
            data={periodRevenues}
            periodType={periodType}
            title={`Biểu đồ doanh thu ${
              periodType === "daily"
                ? "theo ngày"
                : periodType === "monthly"
                ? "theo tháng"
                : "theo năm"
            }`}
          />
        </Col>
      </Row>

      {/* Top Doctors Table */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <TopDoctorsTable
            data={topDoctors}
            title={`Top ${topDoctorsCount} bác sĩ có doanh thu cao nhất`}
          />
        </Col>
      </Row>
    </div>
  );
};

export default RevenueReportPage;
