import {
  CalendarOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Statistic, Typography } from "antd";
import React, { useEffect } from "react";
import { authen } from "../api/apiEndPoint";

const { Title } = Typography;

const Dashboard: React.FC = () => {
  useEffect(() => {
    authen.role().then((res) => {
      console.log("Roles:", res.data);
    });
  }, []);
  return (
    <div>
      <Title level={2}>Dashboard</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng đặt sân hôm nay"
              value={1128}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Người dùng hoạt động"
              value={93}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sân thể thao"
              value={45}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Doanh thu tháng"
              value={112893}
              prefix={<DollarOutlined />}
              suffix="VNĐ"
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Đặt sân gần đây" size="small">
            <p>Nội dung đặt sân gần đây sẽ được hiển thị ở đây...</p>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Thống kê sử dụng" size="small">
            <p>Biểu đồ thống kê sử dụng sẽ được hiển thị ở đây...</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
