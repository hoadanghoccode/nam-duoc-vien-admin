import authorizedAxiosInstance from "../services/Axios";

export const uploadImageToCloud = async (file: any) => {
  try {
    // Tạo FormData để gửi file
    const formData = new FormData();
    formData.append("Files", file);

    // Gọi API upload với authorizedAxiosInstance
    const response = await authorizedAxiosInstance.post(
      "/File/UploadFiles",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Lấy fileUrl từ response (item đầu tiên trong array)
    const fileUrl = response.data[0]?.fileUrl;

    if (!fileUrl) {
      throw new Error("Không nhận được fileUrl từ server");
    }

    console.log("Uploaded fileUrl:", fileUrl);

    // Trả về fileUrl gốc từ server (không ghép domain)
    return fileUrl;
  } catch (error) {
    console.error("Lỗi khi upload ảnh:", error);
    throw error;
  }
};

export const uploadMultipleImages = async (files: any[]) => {
  try {
    const formData = new FormData();

    // Thêm tất cả files vào FormData với key 'Files'
    files.forEach((file) => {
      formData.append("Files", file);
    });

    const response = await authorizedAxiosInstance.post(
      "/File/UploadFiles",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Trả về array các fileUrl gốc từ server (không ghép domain)
    const fileUrls = response.data.map((item: any) => item.fileUrl);

    console.log("Uploaded fileUrls:", fileUrls);

    return fileUrls;
  } catch (error) {
    console.error("Lỗi khi upload nhiều ảnh:", error);
    throw error;
  }
};

// Helper function để tạo full URL khi hiển thị
export const getFullImageUrl = (fileUrl: string) => {
  if (!fileUrl) return "";

  // Nếu đã có domain rồi thì return luôn
  if (fileUrl.startsWith("http")) {
    return fileUrl;
  }

  // Ghép với base URL để tạo đường dẫn đầy đủ
  return `https://namduocvien-api.id.vn/api/static-contents/${fileUrl}`;
};
