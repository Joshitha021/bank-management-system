import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { Users, DollarSign, Activity, CreditCard } from 'lucide-react';

export default function AdminPage() {
  const { token, user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    if (user?.role === 'Admin') {
      fetchAdminData();
    }
  }, [user]);

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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
