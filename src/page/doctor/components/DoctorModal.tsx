import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Switch,
  Upload,
  Button,
  Row,
  Col,
  Typography,
  Divider,
  Spin,
  Card,
} from "antd";
import {
  UserOutlined,
  UploadOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../store/Store";
import { getAdminMedicalFacilitiesAsync } from "../../../store/facilities/adminMedicalFacilitySlice";
import { getAdminSpecialtiesByFacilityAsync } from "../../../store/facilities/adminSpecialtiesByFacilitySlice";
import { getAdminTimeSlotsAsync } from "../../../store/doctor/adminTimeSlotSlice";
import { getFullImageUrl } from "../../../helpers/upload";
import { DoctorFormData, TimeSlotSelection, DoctorTimeSlot } from "../types";
import WeeklyScheduleTable from "./WeeklyScheduleTable";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface DoctorModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: DoctorFormData) => Promise<void>;
  loading?: boolean;
  initialValues?: DoctorFormData | null;
  mode?: 'create' | 'view' | 'edit';
  onSwitchToEdit?: () => void;
}

const DoctorModal: React.FC<DoctorModalProps> = ({
  visible,
  onClose,
  onSubmit,
  loading = false,
  initialValues = null,
  mode = 'create',
  onSwitchToEdit,
}) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch<AppDispatch>();
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlotSelection[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showScheduleTable, setShowScheduleTable] = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("");
  const [currentSpecialtyIds, setCurrentSpecialtyIds] = useState<string[]>([]);

  // Redux states
  const { loading: facilitiesLoading, data: facilitiesData } = useSelector(
    (state: RootState) => state.adminMedicalFacility
  );
  const { loading: specialtiesLoading, items: specialtiesData } = useSelector(
    (state: RootState) => state.adminSpecialtiesByFacility
  );
  const { data: timeSlotsData } = useSelector(
    (state: RootState) => state.adminTimeSlot
  );
