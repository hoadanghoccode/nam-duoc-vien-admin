import { DeleteOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Space, Table, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadImageToCloud } from "../../helpers/upload";
import { AppDispatch, RootState } from "../../store/Store";
import { deleteAdminMedicalFacilityAsync } from "../../store/facilities/adminMedicalFacilityDeleteSlice";
import { getAdminMedicalFacilitiesAsync } from "../../store/facilities/adminMedicalFacilitySlice";
import { updateAdminMedicalFacilityAsync } from "../../store/facilities/adminMedicalFacilityUpdateSlice";
import { createMedicalFacilityAsync } from "../../store/facilities/medicalFacilityCreateSlice";
import { notifyStatus } from "../../utils/toast-notifier";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { FacilityDetailModal } from "./components/FacilityDetailModal";
import { FacilityFormData, FacilityModal } from "./components/FacilityModal";

const { Title, Text } = Typography;

// Interface cho specialty option (không cần nữa vì đã tích hợp Redux)

const FacilityManagementPage = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux states
  const {
    loading: createLoading,
    error: createError,
    data: createData,
  } = useSelector((state: RootState) => state.medicalFacilityCreate);
  const {
    loading: updateLoading,
    error: updateError,
    success: updateSuccess,
    updatedFacility,
  } = useSelector((state: RootState) => state.adminMedicalFacilityUpdate);
  const {
    loading: deleteLoading,
    error: deleteError,
    success: deleteSuccess,
    deletedId,
  } = useSelector((state: RootState) => state.adminMedicalFacilityDelete);
  const {
    loading: listLoading,
    error: listError,
    data: listData,
  } = useSelector((state: RootState) => state.adminMedicalFacility);

  // Local states
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editData, setEditData] = useState<FacilityFormData | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [viewingFacilityId, setViewingFacilityId] = useState<string | null>(
    null
  );
  const [detailModalMode, setDetailModalMode] = useState<"view" | "edit">(
    "view"
  );
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [deletingFacility, setDeletingFacility] =
    useState<FacilityFormData | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // Load danh sách facilities với useCallback để tránh re-render
  const loadFacilities = useCallback(async () => {
    try {
      await dispatch(
        getAdminMedicalFacilitiesAsync({
          page: pagination.current,
          limit: pagination.pageSize,
        })
      ).unwrap();
    } catch (error) {
      console.error("Error loading facilities:", error);
    }
  }, [dispatch, pagination.current, pagination.pageSize]);

  // Load danh sách facilities khi pagination thay đổi
  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

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
      loadFacilities(); // Refresh danh sách
    }
  }, [createData, createLoading, loadFacilities]);

  // Xử lý khi update thành công
  useEffect(() => {
    if (updateSuccess && updatedFacility && !updateLoading) {
      setDetailModalVisible(false);
      setViewingFacilityId(null);
      loadFacilities(); // Refresh danh sách
    }
  }, [updateSuccess, updatedFacility, updateLoading, loadFacilities]);

  // Xử lý khi delete thành công
  useEffect(() => {
    if (deleteSuccess && deletedId && !deleteLoading) {
      notifyStatus(200, "Xóa cơ sở y tế thành công!");
      loadFacilities(); // Refresh danh sách
    }
  }, [deleteSuccess, deletedId, deleteLoading, loadFacilities]);

  const handleOpenAddModal = (): void => {
    setEditData(null);
    setModalVisible(true);
  };

  const handleCloseModal = (): void => {
    setModalVisible(false);
    setEditData(null);
  };

  const handleViewFacility = (facility: any): void => {
    setViewingFacilityId(facility.id);
    setDetailModalMode("view");
    setDetailModalVisible(true);
  };

  const handleCloseDetailModal = (): void => {
    setDetailModalVisible(false);
    setViewingFacilityId(null);
    setDetailModalMode("view");
  };

  const handleDetailModalModeChange = (mode: "view" | "edit"): void => {
    setDetailModalMode(mode);
  };

  const handleOpenDeleteModal = (facility: any): void => {
    setDeletingFacility(facility);
    setDeleteModalVisible(true);
  };

  const handleCloseDeleteModal = (): void => {
    setDeleteModalVisible(false);
    setDeletingFacility(null);
  };

  const handleDelete = async (): Promise<void> => {
    if (!deletingFacility) return;

    try {
      await dispatch(
        deleteAdminMedicalFacilityAsync(deletingFacility.id!)
      ).unwrap();
      handleCloseDeleteModal();
    } catch (error) {
      notifyStatus(500, "Xóa cơ sở y tế không thành công!");
    }
  };

  const handleDetailSubmit = async (
    values: FacilityFormData
  ): Promise<void> => {
    try {
      let finalImageUrl = values.imageURL;

      // BƯỚC 1: Upload ảnh lên cloud nếu có file mới
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

      const payload = {
        id: viewingFacilityId,
        facilityName: values.facilityName,
        address: values.address,
        city: values.city,
        district: values.district,
        ward: values.ward,
        phone: values.phone,
        email: values.email,
        website: values.website,
        description: values.description,
        imageURL: finalImageUrl,
        latitude: values.latitude,
        longitude: values.longitude,
        isActive: values.isActive,
        specialtyIds: values.specialtyIds,
      };

      // UPDATE mode (for detail modal)
      if (viewingFacilityId) {
        await dispatch(
          updateAdminMedicalFacilityAsync({
            id: viewingFacilityId,
            payload,
          })
        ).unwrap();
        notifyStatus(200, "Cập nhật cơ sở y tế thành công!");
      }
    } catch (error: any) {
      console.error("Error in handleDetailSubmit:", error);
      throw error;
    }
  };

  const handleSubmit = async (values: FacilityFormData): Promise<void> => {
    try {
      let finalImageUrl = values.imageURL;

      // BƯỚC 1: Upload ảnh lên cloud nếu có file mới
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

      const payload = {
        facilityName: values.facilityName,
        address: values.address,
        city: values.city,
        district: values.district,
        ward: values.ward,
        phone: values.phone,
        email: values.email,
        website: values.website,
        description: values.description,
        imageURL: finalImageUrl,
        latitude: values.latitude,
        longitude: values.longitude,
        isActive: values.isActive,
        specialtyIds: values.specialtyIds,
      };

      if (editData) {
        // UPDATE mode
        await dispatch(
          updateAdminMedicalFacilityAsync({
            id: editData.id || "",
            payload,
          })
        ).unwrap();

        notifyStatus(200, "Cập nhật cơ sở y tế thành công!");
      } else {
        // CREATE mode
        await dispatch(createMedicalFacilityAsync(payload)).unwrap();
        await dispatch(
          getAdminMedicalFacilitiesAsync({
            page: pagination.current,
            limit: pagination.pageSize,
          })
        ).unwrap();
        notifyStatus(201, "Tạo cơ sở y tế thành công!");
      }
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
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
            alt="Facility"
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
        title: "Tên cơ sở",
        dataIndex: "facilityName",
        key: "facilityName",
        sorter: true,
        render: (text: string) => (
          <Text strong style={{ fontSize: "14px" }}>
            {text}
          </Text>
        ),
      },
      {
        title: "Địa chỉ",
        dataIndex: "address",
        key: "address",
        ellipsis: {
          showTitle: false,
        },
        render: (text: string) => (
          <Tooltip placement="topLeft" title={text}>
            <Text>{text || "Chưa có địa chỉ"}</Text>
          </Tooltip>
        ),
      },
      {
        title: "Thành phố",
        dataIndex: "city",
        key: "city",
        width: 120,
        render: (text: string) => <Tag color="blue">{text}</Tag>,
      },
      {
        title: "Số điện thoại",
        dataIndex: "phone",
        key: "phone",
        width: 120,
        render: (text: string) => <Text>{text}</Text>,
      },
      {
        title: "Chuyên khoa",
        dataIndex: "specialties",
        key: "specialties",
        width: 150,
        render: (specialties: any[]) => (
          <div>
            {specialties?.slice(0, 2).map((spec, index) => (
              <Tag key={index} color="green" style={{ marginBottom: 2 }}>
                {spec.specialty?.specialtyName}
              </Tag>
            ))}
            {specialties?.length > 2 && (
              <Tag color="default">+{specialties.length - 2}</Tag>
            )}
          </div>
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
                onClick={() => handleViewFacility(record)}
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
      handleViewFacility,
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

  // Không cần specialtyOptions nữa vì đã tích hợp Redux

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Quản lý cơ sở y tế
        </Title>
        <Text type="secondary">
          Quản lý danh sách các cơ sở y tế trong hệ thống
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
            Thêm cơ sở y tế
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
              `${range[0]}-${range[1]} của ${total} cơ sở y tế`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </div>

      {/* <VietmapDirections
        initialStart={{ lat: 21.028511, lng: 105.804817, address: "Hà Nội" }}
        onRouteReady={(info) => console.log("Route:", info)}
      /> */}

      {/* Create Modal */}
      <FacilityModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialValues={editData}
        loading={createLoading}
      />

      {/* Detail/Edit Modal */}
      <FacilityDetailModal
        visible={detailModalVisible}
        onClose={handleCloseDetailModal}
        onSubmit={handleDetailSubmit}
        facilityId={viewingFacilityId}
        loading={updateLoading}
        mode={detailModalMode}
        onModeChange={handleDetailModalModeChange}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        visible={deleteModalVisible}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDelete}
        itemName={deletingFacility?.facilityName}
        loading={deleteLoading}
      />
    </div>
  );
};

export default FacilityManagementPage;
