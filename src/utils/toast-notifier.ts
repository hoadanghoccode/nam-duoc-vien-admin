// ToastNotifier.js
import { toast } from 'react-toastify';

// Hàm này nhận vào status code và message
export function notifyStatus(status: number, message: string) {
  if (status === 200 || status === 201) {
    toast.success(message || 'Thành công!');
  } else {
    toast.error(message || 'Có lỗi xảy ra!');
  }
}
