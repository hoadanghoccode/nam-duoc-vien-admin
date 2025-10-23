import { CheckCircleOutlined, LockOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Form, Input, Space, Typography } from "antd";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/Store";
import {
  changePasswordAsync,
  resetChangePasswordState,
} from "../../../store/user/changePasswordSlice";
import { notifyStatus } from "../../../utils/toast-notifier";
import { passwordRules } from "../../../utils/password-validator";

const { Title, Text } = Typography;

export default function SecuritySettings() {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();

  const { loading, error, success } = useSelector(
    (state: RootState) => state.changePassword
  );

  useEffect(() => {
    if (success) {
      notifyStatus(200, "Đổi mật khẩu thành công!");
      form.resetFields();
      dispatch(resetChangePasswordState());
    }
  }, [success, form, dispatch]);

  const handleSubmit = async (values: any) => {
    try {
      await dispatch(
        changePasswordAsync({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
          confirmNewPassword: values.confirmNewPassword,
        })
      ).unwrap();
    } catch (err) {
      // Error handled by reducer
    }
  };

  return (
    <Card
      title={
        <Title level={4} style={{ margin: 0 }}>
          Bảo mật
        </Title>
      }
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
    >
      <div style={{ maxWidth: 600 }}>
        {/* Info Section */}
        <Alert
          message="Đổi mật khẩu"
          description={
            <div>
              <Text>Yêu cầu mật khẩu:</Text>
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                <li>Tối thiểu 8 ký tự</li>
                <li>Ít nhất một chữ hoa (A-Z)</li>
                <li>Ít nhất một chữ thường (a-z)</li>
                <li>Ít nhất một ký tự đặc biệt (!@#$%^&*...)</li>
              </ul>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Lưu ý: Bạn sẽ vẫn đăng nhập sau khi đổi mật khẩu.
              </Text>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        {/* Error Alert */}
        {error && (
          <Alert
            message="Đổi mật khẩu thất bại"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => dispatch(resetChangePasswordState())}
            style={{ marginBottom: 24 }}
          />
        )}

        {/* Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
        >
          {/* Current Password */}
          <Form.Item
            name="currentPassword"
            label="Mật khẩu hiện tại"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu hiện tại!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#1890ff" }} />}
              placeholder="Nhập mật khẩu hiện tại"
            />
          </Form.Item>

          {/* New Password */}
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={passwordRules}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#1890ff" }} />}
              placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự, chữ hoa, chữ thường, ký tự đặc biệt)"
            />
          </Form.Item>

          {/* Confirm New Password */}
          <Form.Item
            name="confirmNewPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={["newPassword"]}
            hasFeedback
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#1890ff" }} />}
              placeholder="Nhập lại mật khẩu mới"
            />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<CheckCircleOutlined />}
                style={{ minWidth: 160 }}
              >
                Đổi mật khẩu
              </Button>
              <Button onClick={() => form.resetFields()} disabled={loading}>
                Đặt lại
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </Card>
  );
}
