import React, { useState } from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const { Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh", overflow: "hidden" }}>
      <Sidebar collapsed={collapsed} />
      <Layout style={{ overflow: "hidden" }}>
        <Header
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
        <Content
          style={{
            margin: "24px 16px",
            padding: 0,
            minHeight: "calc(100vh - 112px)",
            background: "#f5f5f5",
            borderRadius: 8,
            overflow: "auto",
          }}
        >
          <div
            style={{
              padding: 24,
              background: "#fff",
              borderRadius: 8,
              minHeight: "100%",
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
