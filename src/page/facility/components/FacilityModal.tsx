import React, { useEffect, useState } from "react";
import { Modal, Input, Select, Switch, Upload, Button, message } from "antd";
import { UploadOutlined, CloseCircleFilled } from "@ant-design/icons";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { VietmapSearch } from "../../../helpers/VietmapSearch";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../store/Store";
import { getSpecialtiesAsync } from "../../../store/specialty/specialtySlice";
import { getFullImageUrl } from "../../../utils/image-utils";
import "../style/FacilityModal.css";

const { TextArea } = Input;

// Interface cho form data
export interface FacilityFormData {
  id?: string;
  facilityName: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  imageURL: string;
  imageFile?: File;
  latitude: number;
  longitude: number;
  isActive: boolean;
  specialtyIds: string[];
}

// Interface cho specialty option
interface SpecialtyOption {
  value: string;
  label: string;
}

// Props cho Modal
interface FacilityModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: FacilityFormData) => Promise<void>;
  initialValues?: FacilityFormData | null;
  loading?: boolean;
}

// Validation Schema với Yup
const validationSchema = Yup.object().shape({
  facilityName: Yup.string()
    .required("Tên cơ sở y tế là bắt buộc")
    .min(3, "Tên phải có ít nhất 3 ký tự")
    .max(200, "Tên không được quá 200 ký tự"),

  address: Yup.string()
    .required("Địa chỉ là bắt buộc")
    .min(10, "Địa chỉ phải có ít nhất 10 ký tự"),

  city: Yup.string().required("Thành phố là bắt buộc"),

  district: Yup.string().required("Quận/Huyện là bắt buộc"),

  ward: Yup.string().required("Phường/Xã là bắt buộc"),

  phone: Yup.string()
    .required("Số điện thoại là bắt buộc")
    .matches(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ (10-11 số)"),

  email: Yup.string().required("Email là bắt buộc").email("Email không hợp lệ"),

  website: Yup.string().url("Website không hợp lệ").nullable(),

  description: Yup.string()
    .required("Mô tả là bắt buộc")
    .min(20, "Mô tả phải có ít nhất 20 ký tự")
    .max(1000, "Mô tả không được quá 1000 ký tự"),

  imageURL: Yup.string().required("Vui lòng chọn hình ảnh"),

  // imageFile: Yup.mixed().test(
  //   "file-required",
  //   "Vui lòng chọn hình ảnh",
  //   function (value) {
  //     const { imageURL } = this.parent;
  //     // Nếu có imageURL từ initialValues (edit mode) thì không cần imageFile
  //     if (imageURL && !imageURL.includes("blob:")) {
  //       return true;
  //     }
  //     // Nếu là tạo mới hoặc chọn ảnh mới thì cần imageFile
  //     return value instanceof File;
  //   }
  // ),

  latitude: Yup.number()
    // .required("Vĩ độ là bắt buộc")
    .min(-90, "Vĩ độ phải từ -90 đến 90")
    .max(90, "Vĩ độ phải từ -90 đến 90"),

  longitude: Yup.number()
    // .required("Kinh độ là bắt buộc")
    .min(-180, "Kinh độ phải từ -180 đến 180")
    .max(180, "Kinh độ phải từ -180 đến 180"),

  specialtyIds: Yup.array()
    .of(Yup.string())
    .min(1, "Vui lòng chọn ít nhất 1 chuyên khoa"),
  // .required("Chuyên khoa là bắt buộc"),

  isActive: Yup.boolean(),
});

// Default initial values
const defaultInitialValues: FacilityFormData = {
  id: "",
  facilityName: "",
  address: "",
  city: "",
  district: "",
  ward: "",
  phone: "",
  email: "",
  website: "",
  description: "",
  imageURL: "",
  // imageFile: undefined,
  latitude: 0,
  longitude: 0,
  isActive: true,
  specialtyIds: [],
};

export const FacilityModal: React.FC<FacilityModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialValues = null,
  loading = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [imagePreview, setImagePreview] = useState<string>("");

  // Redux state cho specialties
  const {
    loading: specialtiesLoading,
    error: specialtiesError,
    data: specialtiesData,
  } = useSelector((state: RootState) => state.specialty);

  // Gọi API specialties khi modal mở
  useEffect(() => {
    if (visible) {
      dispatch(getSpecialtiesAsync({ page: 1, limit: 100 }));
    }
  }, [visible, dispatch]);

  // Reset state khi modal đóng/mở
  useEffect(() => {
    if (visible && initialValues) {
      setImagePreview(getFullImageUrl(initialValues.imageURL));
    } else if (!visible) {
      setImagePreview("");
    }
  }, [visible, initialValues]);

  // Xử lý chọn file ảnh - giống như trong speciality
  const handleFileSelect = (file: File, setFieldValue: any) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ được chọn file ảnh!");
      return false;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Ảnh phải nhỏ hơn 2MB!");
      return false;
    }

    // Tạo preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Set cả imageFile và imageURL để validation hoạt động
    setFieldValue("imageFile", file);
    setFieldValue("imageURL", file.name);

    // Clear validation errors
    setFieldValue("imageFile", file, false);
    setFieldValue("imageURL", file.name, false);

    return false; // Prevent auto upload
  };

  // Xử lý xóa ảnh
  const handleRemoveImage = (setFieldValue: any) => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview("");
    setFieldValue("imageFile", null);
    setFieldValue("imageURL", "");

    // Clear validation errors
    setFieldValue("imageFile", null, false);
    setFieldValue("imageURL", "", false);
  };

  // Parse address function không cần thiết nữa vì không tự động điền địa chỉ

  // Xử lý khi chọn địa điểm từ VietmapSearch
  const handleLocationSelect = (
    location: { address: string; lat: number; lng: number },
    setFieldValue: any
  ) => {
    // Chỉ điền tọa độ, không tự động điền các trường địa chỉ
    setFieldValue("latitude", location.lat);
    setFieldValue("longitude", location.lng);
    
    // Không tự động điền địa chỉ, city, district, ward
    // Để người dùng tự nhập thông tin địa chỉ
  };

  // Tạo specialtyOptions từ Redux data
  const specialtyOptions: SpecialtyOption[] = specialtiesData?.items?.map(specialty => ({
    value: specialty.id,
    label: specialty.specialtyName
  })) || [];

  // Hiển thị loading nếu đang tải specialties
  if (specialtiesLoading) {
    return (
      <Modal
        title={initialValues ? "Chỉnh sửa cơ sở y tế" : "Thêm cơ sở y tế mới"}
        open={visible}
        onCancel={onClose}
        footer={null}
        width={900}
        destroyOnClose
        maskClosable={true}
      >
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <div>Đang tải danh sách chuyên khoa...</div>
        </div>
      </Modal>
    );
  }

  // Hiển thị lỗi nếu không tải được specialties
  if (specialtiesError) {
    return (
      <Modal
        title={initialValues ? "Chỉnh sửa cơ sở y tế" : "Thêm cơ sở y tế mới"}
        open={visible}
        onCancel={onClose}
        footer={null}
        width={900}
        destroyOnClose
        maskClosable={true}
      >
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <div style={{ color: "#ff4d4f" }}>Không thể tải danh sách chuyên khoa</div>
          <Button onClick={onClose} style={{ marginTop: 16 }}>Đóng</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={initialValues ? "Chỉnh sửa cơ sở y tế" : "Thêm cơ sở y tế mới"}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      destroyOnClose
      maskClosable={true}
    >
      <Formik
        initialValues={initialValues || defaultInitialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await onSubmit(values);
            onClose();
          } catch (error) {
            console.error("Submit error:", error);
          } finally {
            setSubmitting(false);
          }
        }}
        enableReinitialize
      >
        {({ values, setFieldValue, isSubmitting, touched, errors }) => (
          <Form className="facility-form">
            <div className="form-grid">
              {/* Tên cơ sở */}
              <div className="form-item full-width">
                <label className="form-label">
                  Tên cơ sở y tế <span className="required">*</span>
                </label>
                <Field name="facilityName">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      placeholder="Nhập tên cơ sở y tế"
                      size="large"
                      status={
                        touched.facilityName && errors.facilityName
                          ? "error"
                          : ""
                      }
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="facilityName"
                  component="div"
                  className="error-message"
                />
              </div>

              {/* Địa chỉ */}
              <div className="form-item full-width">
                <label className="form-label">
                  Địa chỉ <span className="required">*</span>
                </label>
                <Field name="address">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      placeholder="Số nhà, tên đường"
                      size="large"
                      status={touched.address && errors.address ? "error" : ""}
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="address"
                  component="div"
                  className="error-message"
                />
              </div>

              {/* Thành phố */}
              <div className="form-item">
                <label className="form-label">
                  Thành phố <span className="required">*</span>
                </label>
                <Field name="city">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      placeholder="Nhập thành phố"
                      size="large"
                      status={touched.city && errors.city ? "error" : ""}
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="city"
                  component="div"
                  className="error-message"
                />
              </div>

              {/* Quận/Huyện */}
              <div className="form-item">
                <label className="form-label">
                  Quận/Huyện <span className="required">*</span>
                </label>
                <Field name="district">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      placeholder="Nhập quận/huyện"
                      size="large"
                      status={
                        touched.district && errors.district ? "error" : ""
                      }
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="district"
                  component="div"
                  className="error-message"
                />
              </div>

              {/* Phường/Xã */}
              <div className="form-item">
                <label className="form-label">
                  Phường/Xã <span className="required">*</span>
                </label>
                <Field name="ward">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      placeholder="Nhập phường/xã"
                      size="large"
                      status={touched.ward && errors.ward ? "error" : ""}
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="ward"
                  component="div"
                  className="error-message"
                />
              </div>

              {/* Số điện thoại và Email */}
              <div className="form-item">
                <label className="form-label">
                  Số điện thoại <span className="required">*</span>
                </label>
                <Field name="phone">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      placeholder="0123456789"
                      size="large"
                      status={touched.phone && errors.phone ? "error" : ""}
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="phone"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="form-item">
                <label className="form-label">
                  Email <span className="required">*</span>
                </label>
                <Field name="email">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      type="email"
                      placeholder="example@hospital.com"
                      size="large"
                      status={touched.email && errors.email ? "error" : ""}
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="email"
                  component="div"
                  className="error-message"
                />
              </div>

              {/* Website */}
              <div className="form-item full-width">
                <label className="form-label">Website</label>
                <Field name="website">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      placeholder="https://example.com"
                      size="large"
                      status={touched.website && errors.website ? "error" : ""}
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="website"
                  component="div"
                  className="error-message"
                />
              </div>

              {/* Mô tả */}
              <div className="form-item full-width">
                <label className="form-label">
                  Mô tả <span className="required">*</span>
                </label>
                <Field name="description">
                  {({ field }: any) => (
                    <TextArea
                      {...field}
                      rows={4}
                      placeholder="Mô tả chi tiết về cơ sở y tế"
                      showCount
                      maxLength={1000}
                      status={
                        touched.description && errors.description ? "error" : ""
                      }
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="description"
                  component="div"
                  className="error-message"
                />
              </div>

              {/* Upload ảnh */}
              <div className="form-item full-width">
                <label className="form-label">
                  Hình ảnh <span className="required">*</span>
                </label>
                <Field name="imageURL">
                  {({ form }: any) => (
                    <Upload
                      accept="image/*"
                      showUploadList={false}
                      beforeUpload={(file) =>
                        handleFileSelect(file, form.setFieldValue)
                      }
                      maxCount={1}
                    >
                      {!imagePreview ? (
                        <Button icon={<UploadOutlined />} size="large" block>
                          Chọn ảnh
                        </Button>
                      ) : (
                        <div className="image-preview-container">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="image-preview"
                          />
                          <Button
                            type="text"
                            danger
                            icon={<CloseCircleFilled />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(form.setFieldValue);
                            }}
                            className="remove-image-btn"
                          >
                            Xóa ảnh
                          </Button>
                        </div>
                      )}
                    </Upload>
                  )}
                </Field>
                <ErrorMessage
                  name="imageURL"
                  component="div"
                  className="error-message"
                />
                <ErrorMessage
                  name="imageFile"
                  component="div"
                  className="error-message"
                />
              </div>

              {/* Chuyên khoa - Multiple Select */}
              <div className="form-item full-width">
                <label className="form-label">
                  Chuyên khoa <span className="required">*</span>
                </label>
                <Select
                  mode="multiple"
                  size="large"
                  placeholder="Chọn các chuyên khoa"
                  value={values.specialtyIds}
                  onChange={(value) => setFieldValue("specialtyIds", value)}
                  options={specialtyOptions}
                  style={{ width: "100%" }}
                  status={
                    touched.specialtyIds && errors.specialtyIds ? "error" : ""
                  }
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
                <ErrorMessage
                  name="specialtyIds"
                  component="div"
                  className="error-message"
                />
              </div>

              {/* Tọa độ */}
              {/* <div className="form-item">
                <label className="form-label">
                  Vĩ độ (Latitude) <span className="required">*</span>
                </label>
                <Field name="latitude">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      type="number"
                      step="0.000001"
                      placeholder="21.0376"
                      size="large"
                      onChange={(e) =>
                        setFieldValue(
                          "latitude",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      status={
                        touched.latitude && errors.latitude ? "error" : ""
                      }
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="latitude"
                  component="div"
                  className="error-message"
                />
              </div> */}

              {/* <div className="form-item">
                <label className="form-label">
                  Kinh độ (Longitude) <span className="required">*</span>
                </label>
                <Field name="longitude">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      type="number"
                      step="0.000001"
                      placeholder="105.8342"
                      size="large"
                      onChange={(e) =>
                        setFieldValue(
                          "longitude",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      status={
                        touched.longitude && errors.longitude ? "error" : ""
                      }
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="longitude"
                  component="div"
                  className="error-message"
                />
              </div> */}

              {/* Trạng thái */}
              <div className="form-item full-width">
                <label className="form-label">Trạng thái hoạt động</label>
                <div>
                  <Switch
                    checked={values.isActive}
                    onChange={(checked) => setFieldValue("isActive", checked)}
                    checkedChildren="Hoạt động"
                    unCheckedChildren="Tạm dừng"
                  />
                </div>
              </div>

              {/* Bản đồ để chọn vị trí */}
              <div className="form-item full-width">
                <label className="form-label">
                  Vị trí & Bản đồ <span className="required">*</span>
                </label>
                 <div style={{ marginBottom: 16 }}>
                   <p style={{ color: "#666", fontSize: 14, marginBottom: 8 }}>
                     Tìm kiếm địa điểm để chọn tọa độ chính xác. Thông tin địa chỉ phải nhập tay ở các trường phía trên.
                   </p>
                 </div>

                {/* Sử dụng VietmapSearch component có sẵn */}
                <div
                  style={{
                    height: 400,
                    border: "1px solid #d9d9d9",
                    borderRadius: 6,
                  }}
                >
                   <VietmapSearch
                     onLocationSelect={(location) =>
                       handleLocationSelect(location, setFieldValue)
                     }
                     initialLocation={{
                       lat: values.latitude || 0,
                       lng: values.longitude || 0,
                       address: values.address || "",
                     }}
                   />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="modal-footer">
              <Button
                size="large"
                onClick={onClose}
                disabled={isSubmitting || loading}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={isSubmitting || loading}
              >
                {initialValues ? "Cập nhật" : "Tạo mới"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};
