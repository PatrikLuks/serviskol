
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';


const ROLES = ['client', 'mechanic', 'admin'];
const ADMIN_ROLES = ['superadmin', 'approver', 'readonly'];
// Granularitní práva (lze rozšířit)
const PERMISSIONS = [
  'ai:run-report',
  'user:manage',
  'security:view',
  'prompt:edit',
  'proposal:approve',
  'audit:view',
  'dashboard:access',
];


export default function AdminUserManagement() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(null); // id ukládaného uživatele

  // Reviewer i admin mají přístup
  // Superadmin může měnit granularitní práva, ostatní pouze čtou
  const isSuperadmin = session?.user?.adminRole === 'superadmin';
  if (!['admin','superadmin','approver','readonly'].includes(session?.user?.role)) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Správa uživatelů a rolí</h2>
        <div className="text-gray-600 dark:text-gray-300">Nemáte oprávnění spravovat uživatele. Kontaktujte správce.</div>
      </div>
    );
  }

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const resUsers = await fetch('/api/admin/admins?role=all');
        const usersData = await resUsers.json();
        setUsers(usersData);
        const resAudit = await fetch('/api/admin/audit-log');
        const auditData = await resAudit.json();
        setAudit(auditData.map(a => ({
          timestamp: a.createdAt,
          user: a.targetUser?.name || '',
          email: a.targetUser?.email || '',
          oldRole: a.details?.prevRole,
          newRole: a.details?.newRole || a.details?.newAdminRole
        })));
      } catch (e) {
        setError('Chyba při načítání dat.');
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  async function handleRoleChange(userId, newRole, newAdminRole) {
  async function handlePermissionsChange(userId, perm, checked) {
    setSaving(userId);
    try {
      // Získat aktuální práva
      const res = await fetch(`/api/admin/admins/${userId}/permissions`);
      let perms = await res.json();
      if (!Array.isArray(perms)) perms = [];
      let newPerms;
      if (checked) {
        newPerms = [...new Set([...perms, perm])];
      } else {
        newPerms = perms.filter(p => p !== perm);
      }
      await fetch(`/api/admin/admins/${userId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: newPerms })
      });
      setUsers(users => users.map(u => u._id === userId ? { ...u, permissions: newPerms } : u));
    } catch (e) {
      setError('Chyba při ukládání granularitních práv.');
    }
    setSaving(null);
  }
    setSaving(userId);
    try {
      await fetch(`/api/admin/admins/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole, adminRole: newAdminRole })
      });
      setUsers(users => users.map(u => u._id === userId ? { ...u, role: newRole, adminRole: newAdminRole } : u));
    } catch (e) {
      setError('Chyba při ukládání změny.');
    }
    setSaving(null);
  }

  if (loading) return <div className="mt-8">Načítání dat...</div>;
  if (error) return <div className="mt-8 text-red-600">{error}</div>;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">Správa uživatelů a rolí</h2>
      <table className="min-w-full text-sm border mb-6">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="px-2 py-1 border">Jméno</th>
            <th className="px-2 py-1 border">Email</th>
            <th className="px-2 py-1 border">Role</th>
            <th className="px-2 py-1 border">Admin role</th>
            <th className="px-2 py-1 border">Změnit roli</th>
            <th className="px-2 py-1 border">Granularitní práva</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id} className="border-b">
              <td className="px-2 py-1 border">{u.name}</td>
              <td className="px-2 py-1 border">{u.email}</td>
              <td className="px-2 py-1 border">{u.role}</td>
              <td className="px-2 py-1 border">{u.adminRole || '-'}</td>
              <td className="px-2 py-1 border">
                <select
                  value={u.role}
                  disabled={saving === u._id}
                  onChange={e => handleRoleChange(u._id, e.target.value, u.adminRole)}
                  className="border rounded px-1 py-0.5 mr-2"
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {u.role === 'admin' && (
                  <select
                    value={u.adminRole}
                    disabled={saving === u._id}
                    onChange={e => handleRoleChange(u._id, u.role, e.target.value)}
                    className="border rounded px-1 py-0.5"
                  >
                    {ADMIN_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                )}
                {saving === u._id && <span className="ml-2 text-xs text-blue-600">Ukládám...</span>}
              </td>
              <td className="px-2 py-1 border">
                <div className="flex flex-wrap gap-2">
                  {PERMISSIONS.map(perm => (
                    <label key={perm} className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={u.permissions?.includes(perm) || false}
                        disabled={!isSuperadmin || saving === u._id}
                        onChange={e => handlePermissionsChange(u._id, perm, e.target.checked)}
                      />
                      {perm}
                    </label>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 className="text-lg font-semibold mb-2">Audit změn rolí</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-2 py-1 border">Čas</th>
              <th className="px-2 py-1 border">Uživatel</th>
              <th className="px-2 py-1 border">Email</th>
              <th className="px-2 py-1 border">Původní role</th>
              <th className="px-2 py-1 border">Nová role</th>
            </tr>
          </thead>
          <tbody>
            {audit.map((a, i) => (
              <tr key={i} className="border-b">
                <td className="px-2 py-1 border whitespace-nowrap">{a.timestamp}</td>
                <td className="px-2 py-1 border">{a.user}</td>
                <td className="px-2 py-1 border">{a.email}</td>
                <td className="px-2 py-1 border">{a.oldRole}</td>
                <td className="px-2 py-1 border">{a.newRole}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
