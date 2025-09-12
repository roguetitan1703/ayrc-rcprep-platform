// IST Date Utilities
// Ensures all day boundary logic uses India Standard Time (UTC+5:30)

export function toIST(date = new Date()) {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000
  return new Date(utc + 5.5 * 3600000)
}

export function startOfIST(date = new Date()) {
  const d = toIST(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfIST(date = new Date()) {
  const start = startOfIST(date)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return end
}

export function istRangeFor(date = new Date()) {
  return { start: startOfIST(date), end: endOfIST(date) }
}

export function isISTToday(date) {
  const { start, end } = istRangeFor(new Date())
  return date >= start && date < end
}

export function istDateKey(date = new Date()) {
  return startOfIST(date).toISOString().slice(0, 10)
}
