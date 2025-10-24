/**
 * Day of Week utilities
 * Backend uses: Monday = 1, Tuesday = 2, ..., Saturday = 6, Sunday = 7
 */

export const DayOfWeek = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
} as const;

export type DayOfWeek = (typeof DayOfWeek)[keyof typeof DayOfWeek];

/**
 * Convert old format (0-6: Sunday=0) to new format (1-7: Monday=1, Sunday=7)
 * This is for backward compatibility with old data
 */
export const normalizeDayOfWeek = (dayOfWeek: number): number => {
  // If already in new format (1-7), return as is
  if (dayOfWeek >= 1 && dayOfWeek <= 7) {
    return dayOfWeek;
  }

  // Convert old format (0-6) to new format (1-7)
  // Old: 0=Sunday, 1=Monday, 2=Tuesday, ..., 6=Saturday
  // New: 1=Monday, 2=Tuesday, ..., 6=Saturday, 7=Sunday
  if (dayOfWeek === 0) {
    return 7; // Sunday: 0 -> 7
  }

  // For 1-6, they stay the same in both formats
  return dayOfWeek;
};

export const getDayName = (dayOfWeek: number): string => {
  const normalized = normalizeDayOfWeek(dayOfWeek);
  const days: { [key: number]: string } = {
    [DayOfWeek.Monday]: "Thứ 2",
    [DayOfWeek.Tuesday]: "Thứ 3",
    [DayOfWeek.Wednesday]: "Thứ 4",
    [DayOfWeek.Thursday]: "Thứ 5",
    [DayOfWeek.Friday]: "Thứ 6",
    [DayOfWeek.Saturday]: "Thứ 7",
    [DayOfWeek.Sunday]: "Chủ nhật",
  };
  return days[normalized] || "";
};

export const getDayShortName = (dayOfWeek: number): string => {
  const normalized = normalizeDayOfWeek(dayOfWeek);
  const days: { [key: number]: string } = {
    [DayOfWeek.Monday]: "T2",
    [DayOfWeek.Tuesday]: "T3",
    [DayOfWeek.Wednesday]: "T4",
    [DayOfWeek.Thursday]: "T5",
    [DayOfWeek.Friday]: "T6",
    [DayOfWeek.Saturday]: "T7",
    [DayOfWeek.Sunday]: "CN",
  };
  return days[normalized] || "";
};

export const getAllDays = () => [
  { value: DayOfWeek.Monday, label: "Thứ 2", shortLabel: "T2" },
  { value: DayOfWeek.Tuesday, label: "Thứ 3", shortLabel: "T3" },
  { value: DayOfWeek.Wednesday, label: "Thứ 4", shortLabel: "T4" },
  { value: DayOfWeek.Thursday, label: "Thứ 5", shortLabel: "T5" },
  { value: DayOfWeek.Friday, label: "Thứ 6", shortLabel: "T6" },
  { value: DayOfWeek.Saturday, label: "Thứ 7", shortLabel: "T7" },
  { value: DayOfWeek.Sunday, label: "Chủ nhật", shortLabel: "CN" },
];
