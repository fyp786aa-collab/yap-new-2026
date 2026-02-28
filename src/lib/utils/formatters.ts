/**
 * Pakistan-specific formatters for CNIC and phone numbers
 */

/**
 * Format CNIC as XXXXX-XXXXXXX-X (13 digits)
 * Auto-inserts dashes as user types
 */
export function formatPakistanCNIC(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

/**
 * Validate CNIC format XXXXX-XXXXXXX-X
 */
export function isValidPakistanCNIC(value: string): boolean {
  return /^\d{5}-\d{7}-\d{1}$/.test(value);
}

/**
 * Parse formatted CNIC to raw digits
 */
export function parseCNIC(formatted: string): string {
  return formatted.replace(/\D/g, "");
}

/**
 * Format Pakistan phone number
 * Accepts: 03XX-XXXXXXX or +92XXX-XXXXXXX
 * Output: 03XX-XXXXXXX
 */
export function formatPakistanPhone(value: string): string {
  let digits = value.replace(/\D/g, "");

  // Handle +92 prefix - convert to 0 prefix
  if (digits.startsWith("92") && digits.length > 2) {
    digits = "0" + digits.slice(2);
  }

  digits = digits.slice(0, 11);

  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

/**
 * Validate Pakistan phone number format
 * Accepts: 03XX-XXXXXXX (with dash) or 03XXXXXXXXX (without)
 */
export function isValidPakistanPhone(value: string): boolean {
  return /^03\d{2}-?\d{7}$/.test(value);
}

/**
 * Format phone for display
 */
export function formatPhoneDisplay(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("03")) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  return value;
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

/**
 * Truncate text to word limit
 */
export function truncateToWordLimit(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ");
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
