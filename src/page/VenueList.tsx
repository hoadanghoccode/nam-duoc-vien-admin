import React from 'react';
import { Typography, Table, Tag, Button, Space, Image } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface VenueData {
  key: string;
  id: string;
  name: string;
  type: string;
  location: string;
  price: number;
  status: string;
  image: string;
}

const VenueList: React.FC = () => {
  const columns: ColumnsType<VenueData> = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (image: string) => (
        <Image
          width={80}
          height={60}
          src={image}
          style={{ objectFit: 'cover', borderRadius: '4px' }}
        />
      ),
    },
    {
      title: 'Tên sân',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Loại sân',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        let color = 'default';
        if (type === 'Bóng đá') color = 'green';
        if (type === 'Tennis') color = 'blue';
        if (type === 'Cầu lông') color = 'orange';
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Giá/giờ',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `${price.toLocaleString()} VNĐ`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'Hoạt động') color = 'green';
        if (status === 'Bảo trì') color = 'orange';
        if (status === 'Ngừng hoạt động') color = 'red';
        return <Tag color={color}>{status}</Tag>;
      },
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

  const data: VenueData[] = [
    {
      key: '1',
      id: 'V001',
      name: 'Sân bóng đá A1',
      type: 'Bóng đá',
      location: 'Quận 1, TP.HCM',
      price: 200000,
      status: 'Hoạt động',
      image: 'https://via.placeholder.com/80x60/4CAF50/FFFFFF?text=A1',
    },
    {
      key: '2',
      id: 'V002',
      name: 'Sân tennis B2',
      type: 'Tennis',
      location: 'Quận 2, TP.HCM',
      price: 150000,
      status: 'Hoạt động',
      image: 'https://via.placeholder.com/80x60/2196F3/FFFFFF?text=B2',
    },
    {
      key: '3',
      id: 'V003',
      name: 'Sân cầu lông C1',
      type: 'Cầu lông',
      location: 'Quận 3, TP.HCM',
      price: 100000,
      status: 'Bảo trì',
      image: 'https://via.placeholder.com/80x60/FF9800/FFFFFF?text=C1',
    },
  ];

  return (
    <div>
      <Title level={2}>Danh sách sân thể thao</Title>
      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default VenueList;
