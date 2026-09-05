/**
 * Sanitizes a `?next=` query value into a safe in-app path. Returns undefined
 * for anything that isn't a same-origin path (blocks open redirects) and for
 * any path pointing into the admin area, so customers are never sent toward
 * /admin after sign-in/sign-up.
 */
const ADMIN_PREFIXES = ["/admin", "/dashboard"];

export function safeNextPath(
  value: string | string[] | undefined,
): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return undefined;
  if (
    ADMIN_PREFIXES.some(
      (prefix) => raw === prefix || raw.startsWith(`${prefix}/`),
    )
  ) {
    return undefined;
  }
  return raw;
}