"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  TriangleAlert,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { initials } from "@/lib/format";
import {
  StaffForm,
  type StaffFormValues,
  type StaffServerError,
  type StaffMember,
} from "@/components/dashboard/staff-form";

type LoadState = "loading" | "success" | "error";

const ROLE_LABELS: Record<StaffMember["role"], string> = {
  manager: "Manager",
  staff: "Staff",
};

function StatusBadge({ status }: { status: StaffMember["status"] }) {
  return status === "active" ? (
    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
      Active
    </Badge>
  ) : (
    <Badge className="bg-muted text-muted-foreground">Inactive</Badge>
  );
}

export function StaffSection() {
  const [members, setMembers] = useState<StaffMember[] | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StaffMember | undefined>(undefined);
  const [formError, setFormError] = useState<StaffServerError | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/staff", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: { users: StaffMember[] }) => {
        setMembers(data.users);
        setLoadState("success");
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          setLoadState("error");
          setMembers([]);
        }
      });
    return () => controller.abort();
  }, [refreshKey]);

  const filtered = useMemo(() => {
    if (!members) return [];
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.phone ?? "").toLowerCase().includes(q),
    );
  }, [members, search]);

  const handleSubmit = useCallback(
    (values: StaffFormValues) => {
      const url = editing ? `/api/staff/${editing.id}` : "/api/staff";
      const method = editing ? "PATCH" : "POST";
      setFormError(null);

      fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
        .then((r) => {
          if (!r.ok) {
            return r.json().then((d) => {
              setFormError({
                message: d.error || "Unable to save staff member.",
                email: d.fields?.email?.[0],
              });
              throw new Error(d.error || "Unable to save staff member.");
            });
          }
          return r.json();
        })
        .then(() => {
          const name = values.name;
          setEditing(undefined);
          setFormOpen(false);
          setRefreshKey((k) => k + 1);
          toast.success(editing ? "Staff member updated" : "Staff member created", {
            description: `${name} was ${editing ? "saved" : "added"}.`,
          });
        })
        .catch((err) => {
          if (err?.name === "AbortError") return;
          toast.error("Couldn't save staff member", {
            description: err?.message || "Please try again.",
          });
        });
    },
    [editing],
  );

  function toggleStatus(member: StaffMember) {
    const nextStatus = member.status === "active" ? "inactive" : "active";
    setTogglingId(member.id);
    fetch(`/api/staff/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    })
      .then((r) => {
        if (!r.ok) {
          return r.json().then((d) => {
            throw new Error(d.error || "Update failed");
          });
        }
      })
      .then(() => {
        setRefreshKey((k) => k + 1);
        toast.success(
          nextStatus === "active"
            ? "Staff member activated"
            : "Staff member deactivated",
          {
            description: `${member.name}'s account is now ${nextStatus}.`,
          },
        );
      })
      .catch((err) => {
        toast.error("Update failed", {
          description: err?.message || "Please try again.",
        });
      })
      .finally(() => setTogglingId(null));
  }

  function openAdd() {
    setEditing(undefined);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(member: StaffMember) {
    setEditing(member);
    setFormError(null);
    setFormOpen(true);
  }

  function handleFormOpenChange(open: boolean) {
    if (!open) setFormError(null);
    setFormOpen(open);
  }

  const renderToolbar = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative max-w-sm flex-1">
        <Search
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          placeholder="Search staff..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          aria-label="Search staff by name, email or phone"
        />
      </div>
      <Button size="sm" onClick={openAdd}>
        <Plus className="size-4" aria-hidden="true" />
        Add staff
      </Button>
    </div>
  );

  let content: ReactNode;

  if (loadState === "loading") {
    content = (
      <div className="rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-amber-50/60 dark:bg-amber-500/5">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden sm:table-cell">Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-36" />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-14" />
                </TableCell>
                <TableCell>
                  <Skeleton className="size-6 rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  } else if (loadState === "error") {
    content = (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
        <div className="mb-1 inline-flex size-10 items-center justify-center rounded-md bg-destructive/10 text-destructive">
          <TriangleAlert className="size-6" aria-hidden="true" />
        </div>
        <h3 className="font-medium">Failed to load staff</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Something went wrong while loading your staff. Please try again.
        </p>
        <Button variant="outline" size="sm" onClick={() => setRefreshKey((k) => k + 1)}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Retry
        </Button>
      </div>
    );
  } else if (filtered.length === 0) {
    const hasSearch = search.trim() !== "";
    content = (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
        <div className="mb-1 inline-flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
          {hasSearch ? (
            <Search className="size-6" aria-hidden="true" />
          ) : (
            <Users className="size-6" aria-hidden="true" />
          )}
        </div>
        <h3 className="font-medium">
          {hasSearch ? "No matching staff" : "No staff members yet"}
        </h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          {hasSearch
            ? "Try a different search term to find what you're looking for."
            : "Add your first staff or manager to get them into the dashboard."}
        </p>
        {hasSearch ? (
          <Button variant="outline" size="sm" onClick={() => setSearch("")}>
            Clear search
          </Button>
        ) : (
          <Button size="sm" onClick={openAdd}>
            <UserPlus className="size-4" aria-hidden="true" />
            Add staff
          </Button>
        )}
      </div>
    );
  } else {
    content = (
      <div className="rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-amber-50/60 dark:bg-amber-500/5">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden sm:table-cell">Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {initials(member.name)}
                    </div>
                    <span className="font-medium">{member.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{member.email}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {member.phone || "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={member.role === "manager" ? "default" : "secondary"}>
                    {ROLE_LABELS[member.role]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={member.status} />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Actions for ${member.name}`}
                      >
                        <MoreHorizontal className="size-4" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => openEdit(member)}>
                        <Pencil className="size-4" aria-hidden="true" />
                        Edit details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={togglingId === member.id}
                        onSelect={() => toggleStatus(member)}
                      >
                        {member.status === "active" ? (
                          <>
                            <RotateCcw className="size-4" aria-hidden="true" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserPlus className="size-4" aria-hidden="true" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-3.5" aria-hidden="true" />
            </span>
            Staff
          </CardTitle>
          <CardDescription>
            Manage staff and manager accounts. Deactivating an account blocks
            them from signing in.
          </CardDescription>
        </div>
        <div className="sm:w-auto">{renderToolbar}</div>
      </CardHeader>
      <CardContent>{content}</CardContent>

      <StaffForm
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        member={editing}
        serverError={formError}
        onSubmit={handleSubmit}
      />
    </Card>
  );
}