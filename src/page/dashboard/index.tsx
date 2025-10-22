import {
  CalendarOutlined,
  DollarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Statistic, Typography } from "antd";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { dispatch, RootState } from "../../store/Store";
import { fetchRevenueByPeriod } from "../../store/dashboard/adminRevenueByPeriodSlice";
import { fetchAdminRevenueOverviewAsync } from "../../store/dashboard/adminRevenueOverviewSlice";
import RevenueOverviewCard from "./components/RevenueOverviewCard";

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const { data: revenueData } = useSelector(
    (state: RootState) => state.adminRevenueByPeriod
  );

  useEffect(() => {
    // Load initial data with default date range (today to 1 month later)
    dispatch(fetchAdminRevenueOverviewAsync({})); // Revenue overview
    dispatch(fetchRevenueByPeriod({})); // Revenue by period chart
  }, []);

  // Calculate statistics
  const totalRevenue =
    revenueData?.reduce((sum, item) => sum + item.totalRevenue, 0) || 0;
  const totalAppointments =
    revenueData?.reduce((sum, item) => sum + item.completedAppointments, 0) ||
    0;
  const averageRevenue =
    revenueData?.length > 0 ? totalRevenue / revenueData.length : 0;
 

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>Dashboard Báo cáo</Title>

      {/* Revenue Overview Card */}
      <RevenueOverviewCard />

      {/* Statistics Cards */}
      <Row
        gutter={[16, 16]}
        style={{ marginTop: "24px", marginBottom: "24px" }}
      >
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={totalRevenue}
              prefix={<DollarOutlined />}
              formatter={(value) => `${value?.toLocaleString("vi-VN")} VNĐ`}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Tổng số ca khám"
              value={totalAppointments}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Doanh thu trung bình"
              value={averageRevenue}
              prefix={<CalendarOutlined />}
              formatter={(value) => `${value?.toLocaleString("vi-VN")} VNĐ`}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
