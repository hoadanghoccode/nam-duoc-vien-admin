import { CalendarOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Avatar, Card, Spin, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import React from "react";
import { getFullImageUrl } from "../../../helpers/upload";

interface TopDoctor {
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

interface TopDoctorsTableProps {
  data: TopDoctor[];
  title: string;
  loading?: boolean;
  error?: string;
}

const TopDoctorsTable: React.FC<TopDoctorsTableProps> = ({
  data,
  title,
  loading = false,
  error,
}) => {
  // Table columns
  const columns: ColumnsType<TopDoctor> = [
    {
      title: "Xếp hạng",
      key: "rank",
      width: 80,
      render: (_: any, __: any, index: number) => (
        <Tag color={index < 3 ? "gold" : index < 5 ? "silver" : "blue"}>
          #{index + 1}
        </Tag>
      ),
    },
    {
      title: "Bác sĩ",
      key: "doctor",
      width: 250,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar
            src={
              record.doctorImageUrl
                ? getFullImageUrl(record.doctorImageUrl)
                : null
            }
            icon={<UserOutlined />}
            size={48}
          />
          <div>
            <Typography.Text strong style={{ fontSize: "14px" }}>
              {record.doctorName}
            </Typography.Text>
            <br />
            <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
              {record.doctorTitle}
            </Typography.Text>
            <br />
            <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
              {record.facilityName}
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
        <span style={{ color: "#3f8600", fontWeight: "bold" }}>
          {value.toLocaleString("vi-VN")} VNĐ
        </span>
      ),
    },
    {
      title: "Hoa hồng",
      dataIndex: "commission",
      key: "commission",
      width: 120,
      sorter: (a, b) => a.commission - b.commission,
      render: (value: number) => (
        <span style={{ color: "#1890ff" }}>
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
        <span style={{ color: "#722ed1" }}>
          {value.toLocaleString("vi-VN")} VNĐ
        </span>
      ),
    },
    {
      title: "Ca khám hoàn thành",
      dataIndex: "totalCompletedAppointments",
      key: "totalCompletedAppointments",
      width: 150,
      sorter: (a, b) =>
        a.totalCompletedAppointments - b.totalCompletedAppointments,
      render: (value: number) => (
        <Tag color="green" icon={<CalendarOutlined />}>
          {value}
        </Tag>
      ),
    },
    {
      title: "Ca khám bị hủy",
      dataIndex: "totalCancelledAppointments",
      key: "totalCancelledAppointments",
      width: 120,
      sorter: (a, b) =>
        a.totalCancelledAppointments - b.totalCancelledAppointments,
      render: (value: number) => <Tag color="red">{value}</Tag>,
    },
    {
      title: "Số bệnh nhân",
      dataIndex: "totalPatients",
      key: "totalPatients",
      width: 120,
      sorter: (a, b) => a.totalPatients - b.totalPatients,
      render: (value: number) => (
        <Tag color="blue" icon={<UserOutlined />}>
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
        <span style={{ color: "#fa8c16" }}>
          {value.toLocaleString("vi-VN")} VNĐ
        </span>
      ),
    },
    {
      title: "Tỷ lệ hoa hồng",
      dataIndex: "commissionRate",
      key: "commissionRate",
      width: 120,
      sorter: (a, b) => a.commissionRate - b.commissionRate,
      render: (value: number) => <Tag color="orange">{value}%</Tag>,
    },
  ];

  if (loading) {
    return (
      <Card title={title}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 400,
          }}
        >
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={title}>
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
        />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card title={title}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 200,
          }}
        >
          <p style={{ color: "#999" }}>Không có dữ liệu bác sĩ</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title={title}>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="doctorId"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} bác sĩ`,
        }}
        scroll={{ x: 1200 }}
        onRow={(_record, index) => ({
          style: {
            backgroundColor: index! < 3 ? "#f6ffed" : "white",
          },
        })}
      />
    </Card>
  );
};

export default TopDoctorsTable;
