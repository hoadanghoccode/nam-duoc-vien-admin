import React, { useState, useEffect } from "react";
import { message } from "antd";
import TinyMCEEditor from "../../../components/TinyMCEEditor";
import { contentApi, PAGE_KEY_MAP, ContentPageResponse } from "../../../api/apiEndPoint";

const DongYIntroPage: React.FC = () => {
  const [contentData, setContentData] = useState<ContentPageResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await contentApi.getContentPage(PAGE_KEY_MAP.DONG_Y_INTRO);
      setContentData(response.data);
    } catch (error) {
      console.error('Lỗi khi tải nội dung:', error);
      message.error('Không thể tải nội dung trang');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (content: string, title: string) => {
    try {
      await contentApi.updateContentPage(PAGE_KEY_MAP.DONG_Y_INTRO, {
        pageTitle: title,
        contentHTML: content,
        isActive: true
      });
      message.success('Lưu nội dung thành công!');
      
      // Cập nhật lại dữ liệu local
      if (contentData) {
        setContentData({
          ...contentData,
          pageTitle: title,
          contentHTML: content
        });
      }
    } catch (error) {
      console.error('Lỗi khi lưu:', error);
      message.error('Có lỗi xảy ra khi lưu nội dung');
      throw error;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <div>Đang tải nội dung...</div>
      </div>
    );
  }

  return (
    <TinyMCEEditor
      pageKey={PAGE_KEY_MAP.DONG_Y_INTRO}
      pageTitle={contentData?.pageTitle || "Giới thiệu Đông Y"}
      initialContent={contentData?.contentHTML || ""}
      onSave={handleSave}
    />
  );
};

export default DongYIntroPage;