import React, { useEffect, useState } from 'react';
import AdminRoleManager from '../components/AdminRoleManager';
import AdminRoleBadge from '../components/AdminRoleBadge';

export default function AdminRoleManagerSection() {
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    fetch('/api/admin/me').then(r=>r.json()).then(setCurrentUser);
  }, []);
  if (!currentUser) return null;
  if (currentUser.adminRole !== 'superadmin') return null;
  return (
    <div style={{marginTop:32,marginBottom:32}}>
      <AdminRoleBadge />
      <AdminRoleManager currentUser={currentUser} />
    </div>
  );
}
