/**
 * Sanitizes a `?next=` query value into a safe in-app path. Returns undefined
 * for anything that isn't a same-origin path (blocks open redirects).
 */
export function safeNextPath(
  value: string | string[] | undefined,
): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return undefined;
  return raw;
}