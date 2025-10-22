import { UserOutlined } from "@ant-design/icons";
import { Card, Typography } from "antd";
import React from "react";
import DoctorReportTable from "../../dashboard/components/DoctorReportTable";

const { Title } = Typography;

const DoctorRevenuePage: React.FC = () => {
  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <UserOutlined style={{ marginRight: 8 }} />
          Báo cáo doanh thu bác sĩ
        </Title>
        <Typography.Text type="secondary">
          Xem chi tiết doanh thu và số ca khám của từng bác sĩ
        </Typography.Text>
      </div>

      <Card>
        <DoctorReportTable title="Báo cáo doanh thu bác sĩ" />
      </Card>
    </div>
  );
};

export default DoctorRevenuePage;

