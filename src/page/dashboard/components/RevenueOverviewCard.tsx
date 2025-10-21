import React, { useEffect } from "react";
import { Card, Row, Col, Statistic, Typography, Spin, Alert } from "antd";
import {
  DollarOutlined,
  UserOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../store/Store";
import { fetchAdminRevenueOverviewAsync } from "../../../store/dashboard/adminRevenueOverviewSlice";

const { Title } = Typography;

interface RevenueOverviewCardProps {
  title?: string;
  refreshTrigger?: number;
}

const RevenueOverviewCard: React.FC<RevenueOverviewCardProps> = ({
  title = "Tổng quan doanh thu",
  refreshTrigger,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector(
    (state: RootState) => state.adminRevenueOverview
  );

  useEffect(() => {
    // Load data on component mount with default date range (today to 1 month later)
    dispatch(fetchAdminRevenueOverviewAsync({}));
  }, [dispatch, refreshTrigger]);

  if (loading) {
    return (
      <Card title={<Title level={4}>{title}</Title>}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={<Title level={4}>{title}</Title>}>
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
        />
      </Card>
    );
  }

  if (!data) {
    return (
      <Card title={<Title level={4}>{title}</Title>}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <p style={{ color: '#999' }}>Không có dữ liệu</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title={<Title level={4}>{title}</Title>}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Statistic
            title="Tổng doanh thu"
            value={data.totalRevenue}
            precision={0}
            valueStyle={{ color: "#3f8600" }}
            prefix={<DollarOutlined />}
            formatter={(value) => `${value?.toLocaleString("vi-VN")} VNĐ`}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Statistic
            title="Tổng hoa hồng"
            value={data.totalCommission}
            precision={0}
            valueStyle={{ color: "#1890ff" }}
            prefix={<DollarOutlined />}
            formatter={(value) => `${value?.toLocaleString("vi-VN")} VNĐ`}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Statistic
            title="Thu nhập bác sĩ"
            value={data.totalDoctorEarnings}
            precision={0}
            valueStyle={{ color: "#722ed1" }}
            prefix={<UserOutlined />}
            formatter={(value) => `${value?.toLocaleString("vi-VN")} VNĐ`}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Statistic
            title="Tỷ lệ hoa hồng"
            value={data.commissionRate}
            precision={2}
            prefix={data.commissionRate >= 0 ? <RiseOutlined /> : <FallOutlined />}
            suffix="%"
            valueStyle={{ 
              color: data.commissionRate >= 0 ? "#3f8600" : "#cf1322" 
            }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Statistic
            title="Ca khám hoàn thành"
            value={data.totalCompletedAppointments}
            precision={0}
            valueStyle={{ color: "#52c41a" }}
            prefix={<MedicineBoxOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Statistic
            title="Ca khám bị hủy"
            value={data.totalCancelledAppointments}
            precision={0}
            valueStyle={{ color: "#ff4d4f" }}
            prefix={<CalendarOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Statistic
            title="Ca khám chờ xác nhận"
            value={data.totalPendingAppointments}
            precision={0}
            valueStyle={{ color: "#faad14" }}
            prefix={<CalendarOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Statistic
            title="Tổng số bệnh nhân"
            value={data.totalPatients}
            precision={0}
            valueStyle={{ color: "#13c2c2" }}
            prefix={<UserOutlined />}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default RevenueOverviewCard;
