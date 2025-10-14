// SpecialtyPage.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { SpecialtyFormSubmit } from "./components/SpecialtyModal";
import { Button, Table, Space, Tag, Typography, Tooltip } from "antd";
import { PlusOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import SpecialtyModal from "./components/SpecialtyModal";
import SpecialtyDetailModal from "./components/SpecialtyDetailModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/Store";
import { createSpecialtyAsync } from "../../store/specialty/specialtyCreateSlice";
import { updateSpecialtyAsync } from "../../store/specialty/specialtyUpdateSlice";
import { deleteSpecialtyAsync } from "../../store/specialty/specialtyDeleteSlice";
import { getSpecialtiesAsync } from "../../store/specialty/specialtySlice";
import { uploadImageToCloud } from "../../helpers/upload";
import { notifyStatus } from "../../utils/toast-notifier";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const SpecialtyPage = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux states
  const {
    loading: createLoading,
    error: createError,
    data: createData,
  } = useSelector((state: RootState) => state.specialtyCreate);
  const {
    loading: updateLoading,
    error: updateError,
    data: updateData,
  } = useSelector((state: RootState) => state.specialtyUpdate);
  const {
    loading: deleteLoading,
    error: deleteError,
    success: deleteSuccess,
    deletedId,
  } = useSelector((state: RootState) => state.specialtyDelete);
  const {
    loading: listLoading,
    error: listError,
    data: listData,
  } = useSelector((state: RootState) => state.specialty);

  // Local states
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editData, setEditData] = useState<any>(null);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [viewingSpecialty, setViewingSpecialty] = useState<any>(null);
  const [detailModalMode, setDetailModalMode] = useState<"view" | "edit">(
    "view"
  );
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [deletingSpecialty, setDeletingSpecialty] = useState<any>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // Load danh sách specialties với useCallback để tránh re-render
  const loadSpecialties = useCallback(async () => {
    try {
      await dispatch(
        getSpecialtiesAsync({
          page: pagination.current,
          limit: pagination.pageSize,
        })
      ).unwrap();
    } catch (error) {
      console.error("Error loading specialties:", error);
    }
  }, [dispatch, pagination.current, pagination.pageSize]);

  // Load danh sách specialties khi pagination hoặc search thay đổi
  useEffect(() => {
    loadSpecialties();
  }, [loadSpecialties]);

  // Xử lý lỗi từ Redux
  useEffect(() => {
    if (createError) notifyStatus(500, createError);
    if (updateError) notifyStatus(500, updateError);
    if (deleteError) notifyStatus(500, deleteError);
    if (listError) notifyStatus(500, listError);
  }, [createError, updateError, deleteError, listError]);

  // Xử lý khi tạo thành công
  useEffect(() => {
    if (createData && !createLoading) {
      handleCloseModal();
      loadSpecialties(); // Refresh danh sách
    }
  }, [createData, createLoading, loadSpecialties]);

  // Xử lý khi update thành công
  useEffect(() => {
    if (updateData && !updateLoading) {
      setDetailModalVisible(false);
      setViewingSpecialty(null);
      loadSpecialties(); // Refresh danh sách
    }
  }, [updateData, updateLoading, loadSpecialties]);

  // Xử lý khi delete thành công
  useEffect(() => {
    if (deleteSuccess && deletedId && !deleteLoading) {
      notifyStatus(200, "Xóa chuyên khoa thành công!");
      loadSpecialties(); // Refresh danh sách
    }
  }, [deleteSuccess, deletedId, deleteLoading, loadSpecialties]);

  const handleOpenAddModal = (): void => {
    setEditData(null);
    setModalVisible(true);
  };

  const handleCloseModal = (): void => {
    setModalVisible(false);
    setEditData(null);
  };

  const handleViewSpecialty = (specialty: any): void => {
    setViewingSpecialty(specialty);
    setDetailModalMode("view");
    setDetailModalVisible(true);
  };

  const handleCloseDetailModal = (): void => {
    setDetailModalVisible(false);
    setViewingSpecialty(null);
    setDetailModalMode("view");
  };

  const handleDetailModalModeChange = (mode: "view" | "edit"): void => {
    setDetailModalMode(mode);
  };

  const handleOpenDeleteModal = (specialty: any): void => {
    setDeletingSpecialty(specialty);
    setDeleteModalVisible(true);
  };

  const handleCloseDeleteModal = (): void => {
    setDeleteModalVisible(false);
    setDeletingSpecialty(null);
  };

  const handleSubmit = async (values: SpecialtyFormSubmit): Promise<void> => {
    try {
      let finalImageUrl = values.imageURL;

      // BƯỚC 1: Upload ảnh lên cloud nếu có file mới
      if (values.imageFile) {
        try {
          // Upload file và lấy URL
          finalImageUrl = await uploadImageToCloud(values.imageFile);
        } catch (uploadError: any) {
          const errorMessage =
            uploadError?.response?.data?.message || "Upload ảnh thất bại!";
          notifyStatus(500, errorMessage);
          throw uploadError;
        }
      }

      const payload = {
        specialtyName: values.specialtyName,
        description: values.description,
        imageURL: finalImageUrl,
        displayOrder: values.displayOrder,
        isActive: values.isActive,
      };

      // CREATE mode only (for add modal)
      await dispatch(createSpecialtyAsync(payload)).unwrap();
      await dispatch(
        getSpecialtiesAsync({
          page: pagination.current,
          limit: pagination.pageSize,
        })
      ).unwrap();
      notifyStatus(201, "Tạo chuyên khoa thành công!");
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      throw error;
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!deletingSpecialty) return;

    try {
      await dispatch(deleteSpecialtyAsync(deletingSpecialty.id)).unwrap();
      handleCloseDeleteModal(); // Đóng modal sau khi xóa thành công
    } catch (error) {
      notifyStatus(200, "Xóa chuyên khoa không thành công!");
      // console.error("Error deleting specialty:", );
    }
  };

  const handleDetailSubmit = async (
    values: SpecialtyFormSubmit
  ): Promise<void> => {
    try {
      let finalImageUrl = values.imageURL;

      // BƯỚC 1: Upload ảnh lên cloud nếu có file mới
      if (values.imageFile) {
        try {
          // Upload file và lấy URL
          finalImageUrl = await uploadImageToCloud(values.imageFile);
        } catch (uploadError: any) {
          const errorMessage =
            uploadError?.response?.data?.message || "Upload ảnh thất bại!";
          notifyStatus(500, errorMessage);
          throw uploadError;
        }
      }

      const payload = {
        specialtyName: values.specialtyName,
        description: values.description,
        imageURL: finalImageUrl,
        displayOrder: values.displayOrder,
        isActive: values.isActive,
      };

      // UPDATE mode (for detail modal)
      if (viewingSpecialty) {
        await dispatch(
          updateSpecialtyAsync({
            id: viewingSpecialty.id,
            payload,
          })
        ).unwrap();
        notifyStatus(200, "Cập nhật chuyên khoa thành công!");
      }
    } catch (error: any) {
      console.error("Error in handleDetailSubmit:", error);
      throw error;
    }
  };

  const handleTableChange = (pagination: any): void => {
    setPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  // Table columns với useMemo để tránh tạo lại mỗi lần render
  const columns: ColumnsType<any> = useMemo(
    () => [
      {
        title: "STT",
        key: "index",
        width: 60,
        render: (_, __, index) =>
          (pagination.current - 1) * pagination.pageSize + index + 1,
      },
      {
        title: "Hình ảnh",
        dataIndex: "imageURL",
        key: "imageURL",
        width: 100,
        render: (imageURL: string) => (
          <img
            src={imageURL}
            alt="Specialty"
            style={{
              width: 50,
              height: 50,
              objectFit: "cover",
              borderRadius: 4,
            }}
          />
        ),
      },
      {
        title: "Tên chuyên khoa",
        dataIndex: "specialtyName",
        key: "specialtyName",
        sorter: true,
        render: (text: string) => (
          <Text strong style={{ fontSize: "14px" }}>
            {text}
          </Text>
        ),
      },
      {
        title: "Mô tả",
        dataIndex: "description",
        key: "description",
        ellipsis: {
          showTitle: false,
        },
        render: (text: string) => (
          <Tooltip placement="topLeft" title={text}>
            <Text>{text || "Chưa có mô tả"}</Text>
          </Tooltip>
        ),
      },
      {
        title: "Thứ tự",
        dataIndex: "displayOrder",
        key: "displayOrder",
        width: 80,
        sorter: true,
        render: (order: number) => <Tag color="blue">{order}</Tag>,
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
        onFilter: (value, record) => record.isActive === value,
        render: (isActive: boolean) => (
          <Tag color={isActive ? "green" : "red"}>
            {isActive ? "Hoạt động" : "Tạm dừng"}
          </Tag>
        ),
      },
      {
        title: "Ngày tạo",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 150,
        sorter: true,
        render: (date: string) => (
          <Text type="secondary">{dayjs(date).format("DD/MM/YYYY HH:mm")}</Text>
        ),
      },
      {
        title: "Thao tác",
        key: "actions",
        width: 150,
        render: (_, record: any) => (
          <Space size="small">
            <Tooltip title="Xem chi tiết">
              <Button
                type="primary"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewSpecialty(record)}
              />
            </Tooltip>

            <Tooltip title="Xóa">
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleOpenDeleteModal(record)}
                loading={deleteLoading && deletedId === record.id}
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [
      pagination.current,
      pagination.pageSize,
      deleteLoading,
      deletedId,
      handleViewSpecialty,
      handleOpenDeleteModal,
    ]
  );

  // Statistics với useMemo để tránh tính toán lại không cần thiết
  const statistics = useMemo(() => {
    const totalCount = listData?.totalCount || 0;
    const activeCount =
      listData?.items?.filter((item) => item.isActive).length || 0;
    const inactiveCount = totalCount - activeCount;
    return { totalCount, activeCount, inactiveCount };
  }, [listData]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Quản lý chuyên khoa
        </Title>
        <Text type="secondary">
          Quản lý danh sách các chuyên khoa trong hệ thống
        </Text>
      </div>

      {/* Main Content */}
      <div style={{ background: "#fff", padding: 24, borderRadius: 8 }}>
        {/* Toolbar */}
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenAddModal}
          >
            Thêm chuyên khoa
          </Button>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={listData?.items || []}
          rowKey="id"
          loading={listLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: statistics.totalCount,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} chuyên khoa`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
          size="middle"
        />
      </div>

      {/* Create Modal */}
      <SpecialtyModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialValues={editData}
        loading={createLoading}
      />

      {/* Detail/Edit Modal */}
      <SpecialtyDetailModal
        visible={detailModalVisible}
        onClose={handleCloseDetailModal}
        onSubmit={handleDetailSubmit}
        specialtyData={viewingSpecialty}
        loading={updateLoading}
        mode={detailModalMode}
        onModeChange={handleDetailModalModeChange}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        visible={deleteModalVisible}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDelete}
        itemName={deletingSpecialty?.specialtyName}
        loading={deleteLoading}
      />
    </div>
  );
};

export default SpecialtyPage;
