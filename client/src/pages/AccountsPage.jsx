import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wallet, TrendingUp, TrendingDown, ShieldAlert, CheckSquare, Briefcase, Landmark, PiggyBank, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

export default function AccountsPage() {
  const { user } = useContext(AuthContext);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [newAccType, setNewAccType] = useState('Savings');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [initialDeposit, setInitialDeposit] = useState('');
  const [accCreating, setAccCreating] = useState(false);

  // Deposit Modal State
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAccountId, setDepositAccountId] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);

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

  const createAccount = async (e) => {
    e.preventDefault();
    setAccCreating(true);
    try {
      await axios.post('http://localhost:5000/api/accounts', { 
        type: newAccType, 
        initialDeposit: Number(initialDeposit) 
      });
      fetchAccounts();
      // Reset & Close
      setIsWizardOpen(false);
      setWizardStep(1);
      setNewAccType('Savings');
      setAgreedToTerms(false);
      setInitialDeposit('');
    } catch (err) {
      console.error(err);
      alert('Failed to initialize account.');
    } finally {
      setAccCreating(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setIsDepositing(true);
    try {
      await axios.post('http://localhost:5000/api/transactions/deposit', {
        accountId: depositAccountId,
        amount: Number(depositAmount),
        description: 'External Transfer (Top-Up)'
      });
      fetchAccounts();
      setShowDepositModal(false);
      setDepositAmount('');
    } catch (err) {
      console.error(err);
      alert('Deposit failed.');
    } finally {
      setIsDepositing(false);
    }
  };

  const nextStep = () => setWizardStep(prev => prev + 1);
  const prevStep = () => setWizardStep(prev => prev - 1);

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
          onClick={() => setIsWizardOpen(true)} 
          className="btn-primary" 
          disabled={user?.kycStatus !== 'Verified'}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: user?.kycStatus !== 'Verified' ? 0.5 : 1, cursor: user?.kycStatus !== 'Verified' ? 'not-allowed' : 'pointer' }}
        >
          <Plus size={18} /> Open New Account
        </button>
      </div>

      {user?.kycStatus !== 'Verified' && (
        <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--color-danger)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ShieldAlert color="var(--color-danger)" />
          <div>
            <h4 style={{ margin: 0, color: 'var(--color-danger)' }}>Compliance Action Required</h4>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>You must complete Verification (KYC) before opening accounts.</p>
          </div>
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Wallet size={48} className="text-muted" style={{ margin: '0 auto 1rem' }} />
          <h3>No Accounts Found</h3>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>You don't have any open accounts yet.</p>
          <button 
            onClick={() => setIsWizardOpen(true)} 
            className="btn-primary"
            disabled={user?.kycStatus !== 'Verified'}
            style={{ opacity: user?.kycStatus !== 'Verified' ? 0.5 : 1 }}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Available Balance</p>
                  <h2 style={{ fontSize: '2rem', margin: 0 }}>
                    ₹{acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </h2>
                </div>
                <button 
                  onClick={() => { setDepositAccountId(acc._id); setShowDepositModal(true); }}
                  style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Plus size={16} /> Top Up
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modern Account Wizard Modal */}
      <AnimatePresence>
        {isWizardOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="card" 
              style={{ width: '100%', maxWidth: '550px', position: 'relative', padding: '2rem' }}
            >
              <button 
                onClick={() => setIsWizardOpen(false)} 
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
              
              <h2 style={{ marginBottom: '0.25rem' }}>Account Application</h2>
              <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '0.875rem' }}>Step {wizardStep} of 3</p>

              {/* Wizard Step 1: Account Type */}
              {wizardStep === 1 && (
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                  <h3 style={{ marginBottom: '1rem' }}>Select Account Tier</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div 
                      onClick={() => setNewAccType('Savings')} 
                      style={{ padding: '1.5rem', border: `2px solid ${newAccType === 'Savings' ? 'var(--color-accent)' : 'var(--color-border)'}`, borderRadius: '8px', cursor: 'pointer', background: newAccType === 'Savings' ? 'rgba(212,175,55,0.05)' : 'transparent', display: 'flex', alignItems: 'center', gap: '1.5rem' }}
                    >
                      <PiggyBank size={32} color={newAccType === 'Savings' ? 'var(--color-accent)' : 'var(--color-text-muted)'} />
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem 0' }}>High-Yield Savings</h4>
                        <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>Earn 4.5% APY compounded daily.</p>
                      </div>
                    </div>

                    <div 
                      onClick={() => setNewAccType('Checking')} 
                      style={{ padding: '1.5rem', border: `2px solid ${newAccType === 'Checking' ? 'var(--color-accent)' : 'var(--color-border)'}`, borderRadius: '8px', cursor: 'pointer', background: newAccType === 'Checking' ? 'rgba(212,175,55,0.05)' : 'transparent', display: 'flex', alignItems: 'center', gap: '1.5rem' }}
                    >
                      <Landmark size={32} color={newAccType === 'Checking' ? 'var(--color-accent)' : 'var(--color-text-muted)'} />
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem 0' }}>Standard Checking</h4>
                        <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>For daily expenses with 0% APY and no hidden fees.</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={nextStep} className="btn-primary" style={{ width: '100%', marginTop: '2rem' }}>Proceed</button>
                </motion.div>
              )}

              {/* Wizard Step 2: Terms & Agreements */}
              {wizardStep === 2 && (
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                  <h3 style={{ marginBottom: '1rem' }}>Regulatory Compliance</h3>
                  <div style={{ background: 'var(--color-primary)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem', height: '200px', overflowY: 'auto', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    <p><strong>1. Account Agreements</strong></p>
                    <p>By opening this account, you agree to comply with all State and Federal anti-money laundering regulations. You certify that the funds deposited are legally obtained and not subject to international sanctions.</p>
                    <p><strong>2. Limitations</strong></p>
                    <p>High-Yield Savings accounts are limited to precisely 6 outbound withdrawals per calendar month. Standard Checking accounts carry zero withdrawal constraints.</p>
                  </div>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '2rem' }}>
                    <input 
                      type="checkbox" 
                      checked={agreedToTerms} 
                      onChange={e => setAgreedToTerms(e.target.checked)} 
                      style={{ width: '18px', height: '18px', accentColor: 'var(--color-accent)' }} 
                    />
                    <span style={{ fontSize: '0.875rem' }}>I have read and legally bind myself to these Terms.</span>
                  </label>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={prevStep} className="btn-primary" style={{ flex: 1, background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', boxShadow: 'none' }}>Back</button>
                    <button onClick={nextStep} className="btn-primary" style={{ flex: 1 }} disabled={!agreedToTerms}>Acknowledge</button>
                  </div>
                </motion.div>
              )}

              {/* Wizard Step 3: Funding */}
              {wizardStep === 3 && (
                <form onSubmit={createAccount}>
                  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                    <h3 style={{ marginBottom: '1rem' }}>Initial Funding</h3>
                    <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                      To initialize your {newAccType} account, you must fund it with a minimum deposit of ₹1,000 from an external linked source.
                    </p>
                    <div className="form-group">
                      <label>Deposit Amount (₹)</label>
                      <input 
                        type="number" 
                        className="input-field" 
                        placeholder="5000"
                        min="1000"
                        value={initialDeposit} 
                        onChange={e => setInitialDeposit(e.target.value)} 
                        required 
                        style={{ fontSize: '1.25rem', padding: '1rem' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                      <button type="button" onClick={prevStep} className="btn-primary" style={{ flex: 1, background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', boxShadow: 'none' }} disabled={accCreating}>Back</button>
                      <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={accCreating}>
                        {accCreating ? 'Processing Wire...' : 'Initialize Account'}
                      </button>
                    </div>
                  </motion.div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top Up Deposit Modal */}
      <AnimatePresence>
        {showDepositModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="card" 
              style={{ width: '100%', maxWidth: '400px', position: 'relative', padding: '2rem' }}
            >
              <button 
                onClick={() => setShowDepositModal(false)} 
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
              
              <h2 style={{ marginBottom: '0.25rem' }}>Top Up Account</h2>
              <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '0.875rem' }}>Simulate pulling funds from an external bank.</p>

              <form onSubmit={handleDeposit}>
                <div className="form-group">
                  <label>Deposit Amount (₹)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    placeholder="Enter amount"
                    min="1"
                    value={depositAmount} 
                    onChange={e => setDepositAmount(e.target.value)} 
                    required 
                    style={{ fontSize: '1.25rem', padding: '1rem' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isDepositing}>
                    {isDepositing ? 'Processing...' : 'Confirm Deposit'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
