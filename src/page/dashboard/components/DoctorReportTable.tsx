import React, { useEffect, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { Card, Table, Button, DatePicker, Select, Space, Tag, Typography, Row, Col, Statistic } from "antd";
import { ReloadOutlined, UserOutlined, DollarOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../store/Store";
import { fetchRevenueByDoctor } from "../../../store/dashboard/revenueByDoctorSlice";
import dayjs from "dayjs";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface DoctorReportTableProps {
  title?: string;
}

const DoctorReportTable: React.FC<DoctorReportTableProps> = ({
  title = "Báo cáo doanh thu bác sĩ",
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading } = useSelector((state: RootState) => state.revenueByDoctor);

  // State for filters
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [sortBy, setSortBy] = useState<string>("Revenue");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Load data on mount
  useEffect(() => {
    const defaultDateRange: [dayjs.Dayjs, dayjs.Dayjs] = [
      dayjs().subtract(1, "month"),
      dayjs()
    ];
    setDateRange(defaultDateRange);
    
    dispatch(fetchRevenueByDoctor({
      FromDate: defaultDateRange[0].format("YYYY-MM-DD"),
      ToDate: defaultDateRange[1].format("YYYY-MM-DD"),
      SortBy: sortBy,
      SortOrder: sortOrder,
      PageIndex: currentPage,
      PageSize: pageSize,
    }));
  }, [dispatch]);

  // Handle date range change
  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates);
    if (dates && dates.length === 2) {
      dispatch(fetchRevenueByDoctor({
        FromDate: dates[0].format("YYYY-MM-DD"),
        ToDate: dates[1].format("YYYY-MM-DD"),
        SortBy: sortBy,
        SortOrder: sortOrder,
        PageIndex: currentPage,
        PageSize: pageSize,
      }));
    }
  };

  // Handle sort change
  const handleSortChange = (newSortBy: string) => {
    const newSortOrder = sortBy === newSortBy && sortOrder === "desc" ? "asc" : "desc";
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    
    if (dateRange && dateRange.length === 2) {
      dispatch(fetchRevenueByDoctor({
        FromDate: dateRange[0].format("YYYY-MM-DD"),
        ToDate: dateRange[1].format("YYYY-MM-DD"),
        SortBy: newSortBy,
        SortOrder: newSortOrder,
        PageIndex: currentPage,
        PageSize: pageSize,
      }));
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    if (dateRange && dateRange.length === 2) {
      dispatch(fetchRevenueByDoctor({
        FromDate: dateRange[0].format("YYYY-MM-DD"),
        ToDate: dateRange[1].format("YYYY-MM-DD"),
        SortBy: sortBy,
        SortOrder: sortOrder,
        PageIndex: currentPage,
        PageSize: pageSize,
      }));
    }
  };

  // Handle pagination change
  const handlePaginationChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
    
    if (dateRange && dateRange.length === 2) {
      dispatch(fetchRevenueByDoctor({
        FromDate: dateRange[0].format("YYYY-MM-DD"),
        ToDate: dateRange[1].format("YYYY-MM-DD"),
        SortBy: sortBy,
        SortOrder: sortOrder,
        PageIndex: page,
        PageSize: size,
      }));
    }
  };

  // Calculate statistics
  const totalRevenue = data?.items?.reduce((sum: number, item: any) => sum + item.totalRevenue, 0) || 0;
  const totalAppointments = data?.items?.reduce((sum: number, item: any) => sum + item.totalCompletedAppointments, 0) || 0;
  const averageRevenue = data?.items && data.items.length > 0 ? totalRevenue / data.items.length : 0;
  const topDoctor = data?.items && data.items.length > 0 ? data.items[0] : null;

  // Table columns
  const columns: ColumnsType<any> = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Tên bác sĩ",
      dataIndex: "doctorName",
      key: "doctorName",
      width: 200,
      render: (text: string, record: any) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{text}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {record.specialtyName}
          </div>
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
      title: "Tổng doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      width: 150,
      sorter: true,
      sortOrder: sortBy === "Revenue" ? (sortOrder as any) : undefined,
      render: (value: number) => (
        <span style={{ color: "#3f8600", fontWeight: "bold" }}>
          {value.toLocaleString("vi-VN")} VNĐ
        </span>
      ),
    },
    {
      title: "Số ca khám",
      dataIndex: "totalAppointments",
      key: "totalAppointments",
      width: 120,
      sorter: true,
      sortOrder: sortBy === "CompletedAppointments" ? (sortOrder as any) : undefined,
      render: (value: number) => (
        <Tag color="blue">{value}</Tag>
      ),
    },
    {
      title: "Doanh thu trung bình/ca",
      key: "averageRevenue",
      width: 150,
      render: (_: any, record: any) => {
        const average = record.totalAppointments > 0 
          ? record.totalRevenue / record.totalAppointments 
          : 0;
        return (
          <span style={{ color: "#722ed1" }}>
            {average.toLocaleString("vi-VN")} VNĐ
          </span>
        );
      },
    },
    {
      title: "Tỷ lệ (%)",
      key: "percentage",
      width: 100,
      render: (_: any, record: any) => {
        const percentage = totalRevenue > 0 
          ? (record.totalRevenue / totalRevenue) * 100 
          : 0;
        return (
          <Tag color={percentage >= 10 ? "green" : percentage >= 5 ? "orange" : "default"}>
            {percentage.toFixed(1)}%
          </Tag>
        );
      },
    },
  ];

  return (
    <div>
      <Title level={3}>{title}</Title>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={totalRevenue}
              prefix={<DollarOutlined />}
              formatter={(value) => `${value?.toLocaleString("vi-VN")} VNĐ`}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số ca khám"
              value={totalAppointments}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Doanh thu trung bình"
              value={averageRevenue}
              prefix={<DollarOutlined />}
              formatter={(value) => `${value?.toLocaleString("vi-VN")} VNĐ`}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Bác sĩ hàng đầu"
              value={topDoctor?.doctorName || "N/A"}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
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
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <span>Sắp xếp theo:</span>
              <Select
                value={sortBy}
                onChange={handleSortChange}
                style={{ width: "100%" }}
              >
                <Option value="Revenue">Doanh thu</Option>
                <Option value="CompletedAppointments">Số ca khám</Option>
                <Option value="DoctorName">Tên bác sĩ</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <span>Thứ tự:</span>
              <Select
                value={sortOrder}
                onChange={(value) => {
                  setSortOrder(value);
                  if (dateRange && dateRange.length === 2) {
                    dispatch(fetchRevenueByDoctor({
                      FromDate: dateRange[0].format("YYYY-MM-DD"),
                      ToDate: dateRange[1].format("YYYY-MM-DD"),
                      SortBy: sortBy,
                      SortOrder: value,
                      PageIndex: currentPage,
                      PageSize: pageSize,
                    }));
                  }
                }}
                style={{ width: "100%" }}
              >
                <Option value="desc">Giảm dần</Option>
                <Option value="asc">Tăng dần</Option>
              </Select>
            </Space>
          </Col>
        </Row>
        <Row style={{ marginTop: "16px" }}>
          <Col>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={loading}
            >
              Làm mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={data?.items || []}
          rowKey="doctorId"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: data?.totalCount || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} bác sĩ`,
            onChange: handlePaginationChange,
            onShowSizeChange: handlePaginationChange,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          scroll={{ x: 1000 }}
          onChange={(_pagination, _filters, sorter) => {
            // Handle table sorting
            if (sorter && !Array.isArray(sorter) && sorter.field && sorter.order) {
              let newSortBy = sortBy;
              if (sorter.field === 'totalRevenue') {
                newSortBy = 'Revenue';
              } else if (sorter.field === 'totalAppointments') {
                newSortBy = 'CompletedAppointments';
              } else if (sorter.field === 'doctorName') {
                newSortBy = 'DoctorName';
              }
              
              const newSortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
              handleSortChange(newSortBy);
              setSortOrder(newSortOrder);
            }
          }}
          onRow={(record) => ({
            style: {
              backgroundColor: record.doctorId === topDoctor?.doctorId ? "#f6ffed" : "white",
            },
          })}
        />
      </Card>
    </div>
  );
};

export default DoctorReportTable;
