/**
 * Base URL cho API static content
 */
const API_BASE_URL = "https://namduocvien-api.id.vn/api/static-contents";

/**
 * Ghép đường dẫn ảnh với domain API
 * @param imagePath - Đường dẫn ảnh từ API (có thể là đường dẫn tương đối hoặc URL đầy đủ)
 * @returns URL đầy đủ của ảnh hoặc empty string nếu không có ảnh
 * 
 * @example
 * ```ts
 * // Trường hợp đường dẫn tương đối từ API
 * getFullImageUrl("images/a137053e-add6-4c8d-b600-e1242e2de7f5/101739v1emgan.png")
 * // => "https://namduocvien-api.id.vn/images/a137053e-add6-4c8d-b600-e1242e2de7f5/101739v1emgan.png"
 * 
 * // Trường hợp URL đầy đủ (từ cloud storage hoặc external)
 * getFullImageUrl("https://cloudinary.com/image.png")
 * // => "https://cloudinary.com/image.png"
 * 
 * // Trường hợp null hoặc undefined
 * getFullImageUrl(null)
 * // => ""
 * ```
 */
export const getFullImageUrl = (imagePath: string | null | undefined): string => {
  // Nếu không có đường dẫn, trả về empty string
  if (!imagePath) {
    return "";
  }

  // Nếu đã là URL đầy đủ (http hoặc https), trả về nguyên bản
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Nếu là đường dẫn tương đối, ghép với base URL
  // Xử lý trường hợp có hoặc không có "/" ở đầu
  const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  
  return `${API_BASE_URL}${normalizedPath}`;
};

/**
 * Ghép đường dẫn static content với domain API
 * @param contentPath - Đường dẫn content từ API
 * @returns URL đầy đủ
 * 
 * @example
 * ```ts
 * getStaticContentUrl("api/static-contents/image.png")
 * // => "https://namduocvien-api.id.vn/api/static-contents/image.png"
 * ```
 */
export const getStaticContentUrl = (contentPath: string | null | undefined): string => {
  return getFullImageUrl(contentPath);
};

/**
 * Lấy URL đầy đủ cho nhiều ảnh
 * @param imagePaths - Mảng các đường dẫn ảnh
 * @returns Mảng các URL đầy đủ
 * 
 * @example
 * ```ts
 * getFullImageUrls([
 *   "images/image1.png",
 *   "https://external.com/image2.png",
 *   null,
 *   "images/image3.png"
 * ])
 * // => [
 * //   "https://namduocvien-api.id.vn/images/image1.png",
 * //   "https://external.com/image2.png",
 * //   "",
 * //   "https://namduocvien-api.id.vn/images/image3.png"
 * // ]
 * ```
 */
export const getFullImageUrls = (
  imagePaths: (string | null | undefined)[]
): string[] => {
  return imagePaths.map(getFullImageUrl);
};

