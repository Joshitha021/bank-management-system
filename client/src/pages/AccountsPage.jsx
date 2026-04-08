import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Plus, Wallet, TrendingUp, TrendingDown, ShieldAlert } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

export default function AccountsPage() {
  const { user } = useContext(AuthContext);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/accounts');
      setAccounts(res.data.accounts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createDemoAccount = async () => {
    try {
      await axios.post('http://localhost:5000/api/accounts', { type: 'Savings', initialDeposit: 15000 });
      fetchAccounts();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading accounts...</div>;

  return (
    <motion.div 
      className="page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Your Accounts</h1>
          <p className="text-muted">Manage your savings, checking, and deposits.</p>
        </div>
        <button 
          onClick={createDemoAccount} 
          className="btn-primary" 
          disabled={user?.kycStatus !== 'Verified'}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: user?.kycStatus !== 'Verified' ? 0.5 : 1, cursor: user?.kycStatus !== 'Verified' ? 'not-allowed' : 'pointer' }}
        >
          <Plus size={18} /> Open Account
        </button>
      </div>

      {user?.kycStatus !== 'Verified' && (
        <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--color-danger)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ShieldAlert color="var(--color-danger)" />
          <div>
            <h4 style={{ margin: 0, color: 'var(--color-danger)' }}>Compliance Action Required</h4>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>You must complete Identity Verification (KYC) before you can open new live accounts.</p>
          </div>
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Wallet size={48} className="text-muted" style={{ margin: '0 auto 1rem' }} />
          <h3>No Accounts Found</h3>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>You don't have any open accounts yet.</p>
          <button 
            onClick={createDemoAccount} 
            className="btn-primary"
            disabled={user?.kycStatus !== 'Verified'}
            style={{ opacity: user?.kycStatus !== 'Verified' ? 0.5 : 1, cursor: user?.kycStatus !== 'Verified' ? 'not-allowed' : 'pointer' }}
          >
            Open your first account
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {accounts.map((acc, i) => (
            <motion.div 
              key={acc._id}
              className="card"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              style={{ position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'var(--gradient-accent)', opacity: 0.1, borderRadius: '50%', transform: 'translate(30%, -30%)' }}></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ color: 'var(--color-accent)' }}>{acc.type}</h3>
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>**** {acc.accountNumber.slice(-4)}</p>
                </div>
                <div style={{ background: 'var(--color-primary-light)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', height: 'fit-content' }}>{acc.status}</div>
              </div>
              
              <div>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Available Balance</p>
                <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>
                  ₹{acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </h2>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)', fontSize: '0.875rem' }}>
                  <TrendingUp size={16} /> <span className="text-muted">In: ₹0.00</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-danger)', fontSize: '0.875rem' }}>
                  <TrendingDown size={16} /> <span className="text-muted">Out: ₹0.00</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
