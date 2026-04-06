import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, FileText, CheckCircle } from 'lucide-react';

export default function LoansPage() {
  const [amount, setAmount] = useState(10000);
  const [interest, setInterest] = useState(5.5);
  const [tenure, setTenure] = useState(12);

  // EMI Formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
  const calculateEMI = () => {
    const p = amount;
    const r = interest / 12 / 100;
    const n = tenure;
    if (r === 0) return p / n;
    return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  const emi = calculateEMI();
  const totalPayment = emi * tenure;
  const totalInterest = totalPayment - amount;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Loans & EMI Calculator</h1>
        <p className="text-muted">Manage your active loans and calculate potential borrowing costs.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem' }}>
        
        {/* Active Loans Overview */}
        <div style={{ gridColumn: 'span 12', '@media(min-width: 1024px)': { gridColumn: 'span 6' } }}>
          <div className="card" style={{ height: '100%', minHeight: '300px' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} color="var(--color-accent)"/> Active Loans
            </h3>
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <CheckCircle size={48} className="text-muted" style={{ margin: '0 auto 1rem' }} />
              <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>No Active Loans</p>
              <p className="text-muted">You currently do not have any active loans or pending applications.</p>
              <button className="btn-primary" style={{ marginTop: '1.5rem' }}>Apply for a Loan</button>
            </div>
          </div>
        </div>

        {/* EMI Calculator */}
        <div style={{ gridColumn: 'span 12', '@media(min-width: 1024px)': { gridColumn: 'span 6' } }}>
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calculator size={20} color="var(--color-accent)"/> EMI Calculator
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>Loan Amount ($)</label>
                  <span>${amount.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="1000" 
                  max="100000" 
                  step="1000"
                  value={amount} 
                  onChange={e => setAmount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-accent)' }}
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>Interest Rate (% p.a.)</label>
                  <span>{interest}%</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  step="0.1"
                  value={interest} 
                  onChange={e => setInterest(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-accent)' }}
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>Tenure (Months)</label>
                  <span>{tenure} Months</span>
                </div>
                <input 
                  type="range" 
                  min="6" 
                  max="60" 
                  step="6"
                  value={tenure} 
                  onChange={e => setTenure(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-accent)' }}
                />
              </div>

              <div style={{ marginTop: '1rem', padding: '1.5rem', background: 'rgba(212,175,55,0.05)', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div className="text-muted" style={{ fontSize: '0.875rem' }}>Monthly EMI</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                    ${emi.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Total Interest</div>
                    <div style={{ fontWeight: 600 }}>${totalInterest.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1, borderLeft: '1px solid var(--color-border)' }}>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Total Payment</div>
                    <div style={{ fontWeight: 600 }}>${totalPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
