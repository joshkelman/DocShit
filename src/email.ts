export type EmailResult = {
  ok: boolean
  attached: boolean
  message: string
}

export function isEmailAddress(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function emailSubject(names: string[]): string {
  if (names.length === 1) return names[0]
  return `${names.length} files from DocShit`
}

export function cleanNote(value: string): string {
  return value.replace(/\r\n/g, "\n").trim().slice(0, 1000)
}
