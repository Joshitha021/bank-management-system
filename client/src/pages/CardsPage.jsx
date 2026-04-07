import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Plus, CreditCard as CardIcon, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import '../styles/cards.css';

export default function CardsPage() {
  const [cards, setCards] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flipped, setFlipped] = useState({});
  const [showNumbers, setShowNumbers] = useState({});

  useEffect(() => {
    fetchCardsAndAccounts();
  }, []);

  const fetchCardsAndAccounts = async () => {
    try {
      const [cardsRes, accsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/cards'),
        axios.get('http://localhost:5000/api/accounts')
      ]);
      setCards(cardsRes.data.cards);
      setAccounts(accsRes.data.accounts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultCard = async () => {
    if (accounts.length === 0) {
      alert("You need an active account before creating a card.");
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/cards', { 
        accountId: accounts[0]._id, 
        type: 'Virtual' 
      });
      fetchCardsAndAccounts();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFreeze = async (cardId) => {
    try {
      await axios.put(`http://localhost:5000/api/cards/${cardId}/toggle`);
      setCards(cards.map(c => c._id === cardId ? { ...c, status: c.status === 'Active' ? 'Frozen' : 'Active' } : c));
    } catch (err) {
      console.error(err);
    }
  };

  const flipCard = (id) => {
    setFlipped(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleNumberVisibility = (e, id) => {
    e.stopPropagation(); // prevent flipping
    setShowNumbers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatCardNumber = (number, isVisible) => {
    if (isVisible) {
      return number.replace(/(.{4})/g, '$1 ').trim();
    }
    return `**** **** **** ${number.slice(-4)}`;
  };

  if (loading) return <div>Loading cards...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Card Management</h1>
          <p className="text-muted">Manage your virtual and physical cards.</p>
        </div>
        <button onClick={createDefaultCard} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Get New Card
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <CardIcon size={48} className="text-muted" style={{ margin: '0 auto 1rem' }} />
          <h3>No Cards Yet</h3>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Request a virtual card to start making online payments.</p>
          <button onClick={createDefaultCard} className="btn-primary">Generate Virtual Card</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
          {cards.map((card, i) => (
            <motion.div 
              key={card._id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.15 }}
              style={{ flex: '1 1 340px', maxWidth: '400px' }}
            >
              {/* 3D Flip Container */}
              <div className={`flip-card-perspective ${card.status === 'Frozen' ? 'frozen' : ''}`}>
                <div className={`flip-card-inner ${flipped[card._id] ? 'is-flipped' : ''}`} onClick={() => flipCard(card._id)}>
                  
                  {/* FRONT */}
                  <div className="flip-card-front">
                    <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'var(--color-accent)', opacity: 0.1, borderRadius: '50%' }}></div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="virtual-badge">{card.type}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button 
                          onClick={(e) => toggleNumberVisibility(e, card._id)} 
                          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.25rem', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          {showNumbers[card._id] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <h3 style={{ fontStyle: 'italic', margin: 0 }}>Visa</h3>
                      </div>
                    </div>

                    <div className="card-number" style={{ margin: '1.5rem 0', fontFamily: 'monospace' }}>
                      {formatCardNumber(card.cardNumber, showNumbers[card._id])}
                    </div>

                    <div className="card-footer">
                      <div>
                        <div className="card-holder-label">Card Holder</div>
                        <div style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{card.cardHolder}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="card-holder-label">Expires</div>
                        <div>{card.expiryDate}</div>
                      </div>
                    </div>
                  </div>

                  {/* BACK */}
                  <div className="flip-card-back">
                    <div className="magnetic-strip"></div>
                    <div className="card-cvv-strip">
                      {showNumbers[card._id] ? card.cvv : '***'}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Use this card for secure online transactions. If lost, freeze it from the dashboard below immediately.
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Card Controls placed below the 3D element */}
              <div className="card" style={{ padding: '1rem 1.5rem', marginTop: '-1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Daily Limit</div>
                    <div style={{ fontWeight: 'bold' }}>₹{card.limit.toLocaleString()}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="icon-btn" 
                      onClick={() => toggleFreeze(card._id)}
                      title={card.status === 'Active' ? 'Freeze Card' : 'Unfreeze Card'}
                      style={{ 
                        background: card.status === 'Active' ? 'var(--color-primary-light)' : 'rgba(239, 68, 68, 0.2)',
                        color: card.status === 'Active' ? 'var(--color-text-main)' : 'var(--color-danger)',
                        padding: '0.5rem', borderRadius: '8px' 
                      }}
                    >
                      {card.status === 'Active' ? <Unlock size={18} /> : <Lock size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
