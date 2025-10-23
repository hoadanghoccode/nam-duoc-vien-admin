import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Avatar, Button, Dropdown, Layout, Space, Typography } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
import authorizedAxiosInstance from "../services/Axios";
import store from "../store/Store";
import { setAccessToken } from "../store/authen/authSlice";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();

  // Dọn local + (tùy bạn) gọi API logout server
  const handleLogout = async () => {
    try {
      const result = await authorizedAxiosInstance.post(
        "/Authentication/Logout"
      );
      console.log("Logout result", result);
      if (result?.data?.statusCode === 200) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userInfo");
        store.dispatch(setAccessToken(null));
        navigate("auth/login");
      }
    } catch {}
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
    },
  ];

  const handleUserMenuClick: MenuProps["onClick"] = ({ key }) => {
    switch (key) {
      case "profile":
        navigate("/profile");
        break;
      case "settings":
        navigate("/profile?tab=security");
        break;
      case "logout":
        handleLogout();
        break;
      default:
        break;
    }
  };

  return (
    <AntHeader
      style={{
        padding: "0 24px",
        background: "#fff",
        borderBottom: "1px solid #f0f0f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          style={{
            fontSize: "16px",
            width: 64,
            height: 64,
            border: "none",
            boxShadow: "none",
            outline: "none",
          }}
          onMouseDown={(e) => e.preventDefault()}
        />
        {/* <Text strong style={{ fontSize: "18px", marginLeft: "16px" }}>
          Sport Booking Admin
        </Text> */}
      </div>

      <Space size="middle">
        {/* <Button
          type="text"
          style={{ border: "none", boxShadow: "none", outline: "none" }}
          onMouseDown={(e) => e.preventDefault()}
          icon={<BellOutlined />}
          size="large"
        /> */}

        <Dropdown
          menu={{
            items: userMenuItems,
            onClick: handleUserMenuClick,
          }}
          placement="bottomRight"
          arrow
        >
          <Space style={{ cursor: "pointer" }}>
            <Avatar
              size="small"
              icon={<UserOutlined />}
              style={{ backgroundColor: "#1890ff" }}
            />
            <Text>Admin User</Text>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;
