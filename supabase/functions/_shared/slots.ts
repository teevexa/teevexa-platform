// Consultation slot logic, shared by the booking page and the book-consultation edge function.
// Slots are defined in Nairobi time (EAT, UTC+3, no DST) and converted for the visitor,
// so a slot means the same instant for everyone and can't be double-booked across time zones.
// Pure TypeScript (Intl only).

export const SLOT_TIMES = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00",
];

export const EAT_OFFSET_HOURS = 3;
export const MIN_LEAD_HOURS = 4;
export const MAX_DAYS_AHEAD = 60;

export interface Slot {
  eatDate: string; // yyyy-MM-dd in Nairobi
  eatTime: string; // HH:mm in Nairobi
  start: Date; // exact instant
  localDate: string; // yyyy-MM-dd in the visitor's zone
  localTime: string; // HH:mm in the visitor's zone
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Exact instant for a Nairobi wall-clock date + time. */
export function slotInstant(eatDate: string, eatTime: string): Date {
  const [y, m, d] = eatDate.split("-").map(Number);
  const [hh, mm] = eatTime.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh - EAT_OFFSET_HOURS, mm));
}

/** Nairobi wall-clock parts for an instant. */
export function eatParts(instant: Date): { date: string; time: string; weekday: number } {
  const shifted = new Date(instant.getTime() + EAT_OFFSET_HOURS * 3600_000);
  return {
    date: `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`,
    time: `${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}`,
    weekday: shifted.getUTCDay(), // 0 = Sunday
  };
}

const fmtCache = new Map<string, Intl.DateTimeFormat>();
function formatter(tz: string): Intl.DateTimeFormat {
  let f = fmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    });
    fmtCache.set(tz, f);
  }
  return f;
}

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Wall-clock parts of an instant in any IANA zone. */
export function zonedParts(instant: Date, tz: string): { date: string; time: string } {
  const p: Record<string, string> = {};
  for (const part of formatter(tz).formatToParts(instant)) p[part.type] = part.value;
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

const addDays = (date: string, n: number): string => {
  const [y, m, d] = date.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
};

/** Is this instant a bookable slot (Mon–Fri, on the grid, within the lead/lookahead window)? */
export function isBookableInstant(instant: Date, now: Date = new Date()): boolean {
  if (Number.isNaN(instant.getTime())) return false;
  const { time, weekday } = eatParts(instant);
  if (weekday < 1 || weekday > 5) return false;
  if (!SLOT_TIMES.includes(time)) return false;
  if (instant.getTime() < now.getTime() + MIN_LEAD_HOURS * 3600_000) return false;
  if (instant.getTime() > now.getTime() + MAX_DAYS_AHEAD * 86400_000) return false;
  return true;
}

/** All bookable slots that fall on `localDate` in the visitor's time zone, earliest first. */
export function slotsForLocalDate(localDate: string, tz: string, now: Date = new Date()): Slot[] {
  const out: Slot[] = [];
  for (const eatDate of [addDays(localDate, -1), localDate, addDays(localDate, 1)]) {
    for (const eatTime of SLOT_TIMES) {
      const start = slotInstant(eatDate, eatTime);
      if (!isBookableInstant(start, now)) continue;
      const local = zonedParts(start, tz);
      if (local.date !== localDate) continue;
      out.push({ eatDate, eatTime, start, localDate: local.date, localTime: local.time });
    }
  }
  return out.sort((a, b) => a.start.getTime() - b.start.getTime());
}

/** The distinct Nairobi dates whose bookings affect a given local day. */
export function eatDatesForLocalDate(localDate: string): string[] {
  return [addDays(localDate, -1), localDate, addDays(localDate, 1)];
}
