import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownLeft, DollarSign, Wallet, QrCode, Copy, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const { user } = useContext(AuthContext);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Receive Modal State
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedRecvAccount, setSelectedRecvAccount] = useState('');

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
      
      // Default select the first account for receiving
      if (accsRes.data.accounts.length > 0) {
        setSelectedRecvAccount(accsRes.data.accounts[0].accountNumber);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(selectedRecvAccount);
    alert('Account Number copied to clipboard!');
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // 1. Dynamic Pie Chart: Spending by Category
  const calculatePieData = () => {
    // Only map negative transactions (spending)
    const expenditures = transactions.filter(tx => tx.amount < 0);
    if (expenditures.length === 0) {
      return [{ name: 'No Spending', value: 1 }]; // Placeholder if no spend
    }

    const categoryMap = expenditures.reduce((acc, tx) => {
      // Use category or default to 'Other'
      const cat = tx.category || 'Other';
      acc[cat] = (acc[cat] || 0) + Math.abs(tx.amount);
      return acc;
    }, {});

    return Object.keys(categoryMap).map(key => ({
      name: key,
      value: categoryMap[key]
    })).sort((a, b) => b.value - a.value); // Sort biggest spenders first
  };

  // 2. Dynamic Area Chart: Balance Trend
  const calculateTrendData = () => {
    if (transactions.length === 0) {
      return [
        { name: 'Start', balance: 0 },
        { name: 'Today', balance: totalBalance }
      ];
    }

    // Sort newest to oldest so we can calculate mathematically backwards from today's real balance
    const newestToOldest = [...transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    let runningBalance = totalBalance;
    
    const historicTrend = newestToOldest.map((tx, idx) => {
      // The balance right AFTER this transaction occurred was runningBalance
      const pointBalance = runningBalance;
      
      // Step backwards in time for the NEXT loop iteration:
      // If tx was Outbound (-), the balance BEFORE it was higher
      // If tx was Inbound (+), the balance BEFORE it was lower
      runningBalance -= tx.amount;
      
      return {
        name: `Tx ${idx + 1}`,
        dateStr: new Date(tx.createdAt).toLocaleDateString(undefined, {month:'short', day:'numeric'}),
        balance: pointBalance 
      };
    });

    // The array is newest -> oldest. We must reverse it so the chart draws chronologically left -> right.
    return historicTrend.reverse();
  };

  const dynamicPieData = calculatePieData();
  const dynamicTrendData = calculateTrendData();

  const COLORS = ['#d4af37', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6'];

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
            <button onClick={() => setShowReceiveModal(true)} className="btn-primary" style={{ flex: 1, background: 'var(--color-primary-light)', color: 'white' }}>Receive</button>
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
                <Pie data={dynamicPieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {dynamicPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `₹${Number(value).toLocaleString()}`}
                  contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: '#fff' }} 
                />
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
            <AreaChart data={dynamicTrendData}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="dateStr" stroke="var(--color-text-muted)" />
              <YAxis stroke="var(--color-text-muted)" tickFormatter={(value) => `₹${value}`} width={80} />
              <Tooltip 
                formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Balance']}
                contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: '#fff' }} 
              />
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

      {/* Receive Money Modal */}
      <AnimatePresence>
        {showReceiveModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="card" 
              style={{ width: '100%', maxWidth: '400px', position: 'relative', padding: '2rem', textAlign: 'center' }}
            >
              <button 
                onClick={() => setShowReceiveModal(false)} 
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
              
              <h2 style={{ marginBottom: '0.25rem' }}>Receive Money</h2>
              <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '0.875rem' }}>Share these details to get paid.</p>

              {accounts.length === 0 ? (
                <p className="text-muted">You must open an account first.</p>
              ) : (
                <>
                  <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                    <label>Select Account to Credit</label>
                    <select 
                      className="input-field" 
                      value={selectedRecvAccount}
                      onChange={e => setSelectedRecvAccount(e.target.value)}
                      style={{ appearance: 'none', background: 'var(--color-primary-dark)' }}
                    >
                      {accounts.map(acc => (
                        <option key={acc._id} value={acc.accountNumber}>
                          {acc.type} - **** {acc.accountNumber.slice(-4)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ padding: '2rem', background: 'white', borderRadius: '12px', display: 'inline-block', marginBottom: '1.5rem' }}>
                    <QrCode size={150} color="#000" />
                  </div>

                  <div style={{ background: 'var(--color-primary-dark)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="text-muted" style={{ fontSize: '0.75rem', textAlign: 'left', marginBottom: '0.25rem' }}>Your Account Number</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '0.1em' }}>{selectedRecvAccount}</div>
                    </div>
                    <button onClick={copyToClipboard} style={{ background: 'rgba(212, 175, 55, 0.1)', border: 'none', color: 'var(--color-accent)', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>
                      <Copy size={20} />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
