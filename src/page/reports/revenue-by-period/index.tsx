import { DollarOutlined } from "@ant-design/icons";
import { Card, Typography } from "antd";
import React from "react";
import RevenueByPeriodChart from "../../dashboard/components/RevenueByPeriodChart";

const { Title } = Typography;

const RevenueByPeriodPage: React.FC = () => {
  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <DollarOutlined style={{ marginRight: 8 }} />
          Tổng quan doanh thu theo kỳ
        </Title>
        <Typography.Text type="secondary">
          Xem chi tiết biểu đồ doanh thu theo thời gian
        </Typography.Text>
      </div>

      <Card>
        <RevenueByPeriodChart
          title="Biểu đồ doanh thu theo kỳ"
          height={500}
          showFilters={true}
        />
      </Card>
    </div>
  );
};

export default RevenueByPeriodPage;

