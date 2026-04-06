import { Bell, Search, User, Menu } from 'lucide-react';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Layout.css';

export default function Topbar({ toggleSidebar }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if(searchQuery.trim()) {
      alert(`Global search is coming in Phase 12! You searched for: ${searchQuery}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-btn mobile-menu-btn" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <form className="search-bar" onSubmit={handleSearch}>
          <Search size={18} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search transactions, accounts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="topbar-actions">
        {/* We will route notifications to settings for now */}
        <button className="icon-btn" onClick={() => navigate('/settings')}>
          <Bell size={20} />
          {user?.notificationsEnabled && <span className="badge">1</span>}
        </button>
        
        <div className="user-profile" onClick={() => navigate('/settings')}>
          <div className="avatar" style={{ overflow: 'hidden', padding: 0 }}>
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{fontWeight: 'bold'}}>{user?.name?.charAt(0) || <User size={20} />}</div>
            )}
          </div>
          <div className="user-info">
            <p className="user-name">{user?.name || 'Loading...'}</p>
            <p className="user-role">{user?.role === 'Admin' ? 'Administrator' : 'Premium Member'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
