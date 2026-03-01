export function startOfDayUTC7(date: Date) {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const utc7 = new Date(utc + 7 * 60 * 60000);
  return new Date(
    utc7.getFullYear(),
    utc7.getMonth(),
    utc7.getDate()
  );
}

export function yesterdayUTC7(date: Date) {
  const today = startOfDayUTC7(date);
  return new Date(today.getTime() - 24 * 60 * 60 * 1000);
}