export const passwordRules = [
  {
    required: true,
    message: "Vui lòng nhập mật khẩu!",
  },
  {
    min: 8,
    message: "Mật khẩu phải có ít nhất 8 ký tự!",
  },
  {
    pattern: /[A-Z]/,
    message: "Mật khẩu phải có ít nhất một chữ hoa (A-Z)!",
  },
  {
    pattern: /[a-z]/,
    message: "Mật khẩu phải có ít nhất một chữ thường (a-z)!",
  },
  {
    pattern: /[!@#$%^&*(),.?":{}|<>]/,
    message: "Mật khẩu phải có ít nhất một ký tự đặc biệt (!@#$%^&*...)!",
  },
];

