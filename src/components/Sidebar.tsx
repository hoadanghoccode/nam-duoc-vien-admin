import {
  DashboardOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu } from "antd";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../src/assets/logo/logon.png";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuProps["items"] = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "content",
      icon: <FileTextOutlined />,
      label: "Quản lý nội dung",
      children: [
        {
          key: "/content/about-us",
          label: "Về chúng tôi",
        },
        {
          key: "/content/dong-y-intro",
          label: "Giới thiệu Đông Y",
        },
        {
          key: "/content/terms-of-service",
          label: "Điều khoản dịch vụ",
        },
        {
          key: "/content/privacy-policy",
          label: "Chính sách bảo mật",
        },
        {
          key: "/content/contact-info",
          label: "Thông tin liên hệ",
        },
        {
          key: "/content/faq",
          label: "Câu hỏi thường gặp",
        },
        {
          key: "/content/user-guide",
          label: "Hướng dẫn sử dụng",
        },
      ],
    },

    {
      key: "specialties",
      icon: <UserOutlined />,
      label: "Chuyên khoa",
      children: [
        {
          key: "/specialties",
          label: "Danh sách chuyên khoa",
        },
      ],
    },
    {
      key: "medicalfacilities",
      icon: <EnvironmentOutlined />, // Cơ sở y tế: dùng Environment icon
      label: "Cơ sở y tế",
      children: [
        {
          key: "/facilities",
          label: "Danh sách cơ sở y tế",
        },
      ],
    },
    {
      key: "report",
      icon: <FileTextOutlined />,
      label: "Báo cáo",
      children: [
        {
          key: "/report/revenue",
          label: "Báo cáo doanh thu",
        },
        {
          key: "/report/usage",
          label: "Báo cáo sử dụng",
        },
        {
          key: "/report/user",
          label: "Báo cáo người dùng",
        },
      ],
    },
  ];

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    navigate(key);
  };

  // Get selected keys based on current location
  const getSelectedKeys = () => {
    const path = location.pathname;
    const selectedKeys: string[] = [];

    // Find the menu item that matches the current path
    const findSelectedKey = (items: any[], currentPath: string) => {
      for (const item of items) {
        if (item.key === currentPath) {
          selectedKeys.push(item.key);
          return true;
        }
        if (item.children) {
          if (findSelectedKey(item.children, currentPath)) {
            selectedKeys.push(item.key);
            return true;
          }
        }
      }
      return false;
    };

    findSelectedKey(menuItems, path);
    return selectedKeys;
  };

  const getOpenKeys = () => {
    const path = location.pathname;
    const openKeys: string[] = [];

    const findOpenKey = (items: any[], currentPath: string) => {
      for (const item of items) {
        if (item.children) {
          for (const child of item.children) {
            if (child.key === currentPath) {
              openKeys.push(item.key);
              return true;
            }
          }
          if (findOpenKey(item.children, currentPath)) {
            openKeys.push(item.key);
            return true;
          }
        }
      }
      return false;
    };

    findOpenKey(menuItems, path);
    return openKeys;
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={250}
      collapsedWidth={80}
      style={{
        background: "#fff",
        borderRight: "1px solid #f0f0f0",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid #f0f0f0",
          marginBottom: "8px",
        }}
      >
        {!collapsed && (
          <div
            style={{ fontSize: "16px", fontWeight: "bold", color: "#1890ff" }}
          >
            <img width="60px" src={logo} alt="Logo" />
          </div>
        )}

        {collapsed && (
          <div
            style={{ fontSize: "20px", fontWeight: "bold", color: "#1890ff" }}
          >
            <img width="55px" src={logo} alt="Logo" />
          </div>
        )}
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          maxHeight: "calc(100vh - 72px)",
          minHeight: 0,
        }}
        className="custom-scrollbar"
      >
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            border: "none",
            background: "transparent",
            height: "auto",
            minHeight: "100%",
          }}
        />
      </div>
    </Sider>
  );
};

export default Sidebar;
