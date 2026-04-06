import { NavLink, useNavigate } from 'react-router-dom';
import { Home, CreditCard, Send, FileText, Settings, LogOut, Wallet, LayoutGrid } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './Layout.css';

export default function Sidebar() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: <LayoutGrid size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Wallet size={20} />, label: 'Accounts', path: '/accounts' },
    { icon: <Send size={20} />, label: 'Transactions', path: '/transactions' },
    { icon: <CreditCard size={20} />, label: 'Cards', path: '/cards' },
    { icon: <FileText size={20} />, label: 'Loans', path: '/loans' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🏦</div>
        <h2>BankHub</h2>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-bottom">
        <NavLink to="/settings" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
        <button onClick={handleLogout} className="nav-item btn-logout">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
