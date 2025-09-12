export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function extractErrorMessage(err, fallback = 'Something went wrong') {
  return err?.response?.data?.error || err?.message || fallback
}
