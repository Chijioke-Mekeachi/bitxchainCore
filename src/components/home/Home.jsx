import React, { useState } from 'react'
import '../home/home.css'
import blurt from '../../assets/blurt.png'
import anonymus from '../../assets/Anonymous-Logo.png'
import tweeter from '../../assets/tweetericon.png'
import facebook from '../../assets/facebook.png'
import { FaBars } from 'react-icons/fa'
import icon2 from '../../assets/icon2.png'
import { useNavigate } from 'react-router-dom'

export const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const signinscreen = () => {
    navigate("/signup");
  }

  return (
    <div className='container1'>
      <div className="header1">
        <nav className="navbar1">
          <div className="icon">
            <img src={icon2} alt="icon-png" width={100} />
          </div>
          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <FaBars />
          </button>
          <ul className={`nav-list1 ${menuOpen ? 'open' : ''}`}>
            <button className="nav-item1">Home</button>
            <button className="nav-item1" onClick={signinscreen}>Sign-up/Sign-in</button>
            <button className="nav-item1">Contact Us</button>
            <button className="nav-item1">Buy me coffee</button>
          </ul>
        </nav>
      </div>

      <div className="home-container">
        <section className="hero">
          <h2>Welcome to bitXchain</h2>
          <p>Discover amazing things, start here</p>
        </section>

        <section className="about">
          <h2>About Us</h2>
          <p>We an exchange platform blah blah blah you know the gist...</p>
        </section>

        <section className="featured">
          <h2>Partners</h2>
          <div className="products">
            <div className="product-card">
              <img src={blurt} alt="Blurt" className='blurt' />
              <h3>Promo Blurt</h3>
              <p>Blog and Get paid, with the Blurt Token</p>
            </div>
            <div className="product-card">
              <img src={anonymus} alt="Anonymus" />
              <h3>Anonymus Net</h3>
              <p>We are anonymus, We never forgive, we never forget, expect us!</p>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="contact-info">
            <p>Email: No data yet</p>
          </div>
          <div className="social-media">
            <a href="https://facebook.com" target="_blank"><img src={facebook} alt="Facebook" width={50} /></a>
            <a href="https://x.com/promoblurt" target="_blank"><img src={tweeter} alt="Twitter" width={50} /></a>
          </div>
          <p>&copy; 2025 Powered by Anonymus Net</p>
        </footer>
      </div>
    </div>
  )
}
