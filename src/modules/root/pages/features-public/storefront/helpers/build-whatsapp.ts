export function normalizeWhatsAppNumber(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");

  if (digits.length < 10) return null;

  return digits.startsWith("55") && digits.length >= 12 ? digits : `55${digits}`;
}

export function buildWhatsAppUrl(raw: string | null | undefined, message?: string): string | null {
  if (!raw) return null;

  const number = normalizeWhatsAppNumber(raw);
  if (!number) return null;

  return message
    ? `https://wa.me/${number}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${number}`;
}
