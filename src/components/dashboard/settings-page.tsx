"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  Clock,
  Landmark,
  LockKeyhole,
  LogOut,
  Minus,
  RotateCcw,
  ShieldCheck,
  Store,
} from "lucide-react";

import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { Permission, Role } from "@/lib/auth-types";
import { ROLE_PERMISSIONS } from "@/lib/auth-types";
import { initials } from "@/lib/format";
import { StaffSection } from "@/components/dashboard/staff-section";

const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  manager: "Manager",
  staff: "Staff",
  customer: "Customer",
};

const ROLE_SCOPES: { label: string; permissions: Permission[] }[] = [
  { label: "Catalog", permissions: ["products.view"] },
  { label: "Categories", permissions: ["categories.view"] },
  { label: "Orders", permissions: ["orders.view"] },
  { label: "Customers", permissions: ["customers.view"] },
  { label: "Inventory", permissions: ["inventory.view"] },
  { label: "Expenses", permissions: ["expenses.view"] },
  { label: "Reports", permissions: ["reports.view"] },
  { label: "Staff", permissions: ["users.manage"] },
];

const STORE_KEY = "bonbon-settings";

const currencies = ["USD", "EUR", "GBP", "INR", "AUD", "CAD"];
const timezones = [
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
];

type SettingsState = {
  storeName: string;
  currency: string;
  timezone: string;
  notifications: {
    orders: boolean;
    lowStock: boolean;
    reports: boolean;
    marketing: boolean;
  };
};

const defaults: SettingsState = {
  storeName: "Bonbon",
  currency: "USD",
  timezone: "America/New_York",
  notifications: {
    orders: true,
    lowStock: true,
    reports: false,
    marketing: false,
  },
};

