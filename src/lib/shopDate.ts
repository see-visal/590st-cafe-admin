/** Calendar dates match the API's Asia/Phnom_Penh reporting zone. */
export function shopDate(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Phnom_Penh", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(date);
}

export function trailingDates(lastDate: string, count: number): string[] {
  const end = new Date(`${lastDate}T12:00:00Z`);
  return Array.from({ length: count }, (_, index) => {
    const day = new Date(end);
    day.setUTCDate(end.getUTCDate() - (count - 1 - index));
    return day.toISOString().slice(0, 10);
  });
}
