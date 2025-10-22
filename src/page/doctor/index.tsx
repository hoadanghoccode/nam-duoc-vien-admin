import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Card, Space, Table, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFullImageUrl, uploadImageToCloud } from "../../helpers/upload";
import { AppDispatch, RootState } from "../../store/Store";
import { createAdminDoctorAsync } from "../../store/doctor/adminDoctorCreateSlice";
import { deleteAdminDoctorAsync } from "../../store/doctor/adminDoctorDeleteSlice";
import {
  getAdminDoctorDetailAsync,
  clearDoctorDetail,
} from "../../store/doctor/adminDoctorDetailSlice";
import { updateAdminDoctorAsync } from "../../store/doctor/adminDoctorUpdateSlice";
import { getAdminDoctorsAsync } from "../../store/doctor/adminDoctorsSlice";
import { notifyStatus } from "../../utils/toast-notifier";
import DoctorModal from "./components/DoctorModal";
import { DoctorFormData } from "./types";

const { Title, Text } = Typography;

const DoctorManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux states
  const {
    loading: listLoading,
    error: listError,
    data: listData,
  } = useSelector((state: RootState) => state.adminDoctors);
  const {
    loading: createLoading,
    error: createError,
    result: createData,
  } = useSelector((state: RootState) => state.adminDoctorCreate);
  const {
    loading: updateLoading,
    error: updateError,
    result: updateData,
  } = useSelector((state: RootState) => state.adminDoctorUpdate);
  const {
    loading: deleteLoading,
    error: deleteError,
    success: deleteSuccess,
    deletedId,
  } = useSelector((state: RootState) => state.adminDoctorDelete);
  const { error: detailError, data: doctorDetail } = useSelector(
    (state: RootState) => state.adminDoctorDetail
  );

  // Local states
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editData, setEditData] = useState<DoctorFormData | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "view" | "edit">(
    "create"
  );
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // Load doctors list
  const loadDoctors = useCallback(
    async (page = pagination.current, limit = pagination.pageSize) => {
      try {
        await dispatch(
          getAdminDoctorsAsync({
            page,
            limit,
          })
        ).unwrap();
      } catch (error) {
        console.error("Error loading doctors:", error);
      }
    },
    [dispatch]
  );

  // Load doctors on mount and when pagination changes
  useEffect(() => {
    loadDoctors(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize, loadDoctors]);

  // Handle errors
  useEffect(() => {
    if (listError) notifyStatus(500, listError);
    if (createError) notifyStatus(500, createError);
    if (updateError) notifyStatus(500, updateError);
    if (deleteError) notifyStatus(500, deleteError);
    if (detailError) notifyStatus(500, detailError);
  }, [listError, createError, updateError, deleteError, detailError]);

  // Handle create success
  useEffect(() => {
    if (createData && !createLoading) {
      handleCloseModal();
      loadDoctors(pagination.current, pagination.pageSize);
      notifyStatus(201, "Tạo bác sĩ thành công!");
    }
  }, [
    createData,
    createLoading,
    loadDoctors,
    pagination.current,
    pagination.pageSize,
  ]);

  // Handle update success
  useEffect(() => {
    if (updateData && !updateLoading) {
      handleCloseModal();
      loadDoctors(pagination.current, pagination.pageSize);
      notifyStatus(200, "Cập nhật bác sĩ thành công!");
    }
  }, [
    updateData,
    updateLoading,
    loadDoctors,
    pagination.current,
    pagination.pageSize,
  ]);

  // Handle delete success
  useEffect(() => {
    if (deleteSuccess && !deleteLoading) {
      loadDoctors(pagination.current, pagination.pageSize);
      notifyStatus(200, "Xóa bác sĩ thành công!");
    }
  }, [
    deleteSuccess,
    deleteLoading,
    loadDoctors,
    pagination.current,
    pagination.pageSize,
  ]);

  // Modal handlers
  const handleOpenAddModal = () => {
    setEditData(null);
    setModalMode("create");
    setModalVisible(true);
  };

  const handleOpenViewModal = async (doctor: any) => {
    try {
      // Clear previous doctor detail data to avoid cache issues
      dispatch(clearDoctorDetail());

      const result = await dispatch(
        getAdminDoctorDetailAsync(doctor.id)
      ).unwrap();

      // Use data from API response directly instead of state
      const doctorDetailData = result || doctorDetail;

      // Debug doctor detail data
      console.log("Doctor detail data from API:", doctorDetailData);
      console.log("Doctor detail timeSlots:", doctorDetailData?.timeSlots);
      console.log("Doctor detail specialties:", doctorDetailData?.specialties);
      console.log(
        "First specialty object:",
        doctorDetailData?.specialties?.[0]
      );
      console.log(
        "All specialty objects:",
        doctorDetailData?.specialties?.map((s, index) => ({ index, object: s }))
      );

      // Convert doctor detail to form data
      const formData: DoctorFormData = {
        email: doctorDetailData?.email || "",
        phoneNumber: doctorDetailData?.phoneNumber || "",
        password: "",
        displayName: doctorDetailData?.displayName || "",
        firstName: doctorDetailData?.firstName || "",
        lastName: doctorDetailData?.lastName || "",
        dateOfBirth: doctorDetailData?.dateOfBirth || "",
        gender: Number(doctorDetailData?.gender) || 1,
        address: doctorDetailData?.address || "",
        imageURL: doctorDetailData?.imageUrl || "",
        facilityId: doctorDetailData?.facilityId || "",
        doctorTitle: doctorDetailData?.doctorTitle || "",
        bio: doctorDetailData?.bio || "",
        examinationFee: Number(doctorDetailData?.examinationFee) || 0,
        yearsOfExperience: Number(doctorDetailData?.yearsOfExperience) || 0,
        licenseNumber: doctorDetailData?.licenseNumber || "",
        isActive: doctorDetailData?.isActive || true,
        specialtyIds:
          doctorDetailData?.specialties
            ?.filter((s: any) => s && Object.keys(s).length > 0) // Filter out empty objects
            ?.map((s: any) => s.specialty?.id || s.specialtyId || s.id) || [],
        timeSlots:
          doctorDetailData?.timeSlots?.map((ts: any) => ({
            timeSlotId: ts.timeSlot?.id || ts.timeSlotId,
            dayOfWeek: ts.dayOfWeek,
            isActive: ts.isActive,
          })) || [],
      };

      // Debug form data timeSlots
      console.log("Form data timeSlots:", formData.timeSlots);
      console.log("Form data specialtyIds:", formData.specialtyIds);

      // Debug specialty mapping process
      const filteredSpecialties = doctorDetailData?.specialties?.filter(
        (s: any) => s && Object.keys(s).length > 0
      );
      console.log("Filtered specialties:", filteredSpecialties);
      const mappedSpecialtyIds = filteredSpecialties?.map(
        (s: any) => s.specialty?.id || s.specialtyId || s.id
      );
      console.log("Mapped specialty IDs:", mappedSpecialtyIds);

      setEditData(formData);
      setModalMode("view");
      setModalVisible(true);
    } catch (error) {
      notifyStatus(500, "Không thể tải thông tin bác sĩ!");
    }
  };

  const handleSwitchToEditMode = () => {
    setModalMode("edit");
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditData(null);
    setModalMode("create");
  };

  // Handle delete
  const handleDelete = async (doctor: any) => {
    try {
      await dispatch(deleteAdminDoctorAsync(doctor.id)).unwrap();
    } catch (error) {
      // Error notification is handled by useEffect
      console.error("Delete doctor error:", error);
    }
  };

  // Handle form submission
  const handleSubmit = async (values: DoctorFormData) => {
    try {
      let finalImageUrl = values.imageURL;

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

      if (editData) {
        // Update mode - convert to UpdateAdminDoctorPayload format
        const updatePayload = {
          id: doctorDetail?.id || "",
          email: values.email,
          phoneNumber: values.phoneNumber,
          displayName: values.displayName,
          firstName: values.firstName,
          lastName: values.lastName,
          dateOfBirth: values.dateOfBirth,
          gender: values.gender,
          address: values.address,
          imageUrl: finalImageUrl,
          facilityId: values.facilityId,
          doctorTitle: values.doctorTitle,
          bio: values.bio,
          examinationFee: values.examinationFee,
          yearsOfExperience: values.yearsOfExperience,
          licenseNumber: values.licenseNumber,
          isActive: values.isActive,
          specialties: values.specialtyIds.map((id) => ({ specialtyId: id })),
          timeSlots: values.timeSlots,
        };

        await dispatch(updateAdminDoctorAsync(updatePayload)).unwrap();
        await dispatch(
          getAdminDoctorsAsync({
            page: pagination.current,
            limit: pagination.pageSize,
          })
        ).unwrap();
      } else {
        // Create mode - convert to CreateAdminDoctorPayload format
        const createPayload = {
          email: values.email,
          phoneNumber: values.phoneNumber,
          password: values.password,
          displayName: values.displayName,
          firstName: values.firstName,
          lastName: values.lastName,
          dateOfBirth: values.dateOfBirth,
          gender: values.gender,
          address: values.address,
          imageUrl: finalImageUrl,
          facilityId: values.facilityId,
          doctorTitle: values.doctorTitle,
          bio: values.bio,
          examinationFee: values.examinationFee,
          yearsOfExperience: values.yearsOfExperience,
          licenseNumber: values.licenseNumber,
          isActive: values.isActive,
          specialtyIds: values.specialtyIds,
          timeSlots: values.timeSlots,
        };

        await dispatch(createAdminDoctorAsync(createPayload)).unwrap();
        await dispatch(
          getAdminDoctorsAsync({
            page: pagination.current,
            limit: pagination.pageSize,
          })
        ).unwrap();
      }
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      throw error;
    }
  };

  // Handle table change
  const handleTableChange = (pagination: any) => {
    setPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  // Table columns
  const columns: ColumnsType<any> = [
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
        <>
          {console.log("Doctor image URL:", getFullImageUrl(imageURL))}
          <img
            src={imageURL}
            alt="Doctor"
            style={{
              width: 50,
              height: 50,
              objectFit: "cover",
              borderRadius: 4,
            }}
          />
        </>
      ),
    },
    {
      title: "Thông tin bác sĩ",
      key: "doctorInfo",
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: "14px" }}>
            {record.displayName}
          </Text>
          <br />
          <Text type="secondary">{record.doctorTitle}</Text>
          <br />
          <Text type="secondary">{record.email}</Text>
        </div>
      ),
    },
    {
      title: "Cơ sở y tế",
      dataIndex: "facility",
      key: "facilityName",
      render: (_, record) => <Text>{record?.facilityName}</Text>,
    },
    {
      title: "Chuyên khoa",
      dataIndex: "specialties",
      key: "specialties",
      width: 150,
      render: (specialties: any[]) => (
        <div>
          {specialties?.slice(0, 2).map((spec, index) => (
            <Tag key={index} color="blue" style={{ marginBottom: 2 }}>
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
      title: "Phí khám",
      dataIndex: "examinationFee",
      key: "examinationFee",
      width: 120,
      render: (fee: number) => (
        <Text strong style={{ color: "#52c41a" }}>
          {fee?.toLocaleString()} VNĐ
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
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
              onClick={() => handleOpenViewModal(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenViewModal(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              loading={deleteLoading && deletedId === record.id}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Statistics
  const statistics = {
    totalCount: listData?.totalCount || 0,
    activeCount:
      listData?.items?.filter((item: any) => item.isActive).length || 0,
    inactiveCount:
      (listData?.totalCount || 0) -
      (listData?.items?.filter((item: any) => item.isActive).length || 0),
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Quản lý bác sĩ
        </Title>
        <Text type="secondary">
          Quản lý danh sách các bác sĩ trong hệ thống
        </Text>
      </div>

      {/* Main Content */}
      <Card>
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
            Thêm bác sĩ
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
              `${range[0]}-${range[1]} của ${total} bác sĩ`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>

      {/* Doctor Modal */}
      <DoctorModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        loading={createLoading || updateLoading}
        initialValues={editData}
        mode={modalMode}
        onSwitchToEdit={handleSwitchToEditMode}
      />
    </div>
  );
};

export default DoctorManagementPage;
