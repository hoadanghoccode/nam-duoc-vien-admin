import React from "react";
import { Modal, Button, Typography, Space } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface DeleteConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
  loading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  itemName,
  loading = false,
}) => {
  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
          <span>Xác nhận xóa</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      maskClosable={true}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={loading}>
          Hủy
        </Button>,
        <Button
          key="delete"
          type="primary"
          danger
          onClick={onConfirm}
          loading={loading}
        >
          Xóa
        </Button>,
      ]}
      width={400}
      centered
    >
      <div style={{ padding: "16px 0" }}>
        <Text>
          Bạn có chắc chắn muốn xóa cơ sở y tế{" "}
          <Text strong>"{itemName || "này"}"</Text> không?
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: "12px" }}>
          Hành động này không thể hoàn tác.
        </Text>
      </div>
    </Modal>
  );
};
