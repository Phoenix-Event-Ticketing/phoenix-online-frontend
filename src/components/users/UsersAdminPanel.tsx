"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useListUsersQuery,
  useUpdateUserMutation,
  useUpdateUserRoleMutation,
  type ApiUser,
} from "@/store/api";

type RoleName = "USER" | "ORGANIZER" | "ADMIN";
type UserStatus = "ACTIVE" | "INACTIVE";

type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: RoleName;
  status: UserStatus;
};

const ROLE_OPTIONS: RoleName[] = ["USER", "ORGANIZER", "ADMIN"];

type PermissionName =
  | "VIEW_PROFILE"
  | "UPDATE_PROFILE"
  | "DELETE_ACCOUNT"
  | "VIEW_USERS"
  | "MANAGE_USERS"
  | "ASSIGN_ROLE"
  | "VIEW_EVENTS"
  | "CREATE_EVENT"
  | "UPDATE_EVENT"
  | "DELETE_EVENT"
  | "PUBLISH_EVENT"
  | "VIEW_TICKET_INVENTORY"
  | "CREATE_TICKET_TYPE"
  | "UPDATE_TICKET_INVENTORY"
  | "DELETE_TICKET_TYPE"
  | "RESERVE_TICKET"
  | "CREATE_BOOKING"
  | "VIEW_BOOKINGS"
  | "CANCEL_BOOKING"
  | "UPDATE_BOOKING"
  | "VIEW_ALL_BOOKINGS"
  | "INITIATE_PAYMENT"
  | "PROCESS_PAYMENT"
  | "VIEW_PAYMENT"
  | "REFUND_PAYMENT"
  | "VIEW_ALL_PAYMENTS";

type PermissionGroup = {
  key: string;
  title: string;
  items: { name: PermissionName; description: string }[];
};

const PERMISSION_CATALOG: PermissionGroup[] = [
  {
    key: "user",
    title: "User Service",
    items: [
      { name: "VIEW_PROFILE", description: "view own profile" },
      { name: "UPDATE_PROFILE", description: "update profile" },
      { name: "DELETE_ACCOUNT", description: "delete own account" },
      { name: "VIEW_USERS", description: "list users (admin)" },
      { name: "MANAGE_USERS", description: "create/update/delete users" },
      { name: "ASSIGN_ROLE", description: "assign roles" },
    ],
  },
  {
    key: "event",
    title: "Event Service",
    items: [
      { name: "VIEW_EVENTS", description: "view event catalog" },
      { name: "CREATE_EVENT", description: "create events" },
      { name: "UPDATE_EVENT", description: "update events" },
      { name: "DELETE_EVENT", description: "remove events" },
      { name: "PUBLISH_EVENT", description: "publish event" },
    ],
  },
  {
    key: "inventory",
    title: "Ticket Inventory Service",
    items: [
      {
        name: "VIEW_TICKET_INVENTORY",
        description: "view ticket availability",
      },
      { name: "CREATE_TICKET_TYPE", description: "create ticket categories" },
      { name: "UPDATE_TICKET_INVENTORY", description: "update seat counts" },
      { name: "DELETE_TICKET_TYPE", description: "remove ticket types" },
      { name: "RESERVE_TICKET", description: "reserve ticket during booking" },
    ],
  },
  {
    key: "booking",
    title: "Booking Service",
    items: [
      { name: "CREATE_BOOKING", description: "create booking" },
      { name: "VIEW_BOOKINGS", description: "view own bookings" },
      { name: "CANCEL_BOOKING", description: "cancel booking" },
      { name: "UPDATE_BOOKING", description: "modify booking" },
      { name: "VIEW_ALL_BOOKINGS", description: "admin booking view" },
    ],
  },
  {
    key: "payment",
    title: "Payment Service",
    items: [
      { name: "INITIATE_PAYMENT", description: "start payment" },
      { name: "PROCESS_PAYMENT", description: "complete payment" },
      { name: "VIEW_PAYMENT", description: "view payment details" },
      { name: "REFUND_PAYMENT", description: "refund payment" },
      { name: "VIEW_ALL_PAYMENTS", description: "admin payment view" },
    ],
  },
];

