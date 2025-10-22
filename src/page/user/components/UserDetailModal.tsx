import React, { useEffect, useState } from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Button,
  Space,
  Avatar,
  Divider,
  Typography,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Upload,
  Row,
  Col,
  Spin,
  message,
} from "antd";
import {
  EditOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  UploadOutlined,
  CloseCircleFilled,
  SaveOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { AdminUserDetail } from "../../../api/adminUsersApi";
import { getFullImageUrl } from "../../../utils/image-utils";
import { UserFormData } from "../types";

const { Title } = Typography;
const { Option } = Select;

interface UserDetailModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: UserFormData) => Promise<void>;
  userData: AdminUserDetail | null;
  loading?: boolean;
  submitLoading?: boolean;
  mode: "view" | "edit";
  onModeChange: (mode: "view" | "edit") => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  visible,
  onClose,
  onSubmit,
  userData,
  loading = false,
  submitLoading = false,
  mode,
  onModeChange,
}) => {
  const [form] = Form.useForm<UserFormData>();
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const genderMap: Record<number, string> = {
    1: "Nam",
    2: "Nữ",
    3: "Khác",
  };

  // Reset form khi userData thay đổi
  useEffect(() => {
    if (visible && userData) {
      form.setFieldsValue({
        id: userData.id,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        displayName: userData.displayName,
        dateOfBirth: userData.dateOfBirth ? dayjs(userData.dateOfBirth) : undefined,
        gender: userData.gender,
        address: userData.address,
        role: userData.role,
        isActive: userData.isActive,
      } as any);
      setImagePreview(getFullImageUrl(userData.imageUrl) || "");
      setSelectedFile(null);
    }
  }, [visible, userData, form]);

  // Reset mode về view khi đóng modal
  useEffect(() => {
    if (!visible) {
      onModeChange("view");
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview("");
      setSelectedFile(null);
    }
  }, [visible, onModeChange, imagePreview]);

  const handleFileSelect = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ được chọn file ảnh!");
      return false;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Ảnh phải nhỏ hơn 2MB!");
      return false;
    }

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    return false;
  };

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview("");
    setSelectedFile(null);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log("Form values:", values);
      
      const submitData: UserFormData = {
        ...values,
        dateOfBirth: values.dateOfBirth
          ? dayjs(values.dateOfBirth).format("YYYY-MM-DD")
          : undefined,
        imageFile: selectedFile || undefined,
        imageUrl: selectedFile ? "" : (userData?.imageUrl || ""),
      };

      console.log("Submit data:", submitData);
      await onSubmit(submitData);
    } catch (error: any) {
      console.error("Form validation error:", error);
      console.error("Error fields:", error.errorFields);
      // Hiển thị lỗi validation cho user
      if (error.errorFields && error.errorFields.length > 0) {
        message.error(`Vui lòng kiểm tra lại: ${error.errorFields.map((f: any) => f.errors[0]).join(", ")}`);
      }
    }
  };

  const handleClose = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview("");
    setSelectedFile(null);
    onClose();
  };

  if (!userData && !loading) return null;

  const renderViewMode = () => (
    <>
      {/* User Profile Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 24,
          padding: 24,
          background: "#fafafa",
          borderRadius: 8,
        }}
      >
        <Avatar
          size={100}
          src={getFullImageUrl(userData?.imageUrl)}
          icon={<UserOutlined />}
          style={{ marginBottom: 16 }}
        />
        <Title level={4} style={{ margin: 0 }}>
          {userData?.displayName}
        </Title>
        <Space size="middle" style={{ marginTop: 8 }}>
          <Tag color={userData?.role === "Admin" ? "red" : "blue"}>
            {userData?.role}
          </Tag>
          <Tag color={userData?.isActive ? "green" : "default"}>
            {userData?.isActive ? "Hoạt động" : "Tạm dừng"}
          </Tag>
        </Space>
      </div>

      <Divider orientation="left">Thông tin cá nhân</Divider>

      <Descriptions column={2} bordered>
        <Descriptions.Item label={<><MailOutlined /> Email</>} span={2}>
          {userData?.email}
        </Descriptions.Item>

        <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>
          {userData?.phoneNumber}
        </Descriptions.Item>

        <Descriptions.Item label="Ngày sinh">
          {userData?.dateOfBirth
            ? dayjs(userData.dateOfBirth).format("DD/MM/YYYY")
            : "Chưa cập nhật"}
        </Descriptions.Item>

        <Descriptions.Item label="Giới tính">
          {userData?.gender ? genderMap[userData.gender] : "Chưa cập nhật"}
        </Descriptions.Item>

        <Descriptions.Item label={<><EnvironmentOutlined /> Địa chỉ</>} span={2}>
          {userData?.address || "Chưa cập nhật"}
        </Descriptions.Item>

        <Descriptions.Item label="Vai trò">
          <Tag color={userData?.role === "Admin" ? "red" : "blue"}>
            {userData?.role}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Trạng thái">
          <Tag color={userData?.isActive ? "green" : "default"}>
            {userData?.isActive ? "Hoạt động" : "Tạm dừng"}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Ngày tạo">
          {userData?.createdAt ? dayjs(userData.createdAt).format("DD/MM/YYYY HH:mm") : "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Cập nhật lần cuối">
          {userData?.updatedAt ? dayjs(userData.updatedAt).format("DD/MM/YYYY HH:mm") : "-"}
        </Descriptions.Item>
      </Descriptions>
    </>
  );

  const renderEditMode = () => (
    <Form
      form={form}
      layout="vertical"
    >
      {/* Hidden ID field */}
      <Form.Item name="id" hidden>
        <Input />
      </Form.Item>

      {/* Avatar Section */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={handleFileSelect}
          maxCount={1}
        >
          <div style={{ cursor: "pointer" }}>
            <Avatar
              size={100}
              src={imagePreview}
              icon={<UserOutlined />}
              style={{ marginBottom: 8 }}
            />
            <div>
              <Button icon={<UploadOutlined />} size="small">
                Đổi ảnh
              </Button>
            </div>
          </div>
        </Upload>
        {selectedFile && (
          <Button
            type="link"
            danger
            size="small"
            icon={<CloseCircleFilled />}
            onClick={handleRemoveImage}
          >
            Xóa ảnh mới
          </Button>
        )}
      </div>

      <Divider orientation="left">Thông tin cá nhân</Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input placeholder="example@email.com" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
              {
                pattern: /^[0-9]{10,11}$/,
                message: "Số điện thoại không hợp lệ (10-11 số)",
              },
            ]}
          >
            <Input placeholder="0123456789" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="displayName"
            label="Tên hiển thị"
            rules={[{ required: true, message: "Vui lòng nhập tên hiển thị" }]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="dateOfBirth" label="Ngày sinh">
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày sinh"
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="gender" label="Giới tính">
            <Select placeholder="Chọn giới tính">
              <Option value={1}>Nam</Option>
              <Option value={2}>Nữ</Option>
              <Option value={3}>Khác</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
          >
            <Select placeholder="Chọn vai trò">
              <Option value="User">User</Option>
              <Option value="Admin">Admin</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea rows={2} placeholder="Nhập địa chỉ" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <UserOutlined />
          <span>{mode === "view" ? "Chi tiết người dùng" : "Chỉnh sửa người dùng"}</span>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      footer={
        mode === "view"
          ? [
              <Button key="close" onClick={handleClose}>
                Đóng
              </Button>,
              <Button
                key="edit"
                type="primary"
                icon={<EditOutlined />}
                onClick={() => onModeChange("edit")}
              >
                Chỉnh sửa
              </Button>,
            ]
          : [
              <Button key="cancel" onClick={() => onModeChange("view")}>
                Hủy
              </Button>,
              <Button
                key="submit"
                type="primary"
                icon={<SaveOutlined />}
                loading={submitLoading}
                onClick={handleSubmit}
              >
                Lưu thay đổi
              </Button>,
            ]
      }
      width={800}
      destroyOnClose={false}
    >
      <Spin spinning={loading}>
        {mode === "view" ? renderViewMode() : renderEditMode()}
      </Spin>
    </Modal>
  );
};

