import React from "react";
import { Modal, Button, Typography, Space } from "antd";
import { LockOutlined, UserOutlined, WarningOutlined } from "@ant-design/icons";

const { Text, Paragraph } = Typography;

interface ResetPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  userName?: string;
  loading?: boolean;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  visible,
  onClose,
  onSubmit,
  userName,
  loading = false,
}) => {
  const handleSubmit = async () => {
    try {
      await onSubmit();
    } catch (error) {
      console.error("Reset password error:", error);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LockOutlined style={{ color: "#fa8c16" }} />
          <span>Đặt lại mật khẩu</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          danger
          loading={loading}
          onClick={handleSubmit}
        >
          Xác nhận đặt lại
        </Button>,
      ]}
      width={500}
      destroyOnClose
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {userName && (
          <div
            style={{
              padding: "12px 16px",
              background: "#f0f2f5",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <UserOutlined style={{ color: "#1890ff" }} />
            <Text strong>Người dùng: {userName}</Text>
          </div>
        )}

        <div>
          <Paragraph>
            <WarningOutlined style={{ color: "#fa8c16", marginRight: 8 }} />
            Bạn có chắc chắn muốn đặt lại mật khẩu cho người dùng này không?
          </Paragraph>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Hệ thống sẽ tự động tạo mật khẩu mới và gửi cho người dùng.
          </Paragraph>
        </div>

        <div
          style={{
            padding: 12,
            background: "#fff7e6",
            border: "1px solid #ffd591",
            borderRadius: 4,
          }}
        >
          <Text type="warning" style={{ fontSize: 12 }}>
            <strong>Lưu ý:</strong> Mật khẩu mới sẽ được tạo tự động và gửi cho người
            dùng qua email. Mật khẩu cũ sẽ không còn sử dụng được nữa.
          </Text>
        </div>
      </Space>
    </Modal>
  );
};

