import { Button, message, Table } from "antd";
import { useState, useEffect, useCallback, useMemo } from "react";
import { createColumns, ShiftRow } from "./column";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../store/Store";
import { getAdminTimeSlotsAsync } from "../../../store/doctor/adminTimeSlotSlice";
import { DoctorTimeSlot, TimeSlotSelection } from "../types";


interface WeeklyScheduleTableProps {
  onSelectionChange?: (selections: TimeSlotSelection[]) => void;
  initialSelectedTimeSlots?: DoctorTimeSlot[];
}

const WeeklyScheduleTable: React.FC<WeeklyScheduleTableProps> = ({
  onSelectionChange,
  initialSelectedTimeSlots = [],
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading: timeSlotsLoading, data: timeSlotsData } = useSelector(
    (state: RootState) => state.adminTimeSlot
  );

  // Debug Redux state
  useEffect(() => {
    console.log("WeeklyScheduleTable Redux state:", {
      timeSlotsLoading,
      timeSlotsDataLength: timeSlotsData?.length,
      timeSlotsData: timeSlotsData,
    });
  }, [timeSlotsLoading, timeSlotsData]);

  const [selectedShifts, setSelectedShifts] = useState<ShiftRow[]>([]);

  // Load time slots on mount
  useEffect(() => {
    dispatch(getAdminTimeSlotsAsync(true));
  }, [dispatch]);

  // Initialize table data - memoized
  const initializeTableData = useCallback((): ShiftRow[] => {
    if (!timeSlotsData) return [];
    
    return timeSlotsData.map((slot) => ({
      key: slot.id,
      timeSlot: slot.displayText || `${slot.startTime} - ${slot.endTime}`,
      timeSlotId: slot.id,
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    }));
  }, [timeSlotsData]);

  // Helper function to convert dayOfWeek to day key
  const getDayKey = (dayOfWeek: number): keyof ShiftRow | null => {
    const dayMapping: { [key: number]: keyof ShiftRow } = {
      1: "monday",
      2: "tuesday",
      3: "wednesday",
      4: "thursday",
      5: "friday",
      6: "saturday",
      0: "sunday", // Sunday is 0
      7: "sunday", // Some systems use 7 for Sunday
    };
    return dayMapping[dayOfWeek] || null;
  };

  // Initialize selected shifts when timeSlotsData changes
  useEffect(() => {
    console.log("WeeklyScheduleTable useEffect triggered:", {
      timeSlotsData: timeSlotsData?.length,
      initialSelectedTimeSlots: initialSelectedTimeSlots.length,
      initialSelectedTimeSlotsData: initialSelectedTimeSlots,
    });

    if (timeSlotsData && selectedShifts.length === 0) {
      const initialized = initializeTableData();
      console.log("Initialized table data:", initialized);

      // Apply initial selected time slots if provided
      if (initialSelectedTimeSlots.length > 0) {
        console.log("Applying initial time slots:", initialSelectedTimeSlots);
        const updated = initialized.map((row) => {
          const newRow = { ...row };
          initialSelectedTimeSlots.forEach((ts) => {
            console.log(
              `Checking timeSlot: ${ts.timeSlotId} vs row: ${row.timeSlotId}`
            );
            if (ts.timeSlotId === row.timeSlotId) {
              const dayKey = getDayKey(ts.dayOfWeek);
              console.log(`Day of week: ${ts.dayOfWeek} -> dayKey: ${dayKey}`);
              if (dayKey) {
                console.log(`Setting ${dayKey} for timeSlot ${ts.timeSlotId}`);
                (newRow as any)[dayKey] = true;
              }
            }
          });
          return newRow;
        });
        console.log("Updated table data:", updated);
        setSelectedShifts(updated);
        // Notify parent about the initial selections
        notifySelectionChange(updated);
      } else {
        console.log("No initial time slots, setting initialized data");
        setSelectedShifts(initialized);
      }
    } else {
      console.log("No timeSlotsData available yet or already initialized");
    }
  }, [timeSlotsData, initialSelectedTimeSlots, selectedShifts.length]);

  // Get or initialize selected shifts
  const getTableData = (): ShiftRow[] => {
    return selectedShifts;
  };

  // Notify parent component of selection changes - memoized
  const notifySelectionChange = useCallback((data: ShiftRow[]) => {
    if (!onSelectionChange) return;

    const selections: TimeSlotSelection[] = [];
    const dayMapping = [
      { key: "sunday", name: "Chủ nhật", dayOfWeek: 0 },
      { key: "monday", name: "Thứ 2", dayOfWeek: 1 },
      { key: "tuesday", name: "Thứ 3", dayOfWeek: 2 },
      { key: "wednesday", name: "Thứ 4", dayOfWeek: 3 },
      { key: "thursday", name: "Thứ 5", dayOfWeek: 4 },
      { key: "friday", name: "Thứ 6", dayOfWeek: 5 },
      { key: "saturday", name: "Thứ 7", dayOfWeek: 6 },
    ];

    data.forEach((row) => {
      dayMapping.forEach((day) => {
        if (row[day.key as keyof ShiftRow]) {
          selections.push({
            timeSlotId: row.timeSlotId,
            timeSlotText: row.timeSlot,
            dayOfWeek: day.dayOfWeek,
            dayName: day.name,
          });
        }
      });
    });

    onSelectionChange(selections);
  }, [onSelectionChange]);

  // Handle checkbox change - memoized
  const handleCheckboxChange = useCallback((
    rowKey: string,
    dayKey: keyof ShiftRow,
    checked: boolean
  ) => {
    console.log("handleCheckboxChange called:", { rowKey, dayKey, checked });
    setSelectedShifts(prevShifts => {
      const newData = prevShifts.map((row) => {
        if (row.key === rowKey) {
          return { ...row, [dayKey]: checked };
        }
        return row;
      });
      console.log("Updated shifts:", newData);
      notifySelectionChange(newData);
      return newData;
    });
  }, [notifySelectionChange]);

  // Handle select all for a day - memoized
  const handleSelectAllDay = useCallback((dayKey: keyof ShiftRow) => {
    setSelectedShifts(prevShifts => {
      const allChecked = prevShifts.every((row) => row[dayKey]);
      const newData = prevShifts.map((row) => ({
        ...row,
        [dayKey]: !allChecked,
      }));
      notifySelectionChange(newData);
      return newData;
    });
  }, [notifySelectionChange]);

  // Handle select all for a time slot - memoized
  const handleSelectAllSlot = useCallback((rowKey: string) => {
    const dayKeys: (keyof ShiftRow)[] = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    setSelectedShifts(prevShifts => {
      const row = prevShifts.find((r) => r.key === rowKey);
      const allChecked = dayKeys.every((key) => row?.[key]);

      const newData = prevShifts.map((r) => {
        if (r.key === rowKey) {
          const updated = { ...r };
          dayKeys.forEach((key) => {
            (updated as any)[key] = !allChecked;
          });
          return updated;
        }
        return r;
      });
      notifySelectionChange(newData);
      return newData;
    });
  }, [notifySelectionChange]);

  // Submit selected shifts
  const handleSubmit = () => {
    const selected: any[] = [];

    selectedShifts.forEach((row) => {
      const dayKeys = [
        { key: "monday", name: "Thứ 2" },
        { key: "tuesday", name: "Thứ 3" },
        { key: "wednesday", name: "Thứ 4" },
        { key: "thursday", name: "Thứ 5" },
        { key: "friday", name: "Thứ 6" },
        { key: "saturday", name: "Thứ 7" },
        { key: "sunday", name: "Chủ nhật" },
      ];

      dayKeys.forEach((day) => {
        if (row[day.key as keyof ShiftRow]) {
          selected.push({
            timeSlotId: row.timeSlotId,
            timeSlot: row.timeSlot,
            dayOfWeek: day.name,
            dayKey: day.key,
          });
        }
      });
    });

    console.log("Selected shifts:", selected);
    message.success(`Đã chọn ${selected.length} ca làm việc`);

    // Call API here to save selected shifts
  };

  // Clear all selections - memoized
  const handleClear = useCallback(() => {
    const cleared = initializeTableData();
    setSelectedShifts(cleared);
    notifySelectionChange(cleared);
    message.info("Đã xóa tất cả lựa chọn");
  }, [initializeTableData, notifySelectionChange]);

  // Count selected shifts - memoized
  const countSelected = useMemo(() => {
    let count = 0;
    selectedShifts.forEach((row) => {
      const dayKeys: (keyof ShiftRow)[] = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];
      dayKeys.forEach((key) => {
        if (row[key]) count++;
      });
    });
    return count;
  }, [selectedShifts]);

  // Create columns with handlers - memoized
  const tableColumns = useMemo(() => {
    return createColumns({
      handleCheckboxChange,
      handleSelectAllDay,
      handleSelectAllSlot,
    });
  }, [handleCheckboxChange, handleSelectAllDay, handleSelectAllSlot]);

  return (
    <div>
      {/* Table */}
      <Table
        columns={tableColumns}
        dataSource={getTableData()}
        pagination={false}
        scroll={{ x: 900 }}
        bordered
        size="middle"
        loading={timeSlotsLoading}
      />

      {/* Action Buttons */}
      <div
        style={{
          marginTop: "16px",
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
        }}
      >
        <Button onClick={handleClear}>Xóa tất cả</Button>
        <Button
          type="primary"
          onClick={handleSubmit}
          disabled={countSelected === 0}
        >
          Xác nhận ({countSelected} ca)
        </Button>
      </div>
    </div>
  );
};

export default WeeklyScheduleTable;
