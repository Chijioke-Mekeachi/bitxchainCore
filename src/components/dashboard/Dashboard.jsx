import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { FaBars } from 'react-icons/fa';
import icon2 from '../../assets/icon2.png';
import Stat from '../dashboard/Stat';
import Profile from './Profile/Profile';
import Buy from '../dashboard/Buy';
import Wallet from './wallet/Wallet';
import { supabase } from '../../lib/supabase';
import Blog from './blog/Blog';

export default function Dashboard() {
  const [username, setUsername] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState(false);
  const [buy, setBuy] = useState(false);
  const [wallet, setWallet] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [blog, setBlog] = useState(true);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('username')
          .eq('id', user.id)
          .single();

        if (data) {
          setUsername(data.username);
        } else {
          setUsername("Anonymous");
        }
      } else {
        setUsername("Guest");
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setIsLoggedIn(false);
    }, 1000);
  }, []);

  // Countdown logic
  useEffect(() => {
  const launchDate = new Date("2025-08-20T00:00:00"); // Set testnet date

  const updateCountdown = () => {
    const now = new Date();
    const timeDiff = launchDate - now;
    const days = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
    setDaysLeft(days);
  };

  updateCountdown(); // initial call
  const interval = setInterval(updateCountdown, 1000 * 60 * 60); // update every hour

  return () => clearInterval(interval);
}, []);


  const handle_stat = () => { setProfile(false); setBuy(false); setWallet(false); setMenuOpen(false); setBlog(false); };
  const handle_profile = () => { setProfile(true); setBuy(false); setWallet(false); setMenuOpen(false); setBlog(false); };
  const handle_wallet = () => { setProfile(false); setBuy(false); setWallet(true); setMenuOpen(false); setBlog(false); };
  const handle_blog = () => { setProfile(false); setBuy(false); setWallet(false); setMenuOpen(false); setBlog(true); };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="icon">
          <img src={icon2} alt="icon" width={100} />
        </div>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <FaBars />
        </button>
        <ul className={`nav-list ${menuOpen ? 'open' : ''}`}>
          <button className="nav-item" onClick={handle_stat}>Home</button>
          <button className="nav-item" onClick={handle_blog}>Blog</button>
          <button className="nav-item" onClick={handle_profile}>Profile</button>
          <button className="nav-item" onClick={handle_wallet}>Wallet</button>
        </ul>
      </nav>

      <div>
        {isLoggedIn ? (
          <div className="message show">
            Hello {username}
          </div>
        ) : (
          <div className="nothing"></div>
        )}
      </div>

      {/* ✅ Countdown Display */}
      <div style={{ textAlign: 'center', marginTop: '10px', color: '#00ffcc', fontFamily: 'Orbitron, sans-serif', fontSize: '18px' }}>
        🚀 Testnet launches in <strong>{daysLeft}</strong> day{daysLeft !== 1 ? 's' : ''}!
      </div>

      <div className="body">
        {profile ? <Profile /> :
          wallet ? <Wallet /> :
            buy ? <Buy /> :
              blog ? <Blog /> :
                <Stat />}
      </div>
    </div>
  );
}
