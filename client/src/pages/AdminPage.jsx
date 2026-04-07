import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { Users, DollarSign, Activity, CreditCard, Edit2, X, Shield } from 'lucide-react';

export default function AdminPage() {
  const { token, user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const fetchAdminData = async () => {
    try {
      const statsRes = await axios.get('http://localhost:5000/api/admin/stats');
      setStats(statsRes.data.stats);

      const usersRes = await axios.get('http://localhost:5000/api/admin/users');
      setUsersList(usersRes.data.users);
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchAdminData();
    }
  }, [user]);

  const openEditModal = (u) => {
    setSelectedUser(u);
    setEditForm({ name: u.name, email: u.email, role: u.role });
    setEditError('');
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');

    try {
      await axios.put(`http://localhost:5000/api/admin/users/${selectedUser._id}`, editForm);
      setSelectedUser(null);
      fetchAdminData(); // Refresh table
    } catch (err) {
      setEditError(err.response?.data?.message || 'Update failed');
    } finally {
      setEditLoading(false);
    }
  };

  if (user?.role !== 'Admin') {
    return <div className="card">Access Denied: You must be an Administrator.</div>;
  }

  if (loading) return <div>Loading Admin Dashboard...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h2>Admin Dashboard</h2>
        <p className="text-muted">System overview and user management.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="text-muted">Total Users</span>
            <Users size={20} color="var(--color-accent)" />
          </div>
          <h3>{stats?.totalUsers || 0}</h3>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="text-muted">Total Balance</span>
            <DollarSign size={20} color="var(--color-success)" />
          </div>
          <h3>₹{(stats?.totalBalance || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="text-muted">Active Accounts</span>
            <CreditCard size={20} color="var(--color-accent)" />
          </div>
          <h3>{stats?.totalAccounts || 0}</h3>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="text-muted">Total Transactions</span>
            <Activity size={20} color="var(--color-accent)" />
          </div>
          <h3>{stats?.totalTransactions || 0}</h3>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>User Directory</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '1rem 0' }}>Name</th>
                <th style={{ padding: '1rem 0' }}>Email</th>
                <th style={{ padding: '1rem 0' }}>Role</th>
                <th style={{ padding: '1rem 0' }}>Joined</th>
                <th style={{ padding: '1rem 0', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                      {u.name.charAt(0)}
                    </div>
                    {u.name}
                  </td>
                  <td style={{ padding: '1rem 0' }}>{u.email}</td>
                  <td style={{ padding: '1rem 0' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem',
                      background: u.role === 'Admin' ? 'var(--color-accent-light)' : 'rgba(255, 255, 255, 0.05)',
                      color: u.role === 'Admin' ? 'var(--color-accent)' : 'var(--color-text-muted)'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                    <button 
                      onClick={() => openEditModal(u)}
                      style={{ background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.25rem 0.5rem', color: 'var(--color-accent)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield color="var(--color-accent)" size={20} />
                <h3 style={{ margin: 0 }}>Edit User Profile</h3>
              </div>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {editError && <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem' }}>{editError}</div>}
              
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={editForm.name} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="input-field" 
                  value={editForm.email} 
                  onChange={e => setEditForm({...editForm, email: e.target.value})} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Account Status / Role</label>
                <select 
                  className="input-field" 
                  value={editForm.role} 
                  onChange={e => setEditForm({...editForm, role: e.target.value})}
                >
                  <option value="User">Standard User</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>
              
              <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
