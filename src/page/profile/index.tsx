import { useEffect, useState } from "react";
import {
  Layout,
  Card,
  Typography,
  Tabs,
  Menu,
  Spin,
  Grid,
  Tag,
  Space,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  StarOutlined,
  MedicineBoxOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/Store";
import { getMyProfileAsync } from "../../store/user/userProfileSlice";
import { setUserProfile } from "../../store/authen/authSlice";
import AccountInfo from "./components/AccountInfo";
import SecuritySettings from "./components/SecuritySettings";
import AvatarUpload from "./components/AvatarUpload";

const { Content } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function UserProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const screens = useBreakpoint();
  const [selectedSidebarKey, setSelectedSidebarKey] = useState("account");
  const [selectedTopTab, setSelectedTopTab] = useState("profile");

  const { profile, loading } = useSelector(
    (state: RootState) => state.userProfile
  );

  useEffect(() => {
    // Lấy thông tin profile và đồng bộ với auth state
    dispatch(getMyProfileAsync()).then((result: any) => {
      if (result.payload) {
        // Cập nhật vào auth state để đồng bộ
        dispatch(setUserProfile(result.payload));
      }
    });
  }, [dispatch]);

  // Banner background gradient
  const bannerStyle: React.CSSProperties = {
    height: screens.md ? 280 : 200,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    backgroundImage:
      "linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%), url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1440 320%22%3E%3Cpath fill=%22%23ffffff%22 fill-opacity=%220.1%22 d=%22M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,106.7C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z%22%3E%3C/path%3E%3C/svg%3E')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0 0 24px 24px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  };

  // Avatar container
  const avatarContainerStyle: React.CSSProperties = {
    position: "relative",
    textAlign: "center",
  };

  // Top tabs items
  const topTabItems = [
    {
      key: "profile",
      label: (
        <span style={{ fontSize: 15, fontWeight: 500 }}>
          <UserOutlined style={{ marginRight: 6 }} />
          Trang Cá Nhân
        </span>
      ),
    },
    {
      key: "reviews",
      label: (
        <span style={{ fontSize: 15, fontWeight: 500 }}>
          <StarOutlined style={{ marginRight: 6 }} />
          Lịch khám
        </span>
      ),
    },
  ];

  // Sidebar menu items
  const sidebarMenuItems = [
    {
      key: "account",
      icon: <UserOutlined />,
      label: "Thông Tin Tài Khoản",
    },
    {
      key: "security",
      icon: <LockOutlined />,
      label: "Bảo Mật",
    },
  ];

  // Render content based on top tab and sidebar selection
  const renderContent = () => {
    // My Appointments tab

    // Profile tab with sidebar
    if (selectedTopTab === "profile") {
      switch (selectedSidebarKey) {
        case "account":
          return <AccountInfo profile={profile} />;
        case "security":
          return <SecuritySettings />;
        default:
          return null;
      }
    }

    return null;
  };

  if (loading && !profile) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" tip="Đang tải thông tin..." />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      {/* Banner Header */}
      <div style={bannerStyle}>
        <div style={avatarContainerStyle}>
          <AvatarUpload
            imageUrl={profile?.imageUrl}
            size={screens.md ? 120 : 90}
          />
          <div style={{ marginTop: 16 }}>
            <Title
              level={screens.md ? 2 : 4}
              style={{
                color: "white",
                margin: 0,
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              {profile?.displayName || "Người dùng"}
            </Title>
            <Text
              style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: screens.md ? 15 : 13,
                textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                display: "block",
                marginTop: 4,
              }}
            >
              {profile?.email || ""}
            </Text>

            {/* Role Tags */}
            {profile?.roles && profile.roles.length > 0 && (
              <Space style={{ marginTop: 12 }} wrap>
                {profile.roles.map((role) => (
                  <Tag
                    key={role.id}
                    icon={
                      role.name === "Doctor" ? (
                        <MedicineBoxOutlined />
                      ) : (
                        <UserOutlined />
                      )
                    }
                    color={role.name === "Doctor" ? "green" : "blue"}
                    style={{
                      fontSize: 13,
                      padding: "4px 12px",
                      borderRadius: 16,
                      border: "none",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                    }}
                  >
                    {role.name === "Doctor" ? "Bác sĩ" : role.name}
                  </Tag>
                ))}
                {profile?.status && (
                  <Tag
                    icon={<CheckCircleOutlined />}
                    color={profile.status === "Active" ? "success" : "default"}
                    style={{
                      fontSize: 13,
                      padding: "4px 12px",
                      borderRadius: 16,
                      border: "none",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                    }}
                  >
                    {profile.status === "Active"
                      ? "Đã kích hoạt"
                      : profile.status}
                  </Tag>
                )}
              </Space>
            )}
          </div>
        </div>
      </div>

      {/* Top Navigation Tabs */}
      <div
        style={{
          background: "white",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <Tabs
            activeKey={selectedTopTab}
            onChange={setSelectedTopTab}
            items={topTabItems}
            size="large"
            style={{ marginBottom: 0 }}
          />
        </div>
      </div>

      {/* Main Content */}
      <Content
        style={{
          maxWidth: 1200,
          margin: "24px auto",
          width: "100%",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 24,
            flexDirection: screens.md ? "row" : "column",
          }}
        >
          {/* Sidebar */}
          {selectedTopTab === "profile" && (
            <Card
              style={{
                width: screens.md ? 280 : "100%",
                height: "fit-content",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
              styles={{ body: { padding: "12px 0" } }}
            >
              <Menu
                mode="inline"
                selectedKeys={[selectedSidebarKey]}
                items={sidebarMenuItems}
                onClick={({ key }) => setSelectedSidebarKey(key)}
                style={{ border: "none" }}
              />
            </Card>
          )}

          {/* Main Content Area */}
          <div style={{ flex: 1, width: "100%" }}>{renderContent()}</div>
        </div>
      </Content>
    </Layout>
  );
}
