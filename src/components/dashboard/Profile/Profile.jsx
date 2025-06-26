import React, { useEffect, useState } from 'react';
import './Profile.css';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedProfile = localStorage.getItem('userProfile');
    if (!storedProfile) {
      navigate('/signin');
    } else {
      setUserData(JSON.parse(storedProfile));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userProfile');
    navigate('/signin');
  };

  return (
    <div className="profile-container">
      <div className="tabs">
        <button className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</button>
        <button className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Settings</button>
      </div>

      <div className="tab-content">
        {activeTab === 'profile' ? (
          <div className="profile-section">
            <h2 className="section-title">Profile</h2>
            <div className="profile-info">
              <div className="profile-item"><span className="label">Username:</span><span className="value">{userData?.username || '...'}</span></div>
              <div className="profile-item"><span className="label">Email:</span><span className="value">{userData?.email || '...'}</span></div>
              <div className="profile-item"><span className="label">Bio:</span><span className="value">Random Hacker.</span></div>
            </div>
          </div>
        ) : (
          <div className="settings-section">
            <h2 className="section-title">Settings</h2>
            <div className="settings-item">
              <button className="select">Change Password</button>
            </div>
            <div className="settings-item">
              <button className="select" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
