// Validation helpers used by all forms on the account page.
// Pure functions: take a string, return either an error message key (to be
// looked up in translations) or null if valid.

export function validateFullName(value) {
  if (!value || !value.trim()) return 'required'
  const trimmed = value.trim()
  if (trimmed.length < 2) return 'nameShape'
  if (!/^[\p{L}\p{M}\s.'\-]+$/u.test(trimmed)) return 'nameShape'
  if (/^\d+$/.test(trimmed)) return 'nameShape'
  return null
}

export function validateEmail(value) {
  if (!value || !value.trim()) return 'required'
  const trimmed = value.trim().toLowerCase()
  // Pragmatic email regex; server-side should re-validate.
  const re = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/i
  if (!re.test(trimmed)) return 'email'
  return null
}

export function validateIndianPhone(value) {
  if (!value) return 'required'
  const digits = String(value).replace(/\D/g, '')
  if (digits.length !== 10) return 'phone'
  if (!/^[6-9]\d{9}$/.test(digits)) return 'phone'
  return null
}

export function validatePassword(value) {
  if (!value) return 'required'
  if (String(value).length < 8) return 'password'
  return null
}

export function validateGstin(value) {
  if (!value) return null                  // optional
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value.toUpperCase())
    ? null
    : 'gstin'
}

export function normalizeGstin(value) {
  return (value || '').toUpperCase().slice(0, 15)
}

export function normalizeIndianPhone(value) {
  return String(value || '').replace(/\D/g, '').slice(-10)
}
