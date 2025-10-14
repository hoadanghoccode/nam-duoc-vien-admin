import React, { useRef, useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Button, Card, Spin, message } from "antd";
import { EditOutlined, SaveOutlined, EyeOutlined } from "@ant-design/icons";
import { contentApi } from "../api/apiEndPoint";

interface TinyMCEEditorProps {
  pageKey: number;
  pageTitle: string;
  initialContent?: string;
  onSave?: (content: string, title: string) => void;
}

const TinyMCEEditor: React.FC<TinyMCEEditorProps> = ({
  pageKey,
  pageTitle,
  initialContent = "",
  onSave,
}) => {
  const editorRef = useRef<any>(null);
  const [content, setContent] = useState<string>(initialContent);
  const [title, setTitle] = useState<string>(pageTitle);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [loading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    setContent(initialContent);
    setTitle(pageTitle);
  }, [initialContent, pageTitle]);

  const handleEditorChange = (content: string) => {
    setContent(content);
  };

  const handleSave = async () => {
    if (!editorRef.current) {
      message.error("Editor chưa sẵn sàng");
      return;
    }

    setSaving(true);
    try {
      const editorContent = editorRef.current.getContent();

      if (onSave) {
        await onSave(editorContent, title);
      } else {
        // Gọi API trực tiếp nếu không có callback
        await contentApi.updateContentPage(pageKey, {
          pageTitle: title,
          contentHTML: editorContent,
          isActive: true,
        });
        message.success("Lưu nội dung thành công!");
      }

      setIsEditMode(false);
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      message.error("Có lỗi xảy ra khi lưu nội dung");
    } finally {
      setSaving(false);
    }
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const renderEditor = () => {
    if (isEditMode) {
      return (
        <div>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{ fontWeight: "bold", marginBottom: 8, display: "block" }}
            >
              Tiêu đề:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d9d9d9",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "#fff",
                color: "#000",
              }}
              placeholder="Nhập tiêu đề..."
            />
          </div>

          <Editor
            onInit={(_evt, editor) => (editorRef.current = editor)}
            value={content}
            onEditorChange={handleEditorChange}
            apiKey="sez1k92ahe6l77ht472r1rqipix5wtjijt7a7440qw2cy8zs"
            init={{
              height: "calc(100vh - 400px)",
              min_height: 400,
              max_height: "calc(100vh - 200px)",
              menubar: true,
              plugins: [
                "advlist",
                "autolink",
                "lists",
                "link",
                "image",
                "charmap",
                "preview",
                "anchor",
                "searchreplace",
                "visualblocks",
                "code",
                "fullscreen",
                "insertdatetime",
                "media",
                "table",
                "help",
                "wordcount",
                "emoticons",
                "template",
                "codesample",
                "hr",
                "pagebreak",
                "nonbreaking",
                "toc",
                "imagetools",
                "textpattern",
                "noneditable",
                "quickbars",
                "accordion",
              ],
              toolbar:
                "undo redo | blocks fontfamily fontsize | " +
                "bold italic underline strikethrough | alignleft aligncenter " +
                "alignright alignjustify | outdent indent |  numlist bullist | " +
                "forecolor backcolor removeformat | pagebreak | charmap emoticons | " +
                "fullscreen preview save print | insertfile image media template link anchor codesample | " +
                "ltr rtl | showcomments addcomment",
              content_style:
                "body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px }",
              language: "vi",
              branding: false,
              promotion: false,
              // Enhanced features với API key
              image_advtab: true,
              image_caption: true,
              image_title: true,
              image_description: true,
              media_live_embeds: true,
              table_default_attributes: {
                border: "1",
              },
              table_default_styles: {
                "border-collapse": "collapse",
                width: "100%",
              },
              table_toolbar:
                "tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol",
              // Template support
              templates: [
                {
                  title: "Header Section",
                  description: "A simple header section",
                  content:
                    "<h1>Tiêu đề chính</h1><p>Mô tả ngắn gọn về nội dung...</p>",
                },
                {
                  title: "Two Column Layout",
                  description: "Layout hai cột",
                  content:
                    '<div style="display: flex; gap: 20px;"><div style="flex: 1;"><h3>Cột 1</h3><p>Nội dung cột 1...</p></div><div style="flex: 1;"><h3>Cột 2</h3><p>Nội dung cột 2...</p></div></div>',
                },
              ],
              // Quickbars
              quickbars_selection_toolbar:
                "bold italic | quicklink h2 h3 blockquote quickimage quicktable",
              quickbars_insert_toolbar: "quickimage quicktable",
              // Auto save
              autosave_ask_before_unload: true,
              autosave_interval: "30s",
              autosave_prefix: "{path}{query}-{id}-",
              autosave_retention: "2m",
              // Accessibility
              a11y_advanced_options: true,
              // Context menu
              contextmenu:
                "link image imagetools table spellchecker configurepermanentpen",
              // File picker
              file_picker_types: "image media",
              file_picker_callback: function (cb: any, _value: any, meta: any) {
                if (meta.filetype === "image") {
                  const input = document.createElement("input");
                  input.setAttribute("type", "file");
                  input.setAttribute("accept", "image/*");

                  input.onchange = function () {
                    const file = (this as any).files[0];
                    const reader = new FileReader();
                    reader.onload = function () {
                      cb(reader.result as string, {
                        alt: file.name,
                      });
                    };
                    reader.readAsDataURL(file);
                  };

                  input.click();
                }
              },
            }}
          />

          <div style={{ marginTop: 16, textAlign: "right" }}>
            <Button
              onClick={() => setIsEditMode(false)}
              style={{ marginRight: 8 }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saving}
            >
              Lưu
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ margin: 0, color: "#1890ff" }}>{title}</h2>
        </div>

        <div
          className="content-viewer"
          dangerouslySetInnerHTML={{
            __html: content || "<p>Chưa có nội dung</p>",
          }}
          style={{
            minHeight: 200,
            padding: 16,
            border: "1px solid #f0f0f0",
            borderRadius: 6,
            backgroundColor: "#fafafa",
          }}
        />

        <div style={{ marginTop: 16, textAlign: "right" }}>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={toggleEditMode}
          >
            Chỉnh sửa
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <EyeOutlined />
          {isEditMode ? "Chỉnh sửa nội dung" : "Xem nội dung"}
        </div>
      }
      style={{ marginBottom: 24 }}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: 50 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Đang tải...</div>
        </div>
      ) : (
        renderEditor()
      )}
    </Card>
  );
};

export default TinyMCEEditor;
