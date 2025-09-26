import React from 'react';
import { Typography, Table, Tag, Button, Space, Avatar } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface UserData {
  key: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  joinDate: string;
}

const UserList: React.FC = () => {
  const columns: ColumnsType<UserData> = [
    {
      title: 'Avatar',
      dataIndex: 'name',
      key: 'avatar',
      render: (name: string) => (
        <Avatar style={{ backgroundColor: '#1890ff' }}>
          {name.charAt(0).toUpperCase()}
        </Avatar>
      ),
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        let color = 'default';
        if (role === 'Admin') color = 'red';
        if (role === 'Manager') color = 'blue';
        if (role === 'User') color = 'green';
        return <Tag color={color}>{role}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'Hoạt động') color = 'green';
        if (status === 'Tạm khóa') color = 'orange';
        if (status === 'Vô hiệu hóa') color = 'red';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Ngày tham gia',
      dataIndex: 'joinDate',
      key: 'joinDate',
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

  const data: UserData[] = [
    {
      key: '1',
      id: 'U001',
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com',
      phone: '0123456789',
      role: 'Admin',
      status: 'Hoạt động',
      joinDate: '2024-01-01',
    },
    {
      key: '2',
      id: 'U002',
      name: 'Trần Thị B',
      email: 'tranthib@email.com',
      phone: '0987654321',
      role: 'Manager',
      status: 'Hoạt động',
      joinDate: '2024-01-05',
    },
    {
      key: '3',
      id: 'U003',
      name: 'Lê Văn C',
      email: 'levanc@email.com',
      phone: '0369258147',
      role: 'User',
      status: 'Tạm khóa',
      joinDate: '2024-01-10',
    },
  ];

  return (
    <div>
      <Title level={2}>Danh sách người dùng</Title>
      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default UserList;
