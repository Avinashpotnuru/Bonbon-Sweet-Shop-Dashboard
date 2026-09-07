export type Role = "admin" | "manager" | "staff" | "customer";

export type UserStatus = "active" | "inactive";

export type StaffRole = Extract<Role, "manager" | "staff">;

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt?: string;
};

export type PublicUser = Omit<User, "passwordHash">;

/**
 * Fine-grained capabilities enforced server-side on pages and API routes.
 * Each role maps to a set of permissions below.
 */
export type Permission =
  | "products.view"
  | "products.create"
  | "products.update"
  | "products.delete"
  | "categories.view"
  | "categories.create"
  | "categories.update"
  | "categories.delete"
  | "orders.view"
  | "orders.create"
  | "orders.update"
  | "orders.delete"
  | "customers.view"
  | "customers.create"
  | "customers.update"
  | "customers.delete"
  | "inventory.view"
  | "inventory.adjust"
  | "expenses.view"
  | "expenses.manage"
  | "reports.view"
  | "coupons.view"
  | "coupons.manage"
  | "users.manage";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    "products.view",
    "products.create",
    "products.update",
    "products.delete",
    "categories.view",
    "categories.create",
    "categories.update",
    "categories.delete",
    "orders.view",
    "orders.create",
    "orders.update",
    "orders.delete",
    "customers.view",
    "customers.create",
    "customers.update",
    "customers.delete",
    "inventory.view",
    "inventory.adjust",
    "expenses.view",
    "expenses.manage",
    "reports.view",
    "coupons.view",
    "coupons.manage",
    "users.manage",
  ],
  manager: [
    "products.view",
    "products.create",
    "products.update",
    "products.delete",
    "categories.view",
    "categories.create",
    "categories.update",
    "categories.delete",
    "orders.view",
    "orders.create",
    "orders.update",
    "orders.delete",
    "customers.view",
    "customers.create",
    "customers.update",
    "customers.delete",
    "inventory.view",
    "inventory.adjust",
    "expenses.view",
    "expenses.manage",
    "reports.view",
    "coupons.view",
    "coupons.manage",
  ],
  staff: [
    "products.view",
    "products.create",
    "products.update",
    "categories.view",
    "categories.create",
    "categories.update",
    "orders.view",
    "orders.create",
    "orders.update",
    "customers.view",
    "customers.create",
    "customers.update",
    "inventory.view",
    "inventory.adjust",
  ],
  /** Storefront customers. No administrative permissions — cannot reach the dashboard. */
  customer: [],
};

export function roleHasPermission(
  role: Role | undefined | null,
  permission: Permission,
): boolean {
  const perms = role ? ROLE_PERMISSIONS[role] : undefined;
  return perms ? perms.includes(permission) : false;
}

/** True when the role holds at least one of the given permissions. */
export function roleHasAny(
  role: Role | undefined | null,
  permissions: Permission[],
): boolean {
  return permissions.some((permission) => roleHasPermission(role, permission));
}
