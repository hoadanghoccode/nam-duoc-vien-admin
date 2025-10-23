import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Tag,
  message,
  Row,
  Col,
  Card,
  Avatar,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../store/Store";
import { confirmAppointmentAdminAsync } from "../../../store/appointments/adminConfirmAppointmentSlice";
import { completeAppointmentAdminAsync } from "../../../store/appointments/adminCompleteAppointmentSlice";
import { cancelAppointmentAdminAsync } from "../../../store/appointments/adminCancelAppointmentSlice";
import { AppointmentStatus, PaymentStatus } from "../../../api/appointmentApi";
import { getFullImageUrl } from "../../../helpers/upload";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface AppointmentActionModalProps {
  visible: boolean;
  onClose: () => void;
  appointment: any;
  mode: "view" | "confirm" | "complete" | "cancel";
  onSuccess: () => void;
}

const AppointmentActionModal: React.FC<AppointmentActionModalProps> = ({
  visible,
  onClose,
  appointment,
  mode,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);

  // Redux states
  const { loading: confirmLoading } = useSelector((state: RootState) => state.adminConfirmAppointment);
  const { loading: completeLoading } = useSelector((state: RootState) => state.adminCompleteAppointment);
  const { loading: cancelLoading } = useSelector((state: RootState) => state.adminCancelAppointment);

  // Get status color and text
  const getStatusColor = (status: typeof AppointmentStatus[keyof typeof AppointmentStatus]) => {
    switch (status) {
      case AppointmentStatus.Pending:
        return "orange";
      case AppointmentStatus.Confirmed:
        return "blue";
      case AppointmentStatus.Completed:
        return "green";
      case AppointmentStatus.Cancelled:
        return "red";
      case AppointmentStatus.NoShow:
        return "purple";
      default:
        return "default";
    }
  };

  const getStatusText = (status: typeof AppointmentStatus[keyof typeof AppointmentStatus]) => {
    switch (status) {
      case AppointmentStatus.Pending:
        return "Chờ xác nhận";
      case AppointmentStatus.Confirmed:
        return "Đã xác nhận";
      case AppointmentStatus.Completed:
        return "Đã hoàn thành";
      case AppointmentStatus.Cancelled:
        return "Đã hủy";
      case AppointmentStatus.NoShow:
        return "Không đến";
      default:
        return "Không xác định";
    }
  };

  const getPaymentStatusColor = (status: typeof PaymentStatus[keyof typeof PaymentStatus]) => {
    switch (status) {
      case PaymentStatus.Unpaid:
        return "red";
      case PaymentStatus.Paid:
        return "green";
      case PaymentStatus.Refunded:
        return "orange";
      default:
        return "default";
    }
  };

  const getPaymentStatusText = (status: typeof PaymentStatus[keyof typeof PaymentStatus]) => {
    switch (status) {
      case PaymentStatus.Unpaid:
        return "Chưa thanh toán";
      case PaymentStatus.Paid:
        return "Đã thanh toán";
      case PaymentStatus.Refunded:
        return "Đã hoàn tiền";
      default:
        return "Không xác định";
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      let actionPromise;
      let successMessage;

      switch (mode) {
        case "confirm":
          actionPromise = dispatch(confirmAppointmentAdminAsync({
            id: appointment.id,
            notes: values.notes,
          }));
          successMessage = "Xác nhận cuộc hẹn thành công!";
          break;
        case "complete":
          actionPromise = dispatch(completeAppointmentAdminAsync({
            id: appointment.id,
            notes: values.notes,
          }));
          successMessage = "Hoàn thành cuộc hẹn thành công!";
          break;
        case "cancel":
          actionPromise = dispatch(cancelAppointmentAdminAsync({
            id: appointment.id,
            cancelReason: values.notes,
          }));
          successMessage = "Hủy cuộc hẹn thành công!";
          break;
        default:
          return;
      }

      await actionPromise;
      message.success(successMessage);
      onSuccess();
      handleClose();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Thao tác thất bại!";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    form.resetFields();
    setLoading(false);
    onClose();
  };

  // Set form values when appointment changes
  useEffect(() => {
    if (visible && appointment) {
      form.setFieldsValue({
        notes: appointment.notes || "",
      });
    }
  }, [visible, appointment, form]);

  // Get modal title and button text
  const getModalTitle = () => {
    switch (mode) {
      case "view":
        return "Xem chi tiết cuộc hẹn";
      case "confirm":
        return "Xác nhận cuộc hẹn";
      case "complete":
        return "Hoàn thành cuộc hẹn";
      case "cancel":
        return "Hủy cuộc hẹn";
      default:
        return "Cuộc hẹn";
    }
  };

  const getButtonText = () => {
    switch (mode) {
      case "confirm":
        return "Xác nhận";
      case "complete":
        return "Hoàn thành";
      case "cancel":
        return "Hủy cuộc hẹn";
      default:
        return "Đóng";
    }
  };

  const getButtonType = () => {
    switch (mode) {
      case "confirm":
      case "complete":
        return "primary";
      case "cancel":
        return "primary";
      default:
        return "default";
    }
  };

  const getButtonDanger = () => {
    return mode === "cancel";
  };

  return (
    <Modal
      title={<Title level={4}>{getModalTitle()}</Title>}
      open={visible}
      onCancel={handleClose}
      width={800}
      bodyStyle={{ maxHeight: 600, overflowY: "auto" }}
      footer={mode === "view" ? [
        <Button key="close" onClick={handleClose}>
          Đóng
        </Button>,
      ] : [
        <Button key="cancel" onClick={handleClose}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type={getButtonType()}
          danger={getButtonDanger()}
          loading={loading || confirmLoading || completeLoading || cancelLoading}
          onClick={handleSubmit}
        >
          {getButtonText()}
        </Button>,
      ]}
      destroyOnHidden
    >
      {appointment && (
        <div>
          {/* Appointment Information */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <Title level={5}>Thông tin cuộc hẹn</Title>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text strong>Mã cuộc hẹn:</Text>
                  <Text>{appointment.id}</Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text strong>Ngày hẹn:</Text>
                  <Text>{dayjs(appointment.appointmentDate).format("DD/MM/YYYY")}</Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text strong>Giờ hẹn:</Text>
                  <Text>{appointment.timeSlotDisplay}</Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text strong>Trạng thái:</Text>
                  <Tag color={getStatusColor(appointment.status)}>
                    {getStatusText(appointment.status)}
                  </Tag>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text strong>Thanh toán:</Text>
                  <Tag color={getPaymentStatusColor(appointment.paymentStatus)}>
                    {getPaymentStatusText(appointment.paymentStatus)}
                  </Tag>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text strong>Phí khám:</Text>
                  <Text>{appointment.fee ? appointment.fee.toLocaleString("vi-VN") : "0"} VNĐ</Text>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Patient Information */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <Title level={5}>
              <UserOutlined /> Thông tin bệnh nhân
            </Title>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Space direction="vertical" size="small">
                  <Text strong>Tên bệnh nhân:</Text>
                  <Text>{appointment.patientName}</Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text strong><PhoneOutlined /> Số điện thoại:</Text>
                  <Text>{appointment.patientPhone}</Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text strong><MailOutlined /> Email:</Text>
                  <Text>{appointment.patientEmail}</Text>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Doctor Information */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <Title level={5}>
              <UserOutlined /> Thông tin bác sĩ
            </Title>
            <Row gutter={[16, 16]} align="middle">
              <Col span={4}>
                <Avatar
                  src={appointment.doctorImageUrl ? getFullImageUrl(appointment.doctorImageUrl) : null}
                  icon={<UserOutlined />}
                  size={64}
                />
              </Col>
              <Col span={20}>
                <Space direction="vertical" size="small">
                  <Text strong>Tên bác sĩ:</Text>
                  <Text>{appointment.doctorName}</Text>
                  <Text strong>Chức danh:</Text>
                  <Text>{appointment.doctorTitle}</Text>
                  <Text strong>Chuyên khoa:</Text>
                  <Text>{appointment.specialtyName}</Text>
                  <Text strong>Cơ sở y tế:</Text>
                  <Text>{appointment.facilityName}</Text>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Notes Section (for actions) */}
          {mode !== "view" && (
            <Card size="small">
              <Title level={5}>Ghi chú</Title>
              <Form form={form} layout="vertical">
                <Form.Item
                  name="notes"
                  label={mode === "cancel" ? "Lý do hủy" : "Ghi chú"}
                  rules={mode === "cancel" ? [
                    { required: true, message: "Vui lòng nhập lý do hủy" }
                  ] : []}
                >
                  <TextArea
                    rows={4}
                    placeholder={
                      mode === "cancel" 
                        ? "Nhập lý do hủy cuộc hẹn..." 
                        : "Nhập ghi chú (tùy chọn)..."
                    }
                    maxLength={500}
                    showCount
                  />
                </Form.Item>
              </Form>
            </Card>
          )}

          {/* Existing Notes (for view mode) */}
          {mode === "view" && appointment.notes && (
            <Card size="small">
              <Title level={5}>Ghi chú</Title>
              <Text>{appointment.notes}</Text>
            </Card>
          )}
        </div>
      )}
    </Modal>
  );
};

export default AppointmentActionModal;
