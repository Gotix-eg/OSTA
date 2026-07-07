export function formatUserName(firstName?: string, lastName?: string) {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}
