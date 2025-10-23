import {
  CalendarOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  MailOutlined,
  ManOutlined,
  MedicineBoxOutlined,
  PhoneOutlined,
  TrophyOutlined,
  UserOutlined,
  WomanOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/Store";
import {
  getMyProfileAsync,
  resetUpdateState,
  updateMyProfileAsync,
} from "../../../store/user/userProfileSlice";
import { setUserProfile } from "../../../store/authen/authSlice";
import { notifyStatus } from "../../../utils/toast-notifier";
import { UserProfile } from "../../../api/adminUsersApi";

const { Title, Text } = Typography;

interface AccountInfoProps {
  profile: UserProfile | null;
}

export default function AccountInfo({ profile }: AccountInfoProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);

  const { updateLoading, updateError, updateSuccess } = useSelector(
    (state: RootState) => state.userProfile
  );

  useEffect(() => {
    if (profile) {
      form.setFieldsValue({
        displayName: profile.displayName,
        phoneNumber: profile.phoneNumber,
        dateOfBirth: profile.dateOfBirth ? dayjs(profile.dateOfBirth) : null,
        gender: profile.gender,
        address: profile.address,
        email: profile.email,
      });
    }
  }, [profile, form]);

  useEffect(() => {
    if (updateSuccess) {
      notifyStatus(200, "Cập nhật thông tin thành công!");
      setIsEditing(false);
      dispatch(resetUpdateState());
      // Gọi lại API để lấy thông tin user mới nhất
      dispatch(getMyProfileAsync()).then((result: any) => {
        if (result.payload) {
          // Cập nhật vào auth state để đồng bộ
          dispatch(setUserProfile(result.payload));
        }
      });
    }
  }, [updateSuccess, dispatch]);

  const handleSubmit = async (values: any) => {
    try {
      await dispatch(
        updateMyProfileAsync({
          displayName: values.displayName,
          phoneNumber: values.phoneNumber,
          dateOfBirth: values.dateOfBirth
            ? values.dateOfBirth.format("YYYY-MM-DD")
            : null,
          gender: values.gender,
          address: values.address,
          imageUrl: profile?.imageUrl, // Giữ avatar hiện tại
        })
      ).unwrap();
    } catch (err) {
      // Error handled by reducer
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      form.setFieldsValue({
        displayName: profile.displayName,
        phoneNumber: profile.phoneNumber,
        dateOfBirth: profile.dateOfBirth ? dayjs(profile.dateOfBirth) : null,
        gender: profile.gender,
        address: profile.address,
      });
    }
  };

  const InfoItem = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
  }) => (
    <Row style={{ marginBottom: 20 }}>
      <Col span={24}>
        <Space size={12}>
          <div
            style={{
              width: 40,
              height: 40,
              background: "#f0f5ff",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1890ff",
              fontSize: 18,
            }}
          >
            {icon}
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 13, display: "block" }}>
              {label}
            </Text>
            <Text strong style={{ fontSize: 15 }}>
              {value || "-"}
            </Text>
          </div>
        </Space>
      </Col>
    </Row>
  );

  return (
    <Card
      title={
        <Title level={4} style={{ margin: 0 }}>
          Thông tin tài khoản
        </Title>
      }
      extra={
        !isEditing && (
          <Button type="primary" onClick={() => setIsEditing(true)}>
            Sửa
          </Button>
        )
      }
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
    >
      {updateError && (
        <Alert
          message="Cập nhật thất bại"
          description={updateError}
          type="error"
          showIcon
          closable
          onClose={() => dispatch(resetUpdateState())}
          style={{ marginBottom: 24 }}
        />
      )}

      {!isEditing ? (
        <div>
          <InfoItem
            icon={<UserOutlined />}
            label="Tên tài khoản"
            value={profile?.displayName || ""}
          />
          <InfoItem
            icon={<MailOutlined />}
            label="Email"
            value={profile?.email || ""}
          />
          <InfoItem
            icon={<PhoneOutlined />}
            label="Số điện thoại"
            value={profile?.phoneNumber || ""}
          />
          <InfoItem
            icon={profile?.gender === 1 ? <ManOutlined /> : <WomanOutlined />}
            label="Giới tính"
            value={
              profile?.gender === 1
                ? "Nam"
                : profile?.gender === 2
                ? "Nữ"
                : profile?.gender === 3
                ? "Khác"
                : "-"
            }
          />
          <InfoItem
            icon={<CalendarOutlined />}
            label="Ngày sinh"
            value={
              profile?.dateOfBirth
                ? dayjs(profile.dateOfBirth).format("DD/MM/YYYY")
                : "-"
            }
          />
          <InfoItem
            icon={<EnvironmentOutlined />}
            label="Địa chỉ"
            value={profile?.address || "-"}
          />

          {/* Vai trò */}
          {profile?.roles && profile.roles.length > 0 && (
            <Row style={{ marginBottom: 20 }}>
              <Col span={24}>
                <Space size={12}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: "#f0f5ff",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#1890ff",
                      fontSize: 18,
                    }}
                  >
                    <UserOutlined />
                  </div>
                  <div>
                    <Text
                      type="secondary"
                      style={{ fontSize: 13, display: "block" }}
                    >
                      Vai trò
                    </Text>
                    <Space wrap>
                      {profile.roles.map((role) => (
                        <Text
                          key={role.id}
                          strong
                          style={{
                            fontSize: 15,
                            padding: "4px 12px",
                            background:
                              role.name === "Doctor" ? "#52c41a" : "#1890ff",
                            color: "white",
                            borderRadius: 4,
                            display: "inline-block",
                          }}
                        >
                          {role.name === "Doctor"
                            ? "Bác sĩ"
                            : role.name === "User"
                            ? "Người dùng"
                            : role.name}
                        </Text>
                      ))}
                    </Space>
                  </div>
                </Space>
              </Col>
            </Row>
          )}

          {/* Thông tin bác sĩ (nếu có) */}
          {profile?.roles?.some((role) => role.name === "Doctor") && (
            <>
              <Divider
                orientation="left"
                style={{ marginTop: 32, marginBottom: 24 }}
              >
                <Space>
                  <MedicineBoxOutlined style={{ color: "#1890ff" }} />
                  <Text strong style={{ fontSize: 16 }}>
                    Thông tin bác sĩ
                  </Text>
                </Space>
              </Divider>

              {profile?.doctorTitle && (
                <InfoItem
                  icon={<TrophyOutlined />}
                  label="Chức danh"
                  value={profile.doctorTitle}
                />
              )}

              {profile?.facilityName && (
                <InfoItem
                  icon={<HomeOutlined />}
                  label="Cơ sở y tế"
                  value={profile.facilityName}
                />
              )}

              {profile?.yearsOfExperience !== null &&
                profile?.yearsOfExperience !== undefined && (
                  <InfoItem
                    icon={<CalendarOutlined />}
                    label="Số năm kinh nghiệm"
                    value={`${profile.yearsOfExperience} năm`}
                  />
                )}

              {profile?.examinationFee !== null &&
                profile?.examinationFee !== undefined && (
                  <InfoItem
                    icon={<DollarOutlined />}
                    label="Phí khám"
                    value={`${profile.examinationFee.toLocaleString(
                      "vi-VN"
                    )} VNĐ`}
                  />
                )}

              {profile?.bio && (
                <Row style={{ marginBottom: 20 }}>
                  <Col span={24}>
                    <Space size={12} align="start">
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          background: "#f0f5ff",
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#1890ff",
                          fontSize: 18,
                          flexShrink: 0,
                        }}
                      >
                        <UserOutlined />
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text
                          type="secondary"
                          style={{ fontSize: 13, display: "block" }}
                        >
                          Tiểu sử
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            whiteSpace: "pre-line",
                            display: "block",
                            marginTop: 4,
                          }}
                        >
                          {profile.bio}
                        </Text>
                      </div>
                    </Space>
                  </Col>
                </Row>
              )}
            </>
          )}
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="displayName"
            label="Họ và tên"
            rules={[
              { required: true, message: "Vui lòng nhập họ tên!" },
              { min: 3, message: "Họ tên phải có ít nhất 3 ký tự!" },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#1890ff" }} />}
              placeholder="Nguyễn Văn A"
            />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input
              prefix={<MailOutlined style={{ color: "#1890ff" }} />}
              disabled
              style={{ background: "#f5f5f5" }}
            />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              {
                pattern: /^(0|\+84)[0-9]{9}$/,
                message: "Số điện thoại không hợp lệ!",
              },
            ]}
          >
            <Input
              prefix={<PhoneOutlined style={{ color: "#1890ff" }} />}
              placeholder="0123456789"
            />
          </Form.Item>

          <Form.Item name="gender" label="Giới tính">
            <Select
              placeholder="Chọn giới tính"
              options={[
                { value: 1, label: "Nam" },
                { value: 2, label: "Nữ" },
                { value: 3, label: "Khác" },
              ]}
            />
          </Form.Item>

          <Form.Item name="dateOfBirth" label="Ngày sinh">
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày sinh"
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
            />
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea
              rows={3}
              placeholder="Nhập địa chỉ của bạn"
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={updateLoading}
                style={{ minWidth: 120 }}
              >
                Lưu thay đổi
              </Button>
              <Button onClick={handleCancel} disabled={updateLoading}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      )}
    </Card>
  );
}
