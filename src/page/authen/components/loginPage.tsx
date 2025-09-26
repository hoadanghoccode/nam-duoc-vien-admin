import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { Input, Button, Card, Typography, Space, Avatar, Alert } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { dispatch } from "../../../store/Store";
import { loginAsync } from "../../../store/authen/authSlice";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

// Validation schema với Yup
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
    .max(50, "Tên đăng nhập không được quá 50 ký tự")
    .required("Vui lòng nhập tên đăng nhập"),
  password: Yup.string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .required("Vui lòng nhập mật khẩu"),
});

const LoginPage = () => {
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  // Initial values
  const initialValues = {
    email: "",
    password: "",
  };

  // Submit handler
  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    setLoginError("");

    try {
      const result = await dispatch(loginAsync(values));

      // Kiểm tra nếu thành công
      if (result.payload?.status === 200) {
        navigate("/dashboard");
      } else {
        // Xử lý các trường hợp lỗi khác nhau
        handleApiError(result);
      }

      console.log("Dispatch result:", result);
    } catch (error) {
      // Xử lý lỗi không mong muốn
      console.error("Login error:", error);
      setLoginError("Có lỗi không mong muốn xảy ra, vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  // Hàm xử lý lỗi từ API
  const handleApiError = (result: any) => {
    const payload = result.payload;
    const status = payload?.status;
    const message = payload?.message;

    switch (status) {
      case 400:
        // Hiển thị message từ API (như "Account not exist")
        setLoginError(message || "Thông tin đăng nhập không chính xác");
        break;
      case 401:
        setLoginError("Tên đăng nhập hoặc mật khẩu không đúng");
        break;
      case 403:
        setLoginError("Tài khoản của bạn không có quyền truy cập");
        break;
      case 404:
        setLoginError("Không tìm thấy tài khoản");
        break;
      case 500:
        setLoginError("Lỗi máy chủ, vui lòng thử lại sau");
        break;
      default:
        // Nếu có message từ API thì hiển thị, không thì hiển thị message mặc định
        setLoginError(message || "Đăng nhập thất bại, vui lòng thử lại");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f2f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: "400px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
        bodyStyle={{ padding: "32px" }}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
          }) => (
            <>
              {/* Header */}
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <Avatar
                  size={48}
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: "#1890ff",
                    marginBottom: "16px",
                  }}
                />
                <Title level={3} style={{ marginBottom: "8px" }}>
                  Đăng nhập
                </Title>
                <Text type="secondary">
                  Vui lòng nhập thông tin để truy cập
                </Text>
              </div>

              {/* Login error alert */}
              {loginError && (
                <Alert
                  message={loginError}
                  type="error"
                  showIcon
                  closable
                  style={{ marginBottom: "16px" }}
                  onClose={() => setLoginError("")}
                />
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  {/* Email field */}
                  <div>
                    <Text strong>Tên đăng nhập</Text>
                    <Input
                      name="email"
                      size="large"
                      prefix={<UserOutlined style={{ color: "#1890ff" }} />}
                      placeholder="Nhập tên đăng nhập"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      status={errors.email && touched.email ? "error" : ""}
                      style={{ marginTop: "4px" }}
                    />
                    {errors.email && touched.email && (
                      <Text type="danger" style={{ fontSize: "12px" }}>
                        {errors.email}
                      </Text>
                    )}
                  </div>

                  {/* Password field */}
                  <div>
                    <Text strong>Mật khẩu</Text>
                    <Input.Password
                      name="password"
                      size="large"
                      prefix={<LockOutlined style={{ color: "#1890ff" }} />}
                      placeholder="Nhập mật khẩu"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      status={
                        errors.password && touched.password ? "error" : ""
                      }
                      style={{ marginTop: "4px" }}
                    />
                    {errors.password && touched.password && (
                      <Text type="danger" style={{ fontSize: "12px" }}>
                        {errors.password}
                      </Text>
                    )}
                  </div>

                  {/* Submit button */}
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={isSubmitting}
                    size="large"
                    style={{
                      height: "40px",
                      marginTop: "16px",
                    }}
                  >
                    {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                  </Button>

                  {/* Register link */}
                  <div style={{ textAlign: "center", marginTop: "16px" }}>
                    <Text>Chưa có tài khoản? </Text>
                    <Button type="link" style={{ padding: 0 }}>
                      Đăng ký ngay
                    </Button>
                  </div>
                </Space>
              </form>
            </>
          )}
        </Formik>
      </Card>
    </div>
  );
};

export default LoginPage;
