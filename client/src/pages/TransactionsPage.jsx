import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Send, ArrowDownLeft, ArrowUpRight, ShieldAlert } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

export default function TransactionsPage() {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [payees, setPayees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Layout State
  const [activeRightTab, setActiveRightTab] = useState('history');

  // Transfer Form State
  const [fromAccount, setFromAccount] = useState('');
  const [toAccountLabel, setToAccountLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [transferError, setTransferError] = useState('');
  const [transferSuccess, setTransferSuccess] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');

  // Payee Form State
  const [newPayeeName, setNewPayeeName] = useState('');
  const [newPayeeAccount, setNewPayeeAccount] = useState('');
  const [payeeError, setPayeeError] = useState('');
  const [payeeSuccess, setPayeeSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [txsRes, accsRes, payeesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/transactions'),
        axios.get('http://localhost:5000/api/accounts'),
        axios.get('http://localhost:5000/api/payees')
      ]);
      setTransactions(txsRes.data.transactions);
      setAccounts(accsRes.data.accounts);
      setPayees(payeesRes.data.payees);
      if (accsRes.data.accounts.length > 0) {
        setFromAccount(accsRes.data.accounts[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setTransferError('');
    setTransferSuccess('');

    try {
      const payload = {
        fromAccountId: fromAccount,
        toAccountNumber: toAccountLabel,
        amount: Number(amount),
        description: desc || 'Fund Transfer'
      };
      
      if (showOtpModal) {
        payload.otp = otp;
      }

      const res = await axios.post('http://localhost:5000/api/transactions/transfer', payload);
      
      if (res.status === 202 && res.data.requireOTP) {
        setShowOtpModal(true);
        setTransferSuccess(res.data.message);
        return;
      }

      setTransferSuccess('Transfer completed successfully!');
      setAmount('');
      setToAccountLabel('');
      setDesc('');
      setShowOtpModal(false);
      setOtp('');
      fetchData(); // refresh list
    } catch (err) {
      setTransferError(err.response?.data?.message || 'Transfer failed. Check details.');
    }
  };

  const handleAddPayee = async (e) => {
    e.preventDefault();
    setPayeeError('');
    setPayeeSuccess('');
    try {
      const res = await axios.post('http://localhost:5000/api/payees', {
        name: newPayeeName,
        accountNumber: newPayeeAccount
      });
      setPayeeSuccess(res.data.message);
      setNewPayeeName('');
      setNewPayeeAccount('');
      fetchData();
    } catch (err) {
      setPayeeError(err.response?.data?.message || 'Failed to save payee');
    }
  };

  const handleDeletePayee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this saved payee?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/payees/${id}`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete payee', err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Transactions & Transfers</h1>
        <p className="text-muted">Send money easily and view your history.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem' }}>
        
        {/* Transfer Form Component */}
        <div style={{ gridColumn: 'span 12', '@media(min-width: 1024px)': { gridColumn: 'span 5' } }}>
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Send size={20} color="var(--color-accent)"/> Send Money
            </h3>

            {user?.kycStatus !== 'Verified' && (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--color-danger)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <ShieldAlert color="var(--color-danger)" />
                <div>
                  <h4 style={{ margin: 0, color: 'var(--color-danger)' }}>Action Restricted</h4>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>You must complete Verification (KYC) to transfer funds.</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', opacity: user?.kycStatus !== 'Verified' ? 0.5 : 1 }}>
              {transferError && <div style={{ color: 'var(--color-danger)', background: 'rgba(239,68,68,0.1)', padding: '0.5rem', borderRadius: '4px' }}>{transferError}</div>}
              {transferSuccess && <div style={{ color: 'var(--color-success)', background: 'rgba(16,185,129,0.1)', padding: '0.5rem', borderRadius: '4px' }}>{transferSuccess}</div>}
              
              <div className="form-group">
                <label>From Account</label>
                <select 
                  className="input-field" 
                  value={fromAccount} 
                  onChange={e => setFromAccount(e.target.value)}
                  style={{  appearance: 'none', background: 'var(--color-primary-dark)' }}
                >
                  {accounts.map(acc => (
                    <option key={acc._id} value={acc._id}>
                      {acc.type} - **** {acc.accountNumber.slice(-4)} (₹{acc.balance})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ position: 'relative' }}>
                <label>To Account Number</label>
                {payees.length > 0 && (
                  <select 
                    onChange={e => {
                      if (e.target.value) setToAccountLabel(e.target.value);
                    }}
                    style={{ position: 'absolute', right: 0, top: 0, background: 'transparent', color: 'var(--color-accent)', border: 'none', appearance: 'none', cursor: 'pointer', outline: 'none', padding: '0 0.5rem' }}
                  >
                    <option value="">▼ Select Saved Payee</option>
                    {payees.map(p => (
                      <option key={p._id} value={p.accountNumber}>{p.name} - {p.accountNumber}</option>
                    ))}
                  </select>
                )}
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Enter 10-digit number"
                  value={toAccountLabel}
                  onChange={e => setToAccountLabel(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Amount (₹)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  disabled={showOtpModal}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Rent payment"
                  value={desc}
                  disabled={showOtpModal}
                  onChange={e => setDesc(e.target.value)}
                />
              </div>

              {showOtpModal && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="form-group" style={{ padding: '1rem', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--color-accent)', borderRadius: '8px' }}>
                  <label style={{ color: 'var(--color-accent)' }}>Enter 6-Digit OTP</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="123456"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    required
                    maxLength="6"
                    style={{ letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.25rem', fontWeight: 'bold' }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button type="button" onClick={() => { setShowOtpModal(false); setOtp(''); setTransferSuccess(''); }} className="btn-primary" style={{ flex: 1, background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', boxShadow: 'none' }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                      Verify & Send
                    </button>
                  </div>
                </motion.div>
              )}

              {!showOtpModal && (
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ marginTop: '0.5rem', cursor: user?.kycStatus !== 'Verified' ? 'not-allowed' : 'pointer' }}
                  disabled={user?.kycStatus !== 'Verified'}
                >
                  Confirm Transfer
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Right Side Column */}
        <div style={{ gridColumn: 'span 12', '@media(min-width: 1024px)': { gridColumn: 'span 7' } }}>
          <div className="card" style={{ height: '100%', minHeight: '500px' }}>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
              <button 
                onClick={() => setActiveRightTab('history')}
                style={{ background: 'transparent', border: 'none', padding: '0.75rem 1rem', color: activeRightTab === 'history' ? 'var(--color-accent)' : 'var(--color-text-muted)', borderBottom: activeRightTab === 'history' ? '2px solid var(--color-accent)' : '2px solid transparent', cursor: 'pointer', fontWeight: 600 }}
              >
                Transaction History
              </button>
              <button 
                onClick={() => setActiveRightTab('payees')}
                style={{ background: 'transparent', border: 'none', padding: '0.75rem 1rem', color: activeRightTab === 'payees' ? 'var(--color-accent)' : 'var(--color-text-muted)', borderBottom: activeRightTab === 'payees' ? '2px solid var(--color-accent)' : '2px solid transparent', cursor: 'pointer', fontWeight: 600 }}
              >
                Saved Payees (Address Book)
              </button>
            </div>

            {activeRightTab === 'history' && (
              <>
            {transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <p className="text-muted">You have no transactions yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {transactions.map(tx => (
                  <div key={tx._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                        padding: '0.75rem', 
                        borderRadius: '50%', 
                        background: tx.amount < 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: tx.amount < 0 ? 'var(--color-danger)' : 'var(--color-success)'
                      }}>
                        {tx.amount < 0 ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>{tx.description}</div>
                        <div style={{ fontSize: '0.8rem', display: 'flex', gap: '0.5rem' }} className="text-muted">
                          <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{tx.category}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', color: tx.amount < 0 ? 'var(--color-text-main)' : 'var(--color-success)' }}>
                        {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {tx.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </>
            )}

            {activeRightTab === 'payees' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                
                {/* Add Payee Form */}
                <form onSubmit={handleAddPayee} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  <div style={{ flex: 1 }}>
                    <input type="text" className="input-field" placeholder="Payee Name (e.g. Landlord)" value={newPayeeName} onChange={e => setNewPayeeName(e.target.value)} required />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input type="text" className="input-field" placeholder="10-digit Account No." value={newPayeeAccount} onChange={e => setNewPayeeAccount(e.target.value)} required maxLength="10" />
                  </div>
                  <button type="submit" className="btn-primary">Save Info</button>
                </form>
                {payeeError && <div style={{ color: 'var(--color-danger)', background: 'rgba(239,68,68,0.1)', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem' }}>{payeeError}</div>}
                {payeeSuccess && <div style={{ color: 'var(--color-success)', background: 'rgba(16,185,129,0.1)', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem' }}>{payeeSuccess}</div>}

                {payees.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <p className="text-muted">You have no saved payees in your Address Book.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {payees.map(p => (
                      <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--color-text-main)' }}>{p.name}</div>
                          <div className="text-muted" style={{ fontSize: '0.875rem' }}>Account No: {p.accountNumber}</div>
                        </div>
                        <div>
                          <button onClick={() => handleDeletePayee(p._id)} style={{ background: 'transparent', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

          </div>
        </div>

      </div>
    </motion.div>
  );
}
