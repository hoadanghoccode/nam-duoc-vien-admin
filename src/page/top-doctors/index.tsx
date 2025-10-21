import {
  CalendarOutlined,
  ReloadOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/Store";
import { fetchTopDoctors } from "../../store/dashboard/adminTopDoctorsSlice";
import { getFullImageUrl } from "../../helpers/upload";

const { RangePicker } = DatePicker;
const { Option } = Select;

interface TopDoctorItem {
  doctorId: string;
  doctorName: string;
  doctorTitle: string;
  doctorEmail: string;
  doctorPhone: string;
  doctorImageUrl: string | null;
  facilityName: string;
  totalCompletedAppointments: number;
  totalCancelledAppointments: number;
  totalRevenue: number;
  commission: number;
  doctorEarnings: number;
  currentExaminationFee: number;
  totalPatients: number;
  commissionRate: number;
}

const TopDoctorsTab: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector(
    (state: RootState) => state.adminTopDoctors
  );

  // State for filters
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );
  const [topN, setTopN] = useState<number>(10);

  // Load data on mount
  useEffect(() => {
    const defaultDateRange: [dayjs.Dayjs, dayjs.Dayjs] = [
      dayjs().subtract(1, "month"),
      dayjs(),
    ];
    setDateRange(defaultDateRange);

    dispatch(
      fetchTopDoctors({
        fromDate: defaultDateRange[0].format("YYYY-MM-DD"),
        toDate: defaultDateRange[1].format("YYYY-MM-DD"),
        topN: topN,
      })
    );
  }, [dispatch]);

  // Handle date range change
  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates);
    if (dates && dates.length === 2) {
      dispatch(
        fetchTopDoctors({
          fromDate: dates[0].format("YYYY-MM-DD"),
          toDate: dates[1].format("YYYY-MM-DD"),
          topN: topN,
        })
      );
    }
  };

  // Handle top N change
  const handleTopNChange = (value: number) => {
    setTopN(value);
    if (dateRange && dateRange.length === 2) {
      dispatch(
        fetchTopDoctors({
          fromDate: dateRange[0].format("YYYY-MM-DD"),
          toDate: dateRange[1].format("YYYY-MM-DD"),
          topN: value,
        })
      );
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    if (dateRange && dateRange.length === 2) {
      dispatch(
        fetchTopDoctors({
          fromDate: dateRange[0].format("YYYY-MM-DD"),
          toDate: dateRange[1].format("YYYY-MM-DD"),
          topN: topN,
        })
      );
    }
  };

  // Table columns
  const columns: ColumnsType<TopDoctorItem> = [
    {
      title: "Xếp hạng",
      key: "rank",
      width: 80,
      render: (_: any, __: any, index: number) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {index < 3 && (
            <TrophyOutlined
              style={{
                color:
                  index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : "#CD7F32",
                fontSize: "16px",
              }}
            />
          )}
          <Tag color={index < 3 ? "gold" : index < 5 ? "silver" : "blue"}>
            #{index + 1}
          </Tag>
        </div>
      ),
    },
    {
      title: "Bác sĩ",
      key: "doctor",
      width: 280,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar
            src={
              record.doctorImageUrl
                ? getFullImageUrl(record.doctorImageUrl)
                : null
            }
            icon={<UserOutlined />}
            size={56}
          />
          <div>
            <Typography.Text
              strong
              style={{ fontSize: "16px", display: "block" }}
            >
              {record.doctorName}
            </Typography.Text>
            <Typography.Text
              type="secondary"
              style={{ fontSize: "14px", display: "block" }}
            >
              {record.doctorTitle}
            </Typography.Text>
            <Typography.Text
              type="secondary"
              style={{ fontSize: "12px", display: "block" }}
            >
              📧 {record.doctorEmail}
            </Typography.Text>
            <Typography.Text
              type="secondary"
              style={{ fontSize: "12px", display: "block" }}
            >
              📞 {record.doctorPhone}
            </Typography.Text>
            <Typography.Text
              type="secondary"
              style={{ fontSize: "12px", display: "block" }}
            >
              🏥 {record.facilityName}
            </Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: "Tổng doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      width: 150,
      sorter: (a, b) => a.totalRevenue - b.totalRevenue,
      render: (value: number) => (
        <span
          style={{ color: "#3f8600", fontWeight: "bold", fontSize: "14px" }}
        >
          {value.toLocaleString("vi-VN")} VNĐ
        </span>
      ),
    },
    {
      title: "Hoa hồng",
      dataIndex: "commission",
      key: "commission",
      width: 130,
      sorter: (a, b) => a.commission - b.commission,
      render: (value: number) => (
        <span style={{ color: "#1890ff", fontSize: "14px" }}>
          {value.toLocaleString("vi-VN")} VNĐ
        </span>
      ),
    },
    {
      title: "Thu nhập bác sĩ",
      dataIndex: "doctorEarnings",
      key: "doctorEarnings",
      width: 150,
      sorter: (a, b) => a.doctorEarnings - b.doctorEarnings,
      render: (value: number) => (
        <span style={{ color: "#722ed1", fontSize: "14px" }}>
          {value.toLocaleString("vi-VN")} VNĐ
        </span>
      ),
    },
    {
      title: "Ca khám hoàn thành",
      dataIndex: "totalCompletedAppointments",
      key: "totalCompletedAppointments",
      width: 160,
      sorter: (a, b) =>
        a.totalCompletedAppointments - b.totalCompletedAppointments,
      render: (value: number) => (
        <Tag
          color="green"
          icon={<CalendarOutlined />}
          style={{ fontSize: "12px" }}
        >
          {value} ca
        </Tag>
      ),
    },
    {
      title: "Ca khám bị hủy",
      dataIndex: "totalCancelledAppointments",
      key: "totalCancelledAppointments",
      width: 130,
      sorter: (a, b) =>
        a.totalCancelledAppointments - b.totalCancelledAppointments,
      render: (value: number) => (
        <Tag color="red" style={{ fontSize: "12px" }}>
          {value} ca
        </Tag>
      ),
    },
    {
      title: "Số bệnh nhân",
      dataIndex: "totalPatients",
      key: "totalPatients",
      width: 120,
      sorter: (a, b) => a.totalPatients - b.totalPatients,
      render: (value: number) => (
        <Tag color="blue" icon={<UserOutlined />} style={{ fontSize: "12px" }}>
          {value}
        </Tag>
      ),
    },
    {
      title: "Phí khám hiện tại",
      dataIndex: "currentExaminationFee",
      key: "currentExaminationFee",
      width: 150,
      sorter: (a, b) => a.currentExaminationFee - b.currentExaminationFee,
      render: (value: number) => (
        <span style={{ color: "#fa8c16", fontSize: "14px" }}>
          {value.toLocaleString("vi-VN")} VNĐ
        </span>
      ),
    },
    {
      title: "Tỷ lệ hoa hồng",
      dataIndex: "commissionRate",
      key: "commissionRate",
      width: 130,
      sorter: (a, b) => a.commissionRate - b.commissionRate,
      render: (value: number) => (
        <Tag color="orange" style={{ fontSize: "12px" }}>
          {value}%
        </Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
        <p style={{ marginTop: "16px" }}>Đang tải dữ liệu top bác sĩ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px" }}>
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={handleRefresh}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  const topDoctors = data?.items || [];

  return (
    <div style={{ padding: "24px" }}>
      {/* Filters */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <span>Khoảng thời gian:</span>
              <RangePicker
                style={{ width: "100%" }}
                value={dateRange}
                onChange={handleDateRangeChange}
                format="DD/MM/YYYY"
                placeholder={["Từ ngày", "Đến ngày"]}
              />
            </Space>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <span>Số bác sĩ top:</span>
              <Select
                value={topN}
                onChange={handleTopNChange}
                style={{ width: "100%" }}
              >
                <Option value={5}>Top 5</Option>
                <Option value={10}>Top 10</Option>
                <Option value={20}>Top 20</Option>
                <Option value={50}>Top 50</Option>
                <Option value={100}>Top 100</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <span>Thao tác:</span>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
                style={{ width: "100%" }}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Top Doctors Table */}
      <Card title={`Top ${topN} bác sĩ có doanh thu cao nhất`}>
        <Table
          columns={columns}
          dataSource={topDoctors}
          rowKey="doctorId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} bác sĩ`,
          }}
          scroll={{ x: 1400 }}
          locale={{
            emptyText: "Không có dữ liệu bác sĩ cho khoảng thời gian đã chọn"
          }}
          onRow={(_record, index) => ({
            style: {
              backgroundColor: index! < 3 ? "#f6ffed" : "white",
            },
          })}
        />
      </Card>
    </div>
  );
};

export default TopDoctorsTab;
