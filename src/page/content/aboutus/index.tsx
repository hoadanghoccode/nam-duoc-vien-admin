import { message } from "antd";
import React, { useEffect, useState } from "react";
import {
  contentApi,
  ContentPageResponse,
  PAGE_KEY_MAP,
} from "../../../api/apiEndPoint";
import TinyMCEEditor from "../../../components/TinyMCEEditor";

const AboutUsPage: React.FC = () => {
  const [contentData, setContentData] = useState<ContentPageResponse | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await contentApi.getContentPage(PAGE_KEY_MAP.ABOUT_US);
      setContentData(response.data);
    } catch (error) {
      console.error("Lỗi khi tải nội dung:", error);
      message.error("Không thể tải nội dung trang");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (content: string, title: string) => {
    try {
      await contentApi.updateContentPage(PAGE_KEY_MAP.ABOUT_US, {
        pageTitle: title,
        contentHTML: content,
        isActive: true,
      });
      message.success("Lưu nội dung thành công!");

      // Cập nhật lại dữ liệu local
      if (contentData) {
        setContentData({
          ...contentData,
          pageTitle: title,
          contentHTML: content,
        });
      }
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      message.error("Có lỗi xảy ra khi lưu nội dung");
      throw error;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <div>Đang tải nội dung...</div>
      </div>
    );
  }

  return (
    <>
      <TinyMCEEditor
        pageKey={PAGE_KEY_MAP.ABOUT_US}
        pageTitle={contentData?.pageTitle || "Giới thiệu website"}
        initialContent={contentData?.contentHTML || ""}
        onSave={handleSave}
      />
    </>
  );
};

export default AboutUsPage;
