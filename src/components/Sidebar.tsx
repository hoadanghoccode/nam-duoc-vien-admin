import {
  CalendarOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  SettingOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu } from "antd";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
      key: "booking",
      icon: <CalendarOutlined />,
      label: "Quản lý đặt sân",
      children: [
        {
          key: "/booking/list",
          label: "Danh sách đặt sân",
        },
        {
          key: "/booking/calendar",
          label: "Lịch đặt sân",
        },
        {
          key: "/booking/statistics",
          label: "Thống kê đặt sân",
        },
      ],
    },
    {
      key: "venue",
      icon: <EnvironmentOutlined />,
      label: "Quản lý sân thể thao",
      children: [
        {
          key: "/venue/list",
          label: "Danh sách sân",
        },
        {
          key: "/venue/add",
          label: "Thêm sân mới",
        },
        {
          key: "/venue/categories",
          label: "Loại sân",
        },
      ],
    },
    {
      key: "user",
      icon: <UserOutlined />,
      label: "Quản lý người dùng",
      children: [
        {
          key: "/user/list",
          label: "Danh sách người dùng",
        },
        {
          key: "/user/roles",
          label: "Phân quyền",
        },
      ],
    },
    {
      key: "payment",
      icon: <CreditCardOutlined />,
      label: "Quản lý thanh toán",
      children: [
        {
          key: "/payment/transactions",
          label: "Giao dịch",
        },
        {
          key: "/payment/methods",
          label: "Phương thức thanh toán",
        },
        {
          key: "/payment/refunds",
          label: "Hoàn tiền",
        },
      ],
    },
    {
      key: "tournament",
      icon: <TrophyOutlined />,
      label: "Giải đấu",
      children: [
        {
          key: "/tournament/list",
          label: "Danh sách giải đấu",
        },
        {
          key: "/tournament/create",
          label: "Tạo giải đấu",
        },
        {
          key: "/tournament/teams",
          label: "Quản lý đội",
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
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt hệ thống",
      children: [
        {
          key: "/settings/general",
          label: "Cài đặt chung",
        },
        {
          key: "/settings/notification",
          label: "Thông báo",
        },
        {
          key: "/settings/backup",
          label: "Sao lưu dữ liệu",
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
      style={{
        background: "#fff",
        borderRight: "1px solid #f0f0f0",
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
            SportHub
          </div>
        )}
        {collapsed && (
          <div
            style={{ fontSize: "20px", fontWeight: "bold", color: "#1890ff" }}
          >
            SH
          </div>
        )}
      </div>

      <Menu
        mode="inline"
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={getOpenKeys()}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          border: "none",
          background: "transparent",
        }}
      />
    </Sider>
  );
};

export default Sidebar;
