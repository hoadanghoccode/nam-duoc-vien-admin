import React from 'react';
import { Typography, Table, Tag, Button, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface BookingData {
  key: string;
  id: string;
  customer: string;
  venue: string;
  date: string;
  time: string;
  status: string;
  amount: number;
}

const BookingList: React.FC = () => {
  const columns: ColumnsType<BookingData> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Sân thể thao',
      dataIndex: 'venue',
      key: 'venue',
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Giờ',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'Đã xác nhận') color = 'green';
        if (status === 'Chờ xác nhận') color = 'orange';
        if (status === 'Đã hủy') color = 'red';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `${amount.toLocaleString()} VNĐ`,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button type="link" size="small">Xem</Button>
          <Button type="link" size="small">Sửa</Button>
          <Button type="link" size="small" danger>Xóa</Button>
        </Space>
      ),
    },
  ];

  const data: BookingData[] = [
    {
      key: '1',
      id: 'BK001',
      customer: 'Nguyễn Văn A',
      venue: 'Sân bóng đá A1',
      date: '2024-01-15',
      time: '18:00 - 20:00',
      status: 'Đã xác nhận',
      amount: 200000,
    },
    {
      key: '2',
      id: 'BK002',
      customer: 'Trần Thị B',
      venue: 'Sân tennis B2',
      date: '2024-01-15',
      time: '19:00 - 21:00',
      status: 'Chờ xác nhận',
      amount: 150000,
    },
    {
      key: '3',
      id: 'BK003',
      customer: 'Lê Văn C',
      venue: 'Sân cầu lông C1',
      date: '2024-01-16',
      time: '17:00 - 19:00',
      status: 'Đã hủy',
      amount: 100000,
    },
  ];

  return (
    <div>
      <Title level={2}>Danh sách đặt sân</Title>
      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default BookingList;
