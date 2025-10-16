import { EnvironmentOutlined } from "@ant-design/icons";
import { Button, Card, Input, Space, Typography, message } from "antd";
import React, { useState } from "react";

const { Text } = Typography;

interface ReverseGeocodeDemoProps {
  onLocationSelect?: (location: {
    address: string;
    lat: number;
    lng: number;
  }) => void;
}

export const ReverseGeocodeDemo: React.FC<ReverseGeocodeDemoProps> = ({
  onLocationSelect,
}) => {
  const [lat, setLat] = useState<string>("20.96472601");
  const [lng, setLng] = useState<string>("105.77091366");
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleReverseGeocode = async () => {
    if (!lat || !lng) {
      message.error("Vui lòng nhập tọa độ");
      return;
    }

    setLoading(true);
    try {
      const url = `/api/vietmap/reverse?lat=${lat}&lng=${lng}`;
      const res = await fetch(url);

      if (res.ok) {
        const data = await res.json();
        if (data.address) {
          setAddress(data.address);
          message.success("Tìm thấy địa chỉ!");

          // Gọi callback nếu có
          if (onLocationSelect) {
            onLocationSelect({
              address: data.address,
              lat: parseFloat(lat),
              lng: parseFloat(lng),
            });
          }
        } else {
          setAddress("Không tìm thấy địa chỉ");
          message.warning("Không tìm thấy địa chỉ cho tọa độ này");
        }
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      setAddress("Lỗi khi tìm địa chỉ");
      message.error("Lỗi khi tìm địa chỉ từ tọa độ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Reverse Geocoding Demo" style={{ margin: 16 }}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <div>
          <Text strong>Nhập tọa độ để tìm địa chỉ:</Text>
        </div>

        <Space>
          <Input
            placeholder="Latitude"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            style={{ width: 120 }}
          />
          <Input
            placeholder="Longitude"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            style={{ width: 120 }}
          />
          <Button
            type="primary"
            icon={<EnvironmentOutlined />}
            onClick={handleReverseGeocode}
            loading={loading}
          >
            Tìm địa chỉ
          </Button>
        </Space>

        {address && (
          <Card size="small" style={{ background: "#f5f5f5" }}>
            <Text strong>Kết quả:</Text>
            <br />
            <Text>{address}</Text>
          </Card>
        )}

        <div style={{ fontSize: 12, color: "#666" }}>
          <Text type="secondary">
            Demo: Sử dụng tọa độ từ facility để tìm địa chỉ chính xác
          </Text>
        </div>
      </Space>
    </Card>
  );
};
