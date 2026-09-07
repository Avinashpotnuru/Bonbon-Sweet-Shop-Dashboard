import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Tag,
  Tags,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import type { Permission } from "./auth-types";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  permissions?: Permission[];
};

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Products", href: "/dashboard/products", icon: Package },
  { title: "Categories", href: "/dashboard/categories", icon: Tags },
  { title: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { title: "Customers", href: "/dashboard/customers", icon: Users },
  { title: "Inventory", href: "/dashboard/inventory", icon: Boxes },
  { title: "Expenses", href: "/dashboard/expenses", icon: Wallet, permissions: ["expenses.view"] },
  { title: "Reports", href: "/dashboard/reports", icon: BarChart3, permissions: ["reports.view"] },
  { title: "Coupons", href: "/dashboard/coupons", icon: Tag, permissions: ["coupons.view"] },
  { title: "Settings", href: "/dashboard/settings", icon: Settings, permissions: ["users.manage"] },
];
