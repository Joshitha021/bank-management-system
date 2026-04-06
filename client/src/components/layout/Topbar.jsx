import { Bell, Search, User } from 'lucide-react';
import './Layout.css';

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="search-bar">
        <Search size={18} className="text-muted" />
        <input type="text" placeholder="Search transactions, accounts..." />
      </div>

      <div className="topbar-actions">
        <button className="icon-btn">
          <Bell size={20} />
          <span className="badge">3</span>
        </button>
        
        <div className="user-profile">
          <div className="avatar">
            <User size={20} />
          </div>
          <div className="user-info">
            <p className="user-name">Demo User</p>
            <p className="user-role">Premium Member</p>
          </div>
        </div>
      </div>
    </header>
  );
}
