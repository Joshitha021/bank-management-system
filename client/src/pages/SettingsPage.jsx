import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { User, Bell, Shield, Moon, Sun, Camera } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [statusMsg, setStatusMsg] = useState('');

  // Notifications State
  const [emailAlerts, setEmailAlerts] = useState(user?.notificationsEnabled !== false);
  
  // Appearance
  const [theme, setTheme] = useState(user?.theme || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [theme]);

  const handleProfileSave = async () => {
    setStatusMsg('Saving...');
    try {
      const res = await axios.put('http://localhost:5000/api/auth/profile', { name, phone, avatar });
      updateUser(res.data.user);
      setStatusMsg('Profile updated successfully!');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      setStatusMsg('Failed to update profile.');
    }
  };

  const handleNotificationSave = async () => {
    setStatusMsg('Saving preferences...');
    try {
      const res = await axios.put('http://localhost:5000/api/auth/profile', { notificationsEnabled: emailAlerts });
      updateUser(res.data.user);
      setStatusMsg('Preferences updated!');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      setStatusMsg('Failed to update.');
    }
  };

  const toggleTheme = async (mode) => {
    setTheme(mode);
    try {
      const res = await axios.put('http://localhost:5000/api/auth/profile', { theme: mode });
      updateUser(res.data.user);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Settings</h1>
        <p className="text-muted">Manage your profile, security, and preferences.</p>
        {statusMsg && <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'var(--color-primary-light)', color: 'var(--color-accent)', borderRadius: '4px', display: 'inline-block' }}>{statusMsg}</div>}
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Settings Sidebar */}
        <div style={{ flex: '1 1 250px', maxWidth: '300px' }}>
          <div className="card" style={{ padding: '1rem' }}>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>
                <button onClick={() => setActiveTab('profile')} style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', background: activeTab === 'profile' ? 'var(--color-primary-light)' : 'transparent', color: activeTab === 'profile' ? 'var(--color-text-main)' : 'var(--color-text-muted)', border: 'none', cursor: 'pointer' }}>
                  <User size={18} /> Profile
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('security')} style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', background: activeTab === 'security' ? 'var(--color-primary-light)' : 'transparent', color: activeTab === 'security' ? 'var(--color-text-main)' : 'var(--color-text-muted)', border: 'none', cursor: 'pointer' }}>
                  <Shield size={18} /> Security
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('notifications')} style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', background: activeTab === 'notifications' ? 'var(--color-primary-light)' : 'transparent', color: activeTab === 'notifications' ? 'var(--color-text-main)' : 'var(--color-text-muted)', border: 'none', cursor: 'pointer' }}>
                  <Bell size={18} /> Notifications
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('appearance')} style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', background: activeTab === 'appearance' ? 'var(--color-primary-light)' : 'transparent', color: activeTab === 'appearance' ? 'var(--color-text-main)' : 'var(--color-text-muted)', border: 'none', cursor: 'pointer' }}>
                  <Moon size={18} /> Appearance
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Settings Content */}
        <div style={{ flex: '3 1 500px' }}>
          <div className="card">
            
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h3 style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>Profile Information</h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#1a2332', fontWeight: 'bold', overflow: 'hidden' }}>
                    {avatar ? <img src={avatar} alt="avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}}/> : (user?.name?.charAt(0) || 'U')}
                  </div>
                  <label className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Camera size={16} /> Upload New Avatar
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                  </label>
                </div>

                <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '400px' }}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" className="input-field" value={user?.email || ''} disabled style={{ opacity: 0.7 }} />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" className="input-field" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
                  </div>
                  <button type="button" onClick={handleProfileSave} className="btn-primary" style={{ marginTop: '1rem', width: 'fit-content' }}>Save Changes</button>
                </form>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h3 style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>Change Password</h3>
                <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '400px' }}>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input type="password" className="input-field" />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input type="password" className="input-field" />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input type="password" className="input-field" />
                  </div>
                  <button type="button" className="btn-primary" style={{ marginTop: '1rem', width: 'fit-content', opacity: 0.5 }}>Update Password (Coming soon)</button>
                </form>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h3 style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>Notification Preferences</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={emailAlerts} onChange={e => setEmailAlerts(e.target.checked)} style={{ accentColor: 'var(--color-accent)', width: '1.2rem', height: '1.2rem' }} />
                    <div>
                      <div style={{ fontWeight: 500 }}>Email Alerts</div>
                      <div className="text-muted" style={{ fontSize: '0.875rem' }}>Receive daily summaries of your account activity.</div>
                    </div>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', opacity: 0.5 }}>
                    <input type="checkbox" disabled defaultChecked style={{ accentColor: 'var(--color-accent)', width: '1.2rem', height: '1.2rem' }} />
                    <div>
                      <div style={{ fontWeight: 500 }}>Security Alerts</div>
                      <div className="text-muted" style={{ fontSize: '0.875rem' }}>Required alerts for new logins and password changes.</div>
                    </div>
                  </label>
                </div>
                <button type="button" onClick={handleNotificationSave} className="btn-primary" style={{ marginTop: '2rem' }}>Save Preferences</button>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h3 style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>Theme Settings</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div onClick={() => toggleTheme('dark')} style={{ padding: '1rem 2rem', border: theme === 'dark' ? '2px solid var(--color-accent)' : '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: theme === 'dark' ? 'var(--color-primary-light)' : 'transparent' }}>
                    <Moon size={24} color={theme === 'dark' ? "var(--color-accent)" : "currentColor"} />
                    <span style={{ fontWeight: 600 }}>Dark Mode</span>
                  </div>
                  <div onClick={() => toggleTheme('light')} style={{ padding: '1rem 2rem', border: theme === 'light' ? '2px solid var(--color-accent)' : '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: theme === 'light' ? 'var(--color-primary-light)' : 'transparent' }}>
                    <Sun size={24} color={theme === 'light' ? "var(--color-accent)" : "currentColor"} />
                    <span style={{ fontWeight: 600 }}>Light Mode</span>
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        </div>

      </div>
    </motion.div>
  );
}
