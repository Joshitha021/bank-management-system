import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownLeft, DollarSign, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useContext(AuthContext);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accsRes, txsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/accounts'),
        axios.get('http://localhost:5000/api/transactions')
      ]);
      setAccounts(accsRes.data.accounts);
      setTransactions(txsRes.data.transactions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Dummy Chart Data
  const trendData = [
    { name: 'Jan', balance: 12000 },
    { name: 'Feb', balance: 13500 },
    { name: 'Mar', balance: 12800 },
    { name: 'Apr', balance: 15000 },
    { name: 'May', balance: totalBalance || 15000 }
  ];

  const pieData = [
    { name: 'Shopping', value: 400 },
    { name: 'Bills', value: 300 },
    { name: 'Food', value: 300 },
    { name: 'Transfer', value: 200 }
  ];
  const COLORS = ['#d4af37', '#10b981', '#3b82f6', '#8b5cf6'];

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Hello, {user?.name} 👋</h1>
        <p className="text-muted">Here is what's happening with your finances today.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Balance Card */}
        <div className="card" style={{ gridColumn: 'span 12', '@media (min-width: 1024px)': { gridColumn: 'span 4' } }}>
          <h3 className="text-muted" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Total Balance</h3>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--color-accent)' }}>
            ₹{totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/transactions" className="btn-primary" style={{ flex: 1, textAlign: 'center' }}>Send</Link>
            <button className="btn-primary" style={{ flex: 1, background: 'var(--color-primary-light)', color: 'white' }}>Receive</button>
          </div>
        </div>

        {/* Multi-Accounts Quick View */}
        <div className="card" style={{ gridColumn: 'span 12', '@media (min-width: 1024px)': { gridColumn: 'span 4' } }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>My Accounts</h3>
          {accounts.length === 0 ? (
            <p className="text-muted">No accounts to display.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {accounts.slice(0, 3).map(acc => (
                <div key={acc._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '0.5rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '8px', color: 'var(--color-accent)' }}>
                      <Wallet size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{acc.type}</div>
                      <div style={{ fontSize: '0.75rem' }} className="text-muted">**** {acc.accountNumber.slice(-4)}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 600 }}>₹{acc.balance.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="card" style={{ gridColumn: 'span 12', '@media (min-width: 1024px)': { gridColumn: 'span 4' } }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Spending by Category</h3>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
        {/* Trend Area Chart */}
        <div className="card" style={{ gridColumn: 'span 12', '@media (min-width: 1024px)': { gridColumn: 'span 8' }, height: '400px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Balance Trend</h3>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="var(--color-text-muted)" />
              <YAxis stroke="var(--color-text-muted)" />
              <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: '#fff' }} />
              <Area type="monotone" dataKey="balance" stroke="#d4af37" fillOpacity={1} fill="url(#colorBalance)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Transactions List */}
        <div className="card" style={{ gridColumn: 'span 12', '@media (min-width: 1024px)': { gridColumn: 'span 4' } }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Recent Activity</h3>
            <Link to="/transactions" style={{ fontSize: '0.875rem' }}>View All</Link>
          </div>
          
          {transactions.length === 0 ? (
            <p className="text-muted">No recent transactions.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {transactions.slice(0, 5).map(tx => (
                <div key={tx._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      padding: '0.5rem', 
                      borderRadius: '8px', 
                      background: tx.amount < 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: tx.amount < 0 ? 'var(--color-danger)' : 'var(--color-success)'
                    }}>
                      {tx.amount < 0 ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{tx.description}</div>
                      <div style={{ fontSize: '0.75rem' }} className="text-muted">{new Date(tx.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, color: tx.amount < 0 ? 'var(--color-text-main)' : 'var(--color-success)' }}>
                    {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
