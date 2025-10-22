import React from "react";
import { Modal, Typography } from "antd";
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
        <span>
          <ExclamationCircleOutlined style={{ color: "#faad14", marginRight: 8 }} />
          Xác nhận xóa
        </span>
      }
      open={visible}
      onOk={onConfirm}
      onCancel={onClose}
      okText="Xóa"
      cancelText="Hủy"
      confirmLoading={loading}
      okButtonProps={{ danger: true }}
    >
      <Text>
        Bạn có chắc chắn muốn xóa người dùng <Text strong>{itemName}</Text>?
      </Text>
      <br />
      <Text type="secondary">Hành động này không thể hoàn tác.</Text>
    </Modal>
  );
};

