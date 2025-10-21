// SpecialtyDetailModal.tsx
import {
  CloseCircleFilled,
  EditOutlined,
  SaveOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Space,
  Switch,
  Tag,
  Typography,
  Upload,
} from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { getFullImageUrl } from "../../../utils/image-utils";

// Interface cho dữ liệu specialty
export interface SpecialtyFormData {
  specialtyName: string;
  description: string;
  imageURL: string;
  displayOrder: number;
  isActive: boolean;
}

// Interface khi submit - bao gồm file
export interface SpecialtyFormSubmit extends SpecialtyFormData {
  imageFile?: File | null; // Thêm file object
}

// Props cho Modal component
interface SpecialtyDetailModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: SpecialtyFormSubmit) => Promise<void>;
  specialtyData: SpecialtyFormData | null;
  loading?: boolean;
  mode: "view" | "edit"; // Thêm mode để phân biệt view và edit
  onModeChange: (mode: "view" | "edit") => void;
}

const { Text } = Typography;

const SpecialtyDetailModal: React.FC<SpecialtyDetailModalProps> = ({
  visible,
  onClose,
  onSubmit,
  specialtyData,
  loading: externalLoading = false,
  mode,
  onModeChange,
}) => {
  const [form] = Form.useForm<SpecialtyFormData>();
  const [loading, setLoading] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Set initial values khi modal mở
  useEffect(() => {
    if (visible && specialtyData) {
      form.setFieldsValue(specialtyData);
      setImageUrl(getFullImageUrl(specialtyData.imageURL));
      setSelectedFile(null); // Reset file selection
    } else if (visible) {
      form.resetFields();
      setImageUrl("");
      setSelectedFile(null);
    }
  }, [visible, specialtyData, form]);

  const handleSubmit = async (): Promise<void> => {
    try {
      setLoading(true);

      // Validate tất cả các field với Ant Design Form
      const values = await form.validateFields();

      // Kiểm tra có ảnh hoặc file được chọn
      if (!selectedFile && !values.imageURL) {
        message.error("Vui lòng chọn hình ảnh!");
        setLoading(false);
        return;
      }

      // Truyền cả form values và file object cho parent component
      await onSubmit({
        ...values,
        imageFile: selectedFile, // Thêm file object vào
      });

      // Success message sẽ được xử lý ở parent
      onModeChange("view"); // Chuyển về chế độ view sau khi update thành công
    } catch (error: any) {
      // Ant Design Form validation errors sẽ tự động hiển thị trên form
      // Chỉ log để debug
      console.error("Form validation error:", error);

      // Nếu không phải validation error thì hiển thị message
      if (!error.errorFields) {
        message.error("Có lỗi xảy ra, vui lòng thử lại");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (): void => {
    // Giải phóng URL preview nếu có
    if (imageUrl && imageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrl);
    }

    form.resetFields();
    setImageUrl("");
    setSelectedFile(null);
    onModeChange("view"); // Reset về view mode
    onClose();
  };

  // Xử lý xóa ảnh
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (imageUrl && imageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrl);
    }

    setImageUrl("");
    setSelectedFile(null);
    form.setFieldValue("imageURL", "");
  };

  // Xử lý khi chọn file
  const handleBeforeUpload = (file: File): boolean => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ chấp nhận file ảnh!");
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Kích thước ảnh phải nhỏ hơn 5MB!");
      return false;
    }

    if (imageUrl && imageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrl);
    }

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImageUrl(previewUrl);
    form.setFieldValue("imageURL", file.name);

    return false;
  };

  const fixedContainerStyle: React.CSSProperties = {
    width: "100%",
    height: 200,
    border: "1px dashed #d9d9d9",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: mode === "edit" ? "pointer" : "default",
    transition: "all 0.3s",
    backgroundColor: "#fafafa",
    position: "relative",
    overflow: "hidden",
  };

  if (!specialtyData) return null;

  return (
    <Modal
      title={
        mode === "edit"
          ? `Chỉnh sửa chuyên khoa: ${specialtyData.specialtyName}`
          : `Chi tiết chuyên khoa: ${specialtyData.specialtyName}`
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={800}
      destroyOnClose
      maskClosable={false}
    >
      {mode === "view" ? (
        // VIEW MODE
        <div>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <img
                  src={getFullImageUrl(specialtyData.imageURL)}
                  alt={specialtyData.specialtyName}
                  style={{
                    width: 200,
                    height: 200,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #d9d9d9",
                  }}
                />
              </div>
            </Col>
            <Col span={12}>
              <Text strong>Tên chuyên khoa:</Text>
              <br />
              <Text>{specialtyData.specialtyName}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Mã chuyên khoa:</Text>
              <br />
              <Text code>{(specialtyData as any).specialtyCode || "N/A"}</Text>
            </Col>
            <Col span={24}>
              <Text strong>Mô tả:</Text>
              <br />
              <Text>{specialtyData.description}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Thứ tự hiển thị:</Text>
              <br />
              <Tag color="blue">{specialtyData.displayOrder}</Tag>
            </Col>
            <Col span={12}>
              <Text strong>Trạng thái:</Text>
              <br />
              <Tag color={specialtyData.isActive ? "green" : "red"}>
                {specialtyData.isActive ? "Hoạt động" : "Tạm dừng"}
              </Tag>
            </Col>
            <Col span={12}>
              <Text strong>Ngày tạo:</Text>
              <br />
              <Text type="secondary">
                {(specialtyData as any).createdAt
                  ? dayjs((specialtyData as any).createdAt).format(
                      "DD/MM/YYYY HH:mm"
                    )
                  : "N/A"}
              </Text>
            </Col>
            <Col span={12}>
              <Text strong>Ngày cập nhật:</Text>
              <br />
              <Text type="secondary">
                {(specialtyData as any).updatedAt
                  ? dayjs((specialtyData as any).updatedAt).format(
                      "DD/MM/YYYY HH:mm"
                    )
                  : "Chưa cập nhật"}
              </Text>
            </Col>
          </Row>

          <div style={{ marginTop: 24, textAlign: "right" }}>
            <Space>
              <Button onClick={handleClose}>Đóng</Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => onModeChange("edit")}
              >
                Chỉnh sửa
              </Button>
            </Space>
          </div>
        </div>
      ) : (
        // EDIT MODE
        <Form<SpecialtyFormData>
          form={form}
          layout="vertical"
          initialValues={specialtyData}
        >
          <Form.Item
            name="imageURL"
            label="Hình ảnh"
            rules={[{ required: true, message: "Vui lòng upload hình ảnh!" }]}
          >
            <Upload
              style={{ display: "flex", justifyContent: "center" }}
              accept="image/*"
              showUploadList={false}
              beforeUpload={handleBeforeUpload}
              maxCount={1}
              disabled={false}
            >
              <div
                style={fixedContainerStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#1890ff";
                  e.currentTarget.style.backgroundColor = "#f0f5ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#d9d9d9";
                  e.currentTarget.style.backgroundColor = imageUrl
                    ? "#fff"
                    : "#fafafa";
                }}
              >
                {!imageUrl ? (
                  <div style={{ width: "300px", textAlign: "center" }}>
                    <UploadOutlined
                      style={{ fontSize: 45, color: "#1890ff" }}
                    />
                    <div style={{ marginTop: 12, fontSize: 16 }}>
                      Click để chọn ảnh
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12, color: "#999" }}>
                      Hỗ trợ: JPG, PNG, GIF (tối đa 5MB)
                    </div>
                  </div>
                ) : (
                  <>
                    <CloseCircleFilled
                      onClick={handleRemove}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        fontSize: 28,
                        color: "#ff4d4f",
                        backgroundColor: "#fff",
                        borderRadius: "50%",
                        cursor: "pointer",
                        zIndex: 10,
                        transition: "all 0.3s",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    />

                    <img
                      src={imageUrl}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        message.error("Không thể tải ảnh preview");
                      }}
                    />

                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.3s",
                        pointerEvents: "none",
                      }}
                      className="image-overlay"
                    />
                  </>
                )}
              </div>
            </Upload>

            {selectedFile && (
              <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                <strong>File:</strong> {selectedFile.name}
              </div>
            )}

            <style>{`
              .image-overlay {
                background-color: rgba(0, 0, 0, 0) !important;
              }
              div:hover > .image-overlay {
                background-color: rgba(0, 0, 0, 0.4) !important;
              }
              div:hover > .image-overlay::after {
                content: "Click để thay đổi ảnh";
                color: white;
                font-size: 14px;
                font-weight: 500;
              }
            `}</style>
          </Form.Item>

          <Form.Item
            name="specialtyName"
            label="Tên chuyên môn"
            rules={[
              { required: true, message: "Tên chuyên môn là bắt buộc!" },
              { min: 2, message: "Tên phải có ít nhất 2 ký tự!" },
              { max: 100, message: "Tên không được quá 100 ký tự!" },
            ]}
          >
            <Input placeholder="Nhập tên chuyên môn" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              { required: true, message: "Mô tả là bắt buộc!" },
              { min: 10, message: "Mô tả phải có ít nhất 10 ký tự!" },
              { max: 500, message: "Mô tả không được quá 500 ký tự!" },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập mô tả chi tiết"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="displayOrder"
            label="Thứ tự hiển thị"
            rules={[
              { required: true, message: "Thứ tự hiển thị là bắt buộc!" },
              {
                type: "number",
                min: 0,
                message: "Thứ tự hiển thị phải từ 0 trở lên!",
              },
            ]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="Nhập thứ tự hiển thị"
            />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Trạng thái hoạt động"
            valuePropName="checked"
          >
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
          </Form.Item>

          <div style={{ marginTop: 24, textAlign: "right" }}>
            <Space>
              <Button onClick={() => onModeChange("view")}>Hủy</Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSubmit}
                loading={loading || externalLoading}
              >
                Lưu thay đổi
              </Button>
            </Space>
          </div>
        </Form>
      )}
    </Modal>
  );
};

export default SpecialtyDetailModal;
