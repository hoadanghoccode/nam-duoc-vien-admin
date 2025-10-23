import {
  CameraOutlined,
  LoadingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Spin, Tooltip, Upload } from "antd";
import type { UploadChangeParam } from "antd/es/upload";
import type { RcFile, UploadFile } from "antd/es/upload/interface";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadImageForProfile } from "../../../helpers/upload";
import { AppDispatch, RootState } from "../../../store/Store";
import { getMyProfileAsync, updateAvatarAsync } from "../../../store/user/userProfileSlice";
import { setUserProfile } from "../../../store/authen/authSlice";
import { notifyStatus } from "../../../utils/toast-notifier";

interface AvatarUploadProps {
  imageUrl?: string | null;
  size?: number;
  style?: React.CSSProperties;
}

export default function AvatarUpload({
  imageUrl,
  size = 120,
  style,
}: AvatarUploadProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [uploading, setUploading] = useState(false);
  const { avatarUploadLoading } = useSelector(
    (state: RootState) => state.userProfile
  );

  // CSS để ẩn border của Upload component
  const uploadStyle = `
    .avatar-uploader .ant-upload {
      padding: 0 !important;
      border: none !important;
      background: transparent !important;
      border-radius: 50% !important;
    }
    .avatar-uploader .ant-upload:hover {
      border: none !important;
    }
  `;

  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      notifyStatus(400, "Bạn chỉ có thể tải lên file ảnh!");
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      notifyStatus(400, "Ảnh phải nhỏ hơn 5MB!");
      return false;
    }
    return true;
  };

  const handleUpload = async (file: RcFile) => {
    try {
      setUploading(true);

      // Upload ảnh lên server
      const fileUrl = await uploadImageForProfile(file);

      // Cập nhật avatar vào profile (chỉ gửi imageUrl)
      await dispatch(
        updateAvatarAsync(fileUrl)
      ).unwrap();

      notifyStatus(200, "Cập nhật avatar thành công!");
      
      // Gọi lại API để lấy thông tin user mới nhất (bao gồm avatar mới)
      dispatch(getMyProfileAsync()).then((result: any) => {
        if (result.payload) {
          // Cập nhật vào auth state để đồng bộ
          dispatch(setUserProfile(result.payload));
        }
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      notifyStatus(400, error?.message || "Cập nhật avatar thất bại!");
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.originFileObj) {
      handleUpload(info.file.originFileObj as RcFile);
    }
  };

  const isLoading = uploading || avatarUploadLoading;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <style>{uploadStyle}</style>
      <Tooltip
        title={isLoading ? "Đang tải ảnh lên..." : "Click để thay đổi avatar"}
        placement="top"
      >
        <Upload
          name="avatar"
          listType="picture-card"
          className="avatar-uploader"
          showUploadList={false}
          beforeUpload={beforeUpload}
          onChange={handleChange}
          customRequest={() => {}} // Prevent default upload
          disabled={isLoading}
          accept="image/*"
        >
          <div style={{ position: "relative" }}>
            <Avatar
              size={size}
              src={
                imageUrl
                  ? `https://namduocvien-api.id.vn/api/static-contents/${imageUrl}`
                  : undefined
              }
              icon={<UserOutlined />}
              style={{
                border: "5px solid white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                cursor: "pointer",
                ...style,
              }}
            />

            {/* Upload overlay */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: size * 0.3,
                height: size * 0.3,
                borderRadius: "50%",
                background: "#1890ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                border: "3px solid white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              {isLoading ? (
                <Spin
                  indicator={
                    <LoadingOutlined
                      style={{ fontSize: size * 0.15, color: "white" }}
                      spin
                    />
                  }
                />
              ) : (
                <CameraOutlined
                  style={{ fontSize: size * 0.15, color: "white" }}
                />
              )}
            </div>
          </div>
        </Upload>
      </Tooltip>
    </div>
  );
}
