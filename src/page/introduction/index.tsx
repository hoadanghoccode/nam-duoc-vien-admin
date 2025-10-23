import React from "react";
import { Card, Row, Col, Typography, Divider, Button, Space } from "antd";
import {
  DashboardOutlined,
  MedicineBoxOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  CalendarOutlined,
  SafetyOutlined,
  HeartOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

const IntroductionPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <MedicineBoxOutlined style={{ fontSize: 48, color: "#1890ff" }} />,
      title: "Quản lý Chuyên khoa",
      description:
        "Quản lý danh sách các chuyên khoa y tế một cách hiệu quả và chuyên nghiệp.",
      path: "/specialties",
    },
    {
      icon: <EnvironmentOutlined style={{ fontSize: 48, color: "#52c41a" }} />,
      title: "Quản lý Cơ sở Y tế",
      description:
        "Theo dõi và quản lý thông tin các cơ sở y tế trên toàn hệ thống.",
      path: "/facilities",
    },
    {
      icon: <TeamOutlined style={{ fontSize: 48, color: "#722ed1" }} />,
      title: "Quản lý Bác sĩ",
      description:
        "Quản lý hồ sơ, lịch làm việc và thông tin của đội ngũ bác sĩ.",
      path: "/doctors",
    },
    {
      icon: <CalendarOutlined style={{ fontSize: 48, color: "#fa8c16" }} />,
      title: "Quản lý Lịch hẹn",
      description: "Theo dõi và quản lý các cuộc hẹn khám bệnh của bệnh nhân.",
      path: "/appointments",
    },
    {
      icon: <SafetyOutlined style={{ fontSize: 48, color: "#eb2f96" }} />,
      title: "Quản lý Người dùng",
      description: "Quản lý tài khoản và phân quyền người dùng trong hệ thống.",
      path: "/users",
    },
    {
      icon: <DashboardOutlined style={{ fontSize: 48, color: "#13c2c2" }} />,
      title: "Dashboard & Báo cáo",
      description: "Xem tổng quan và phân tích dữ liệu hoạt động của hệ thống.",
      path: "/dashboard",
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      {/* Header Section */}
      <Card
        style={{
          marginBottom: 24,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
        }}
      >
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <HeartOutlined
            style={{ fontSize: 80, color: "#fff", marginBottom: 16 }}
          />
          <Title level={1} style={{ color: "#fff", marginBottom: 16 }}>
            Chào mừng đến với Hệ thống Quản lý Nam Dược Viện
          </Title>
          <Paragraph
            style={{
              color: "#fff",
              fontSize: 18,
              maxWidth: 800,
              margin: "0 auto",
            }}
          >
            Nền tảng quản lý toàn diện cho các cơ sở y tế, giúp tối ưu hóa quy
            trình khám chữa bệnh và nâng cao chất lượng dịch vụ chăm sóc sức
            khỏe.
          </Paragraph>
        </div>
      </Card>

      {/* Mission & Vision */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card
            hoverable
            style={{ height: "100%", borderTop: "4px solid #1890ff" }}
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <RocketOutlined style={{ fontSize: 48, color: "#1890ff" }} />
              <Title level={3}>Sứ mệnh</Title>
              <Paragraph>
                Cung cấp giải pháp quản lý y tế hiện đại, giúp các cơ sở y tế
                vận hành hiệu quả, tối ưu hóa quy trình làm việc và nâng cao
                trải nghiệm của bệnh nhân.
              </Paragraph>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            hoverable
            style={{ height: "100%", borderTop: "4px solid #52c41a" }}
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <HeartOutlined style={{ fontSize: 48, color: "#52c41a" }} />
              <Title level={3}>Tầm nhìn</Title>
              <Paragraph>
                Trở thành nền tảng quản lý y tế hàng đầu Việt Nam, góp phần nâng
                cao chất lượng chăm sóc sức khỏe cộng đồng và xây dựng hệ thống
                y tế thông minh, bền vững.
              </Paragraph>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Features Section */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 40 }}>
          Tính năng chính
        </Title>
        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card
                hoverable
                style={{
                  height: "100%",
                  textAlign: "center",
                  transition: "all 0.3s",
                }}
                onClick={() => navigate(feature.path)}
              >
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  {feature.icon}
                  <Title level={4}>{feature.title}</Title>
                  <Paragraph style={{ color: "#666" }}>
                    {feature.description}
                  </Paragraph>
                  <Button type="primary" ghost>
                    Truy cập ngay
                  </Button>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Statistics Section */}
      {/* <Card>
        <Title level={2} style={{ textAlign: "center", marginBottom: 40 }}>
          Về chúng tôi
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ textAlign: "center", background: "#e6f7ff" }}>
              <Title level={2} style={{ color: "#1890ff", margin: 0 }}>
                100+
              </Title>
              <Text style={{ fontSize: 16 }}>Cơ sở Y tế</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ textAlign: "center", background: "#f6ffed" }}>
              <Title level={2} style={{ color: "#52c41a", margin: 0 }}>
                500+
              </Title>
              <Text style={{ fontSize: 16 }}>Bác sĩ</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ textAlign: "center", background: "#fff7e6" }}>
              <Title level={2} style={{ color: "#fa8c16", margin: 0 }}>
                10,000+
              </Title>
              <Text style={{ fontSize: 16 }}>Lượt khám/tháng</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ textAlign: "center", background: "#fff0f6" }}>
              <Title level={2} style={{ color: "#eb2f96", margin: 0 }}>
                98%
              </Title>
              <Text style={{ fontSize: 16 }}>Hài lòng</Text>
            </Card>
          </Col>
        </Row>
      </Card> */}

      {/* Footer */}
      <Divider />
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <Text type="secondary">
          © 2025 Nam Dược Viện Admin. Phát triển bởi Đội ngũ Công nghệ Y tế.
        </Text>
      </div>
    </div>
  );
};

export default IntroductionPage;
