// DeleteConfirmModal.tsx
import { Modal, Button, Space, Typography, Divider } from "antd";
import { ExclamationCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import React from "react";

const { Text } = Typography;

interface DeleteConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
  loading?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  itemName = "mục này",
  loading = false,
}) => {
  const handleConfirm = (): void => {
    onConfirm();
  };

  const handleCancel = (): void => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ExclamationCircleOutlined style={{ color: "#ff4d4f", fontSize: 20 }} />
          <span>Xác nhận xóa</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={400}
      maskClosable={!loading}
      closable={!loading}
      centered
    >
      <div style={{ padding: "8px 0" }}>
        <div style={{ marginBottom: 16 }}>
          <Text>
            Bạn có chắc chắn muốn xóa <Text strong>"{itemName}"</Text> không?
          </Text>
        </div>
        
        <Divider style={{ margin: "16px 0" }} />
        
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            ⚠️ Hành động này không thể hoàn tác. Dữ liệu sẽ bị xóa vĩnh viễn.
          </Text>
        </div>
        
        <div style={{ textAlign: "right" }}>
          <Space>
            <Button 
              onClick={handleCancel}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              danger
              type="primary"
              icon={<DeleteOutlined />}
              onClick={handleConfirm}
              loading={loading}
            >
              Xóa
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