//   const { loading: timeSlotsLoading, data: timeSlotsData } = useSelector(
//     (state: RootState) => state.adminTimeSlot
//   );

  // Load facilities on mount
  useEffect(() => {
    if (visible) {
      console.log("Loading facilities and time slots...");
      dispatch(getAdminMedicalFacilitiesAsync({ page: 1, limit: 100 }));
      dispatch(getAdminTimeSlotsAsync(true));
    }
  }, [visible, dispatch]);

  // Load specialties when facility changes
  const handleFacilityChange = useCallback((facilityId: string) => {
    console.log("Facility changed:", facilityId);
    // Reset specialty selection when facility changes
    form.setFieldsValue({ specialtyIds: [] });
    setSelectedFacilityId(facilityId);
    
    if (facilityId) {
      console.log("Loading specialties for facility:", facilityId);
      dispatch(getAdminSpecialtiesByFacilityAsync({ facilityId, isActive: true }));
    } else {
      // Clear specialties when no facility is selected
      setSelectedFacilityId("");
    }
  }, [form, dispatch]);

  // Handle time slot selection change from WeeklyScheduleTable
  const handleTimeSlotSelectionChange = (selections: TimeSlotSelection[]) => {
    setSelectedTimeSlots(selections);
    // Trigger validation for timeSlots field
    form.validateFields(['timeSlots']).catch(() => {
      // Ignore validation errors, just trigger the validation
    });
  };

  // Handle image upload
  const handleImageUpload = (info: any) => {
    if (info.file) {
      setImageFile(info.file);
    }
  };

  // Convert time slot selections to doctor time slots
  const convertToDoctorTimeSlots = (selections: TimeSlotSelection[]): DoctorTimeSlot[] => {
    return selections.map(selection => ({
      timeSlotId: selection.timeSlotId,
      dayOfWeek: selection.dayOfWeek,
      isActive: true,
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const formData: DoctorFormData = {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : "",
        imageFile,
        timeSlots: selectedTimeSlots.length > 0 ? convertToDoctorTimeSlots(selectedTimeSlots) : [],
      };

      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  // Handle modal close
  const handleClose = () => {
    form.resetFields();
    setSelectedTimeSlots([]);
    setImageFile(null);
    setShowScheduleTable(false);
    setSelectedFacilityId("");
    setCurrentSpecialtyIds([]);
    onClose();
  };

  // Set initial values when modal opens
  useEffect(() => {
    console.log("DoctorModal useEffect triggered:", {
      visible,
      initialValues: !!initialValues,
      initialValuesData: initialValues
    });
    
    if (visible && initialValues) {
      console.log("Setting form values:", initialValues);
      
      // Set selected facility ID first
      if (initialValues.facilityId) {
        console.log("Setting facility ID:", initialValues.facilityId);
        setSelectedFacilityId(initialValues.facilityId);
        // Load specialties for the selected facility
        dispatch(getAdminSpecialtiesByFacilityAsync({ facilityId: initialValues.facilityId, isActive: true }));
      }
      
      // Set form values with proper formatting
      const formValues = {
        ...initialValues,
        dateOfBirth: initialValues.dateOfBirth ? dayjs(initialValues.dateOfBirth) : null,
      };
      
      console.log("Form values to set:", formValues);
      console.log("Setting specialtyIds in formValues:", initialValues.specialtyIds);
      
      // Set all form values including specialtyIds at once
      form.setFieldsValue(formValues);
      
      // Set current specialty IDs state
      if (initialValues.specialtyIds && initialValues.specialtyIds.length > 0) {
        setCurrentSpecialtyIds(initialValues.specialtyIds);
      }
      
      // Debug form values after setting
      setTimeout(() => {
        const currentValues = form.getFieldsValue();
        console.log("Form values after setting:", currentValues);
        console.log("Current specialtyIds:", currentValues.specialtyIds);
      }, 100);
      
      // Convert initial time slots to selections and show schedule table
      if (initialValues.timeSlots && initialValues.timeSlots.length > 0) {
        console.log("Setting time slots:", initialValues.timeSlots);
        const selections: TimeSlotSelection[] = initialValues.timeSlots.map(ts => ({
          timeSlotId: ts.timeSlotId,
          timeSlotText: "", // Will be filled by the table component
          dayOfWeek: ts.dayOfWeek,
          dayName: "", // Will be filled by the table component
        }));
        setSelectedTimeSlots(selections);
        setShowScheduleTable(true); // Auto show schedule table if there are time slots
      }
    } else if (visible && !initialValues) {
      console.log("Modal opened without initial values (create mode)");
      // Reset form for create mode
      form.resetFields();
      setSelectedFacilityId("");
      setSelectedTimeSlots([]);
      setShowScheduleTable(false);
    }
  }, [visible, initialValues, form, dispatch]);


  // Facility options
  const facilityOptions = facilitiesData?.items?.map((facility) => (
    <Option key={facility.id} value={facility.id}>
      {facility.facilityName} - {facility.city}
    </Option>
  ));

  // Debug facility options and form values
  useEffect(() => {
    console.log("Facility options debug:", {
      facilitiesLoading,
      facilitiesData,
      facilityOptions: facilityOptions?.length
    });
    
    // Debug current form values
    if (visible) {
      const currentValues = form.getFieldsValue();
      console.log("Current form values:", currentValues);
    }
  }, [facilitiesLoading, facilitiesData, facilityOptions, visible, form]);

  // Specialty options
  const specialtyOptions = specialtiesData?.map((specialty) => (
    <Option key={specialty.id} value={specialty.id}>
      {specialty.specialtyName}
    </Option>
  ));

  // Debug specialties data and set specialtyIds when specialties are loaded
  useEffect(() => {
    console.log("Specialties debug:", {
      specialtiesLoading,
      specialtiesData,
      specialtyOptions: specialtyOptions?.length,
      selectedFacilityId,
      initialValuesSpecialtyIds: initialValues?.specialtyIds
    });
    
    // Set specialtyIds when specialties data is loaded and form is ready
    if (visible && initialValues && !specialtiesLoading && specialtiesData && specialtiesData.length > 0) {
      if (initialValues.specialtyIds && initialValues.specialtyIds.length > 0) {
        console.log("Setting specialtyIds after specialties loaded:", initialValues.specialtyIds);
        console.log("Available specialty options:", specialtyOptions?.map(opt => ({ value: opt.props.value, children: opt.props.children })));
        
        // Use setTimeout to ensure form is ready
        setTimeout(() => {
          form.setFieldsValue({ specialtyIds: initialValues.specialtyIds });
          // Debug after setting
          const currentValues = form.getFieldsValue();
          console.log("Form values after setting specialtyIds:", currentValues);
        }, 200);
      }
    }
  }, [specialtiesLoading, specialtiesData, specialtyOptions, selectedFacilityId, visible, initialValues, form]);

  // Force set specialtyIds when modal opens (backup method)
  useEffect(() => {
    if (visible && initialValues && initialValues.specialtyIds && initialValues.specialtyIds.length > 0) {
      console.log("Force setting specialtyIds on modal open:", initialValues.specialtyIds);
      setTimeout(() => {
        form.setFieldsValue({ specialtyIds: initialValues.specialtyIds });
        // Debug after setting
        const currentValues = form.getFieldsValue();
        console.log("Form values after force setting specialtyIds:", currentValues);
      }, 500);
    }
  }, [visible, initialValues, form]);

  // Additional method: Set specialtyIds when specialties data is available
  useEffect(() => {
    if (visible && initialValues && initialValues.specialtyIds && initialValues.specialtyIds.length > 0) {
      if (specialtiesData && specialtiesData.length > 0 && !specialtiesLoading) {
        console.log("Setting specialtyIds when specialties data is ready:", initialValues.specialtyIds);
        form.setFieldsValue({ specialtyIds: initialValues.specialtyIds });
      }
    }
  }, [visible, initialValues, specialtiesData, specialtiesLoading, form]);

  // Helper functions for view mode
  const getDayName = (dayOfWeek: number): string => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[dayOfWeek] || '';
  };

  const getTimeSlotText = (timeSlotId: string): string => {
    // Try to find the time slot in timeSlotsData
    if (timeSlotsData && timeSlotsData.length > 0) {
      const timeSlot = timeSlotsData.find((ts: any) => ts.id === timeSlotId);
      if (timeSlot) {
        console.log(`Found timeSlot for ${timeSlotId}:`, timeSlot);
        return timeSlot.displayText || `${timeSlot.startTime} - ${timeSlot.endTime}`;
      }
    }
    console.log(`TimeSlot not found for ${timeSlotId}, using fallback`);
    // Fallback to ID if not found
    return timeSlotId;
  };

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          {mode === 'create' ? "Thêm bác sĩ mới" : 
           mode === 'view' ? "Xem chi tiết bác sĩ" : 
           "Cập nhật bác sĩ"}
        </Title>
      }
      open={visible}
      onCancel={handleClose}
      width={1400}
      footer={mode === 'view' ? [
        <Button key="cancel" onClick={handleClose}>
          Đóng
        </Button>,
        <Button key="edit" type="primary" onClick={onSwitchToEdit}>
          Chỉnh sửa
        </Button>,
      ] : [
        <Button key="cancel" onClick={handleClose}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {mode === 'create' ? "Tạo mới" : "Cập nhật"}
        </Button>,
      ]}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            gender: 1,
            isActive: true,
            examinationFee: 0,
            yearsOfExperience: 0,
          }}
          disabled={mode === 'view'}
        >
          {/* Basic Information */}
          <Title level={5}>
            <UserOutlined /> Thông tin cơ bản
          </Title>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Nhập email"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ" },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Nhập số điện thoại"
                />
              </Form.Item>
            </Col>
            {mode === 'create' && (
              <Col span={8}>
                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu" },
                    { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                  ]}
                >
                  <Input.Password placeholder="Nhập mật khẩu" />
                </Form.Item>
              </Col>
            )}
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="firstName"
                label="Tên"
                rules={[{ required: true, message: "Vui lòng nhập tên" }]}
              >
                <Input placeholder="Nhập tên" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="lastName"
                label="Họ"
                rules={[{ required: true, message: "Vui lòng nhập họ" }]}
              >
                <Input placeholder="Nhập họ" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="displayName"
                label="Tên hiển thị"
                rules={[{ required: true, message: "Vui lòng nhập tên hiển thị" }]}
              >
                <Input placeholder="Nhập tên hiển thị" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="dateOfBirth"
                label="Ngày sinh"
                rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày sinh"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
              >
                <Select placeholder="Chọn giới tính">
                  <Option value={1}>Nam</Option>
                  <Option value={2}>Nữ</Option>
                  <Option value={3}>Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="address"
                label="Địa chỉ"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
              >
                <Input
                  prefix={<EnvironmentOutlined />}
                  placeholder="Nhập địa chỉ"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Professional Information */}
          <Divider />
          <Title level={5}>
            <IdcardOutlined /> Thông tin chuyên môn
          </Title>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="facilityId"
                label="Cơ sở y tế"
                rules={[{ required: true, message: "Vui lòng chọn cơ sở y tế" }]}
              >
                <Select
                  placeholder="Chọn cơ sở y tế"
                  loading={facilitiesLoading}
                  onChange={handleFacilityChange}
                >
                  {facilityOptions}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="specialtyIds"
                label="Chuyên khoa"
                rules={[{ required: true, message: "Vui lòng chọn chuyên khoa" }]}
              >
                <Select
                  key={`specialty-select-${selectedFacilityId}-${specialtyOptions?.length || 0}`}
                  mode="multiple"
                  placeholder={selectedFacilityId ? "Chọn chuyên khoa" : "Vui lòng chọn cơ sở y tế trước"}
                  loading={specialtiesLoading}
                  disabled={!selectedFacilityId}
                  notFoundContent={specialtiesLoading ? "Đang tải..." : "Không có chuyên khoa nào"}
                  value={currentSpecialtyIds.length > 0 ? currentSpecialtyIds : (form.getFieldValue('specialtyIds') || initialValues?.specialtyIds || [])}
                  onChange={(value) => {
                    setCurrentSpecialtyIds(value);
                    form.setFieldsValue({ specialtyIds: value });
                  }}
                >
                  {specialtyOptions}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="doctorTitle"
                label="Chức danh"
                rules={[{ required: true, message: "Vui lòng chọn chức danh" }]}
              >
                <Select placeholder="Chọn chức danh">
                  <Select.Option value="Bác sĩ">Bác sĩ</Select.Option>
                  <Select.Option value="Tiến sĩ">Tiến sĩ</Select.Option>
                  <Select.Option value="Thạc sĩ">Thạc sĩ</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="examinationFee"
                label="Phí khám (VNĐ)"
                rules={[{ required: true, message: "Vui lòng nhập phí khám" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Nhập phí khám"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="yearsOfExperience"
                label="Số năm kinh nghiệm"
                rules={[{ required: true, message: "Vui lòng nhập số năm kinh nghiệm" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Nhập số năm kinh nghiệm"
                  min={0}
                  max={50}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="licenseNumber"
                label="Số giấy phép hành nghề"
                rules={[{ required: true, message: "Vui lòng nhập số giấy phép" }]}
              >
                <Input placeholder="Nhập số giấy phép hành nghề" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="bio"
                label="Tiểu sử"
                rules={[{ required: true, message: "Vui lòng nhập tiểu sử" }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Nhập tiểu sử bác sĩ"
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Image Upload */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Ảnh đại diện">
                {(mode === 'view' || mode === 'edit') && initialValues?.imageURL ? (
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={getFullImageUrl(initialValues.imageURL)}
                      alt="avatar"
                      style={{ 
                        width: 120, 
                        height: 120, 
                        objectFit: 'cover', 
                        borderRadius: 8,
                        border: '1px solid #d9d9d9'
                      }}
                    />
                    {mode === 'edit' && (
                      <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                        Click để thay đổi ảnh
                      </div>
                    )}
                  </div>
                ) : (
                  <Upload
                    name="avatar"
                    listType="picture-card"
                    showUploadList={false}
                    beforeUpload={() => false}
                    onChange={handleImageUpload}
                  >
                    {imageFile ? (
                      <img
                        src={URL.createObjectURL(imageFile)}
                        alt="avatar"
                        style={{ width: "100%" }}
                      />
                    ) : initialValues?.imageURL ? (
                      <img
                        src={getFullImageUrl(initialValues.imageURL)}
                        alt="avatar"
                        style={{ width: "100%" }}
                      />
                    ) : (
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>Tải lên ảnh</div>
                      </div>
                    )}
                  </Upload>
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isActive"
                label="Trạng thái hoạt động"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Hoạt động"
                  unCheckedChildren="Tạm dừng"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Time Slots Selection */}
          <Divider />
          <Title level={5}>Lịch làm việc</Title>
          <Text type="secondary">
            Chọn các khung giờ và ngày làm việc cho bác sĩ
          </Text>
          
          <Form.Item
            name="timeSlots"
            rules={[
              {
                validator: () => {
                  if (selectedTimeSlots.length === 0) {
                    return Promise.reject(new Error("Vui lòng chọn ít nhất một ca làm việc!"));
                  }
                  return Promise.resolve();
                },
              },
            ]}
            style={{ marginBottom: 0 }}
          >
            <div />
          </Form.Item>
          
          <div style={{ marginTop: 16 }}>
            {mode === 'view' ? (
              // View mode - show selected time slots like in edit mode
              initialValues?.timeSlots && initialValues.timeSlots.length > 0 ? (
                <div>
                  <Text strong>Đã chọn {initialValues.timeSlots.length} ca làm việc:</Text>
                  <div style={{ marginTop: 8 }}>
                    {initialValues.timeSlots.map((slot, index) => (
                      <Text key={index} style={{ marginRight: 8 }}>
                        {getTimeSlotText(slot.timeSlotId)} - {getDayName(slot.dayOfWeek)}
                      </Text>
                    ))}
                  </div>
                </div>
              ) : (
                <Text type="secondary">Chưa có lịch làm việc</Text>
              )
            ) : (
              // Create/Edit mode - always show interactive table
              <>
                <Button 
                  type="primary" 
                  onClick={() => setShowScheduleTable(!showScheduleTable)}
                  style={{ marginBottom: 16 }}
                >
                  {showScheduleTable ? "Ẩn" : "Hiển thị"} lịch làm việc
                </Button>
                
                {showScheduleTable && (
                  <Card style={{ marginBottom: 16 }}>
                    <WeeklyScheduleTable 
                      onSelectionChange={handleTimeSlotSelectionChange}
                      initialSelectedTimeSlots={initialValues?.timeSlots || []}
                    />
                  </Card>
                )}
                
                {selectedTimeSlots.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Text strong>Đã chọn {selectedTimeSlots.length} ca làm việc:</Text>
                    <div style={{ marginTop: 8 }}>
                      {selectedTimeSlots.map((slot, index) => (
                        <Text key={index} style={{ marginRight: 8 }}>
                          {slot.timeSlotText} - {slot.dayName}
                        </Text>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default DoctorModal;
