import React, { useState } from "react";
import { Tabs, Card } from "antd";
import {
  BarChartOutlined,
  UserOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import RevenueByPeriodChart from "./RevenueByPeriodChart";
import TopDoctorsChart from "./TopDoctorsChart";
import DoctorReportTable from "./DoctorReportTable";

// const { TabPane } = Tabs;

const DashboardTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  return (
    <Card>
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        type="card"
        size="large"
        items={[
          {
            key: "overview",
            label: (
              <span>
                <DollarOutlined />
                Tổng quan doanh thu
              </span>
            ),
            children: (
              <div style={{ marginTop: "16px" }}>
                <RevenueByPeriodChart
                  title="Biểu đồ doanh thu theo kỳ"
                  height={500}
                  showFilters={true}
                />
              </div>
            ),
          },
          {
            key: "top-doctors",
            label: (
              <span>
                <BarChartOutlined />
                Top bác sĩ
              </span>
            ),
            children: (
              <div style={{ marginTop: "16px" }}>
                <TopDoctorsChart
                  title="Top 10 bác sĩ có doanh thu cao nhất"
                  height={400}
                  showFilters={true}
                />
              </div>
            ),
          },
          {
            key: "doctor-report",
            label: (
              <span>
                <UserOutlined />
                Báo cáo bác sĩ
              </span>
            ),
            children: (
              <div style={{ marginTop: "16px" }}>
                <DoctorReportTable title="Báo cáo doanh thu bác sĩ" />
              </div>
            ),
          },
        ]}
      />
    </Card>
  );
};

export default DashboardTabs;
