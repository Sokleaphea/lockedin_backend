const UTC7_OFFSET_MS = 7 * 60 * 60 * 1000;

export function startOfDayUTC7(date: Date) {
  const shifted = new Date(date.getTime() + UTC7_OFFSET_MS);
  return new Date(
    Date.UTC(
      shifted.getUTCFullYear(),
      shifted.getUTCMonth(),
      shifted.getUTCDate()
    ) - UTC7_OFFSET_MS
  );
}

export function yesterdayUTC7(date: Date) {
  const today = startOfDayUTC7(date);
  return new Date(today.getTime() - 24 * 60 * 60 * 1000);
}

export function isSameDayUTC7(a: Date, b: Date) {
  return startOfDayUTC7(a).getTime() === startOfDayUTC7(b).getTime();
}