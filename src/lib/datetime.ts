// The club plays in Italy, so the admin types match times in Italian time
// whatever time zone their own computer is in.

const ROME = "Europe/Rome";

function romeParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: ROME,
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

const pad = (n: number, size = 2) => String(n).padStart(size, "0");

/** ISO date -> "2026-10-24T15:00" in Italian time, for <input type="datetime-local">. */
export function isoToRomeLocal(iso: string | Date) {
  const p = romeParts(new Date(iso));
  return `${pad(p.year, 4)}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

/** "2026-10-24T15:00" typed in Italian time -> ISO date (UTC). Null if invalid. */
export function romeLocalToIso(local: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
  if (!match) return null;
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const wanted = Date.UTC(year, month - 1, day, hour, minute);

  // Two passes settle the offset even on the day the clocks change.
  let guess = wanted;
  for (let i = 0; i < 2; i++) {
    const p = romeParts(new Date(guess));
    guess -= Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - wanted;
  }
  return new Date(guess).toISOString();
}