const ALL_PERMISSIONS: PermissionName[] = PERMISSION_CATALOG.flatMap((g) =>
  g.items.map((i) => i.name),
);

function badgeStyles(kind: "role" | "status", value: string) {
  if (kind === "role") {
    if (value === "ADMIN")
      return "border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-200";
    if (value === "ORGANIZER")
      return "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200";
    return "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200";
  }

  if (value === "ACTIVE")
    return "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200";
  return "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200";
}

function firstRole(roles?: string[]): RoleName {
  const role = roles?.[0];
  if (role === "ADMIN" || role === "ORGANIZER" || role === "USER") return role;
  return "USER";
}

function toAdminRow(user: ApiUser): AdminUserRow {
  const role = user.role ?? firstRole(user.roles);
  return {
    id: user.id,
    name: user.name?.trim() || "Unnamed user",
    email: user.email,
    role,
    status: user.status ?? "ACTIVE",
  };
}

export function UsersAdminPanel() {
  const [view, setView] = useState<"users" | "permissions">("users");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [roleFilter, setRoleFilter] = useState<RoleName | "">("");

  const [modal, setModal] = useState<
    | null
    | { type: "create" }
    | { type: "edit"; id: string }
    | { type: "role"; id: string }
    | { type: "delete"; id: string }
  >(null);

  const [rolePermissions, setRolePermissions] = useState<
    Record<RoleName, Set<PermissionName>>
  >(() => {
    const all = new Set<PermissionName>(ALL_PERMISSIONS);
    return {
      USER: new Set<PermissionName>([
        "VIEW_PROFILE",
        "UPDATE_PROFILE",
        "DELETE_ACCOUNT",
        "VIEW_EVENTS",
        "CREATE_BOOKING",
        "VIEW_BOOKINGS",
        "CANCEL_BOOKING",
        "INITIATE_PAYMENT",
        "VIEW_PAYMENT",
      ]),
      ORGANIZER: new Set<PermissionName>([
        "VIEW_PROFILE",
        "UPDATE_PROFILE",
        "DELETE_ACCOUNT",
        "VIEW_EVENTS",
        "CREATE_EVENT",
        "UPDATE_EVENT",
        "PUBLISH_EVENT",
        "VIEW_TICKET_INVENTORY",
        "CREATE_TICKET_TYPE",
        "UPDATE_TICKET_INVENTORY",
      ]),
      ADMIN: all,
    };
  });
  const [activeRole, setActiveRole] = useState<RoleName>("ADMIN");
  const {
    data: usersResponse,
    isLoading: loadingUsers,
    isFetching: fetchingUsers,
    isError: listUsersFailed,
    refetch,
  } = useListUsersQuery({
    page,
    pageSize,
    q: debouncedQ || undefined,
    role: roleFilter || undefined,
  });

  const rows = useMemo(
    () => (usersResponse?.items ?? []).map(toAdminRow),
    [usersResponse],
  );

  const editing = useMemo(() => {
    if (!modal || !("id" in modal)) return null;
    return rows.find((r) => r.id === modal.id) ?? null;
  }, [modal, rows]);
  const filtered = rows;

  const [draftName, setDraftName] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [draftRole, setDraftRole] = useState<RoleName>("USER");
  const [draftStatus, setDraftStatus] = useState<UserStatus>("ACTIVE");
  const [apiError, setApiError] = useState<string | null>(null);
  const [updateUser, { isLoading: updatingUser }] = useUpdateUserMutation();
  const [updateUserRole, { isLoading: updatingRole }] = useUpdateUserRoleMutation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(q.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [q]);

  const effectiveError =
    apiError ?? (listUsersFailed ? "Could not load users from backend." : null);

  function openCreate() {
    setDraftName("");
    setDraftEmail("");
    setDraftRole("USER");
    setDraftStatus("ACTIVE");
    setModal({ type: "create" });
  }

  function openEdit(id: string) {
    const u = rows.find((r) => r.id === id);
    if (!u) return;
    setDraftName(u.name);
    setDraftEmail(u.email);
    setDraftRole(u.role);
    setDraftStatus(u.status);
    setModal({ type: "edit", id });
  }

  function openRole(id: string) {
    const u = rows.find((r) => r.id === id);
    if (!u) return;
    setDraftRole(u.role);
    setModal({ type: "role", id });
  }

  function closeModal() {
    setModal(null);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              {view === "users" ? "Users" : "Permissions"}
            </h2>
            {view === "users" ? (
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                {loadingUsers || fetchingUsers
                  ? "Loading users from backend..."
                  : "Users sourced from /users APIs."}
              </p>
            ) : null}
            {effectiveError ? (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{effectiveError}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="inline-flex h-10 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <button
                type="button"
                onClick={() => setView("users")}
                className={[
                  "px-3 text-sm font-medium transition-colors",
                  view === "users"
                    ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950"
                    : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900/40",
                ].join(" ")}
              >
                Users
              </button>
              <button
                type="button"
                onClick={() => setView("permissions")}
                className={[
                  "px-3 text-sm font-medium transition-colors",
                  view === "permissions"
                    ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950"
                    : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900/40",
                ].join(" ")}
              >
                Permissions
              </button>
            </div>

            {view === "users" ? (
              <>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search users…"
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600 sm:w-64"
                />
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value as RoleName | "");
                    setPage(1);
                  }}
                  className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
                >
                  <option value="">All roles</option>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={openCreate}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  Add user
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {view === "users" ? (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="grid grid-cols-12 bg-zinc-50 px-4 py-3 text-xs font-medium text-zinc-600 dark:bg-zinc-900/40 dark:text-zinc-300">
            <p className="col-span-4">User</p>
            <p className="col-span-3">Email</p>
            <p className="col-span-2">Role</p>
            <p className="col-span-1">Status</p>
            <p className="col-span-2 text-right">Actions</p>
          </div>

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filtered.length ? (
              filtered.map((u) => (
                <div key={u.id} className="grid grid-cols-12 items-center px-4 py-3">
                  <div className="col-span-4 min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {u.name}
                    </p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {u.id}
                    </p>
                  </div>
                  <p className="col-span-3 truncate text-sm text-zinc-700 dark:text-zinc-300">
                    {u.email}
                  </p>
                  <div className="col-span-2">
                    <span
                      className={[
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                        badgeStyles("role", u.role),
                      ].join(" ")}
                    >
                      {u.role}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <span
                      className={[
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                        badgeStyles("status", u.status),
                      ].join(" ")}
                    >
                      {u.status}
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(u.id)}
                      className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-xs font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900/40"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => openRole(u.id)}
                      className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-xs font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900/40"
                    >
                      Role
                    </button>
                    <button
                      type="button"
                      onClick={() => setModal({ type: "delete", id: u.id })}
                      className="h-8 rounded-md border border-red-200 bg-red-50 px-2 text-xs font-medium text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-950/60"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-sm text-zinc-600 dark:text-zinc-400">
                {loadingUsers || fetchingUsers ? "Loading users..." : "No users found."}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
            <span>
              Page {usersResponse?.meta.page ?? page} of {usersResponse?.meta.totalPages ?? 1} ·{" "}
              {usersResponse?.meta.total ?? rows.length} users
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={(usersResponse?.meta.page ?? page) <= 1 || loadingUsers || fetchingUsers}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900/40"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={
                  (usersResponse?.meta.page ?? page) >= (usersResponse?.meta.totalPages ?? 1) ||
                  loadingUsers ||
                  fetchingUsers
                }
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900/40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Roles
            </p>
            <div className="mt-3 space-y-2">
              {ROLE_OPTIONS.map((r) => {
                const active = activeRole === r;
                const count = rolePermissions[r]?.size ?? 0;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setActiveRole(r)}
                    className={[
                      "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-200 dark:bg-zinc-50 dark:text-zinc-950"
                        : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900/40",
                    ].join(" ")}
                  >
                    <span>{r}</span>
                    <span className="text-xs opacity-80">{count} perms</span>
                  </button>
                );
              })}
            </div>

          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    Permission catalog
                  </h3>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    Toggle permissions for role:{" "}
                    <span className="font-mono">{activeRole}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900/40"
                    onClick={() => {
                      setRolePermissions((prev) => ({
                        ...prev,
                        [activeRole]: new Set<PermissionName>(ALL_PERMISSIONS),
                      }));
                    }}
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900/40"
                    onClick={() => {
                      setRolePermissions((prev) => ({
                        ...prev,
                        [activeRole]: new Set<PermissionName>(),
                      }));
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {PERMISSION_CATALOG.map((group) => (
              <div
                key={group.key}
                className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="bg-zinc-50 px-4 py-3 text-xs font-semibold text-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300">
                  {group.title}
                </div>
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {group.items.map((p) => {
                    const checked =
                      rolePermissions[activeRole]?.has(p.name) ?? false;
                    return (
                      <label
                        key={p.name}
                        className="flex cursor-pointer items-start justify-between gap-3 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p
                            className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
                            title={p.name}
                          >
                            {p.description}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const next = new Set<PermissionName>(
                              rolePermissions[activeRole] ?? [],
                            );
                            if (e.target.checked) next.add(p.name);
                            else next.delete(p.name);
                            setRolePermissions((prev) => ({
                              ...prev,
                              [activeRole]: next,
                            }));
                          }}
                          className="mt-1 h-4 w-4"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modal ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-black/30"
            aria-label="Close modal"
            onClick={closeModal}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[min(560px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            {modal.type === "create" ? (
              <>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Create user
                </h3>
               
              </>
            ) : modal.type === "edit" ? (
              <>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Update profile
                </h3>
               
              </>
            ) : modal.type === "role" ? (
              <>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Assign role
                </h3>
               
              </>
            ) : (
              <>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Delete user
                </h3>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  UI only — delete endpoint not specified, but covered by MANAGE_USERS.
                </p>
              </>
            )}

            <div className="mt-4 space-y-3">
              {modal.type === "delete" ? (
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
                  Delete{" "}
                  <span className="font-mono text-xs">{editing?.id ?? modal.id}</span>
                  ?
                </div>
              ) : (
                <>
                  {modal.type !== "role" ? (
                    <>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <label className="space-y-1">
                          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            Name
                          </span>
                          <input
                            value={draftName}
                            onChange={(e) => setDraftName(e.target.value)}
                            className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
                            placeholder="Full name"
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            Email
                          </span>
                          <input
                            value={draftEmail}
                            onChange={(e) => setDraftEmail(e.target.value)}
                            className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
                            placeholder="user@example.com"
                          />
                        </label>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <label className="space-y-1">
                          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            Role
                          </span>
                          <select
                            value={draftRole}
                            onChange={(e) => setDraftRole(e.target.value as RoleName)}
                            className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
                          >
                            {ROLE_OPTIONS.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="space-y-1">
                          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            Status
                          </span>
                          <select
                            value={draftStatus}
                            onChange={(e) =>
                              setDraftStatus(e.target.value as UserStatus)
                            }
                            className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                          </select>
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Role
                      </span>
                      <select
                        value={draftRole}
                        onChange={(e) => setDraftRole(e.target.value as RoleName)}
                        className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </>
              )}
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900/40"
              >
                Cancel
              </button>

              {modal.type === "delete" ? (
                <button
                  type="button"
                  onClick={() => {
                    setApiError(
                      "Delete user endpoint is not available yet. User list remains backend-sourced.",
                    );
                    closeModal();
                  }}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                >
                  Delete
                </button>
              ) : (
                <button
                  type="button"
                  disabled={updatingUser || updatingRole}
                  onClick={async () => {
                    try {
                      setApiError(null);
                      if (modal.type === "create") {
                        setApiError(
                          "Create user endpoint is not available yet. Please create users via user-service onboarding flow.",
                        );
                      } else if (modal.type === "edit") {
                        await updateUser({
                          id: modal.id,
                          name: draftName.trim(),
                        }).unwrap();
                        await refetch();
                      } else if (modal.type === "role") {
                        await updateUserRole({
                          id: modal.id,
                          role: draftRole,
                        }).unwrap();
                        await refetch();
                      }
                      closeModal();
                    } catch (e) {
                      const message =
                        e instanceof Error ? e.message : "Request failed. Please try again.";
                      setApiError(message);
                    }
                  }}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  {updatingUser || updatingRole ? "Saving..." : "Save"}
                </button>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

