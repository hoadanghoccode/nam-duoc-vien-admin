import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  DatePicker,
  Statistic,
  Tooltip,
  Alert,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/Store";
import { getAdminAppointmentsAsync } from "../../store/appointments/adminAppointmentsSlice";
import { useSearchParams } from "react-router-dom";
// Import from existing API
const AppointmentStatus = {
  Pending: 1,
  Confirmed: 2,
  Completed: 3,
  Cancelled: 4,
  NoShow: 5,
} as const;

const PaymentStatus = {
  Unpaid: 1,
  Paid: 2,
  Refunded: 3,
} as const;
import AppointmentActionModal from "./components/AppointmentActionModal";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const AppointmentManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: appointmentsData, loading } = useSelector(
    (state: RootState) => state.adminAppointments
  );

  // Lấy doctorId từ URL query params (nếu có)
  const [searchParams] = useSearchParams();
  const doctorIdFromUrl = searchParams.get("doctorId") || undefined;

  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<typeof AppointmentStatus[keyof typeof AppointmentStatus] | undefined>();
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<typeof PaymentStatus[keyof typeof PaymentStatus] | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [modalMode, setModalMode] = useState<"view" | "confirm" | "complete" | "cancel">("view");

  // Load appointments on mount
  useEffect(() => {
    dispatch(getAdminAppointmentsAsync({
      searchTerm: searchTerm,
      doctorId: doctorIdFromUrl, // Tự động filter theo doctorId nếu có trong URL
      status: selectedStatus,
      paymentStatus: selectedPaymentStatus,
      fromDate: dateRange?.[0]?.format("YYYY-MM-DD"),
      toDate: dateRange?.[1]?.format("YYYY-MM-DD"),
      pageIndex: 1,
      pageSize: 100,
    }));
  }, [dispatch, searchTerm, doctorIdFromUrl, selectedStatus, selectedPaymentStatus, dateRange]);

  // Handle filter by status card click
  const handleStatusFilter = (status: typeof AppointmentStatus[keyof typeof AppointmentStatus]) => {
    setSelectedStatus(selectedStatus === status ? undefined : status);
  };

  // Handle payment status filter
  const handlePaymentStatusFilter = (paymentStatus: typeof PaymentStatus[keyof typeof PaymentStatus]) => {
    setSelectedPaymentStatus(selectedPaymentStatus === paymentStatus ? undefined : paymentStatus);
  };

  // Handle action button click
  const handleAction = (appointment: any, action: "view" | "confirm" | "complete" | "cancel") => {
    setSelectedAppointment(appointment);
    setModalMode(action);
    setModalVisible(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedAppointment(null);
    setModalMode("view");
  };

  // Handle refresh after action
  const handleRefresh = () => {
    dispatch(getAdminAppointmentsAsync({
      searchTerm: searchTerm,
      doctorId: doctorIdFromUrl, // Giữ nguyên filter theo doctorId khi refresh
      status: selectedStatus,
      paymentStatus: selectedPaymentStatus,
      fromDate: dateRange?.[0]?.format("YYYY-MM-DD"),
      toDate: dateRange?.[1]?.format("YYYY-MM-DD"),
      pageIndex: 1,
      pageSize: 100,
    }));
  };

  // Get status color
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

  // Get status text
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

  // Get payment status color
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

  // Get payment status text
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

  // Table columns
  const columns: ColumnsType<any> = [
    {
      title: "Bệnh nhân",
      dataIndex: "patientName",
      key: "patientName",
      fixed: "left",
      width: 150,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{text}</div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.patientPhone}
          </Text>
        </div>
      ),
    },
    {
      title: "Bác sĩ",
      dataIndex: "doctorName",
      key: "doctorName",
      width: 150,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{text}</div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.doctorTitle}
          </Text>
        </div>
      ),
    },
    {
      title: "Ngày giờ hẹn",
      dataIndex: "appointmentDate",
      key: "appointmentDate",
      width: 150,
      render: (text, record) => (
        <div>
          <div>{dayjs(text).format("DD/MM/YYYY")}</div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.appointmentTime}
          </Text>
        </div>
      ),
    },
    {
      title: "Cơ sở y tế",
      dataIndex: "facilityName",
      key: "facilityName",
      width: 150,
    },
    {
      title: "Chuyên khoa",
      dataIndex: "specialtyName",
      key: "specialtyName",
      width: 120,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: typeof AppointmentStatus[keyof typeof AppointmentStatus]) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 120,
      render: (status: typeof PaymentStatus[keyof typeof PaymentStatus]) => (
        <Tag color={getPaymentStatusColor(status)}>
          {getPaymentStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "Phí khám",
      dataIndex: "fee",
      key: "fee",
      width: 120,
      render: (fee: number) => fee ? `${fee.toLocaleString("vi-VN")} VNĐ` : "0 VNĐ",
    },
    {
      title: "Hành động",
      key: "action",
      fixed: "right",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleAction(record, "view")}
            />
          </Tooltip>
          {record.status === AppointmentStatus.Pending && (
            <Tooltip title="Xác nhận">
              <Button
                icon={<CheckOutlined />}
                size="small"
                type="primary"
                onClick={() => handleAction(record, "confirm")}
              />
            </Tooltip>
          )}
          {record.status === AppointmentStatus.Confirmed && (
            <Tooltip title="Hoàn thành">
              <Button
                icon={<CheckOutlined />}
                size="small"
                type="primary"
                onClick={() => handleAction(record, "complete")}
              />
            </Tooltip>
          )}
          {(record.status === AppointmentStatus.Pending || record.status === AppointmentStatus.Confirmed) && (
            <Tooltip title="Hủy">
              <Button
                icon={<CloseOutlined />}
                size="small"
                danger
                onClick={() => handleAction(record, "cancel")}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // Calculate statistics
  const stats = {
    total: appointmentsData?.items?.length || 0,
    pending: appointmentsData?.items?.filter(item => item.status === AppointmentStatus.Pending).length || 0,
    confirmed: appointmentsData?.items?.filter(item => item.status === AppointmentStatus.Confirmed).length || 0,
    completed: appointmentsData?.items?.filter(item => item.status === AppointmentStatus.Completed).length || 0,
    cancelled: appointmentsData?.items?.filter(item => item.status === AppointmentStatus.Cancelled).length || 0,
    unpaid: appointmentsData?.items?.filter(item => item.paymentStatus === PaymentStatus.Unpaid).length || 0,
    paid: appointmentsData?.items?.filter(item => item.paymentStatus === PaymentStatus.Paid).length || 0,
  };

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>Quản lý cuộc hẹn</Title>

      {/* Alert khi filter theo doctorId */}
      {doctorIdFromUrl && (
        <Alert
          message="Đang hiển thị các cuộc hẹn của bạn"
          description="Bạn đang xem danh sách các cuộc hẹn được phân công cho bạn với vai trò bác sĩ."
          type="info"
          icon={<InfoCircleOutlined />}
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={3}>
          <Card 
            hoverable 
            onClick={() => setSelectedStatus(undefined)}
            style={{ cursor: "pointer", backgroundColor: selectedStatus === undefined ? "#f0f0f0" : "white" }}
          >
            <Statistic
              title="Tổng cộng"
              value={stats.total}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={3}>
          <Card 
            hoverable 
            onClick={() => handleStatusFilter(AppointmentStatus.Pending)}
            style={{ cursor: "pointer", backgroundColor: selectedStatus === AppointmentStatus.Pending ? "#fff7e6" : "white" }}
          >
            <Statistic
              title="Chờ xác nhận"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={3}>
          <Card 
            hoverable 
            onClick={() => handleStatusFilter(AppointmentStatus.Confirmed)}
            style={{ cursor: "pointer", backgroundColor: selectedStatus === AppointmentStatus.Confirmed ? "#e6f7ff" : "white" }}
          >
            <Statistic
              title="Đã xác nhận"
              value={stats.confirmed}
              prefix={<CheckOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={3}>
          <Card 
            hoverable 
            onClick={() => handleStatusFilter(AppointmentStatus.Completed)}
            style={{ cursor: "pointer", backgroundColor: selectedStatus === AppointmentStatus.Completed ? "#f6ffed" : "white" }}
          >
            <Statistic
              title="Đã hoàn thành"
              value={stats.completed}
              prefix={<CheckOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={3}>
          <Card 
            hoverable 
            onClick={() => handleStatusFilter(AppointmentStatus.Cancelled)}
            style={{ cursor: "pointer", backgroundColor: selectedStatus === AppointmentStatus.Cancelled ? "#fff2f0" : "white" }}
          >
            <Statistic
              title="Đã hủy"
              value={stats.cancelled}
              prefix={<CloseOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={3}>
          <Card 
            hoverable 
            onClick={() => handlePaymentStatusFilter(PaymentStatus.Unpaid)}
            style={{ cursor: "pointer", backgroundColor: selectedPaymentStatus === PaymentStatus.Unpaid ? "#fff2f0" : "white" }}
          >
            <Statistic
              title="Chưa thanh toán"
              value={stats.unpaid}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={3}>
          <Card 
            hoverable 
            onClick={() => handlePaymentStatusFilter(PaymentStatus.Paid)}
            style={{ cursor: "pointer", backgroundColor: selectedPaymentStatus === PaymentStatus.Paid ? "#f6ffed" : "white" }}
          >
            <Statistic
              title="Đã thanh toán"
              value={stats.paid}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Input
              placeholder="Tìm kiếm theo tên, SĐT, email..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              placeholder="Trạng thái cuộc hẹn"
              value={selectedStatus}
              onChange={setSelectedStatus}
              defaultValue={undefined}
              style={{ width: "100%" }}
            >
              <Option value={undefined}>Tất cả</Option>
              <Option value={AppointmentStatus.Pending}>Chờ xác nhận</Option>
              <Option value={AppointmentStatus.Confirmed}>Đã xác nhận</Option>
              <Option value={AppointmentStatus.Completed}>Đã hoàn thành</Option>
              <Option value={AppointmentStatus.Cancelled}>Đã hủy</Option>
              <Option value={AppointmentStatus.NoShow}>Không đến</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              placeholder="Trạng thái thanh toán"
              value={selectedPaymentStatus}
              onChange={setSelectedPaymentStatus}
              defaultValue={undefined}
              style={{ width: "100%" }}
            >
              <Option value={undefined}>Tất cả</Option>
              <Option value={PaymentStatus.Unpaid}>Chưa thanh toán</Option>
              <Option value={PaymentStatus.Paid}>Đã thanh toán</Option>
              <Option value={PaymentStatus.Refunded}>Đã hoàn tiền</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <RangePicker
              style={{ width: "100%" }}
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
              format="DD/MM/YYYY"
              placeholder={["Từ ngày", "Đến ngày"]}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={appointmentsData?.items || []}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: appointmentsData?.pageIndex || 1,
            pageSize: appointmentsData?.pageSize || 10,
            total: appointmentsData?.totalCount || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} cuộc hẹn`,
          }}
        />
      </Card>

      {/* Action Modal */}
      <AppointmentActionModal
        visible={modalVisible}
        onClose={handleModalClose}
        appointment={selectedAppointment}
        mode={modalMode}
        onSuccess={handleRefresh}
      />
    </div>
  );
};

export default AppointmentManagementPage;