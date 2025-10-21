import { Button } from "antd";
import { ColumnsType } from "antd/es/table";

// Interface cho row data
export interface ShiftRow {
  key: string;
  timeSlot: string;
  timeSlotId: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

// Handler functions sẽ được inject từ parent component
interface ColumnHandlers {
  handleCheckboxChange: (rowKey: string, dayKey: keyof ShiftRow, checked: boolean) => void;
  handleSelectAllDay: (dayKey: keyof ShiftRow) => void;
  handleSelectAllSlot: (rowKey: string) => void;
}

export const createColumns = (handlers: ColumnHandlers): ColumnsType<ShiftRow> => [
  {
    title: <div style={{ fontWeight: 600, fontSize: "14px" }}>Khung giờ</div>,
    dataIndex: "timeSlot",
    key: "timeSlot",
    fixed: "left",
    width: 150,
    render: (text: string, record: ShiftRow) => (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: 600, color: "#1890ff" }}>{text}</span>
        <Button
          size="small"
          type="text"
          onClick={() => handlers.handleSelectAllSlot(record.key)}
          style={{ fontSize: "11px", padding: "0 4px" }}
        >
          Tất cả
        </Button>
      </div>
    ),
  },
  {
    title: (
      <div
        style={{ textAlign: "center", cursor: "pointer" }}
        onClick={() => handlers.handleSelectAllDay("monday")}
      >
        <div style={{ fontWeight: 600, fontSize: "14px" }}>Thứ 2</div>
        <div style={{ fontSize: "11px", color: "#8c8c8c", marginTop: "2px" }}>
          Click để chọn
        </div>
      </div>
    ),
    dataIndex: "monday",
    key: "monday",
    width: 100,
    align: "center",
    render: (checked: boolean, record: ShiftRow) => (
      <input
        type="checkbox"
        checked={!!checked}
        style={{
          width: '16px',
          height: '16px',
          cursor: 'pointer'
        }}
        onChange={(e) => {
          console.log("Monday checkbox clicked:", { record: record.key, checked: e.target.checked });
          handlers.handleCheckboxChange(record.key, "monday", e.target.checked);
        }}
      />
    ),
  },
  {
    title: (
      <div
        style={{ textAlign: "center", cursor: "pointer" }}
        onClick={() => handlers.handleSelectAllDay("tuesday")}
      >
        <div style={{ fontWeight: 600, fontSize: "14px" }}>Thứ 3</div>
        <div style={{ fontSize: "11px", color: "#8c8c8c", marginTop: "2px" }}>
          Click để chọn
        </div>
      </div>
    ),
    dataIndex: "tuesday",
    key: "tuesday",
    width: 100,
    align: "center",
    render: (checked: boolean, record: ShiftRow) => (
      <input
        type="checkbox"
        checked={!!checked}
        style={{
          width: '16px',
          height: '16px',
          cursor: 'pointer'
        }}
        onChange={(e) =>
          handlers.handleCheckboxChange(record.key, "tuesday", e.target.checked)
        }
      />
    ),
  },
  {
    title: (
      <div
        style={{ textAlign: "center", cursor: "pointer" }}
        onClick={() => handlers.handleSelectAllDay("wednesday")}
      >
        <div style={{ fontWeight: 600, fontSize: "14px" }}>Thứ 4</div>
        <div style={{ fontSize: "11px", color: "#8c8c8c", marginTop: "2px" }}>
          Click để chọn
        </div>
      </div>
    ),
    dataIndex: "wednesday",
    key: "wednesday",
    width: 100,
    align: "center",
    render: (checked: boolean, record: ShiftRow) => (
      <input
        type="checkbox"
        checked={!!checked}
        style={{
          width: '16px',
          height: '16px',
          cursor: 'pointer'
        }}
        onChange={(e) =>
          handlers.handleCheckboxChange(record.key, "wednesday", e.target.checked)
        }
      />
    ),
  },
  {
    title: (
      <div
        style={{ textAlign: "center", cursor: "pointer" }}
        onClick={() => handlers.handleSelectAllDay("thursday")}
      >
        <div style={{ fontWeight: 600, fontSize: "14px" }}>Thứ 5</div>
        <div style={{ fontSize: "11px", color: "#8c8c8c", marginTop: "2px" }}>
          Click để chọn
        </div>
      </div>
    ),
    dataIndex: "thursday",
    key: "thursday",
    width: 100,
    align: "center",
    render: (checked: boolean, record: ShiftRow) => (
      <input
        type="checkbox"
        checked={!!checked}
        style={{
          width: '16px',
          height: '16px',
          cursor: 'pointer'
        }}
        onChange={(e) =>
          handlers.handleCheckboxChange(record.key, "thursday", e.target.checked)
        }
      />
    ),
  },
  {
    title: (
      <div
        style={{ textAlign: "center", cursor: "pointer" }}
        onClick={() => handlers.handleSelectAllDay("friday")}
      >
        <div style={{ fontWeight: 600, fontSize: "14px" }}>Thứ 6</div>
        <div style={{ fontSize: "11px", color: "#8c8c8c", marginTop: "2px" }}>
          Click để chọn
        </div>
      </div>
    ),
    dataIndex: "friday",
    key: "friday",
    width: 100,
    align: "center",
    render: (checked: boolean, record: ShiftRow) => (
      <input
        type="checkbox"
        checked={!!checked}
        style={{
          width: '16px',
          height: '16px',
          cursor: 'pointer'
        }}
        onChange={(e) =>
          handlers.handleCheckboxChange(record.key, "friday", e.target.checked)
        }
      />
    ),
  },
  {
    title: (
      <div
        style={{ textAlign: "center", cursor: "pointer" }}
        onClick={() => handlers.handleSelectAllDay("saturday")}
      >
        <div style={{ fontWeight: 600, fontSize: "14px", color: "#ff4d4f" }}>
          Thứ 7
        </div>
        <div style={{ fontSize: "11px", color: "#8c8c8c", marginTop: "2px" }}>
          Click để chọn
        </div>
      </div>
    ),
    dataIndex: "saturday",
    key: "saturday",
    width: 100,
    align: "center",
    render: (checked: boolean, record: ShiftRow) => (
      <input
        type="checkbox"
        checked={!!checked}
        style={{
          width: '16px',
          height: '16px',
          cursor: 'pointer'
        }}
        onChange={(e) =>
          handlers.handleCheckboxChange(record.key, "saturday", e.target.checked)
        }
      />
    ),
  },
  {
    title: (
      <div
        style={{ textAlign: "center", cursor: "pointer" }}
        onClick={() => handlers.handleSelectAllDay("sunday")}
      >
        <div style={{ fontWeight: 600, fontSize: "14px", color: "#ff4d4f" }}>
          Chủ nhật
        </div>
        <div style={{ fontSize: "11px", color: "#8c8c8c", marginTop: "2px" }}>
          Click để chọn
        </div>
      </div>
    ),
    dataIndex: "sunday",
    key: "sunday",
    width: 100,
    align: "center",
    render: (checked: boolean, record: ShiftRow) => (
      <input
        type="checkbox"
        checked={!!checked}
        style={{
          width: '16px',
          height: '16px',
          cursor: 'pointer'
        }}
        onChange={(e) =>
          handlers.handleCheckboxChange(record.key, "sunday", e.target.checked)
        }
      />
    ),
  },
];
