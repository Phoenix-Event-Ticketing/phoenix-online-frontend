export const DASHBOARD_ROLES = ["USER", "ORGANIZER", "ADMIN"] as const;

export type DashboardRole = (typeof DASHBOARD_ROLES)[number];

export type DashboardTabKey =
  | "overview"
  | "events"
  | "payments"
  | "bookings"
  | "inventory"
  | "users"
  | "settings";

const ACCESS_BY_TAB: Record<DashboardTabKey, readonly DashboardRole[]> = {
  overview: ["USER", "ORGANIZER", "ADMIN"],
  events: ["ORGANIZER", "ADMIN"],
  payments: ["USER", "ADMIN"],
  bookings: ["USER", "ORGANIZER", "ADMIN"],
  inventory: ["ORGANIZER", "ADMIN"],
  users: ["ADMIN"],
  settings: ["USER", "ORGANIZER", "ADMIN"],
};

export function normalizeRoles(roles?: string[] | null): DashboardRole[] {
  if (!roles?.length) return ["USER"];
  return roles.filter((role): role is DashboardRole =>
    DASHBOARD_ROLES.includes(role as DashboardRole),
  );
}

export function canAccessTab(tab: DashboardTabKey, roles?: string[] | null): boolean {
  const normalizedRoles = normalizeRoles(roles);
  return ACCESS_BY_TAB[tab].some((role) => normalizedRoles.includes(role));
}

export function resolvePrimaryRole(roles?: string[] | null): DashboardRole {
  const normalizedRoles = normalizeRoles(roles);
  if (normalizedRoles.includes("ADMIN")) return "ADMIN";
  if (normalizedRoles.includes("ORGANIZER")) return "ORGANIZER";
  return "USER";
}
