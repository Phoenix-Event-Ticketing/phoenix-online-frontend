import { UsersAdminPanel } from "@/components/users/UsersAdminPanel";
import { RequireRole } from "@/components/dashboard/RequireRole";

export default function DashboardUsersPage() {
  return (
    <RequireRole tab="users">
      <UsersAdminPanel />
    </RequireRole>
  );
}

