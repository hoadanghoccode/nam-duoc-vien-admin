import {
  BarChartOutlined,
  CalendarOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu } from "antd";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../src/assets/logo/logon.png";
import { RootState } from "../store/Store";
import { hasRole, ROLES } from "../utils/role-utils";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy roles và userProfile từ Redux
  const userRoles = useSelector((state: RootState) => state.auth.roles);
  const userProfile = useSelector((state: RootState) => state.auth.userProfile);

  // Filter menu items dựa trên roles
  const menuItems: MenuProps["items"] = useMemo(() => {
    const isAdmin = hasRole(userRoles, ROLES.ADMIN);

    // Nếu không phải Admin (là Doctor hoặc User), chỉ hiển thị Appointments
    if (!isAdmin) {
      return [
        {
          key: "appointments",
          icon: <CalendarOutlined />,
          label: "Cuộc hẹn",
          children: [
            {
              key: "/appointments",
              label: "Quản lý cuộc hẹn",
            },
          ],
        },
      ];
    }

    // Admin thấy tất cả menu
    const allMenuItems: MenuProps["items"] = [
      {
        key: "/dashboard",
        icon: <DashboardOutlined />,
        label: "Dashboard",
      },
      {
        key: "/revenue-report",
        icon: <BarChartOutlined />,
        label: "Báo cáo doanh thu",
      },
      {
        key: "report",
        icon: <FileTextOutlined />,
        label: "Báo cáo",
        children: [
          {
            key: "/reports/revenue-by-period",
            label: "Tổng quan doanh thu",
          },
          {
            key: "/top-doctors",
            label: "Top bác sĩ",
          },
          {
            key: "/reports/doctor-revenue",
            label: "Báo cáo bác sĩ",
          },
        ],
      },
      {
        key: "/users",
        icon: <TeamOutlined />,
        label: "Quản lý người dùng",
      },

      // {
      //   key: "/top-doctors",
      //   icon: <TrophyOutlined />,
      //   label: "Top bác sĩ",
      // },
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
        icon: <EnvironmentOutlined />,
        label: "Cơ sở y tế",
        children: [
          {
            key: "/facilities",
            label: "Danh sách cơ sở y tế",
          },
        ],
      },
      {
        key: "doctors",
        icon: <MedicineBoxOutlined />,
        label: "Bác sĩ",
        children: [
          {
            key: "/doctor",
            label: "Danh sách bác sĩ",
          },
        ],
      },
      {
        key: "appointments",
        icon: <CalendarOutlined />,
        label: "Cuộc hẹn",
        children: [
          {
            key: "/appointments",
            label: "Quản lý cuộc hẹn",
          },
        ],
      },
    ];

    return allMenuItems;
  }, [userRoles]);

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    // Nếu navigate tới /appointments và user là doctor, tự động thêm doctorId
    if (key === "/appointments" && userProfile?.facilityId) {
      // User có facilityId nghĩa là user này là doctor
      navigate(`${key}?doctorId=${userProfile.id}`);
      return;
    }

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
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
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
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: "#1890ff",
              cursor: "pointer",
            }}
          >
            <img
              width="80px"
              src={logo}
              alt="Logo"
              onClick={() => navigate("/introduction")}
            />
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
