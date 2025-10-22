import { TrophyOutlined } from "@ant-design/icons";
import { Card, Typography } from "antd";
import React from "react";
import TopDoctorsChart from "../../dashboard/components/TopDoctorsChart";

const { Title } = Typography;

const TopDoctorsPage: React.FC = () => {
  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <TrophyOutlined style={{ marginRight: 8 }} />
          Top bác sĩ xuất sắc
        </Title>
        <Typography.Text type="secondary">
          Danh sách các bác sĩ có doanh thu cao nhất
        </Typography.Text>
      </div>

      <Card>
        <TopDoctorsChart
          title="Top 10 bác sĩ có doanh thu cao nhất"
          height={400}
          showFilters={true}
        />
      </Card>
    </div>
  );
};

export default TopDoctorsPage;

