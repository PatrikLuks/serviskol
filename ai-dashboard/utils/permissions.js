import { useSession } from 'next-auth/react';

// Vrací granularitní práva aktuálního uživatele (z next-auth session)
export function usePermissions() {
  const { data: session } = useSession();
  return session?.user?.permissions || [];
}

// Pomocná funkce pro kontrolu konkrétního práva
export function hasPermission(permissions, perm) {
  return Array.isArray(permissions) && permissions.includes(perm);
}
