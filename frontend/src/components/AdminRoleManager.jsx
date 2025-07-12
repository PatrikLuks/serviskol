import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminRoleManager({ currentUser }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/admin/admins');
      setAdmins(res.data);
    } catch (e) {
      setError('Chyba při načítání adminů.');
    }
    setLoading(false);
  }

  async function changeRole(adminId, newRole) {
    setError(null);
    setSuccess(null);
    try {
      await axios.patch(`/api/admin/admins/${adminId}/role`, { adminRole: newRole });
      setSuccess('Role změněna.');
      fetchAdmins();
    } catch (e) {
      setError('Chyba při změně role.');
    }
  }

  if (loading) return <div>Načítám adminy…</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

  return (
    <div style={{marginTop:24}}>
      <h3>Správa adminů a rolí</h3>
      <table style={{width:'100%',marginTop:8}}>
        <thead>
          <tr>
            <th>Jméno</th>
            <th>Email</th>
            <th>Role</th>
            <th>Poslední přihlášení</th>
            <th>Akce</th>
          </tr>
        </thead>
        <tbody>
          {admins.map(a => (
            <tr key={a._id} style={{background:a._id===currentUser?._id?'#f0f0f0':'white'}}>
              <td>{a.name}</td>
              <td>{a.email}</td>
              <td>{a.adminRole}</td>
              <td>{a.lastLogin ? new Date(a.lastLogin).toLocaleString() : '-'}</td>
              <td>
                {currentUser?.adminRole==='superadmin' && a._id!==currentUser._id && (
                  <select value={a.adminRole} onChange={e=>changeRole(a._id,e.target.value)}>
                    <option value="superadmin">superadmin</option>
                    <option value="approver">approver</option>
                    <option value="readonly">readonly</option>
                  </select>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {success && <div style={{color:'green',marginTop:8}}>{success}</div>}
    </div>
  );
}
