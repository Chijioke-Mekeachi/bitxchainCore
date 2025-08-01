import React, { useState } from 'react';
import '../../styles/login.css';
import key from '../../assets/key.svg';
import emailIcon from '../../assets/email.svg';
import icon2 from '../../assets/icon2.png';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase'; // Adjust path as needed

export const LoginPage = () => {
  const [show, setShow] = useState("password");
  const [toggle, setToggle] = useState("show");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleShowHide = () => {
    setShow(prev => (prev === "text" ? "password" : "text"));
    setToggle(prev => (prev === "show" ? "hide" : "show"));
  };

  const showTempMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      return showTempMessage("Please enter your email and password.", 'error');
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      const user = data.user;
      const session = data.session;

      // Store in localStorage
      localStorage.setItem('userProfile', JSON.stringify(user));
      localStorage.setItem('authToken', session?.access_token);

      showTempMessage("Login successful!", 'success');

      // Optional: fetch profile data from 'users' table
      // const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();

      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      showTempMessage(err.message || "Login failed.", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container'>
      <div className="logo">
        <img src={icon2} alt="icon" width={150} />
      </div>

      <div className="header">
        <div className="text">Login</div>
        <div className="underline"></div>
      </div>

      <div className="inputs">
        <div className="input">
          <img src={emailIcon} alt="email icon" />
          <input
            type="email"
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input">
          <img src={key} alt="key icon" />
          <input
            type={show}
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="button" onClick={handleShowHide} className='pas-btn'>{toggle}</button>
        </div>
      </div>

      <div className="forgot-password">
        Don't have an account?{" "}
        <span onClick={() => navigate('/signup')} style={{ color: 'blue', cursor: 'pointer' }}>
          Sign up
        </span>
      </div>
      <div className="forgot-password">
        Forgot Password{' '}
        <span onClick={() => navigate('/forgot')} style={{ color: 'blue', cursor: 'pointer' }}>
          Reset
        </span>
      </div>

      <div className="button-container">
        <button className="submit" onClick={handleLogin} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>

      <div className={`message ${messageType} ${message ? 'show' : ''}`}>
        {message}
      </div>
    </div>
  );
};