export function SettingsPage({
  name,
  email,
  role,
}: {
  name: string;
  email: string;
  role: Role;
}) {
  const router = useRouter();

  const [settings, setSettings] = useState<SettingsState>(() => {
    if (typeof window === "undefined") return defaults;
    try {
      const stored = window.localStorage.getItem(STORE_KEY);
      if (!stored) return defaults;
      return { ...defaults, ...JSON.parse(stored) };
    } catch {
      return defaults;
    }
  });

  const [saved, setSaved] = useState(false);
  const dirty = JSON.stringify(settings) !== JSON.stringify(readInitial());

  function update(patch: Partial<SettingsState>) {
    setSettings((prev) => ({ ...prev, ...patch }));
  }

  function updateNotification(
    key: keyof SettingsState["notifications"],
    value: boolean,
  ) {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
  }

  function handleSave() {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(settings));
    } catch {
      // storage unavailable — still give feedback
    }
    setSaved(true);
    toast.success("Settings saved");
    window.setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    setSettings(defaults);
    window.localStorage.removeItem(STORE_KEY);
    toast.success("Settings reset to defaults");
  }

  async function handleSignOut() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    toast.success("Signed out");
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header + global actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Store settings
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your account, store preferences and notifications.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={!dirty}
            className="gap-2"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={!dirty && !saved}
            className="gap-2"
          >
            {saved ? (
              <>
                <Check className="size-4" aria-hidden="true" />
                Saved
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        {/* Left rail */}
        <div className="flex flex-col gap-6">
          {/* Account hero */}

          <Card className="p-0">
            <div className="relative overflow-hidden bg-gradient-to-br from-primary via-[oklch(0.55_0.14_55)] to-[oklch(0.55_0.17_330)] px-5 py-6">
              <div
                className="pointer-events-none absolute inset-0 [background-image:radial-gradient(rgb(255_255_255_/_0.14)_1px,transparent_1px)] [background-size:14px_14px]"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -top-1/4 left-1/2 h-[200%] w-40 -translate-x-1/2 rotate-12 bg-white/5 blur-2xl"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -right-10 -top-12 size-36 rounded-full bg-white/10 blur-2xl"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -bottom-16 -left-8 size-32 rounded-full bg-rose-200/25 blur-2xl"
                aria-hidden="true"
              />
              <div className="relative flex flex-col gap-4">
                <Avatar className="size-16 shadow-lg shadow-primary-foreground/10 ring-[3px] ring-white/40">
                  <AvatarFallback className="bg-white/20 text-xl font-semibold text-white">
                    {initials(name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1 text-white">
                  <span className="truncate text-lg font-semibold leading-tight">
                    {name}
                  </span>
                  <span className="truncate text-sm text-white/80">
                    {email}
                  </span>
                </div>
                <div className="flex items-center border-t border-white/15 pt-4">
                  <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm">
                    <ShieldCheck
                      className="size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="truncate">{ROLE_LABELS[role]}</span>
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Permissions card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <LockKeyhole className="size-3.5" aria-hidden="true" />
                </span>
                Permissions
              </CardTitle>
              <CardDescription>
                Store areas this account can access based on its role.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {ROLE_SCOPES.map((scope) => {
                const granted = scope.permissions.some((permission) =>
                  ROLE_PERMISSIONS[role].includes(permission),
                );
                return (
                  <span
                    key={scope.label}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                      granted
                        ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                        : "bg-muted text-muted-foreground/70"
                    }`}
                  >
                    {granted ? (
                      <Check className="size-3" aria-hidden="true" />
                    ) : (
                      <Minus className="size-3" aria-hidden="true" />
                    )}
                    {scope.label}
                  </span>
                );
              })}
            </CardContent>
          </Card>

          {/* Session card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <LogOut className="size-3.5" aria-hidden="true" />
                </span>
                Session
              </CardTitle>
              <CardDescription>
                Your login stays active for 7 days. Sign out securely to end it
                early.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4" aria-hidden="true" />
                Active session
              </div>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="justify-start gap-2 text-destructive hover:text-destructive"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Sign out
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main column */}
        <div className="flex flex-col gap-6">
          {/* Store preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Store className="size-3.5" aria-hidden="true" />
                </span>
                Store preferences
              </CardTitle>
              <CardDescription>
                Base settings for pricing, regional formatting and branding.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <Field>
                <FieldLabel htmlFor="store-name">Store name</FieldLabel>
                <FieldContent>
                  <Input
                    id="store-name"
                    value={settings.storeName}
                    onChange={(e) => update({ storeName: e.target.value })}
                  />
                </FieldContent>
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel className="flex items-center gap-1.5">
                    <Landmark
                      className="size-3.5 text-muted-foreground"
                      aria-hidden="true"
                    />
                    Currency
                  </FieldLabel>
                  <FieldContent>
                    <Select
                      value={settings.currency}
                      onValueChange={(value) => update({ currency: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel className="flex items-center gap-1.5">
                    <Clock
                      className="size-3.5 text-muted-foreground"
                      aria-hidden="true"
                    />
                    Timezone
                  </FieldLabel>
                  <FieldContent>
                    <Select
                      value={settings.timezone}
                      onValueChange={(value) => update({ timezone: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Bell className="size-3.5" aria-hidden="true" />
                </span>
                Notifications
              </CardTitle>
              <CardDescription>
                Choose what you want to be notified about.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col">
              <NotificationRow
                title="New orders"
                description="Get notified when a new order is placed."
                checked={settings.notifications.orders}
                onCheckedChange={(v) => updateNotification("orders", v)}
              />
              <Separator className="my-1" />
              <NotificationRow
                title="Low stock alerts"
                description="Alerts when an item drops below reorder point."
                checked={settings.notifications.lowStock}
                onCheckedChange={(v) => updateNotification("lowStock", v)}
              />
              <Separator className="my-1" />
              <NotificationRow
                title="Monthly report"
                description="A summary of store performance at the end of each month."
                checked={settings.notifications.reports}
                onCheckedChange={(v) => updateNotification("reports", v)}
              />
              <Separator className="my-1" />
              <NotificationRow
                title="Marketing updates"
                description="Product tips and feature announcements."
                checked={settings.notifications.marketing}
                onCheckedChange={(v) => updateNotification("marketing", v)}
              />
            </CardContent>
          </Card>

          <StaffSection />
        </div>
      </div>
    </div>
  );
}

function readInitial(): SettingsState {
  if (typeof window === "undefined") return defaults;
  try {
    const stored = window.localStorage.getItem(STORE_KEY);
    if (!stored) return defaults;
    return { ...defaults, ...JSON.parse(stored) };
  } catch {
    return defaults;
  }
}

function NotificationRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/70 text-muted-foreground">
          <Bell className="size-4" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{title}</span>
          <span className="text-sm text-muted-foreground">{description}</span>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
