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

    // Ghép với base URL để tạo đường dẫn đầy đủ
    const fullImageUrl = `https://nam-hoai-api.xyz/api/static-contents/${fileUrl}`;

    console.log("fullImageUrl", fullImageUrl);

    return fullImageUrl;
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

    // Map tất cả fileUrl thành full URL
    const fullUrls = response.data.map(
      (item: any) =>
        `https://nam-hoai-api.xyz/api/static-contents/${item.fileUrl}`
    );

    return fullUrls;
  } catch (error) {
    console.error("Lỗi khi upload nhiều ảnh:", error);
    throw error;
  }
};
