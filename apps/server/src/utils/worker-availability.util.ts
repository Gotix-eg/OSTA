const WORKER_TIMEZONE = "Africa/Cairo";

interface DaySchedule {
  day: string;
  enabled: boolean;
  is24Hours: boolean;
  startTime: string;
  endTime: string;
}

function toMinutes(time: string | undefined): number {
  const parts = (time || "0:0").split(":").map((n) => parseInt(n, 10) || 0);
  const h = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  return h * 60 + m;
}

/**
 * Combines the worker's "متاح للطلبات" (isAvailable) toggle with their weekly
 * schedule and vacation off-dates to decide if they should show as available
 * right now. isAvailable=false always wins regardless of the schedule.
 */
export function isWorkerAvailableNow(params: {
  isAvailable: boolean;
  workingHours?: unknown;
  offDates?: string[] | null;
  now?: Date;
}): boolean {
  const { isAvailable, workingHours, offDates, now = new Date() } = params;

  if (!isAvailable) return false;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: WORKER_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const dateStr = `${get("year")}-${get("month")}-${get("day")}`;
  const todayKey = get("weekday").toLowerCase().slice(0, 3);
  const currentMinutes = parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10);

  if (Array.isArray(offDates) && offDates.includes(dateStr)) return false;

  const schedule = Array.isArray(workingHours) ? (workingHours as DaySchedule[]) : [];
  const todaySchedule = schedule.find((d) => d?.day === todayKey);

  // No schedule configured for this worker yet: fall back to the toggle only.
  if (!todaySchedule) return true;
  if (!todaySchedule.enabled) return false;
  if (todaySchedule.is24Hours) return true;

  const start = toMinutes(todaySchedule.startTime);
  const end = toMinutes(todaySchedule.endTime);

  if (end <= start) {
    // Overnight range, e.g. 22:00 - 06:00
    return currentMinutes >= start || currentMinutes < end;
  }
  return currentMinutes >= start && currentMinutes < end;
}
