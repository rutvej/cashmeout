export interface TimelineInfo {
  day: number;           // 1 to 3650
  year: number;          // 1 to 10
  month: number;         // 1 to 120
  monthInYear: number;   // 1 to 12
  dayInMonth: number;    // 1 to 30
  age: number;           // 22 to 32
  isSalaryDay: boolean;  // dayInMonth === 1
  isYearEnd: boolean;    // dayInMonth === 30 && monthInYear === 12
  isGameComplete: boolean;// day >= 3650
}

export function getTimelineInfo(currentDay: number, startingAge = 22): TimelineInfo {
  const safeDay = Math.max(1, Math.min(3650, currentDay));
  const month = Math.min(120, Math.floor((safeDay - 1) / 30) + 1);
  const dayInMonth = ((safeDay - 1) % 30) + 1;
  const year = Math.min(10, Math.floor((month - 1) / 12) + 1);
  const monthInYear = ((month - 1) % 12) + 1;
  const age = Math.min(startingAge + 10, startingAge + (year - 1));

  return {
    day: safeDay,
    year,
    month,
    monthInYear,
    dayInMonth,
    age,
    isSalaryDay: dayInMonth === 1,
    isYearEnd: dayInMonth === 30 && monthInYear === 12,
    isGameComplete: safeDay >= 3650
  };
}
