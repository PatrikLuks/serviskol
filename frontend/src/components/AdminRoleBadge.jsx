import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminRoleBadge() {
  const [role, setRole] = useState('');
  const [adminRole, setAdminRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/me')
      .then(res => {
        setRole(res.data.role);
        setAdminRole(res.data.adminRole);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!role) return null;

  let color = 'bg-gray-300';
  if (adminRole === 'superadmin') color = 'bg-red-600 text-white';
  if (adminRole === 'approver') color = 'bg-green-600 text-white';
  if (adminRole === 'readonly') color = 'bg-yellow-400 text-black';

  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ml-2 ${color}`}>
      {role} / {adminRole}
    </span>
  );
}
