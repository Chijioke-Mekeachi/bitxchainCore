import React, { useState } from 'react';
import './signup.css';
import userIcon from '../../assets/key.svg';
import keyIcon from '../../assets/key.svg';
import emailIcon from '../../assets/email.svg';
import icon2 from '../../assets/icon2.png';
import { useNavigate } from 'react-router-dom';

export const Signup = () => {
  const [show, setShow] = useState("password");
  const [toggleLabel, setToggleLabel] = useState("show");

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [busername, setBusername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleShowHide = () => {
    setShow(prev => (prev === "text" ? "password" : "text"));
    setToggleLabel(prev => (prev === "show" ? "hide" : "show"));
  };

  const validateEmail = (email) =>
    /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,6}$/.test(email);

  const validatePassword = (password) =>
    /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/.test(password);

  const handleSubmit = async () => {
    setError('');

    if (!username || !busername || !email || !password) {
      return setError("Please fill in all fields.");
    }

    if (!validateEmail(email)) {
      return setError("Please enter a valid email.");
    }

    if (!validatePassword(password)) {
      return setError("Password must be at least 8 characters and include a number and a special character.");
    }

    try {
      setLoading(true);
      const response = await fetch("https://bitapi-0m8c.onrender.com/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, username, busername }),
      });

      const data = await response.json();

      if (!response.ok) {
        return setError(data.message || "Signup failed.");
      }

      alert("Account created successfully!");
      setUsername('');
      setEmail('');
      setPassword('');
      setBusername('');
      navigate('/dashboard');
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goToSignIn = () => navigate('/signin');

  return (
    <div className='container'>
      <div className="logo"><img src={icon2} alt="icon" width={150} /></div>
      <div className="header">
        <div className="text">Sign Up</div>
        <div className="underline"></div>
      </div>
      <div className="inputs">
        <div className="input">
          <img src={userIcon} alt="icon" />
          <input
            type="text"
            placeholder='Username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="input">
          <img src={userIcon} alt="icon" />
          <input
            type="text"
            placeholder='Blurt Username'
            value={busername}
            onChange={(e) => setBusername(e.target.value)}
          />
        </div>
        <div className="input">
          <img src={emailIcon} alt="icon" />
          <input
            type="email"
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input">
          <img src={keyIcon} alt="icon" />
          <input
            type={show}
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="button" onClick={handleShowHide} className='pas-btn'>{toggleLabel}</button>
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="forgot-password">
        Already Have an Account? <span onClick={goToSignIn} className="signin-link">Sign in</span>
      </div>
      <div className="button-container">
        <div className="submit" onClick={!loading ? handleSubmit : null}>
          {loading ? "Creating Account..." : "Sign Up"}
        </div>
      </div>
    </div>
  );
};
