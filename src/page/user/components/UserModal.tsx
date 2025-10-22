import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Upload,
  Button,
  Row,
  Col,
  message,
} from "antd";
import { UploadOutlined, CloseCircleFilled } from "@ant-design/icons";
import dayjs from "dayjs";
import { UserFormData } from "../types";

const { Option } = Select;

interface UserModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: UserFormData) => Promise<void>;
  initialValues?: UserFormData | null;
  loading?: boolean;
  mode: "create" | "edit";
}

export const UserModal: React.FC<UserModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialValues = null,
  loading = false,
  mode,
}) => {
  const [form] = Form.useForm<UserFormData>();
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Reset form khi modal đóng/mở
  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue({
        ...initialValues,
        dateOfBirth: initialValues.dateOfBirth
          ? dayjs(initialValues.dateOfBirth)
          : undefined,
      } as any);
      setImagePreview(initialValues.imageUrl || "");
      setSelectedFile(null);
    } else if (visible) {
      form.resetFields();
      setImagePreview("");
      setSelectedFile(null);
    }
  }, [visible, initialValues, form]);

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
      
      const submitData: UserFormData = {
        ...values,
        dateOfBirth: values.dateOfBirth
          ? dayjs(values.dateOfBirth).format("YYYY-MM-DD")
          : undefined,
        imageFile: selectedFile || undefined,
        imageUrl: imagePreview || "",
      };

      await onSubmit(submitData);
      handleClose();
    } catch (error) {
      console.error("Form validation error:", error);
    }
  };

  const handleClose = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    form.resetFields();
    setImagePreview("");
    setSelectedFile(null);
    onClose();
  };

  return (
    <Modal
      title={mode === "create" ? "Thêm người dùng mới" : "Chỉnh sửa người dùng"}
      open={visible}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {mode === "create" ? "Tạo mới" : "Cập nhật"}
        </Button>,
      ]}
      width={800}
      destroyOnClose
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          role: "User",
          isActive: true,
          gender: 1,
        }}
      >
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

        {mode === "create" && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu" },
                  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu" />
              </Form.Item>
            </Col>
          </Row>
        )}

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
            <Form.Item label="Hình ảnh">
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={handleFileSelect}
                maxCount={1}
              >
                {!imagePreview ? (
                  <Button icon={<UploadOutlined />} block>
                    Chọn ảnh
                  </Button>
                ) : (
                  <div style={{ position: "relative", display: "inline-block" }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        width: 150,
                        height: 150,
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<CloseCircleFilled />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                      style={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                      }}
                    />
                  </div>
                )}
              </Upload>
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
    </Modal>
  );
};

