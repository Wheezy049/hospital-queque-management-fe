export function formatHeaderDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
  }).format(date);
}
