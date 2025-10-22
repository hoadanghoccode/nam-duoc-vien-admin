import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  Card,
  Input,
  Select,
  Avatar,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/Store";
import { getAdminUsersAsync } from "../../store/adminuser/adminUsersSlice";
import { getAdminUserByIdAsync } from "../../store/adminuser/adminUserDetailSlice";
import { createAdminUserAsync } from "../../store/adminuser/createAdminUserSlice";
import { updateAdminUserAsync } from "../../store/adminuser/updateAdminUserSlice";
import { deleteAdminUserAsync } from "../../store/adminuser/deleteAdminUserSlice";
import { resetUserPasswordAsync } from "../../store/adminuser/resetUserPasswordSlice";
import { uploadImageToCloud } from "../../helpers/upload";
import { notifyStatus } from "../../utils/toast-notifier";
import { getFullImageUrl } from "../../utils/image-utils";
import { UserModal } from "./components/UserModal";
import { UserDetailModal } from "./components/UserDetailModal";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { ResetPasswordModal } from "./components/ResetPasswordModal";
import { UserFormData } from "./types";
import { AdminUserItem } from "../../api/adminUsersApi";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const UserManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux states
  const { status, data: listData, error: listError } = useSelector(
    (state: RootState) => state.adminUsers
  );
  const {
    status: createStatus,
    error: createError,
    result: createResult,
  } = useSelector((state: RootState) => state.createAdminUser);
  const {
    statusById: updateStatusById,
    errorById: updateErrorById,
    resultById: updateResultById,
  } = useSelector((state: RootState) => state.updateAdminUser);
  const {
    statusById: deleteStatusById,
    errorById: deleteErrorById,
    deletedAt,
  } = useSelector((state: RootState) => state.deleteAdminUser);
  const { byId: userDetailById, statusById } = useSelector(
    (state: RootState) => state.adminUserDetail
  );
  const {
    statusById: resetPasswordStatusById,
    errorById: resetPasswordErrorById,
    resultById: resetPasswordResultById,
  } = useSelector((state: RootState) => state.resetUserPassword);

  // Local states
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailModalMode, setDetailModalMode] = useState<"view" | "edit">("view");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUserItem | null>(null);
  const [resettingUser, setResettingUser] = useState<AdminUserItem | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"Admin" | "User" | undefined>("User");

  // Load users
  const loadUsers = useCallback(() => {
    dispatch(
      getAdminUsersAsync({
        PageIndex: pagination.current,
        PageSize: pagination.pageSize,
        SearchTerm: searchTerm || undefined,
        Role: roleFilter,
      })
    );
  }, [dispatch, pagination.current, pagination.pageSize, searchTerm, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle errors
  useEffect(() => {
    if (listError) notifyStatus(500, listError);
    if (createError) notifyStatus(500, createError);
    // updateError, deleteError, resetPasswordError là objects, cần xử lý khác
    Object.values(updateErrorById).forEach((err) => {
      if (err) notifyStatus(500, err);
    });
    Object.values(deleteErrorById).forEach((err) => {
      if (err) notifyStatus(500, err);
    });
    Object.values(resetPasswordErrorById).forEach((err) => {
      if (err) notifyStatus(500, err);
    });
  }, [listError, createError, updateErrorById, deleteErrorById, resetPasswordErrorById]);

  // Handle create success
  useEffect(() => {
    if (createStatus === "succeeded" && createResult) {
      notifyStatus(201, "Tạo người dùng thành công!");
      setCreateModalVisible(false);
      loadUsers();
    }
  }, [createStatus, createResult, loadUsers]);

  // Handle update success
  useEffect(() => {
    const hasSucceeded = Object.values(updateStatusById).some((s) => s === "succeeded");
    const hasResult = Object.values(updateResultById).some((r) => r !== undefined);
    
    if (hasSucceeded && hasResult) {
      notifyStatus(200, "Cập nhật người dùng thành công!");
      setDetailModalVisible(false);
      setDetailModalMode("view");
      loadUsers();
    }
  }, [updateStatusById, updateResultById, loadUsers]);

  // Handle delete success
  useEffect(() => {
    const hasDeleted = Object.keys(deletedAt).length > 0;
    
    if (hasDeleted) {
      notifyStatus(200, "Xóa người dùng thành công!");
      setDeleteModalVisible(false);
      loadUsers();
    }
  }, [deletedAt, loadUsers]);

  // Handle reset password success
  useEffect(() => {
    const hasReset = Object.values(resetPasswordStatusById).some((s) => s === "succeeded");
    const hasResult = Object.values(resetPasswordResultById).some((r) => r !== undefined);
    
    if (hasReset && hasResult) {
      notifyStatus(200, "Đặt lại mật khẩu thành công!");
      setResetPasswordModalVisible(false);
      setResettingUser(null);
    }
  }, [resetPasswordStatusById, resetPasswordResultById]);

  // Modal handlers
  const handleOpenAddModal = () => {
    setCreateModalVisible(true);
  };

  const handleOpenViewModal = async (user: AdminUserItem) => {
    setViewingUserId(user.id);
    setDetailModalMode("view");
    setDetailModalVisible(true);
    // Luôn gọi API để lấy dữ liệu mới nhất
    await dispatch(getAdminUserByIdAsync(user.id));
  };

  const handleOpenEditModal = async (user: AdminUserItem) => {
    setViewingUserId(user.id);
    setDetailModalMode("edit");
    setDetailModalVisible(true);
    // Luôn gọi API để lấy dữ liệu mới nhất
    await dispatch(getAdminUserByIdAsync(user.id));
  };

  const handleOpenDeleteModal = (user: AdminUserItem) => {
    setDeletingUser(user);
    setDeleteModalVisible(true);
  };

  const handleOpenResetPasswordModal = (user: AdminUserItem) => {
    setResettingUser(user);
    setResetPasswordModalVisible(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalVisible(false);
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setDetailModalMode("view");
    setViewingUserId(null);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalVisible(false);
    setDeletingUser(null);
  };

  const handleCloseResetPasswordModal = () => {
    setResetPasswordModalVisible(false);
    setResettingUser(null);
  };

  const handleDetailModalModeChange = (mode: "view" | "edit") => {
    setDetailModalMode(mode);
  };

  // Submit handlers
  const handleCreateSubmit = async (values: UserFormData) => {
    try {
      let finalImageUrl = values.imageUrl || "";

      // Upload image if new file
      if (values.imageFile) {
        try {
          finalImageUrl = await uploadImageToCloud(values.imageFile);
        } catch (uploadError: any) {
          const errorMessage =
            uploadError?.response?.data?.message || "Upload ảnh thất bại!";
          notifyStatus(500, errorMessage);
          throw uploadError;
        }
      }

      // Create
      await dispatch(
        createAdminUserAsync({
          email: values.email,
          phoneNumber: values.phoneNumber,
          password: values.password || "123456",
          displayName: values.displayName,
          dateOfBirth: values.dateOfBirth,
          gender: values.gender,
          address: values.address,
          imageUrl: finalImageUrl,
          roles: [values.role], // Convert role string to roles array
          isActive: values.isActive,
          status: values.isActive ? 1 : 0, // Map isActive to status
        })
      ).unwrap();
    } catch (error: any) {
      console.error("Error in handleCreateSubmit:", error);
      throw error;
    }
  };

  const handleDetailSubmit = async (values: UserFormData) => {
    if (!values.id) return;
    
    try {
      let finalImageUrl = values.imageUrl || "";

      // Upload image if new file
      if (values.imageFile) {
        try {
          finalImageUrl = await uploadImageToCloud(values.imageFile);
        } catch (uploadError: any) {
          const errorMessage =
            uploadError?.response?.data?.message || "Upload ảnh thất bại!";
          notifyStatus(500, errorMessage);
          throw uploadError;
        }
      }

      // Update
      await dispatch(
        updateAdminUserAsync({
          userId: values.id,
          payload: {
            email: values.email,
            phoneNumber: values.phoneNumber,
            displayName: values.displayName,
            dateOfBirth: values.dateOfBirth,
            gender: values.gender,
            address: values.address,
            imageUrl: finalImageUrl,
            roles: [values.role], // Convert role string to roles array
            isActive: values.isActive,
            status: values.isActive ? 1 : 0, // Map isActive to status
          },
        })
      ).unwrap();
    } catch (error: any) {
      console.error("Error in handleDetailSubmit:", error);
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      await dispatch(deleteAdminUserAsync(deletingUser.id)).unwrap();
    } catch (error) {
      console.error("Delete user error:", error);
    }
  };

  const handleResetPassword = async () => {
    if (!resettingUser) return;
    try {
      await dispatch(resetUserPasswordAsync(resettingUser.id)).unwrap();
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  };

  const handleTableChange = (pag: any) => {
    setPagination({
      current: pag.current,
      pageSize: pag.pageSize,
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination({ ...pagination, current: 1 });
  };

  const handleRoleFilterChange = (value: "Admin" | "User" | undefined) => {
    setRoleFilter(value);
    setPagination({ ...pagination, current: 1 });
  };

  // Table columns
  const columns: ColumnsType<AdminUserItem> = useMemo(
    () => [
      {
        title: "STT",
        key: "index",
        width: 60,
        render: (_, __, index) =>
          (pagination.current - 1) * pagination.pageSize + index + 1,
      },
      {
        title: "Người dùng",
        key: "user",
        render: (_, record) => (
          <Space>
            <Avatar src={getFullImageUrl(record.imageUrl)} icon={<UserOutlined />} />
            <div>
              <Text strong>{record.displayName}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.email}
              </Text>
            </div>
          </Space>
        ),
      },
      {
        title: "Số điện thoại",
        dataIndex: "phoneNumber",
        key: "phoneNumber",
        width: 130,
      },
      {
        title: "Vai trò",
        dataIndex: "role",
        key: "role",
        width: 100,
        filters: [
          { text: "Admin", value: "Admin" },
          { text: "User", value: "User" },
        ],
        render: (role: string) => (
          <Tag color={role === "Admin" ? "red" : "blue"}>{role}</Tag>
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "isActive",
        key: "isActive",
        width: 120,
        filters: [
          { text: "Hoạt động", value: true },
          { text: "Tạm dừng", value: false },
        ],
        render: (isActive: boolean) => (
          <Tag color={isActive ? "green" : "default"}>
            {isActive ? "Hoạt động" : "Tạm dừng"}
          </Tag>
        ),
      },
      {
        title: "Ngày tạo",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 150,
        render: (date: string) => (
          <Text type="secondary">{dayjs(date).format("DD/MM/YYYY HH:mm")}</Text>
        ),
      },
      {
        title: "Thao tác",
        key: "actions",
        width: 200,
        render: (_, record) => (
          <Space size="small">
            <Tooltip title="Xem chi tiết">
              <Button
                type="primary"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleOpenViewModal(record)}
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleOpenEditModal(record)}
              />
            </Tooltip>
            <Tooltip title="Reset mật khẩu">
              <Button
                size="small"
                icon={<LockOutlined />}
                onClick={() => handleOpenResetPasswordModal(record)}
                loading={resetPasswordStatusById[record.id] === "loading"}
                style={{ color: "#fa8c16", borderColor: "#fa8c16" }}
              />
            </Tooltip>
            <Tooltip title="Xóa">
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleOpenDeleteModal(record)}
                loading={deleteStatusById[record.id] === "loading"}
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [pagination, deleteStatusById, resetPasswordStatusById]
  );

  const statistics = useMemo(() => {
    const totalCount = listData?.totalCount || 0;
    const activeCount =
      listData?.items?.filter((item) => item.isActive).length || 0;
    const inactiveCount = totalCount - activeCount;
    const adminCount =
      listData?.items?.filter((item) => item.role === "Admin").length || 0;
    const userCount =
      listData?.items?.filter((item) => item.role === "User").length || 0;

    return { totalCount, activeCount, inactiveCount, adminCount, userCount };
  }, [listData]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Quản lý người dùng
        </Title>
        <Text type="secondary">
          Quản lý danh sách người dùng trong hệ thống
        </Text>
      </div>

      {/* Main Content */}
      <Card>
        {/* Toolbar */}
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <Space>
            <Search
              placeholder="Tìm kiếm theo tên, email..."
              allowClear
              onSearch={handleSearch}
              style={{ width: 300 }}
              enterButton={<SearchOutlined />}
            />
            <Select
              placeholder="Lọc theo vai trò"
              style={{ width: 150 }}
              allowClear
              value={roleFilter}
              onChange={handleRoleFilterChange}
            >
              <Option value="User">User</Option>
              <Option value="Admin">Admin</Option>
            </Select>
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenAddModal}
          >
            Thêm người dùng
          </Button>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={listData?.items || []}
          rowKey="id"
          loading={status === "loading"}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: statistics.totalCount,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} người dùng`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
          size="middle"
        />
      </Card>

      {/* User Modal (Create) */}
      <UserModal
        visible={createModalVisible}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateSubmit}
        initialValues={null}
        loading={createStatus === "loading"}
        mode="create"
      />

      {/* User Detail Modal (View/Edit) */}
      {viewingUserId && (
        <UserDetailModal
          visible={detailModalVisible}
          onClose={handleCloseDetailModal}
          onSubmit={handleDetailSubmit}
          userData={userDetailById[viewingUserId] || null}
          loading={statusById[viewingUserId] === "loading"}
          submitLoading={
            viewingUserId ? updateStatusById[viewingUserId] === "loading" : false
          }
          mode={detailModalMode}
          onModeChange={handleDetailModalModeChange}
        />
      )}

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        visible={deleteModalVisible}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDelete}
        itemName={deletingUser?.displayName}
        loading={
          deletingUser ? deleteStatusById[deletingUser.id] === "loading" : false
        }
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        visible={resetPasswordModalVisible}
        onClose={handleCloseResetPasswordModal}
        onSubmit={handleResetPassword}
        userName={resettingUser?.displayName}
        loading={
          resettingUser ? resetPasswordStatusById[resettingUser.id] === "loading" : false
        }
      />
    </div>
  );
};

export default UserManagementPage;

