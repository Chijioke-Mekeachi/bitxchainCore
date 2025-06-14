// src/components/Buy.jsx
import React, { useState } from 'react';
import '../../styles/Buy.css'; // Vite will handle this correctly

export default function Buy(){
  const [activeTab, setActiveTab] = useState('profile');
  const [blurtUser, setBlurtUser] = useState('');
  const [pin, setPin] = useState('');
  const [amount, setAmount] = useState(0);
  const [showBankTransferModal, setShowBankTransferModal] = useState(false);

  const handleTabChange = (tab) => setActiveTab(tab);

  const handleAmountChange = (e) => {
    const inputValue = e.target.value;
    if (/^\d*\.?\d*$/.test(inputValue)) {
      setAmount(inputValue);
    }
  };

  const openModal = () => setShowBankTransferModal(true);

  const closeModal = () => {
    setBlurtUser('');
    setPin('');
    setAmount(0);
    setShowBankTransferModal(false);
  };

  return (
    <div>
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => handleTabChange('profile')}
        >
          Buy coin
        </button>
        <button
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => handleTabChange('settings')}
        >
          Sell coin
        </button>
      </div>

      <div className="body-side">
        {activeTab === 'profile' ? (
          <div className="buy-side">
            <div className="container">
              <div className="headerContainer">
                <h1 className="dat">Payment Options</h1>
              </div>
              <div className="cont-buy-sell">
                <div className="buttons">
                  <button className="PayList" onClick={openModal}>Bank Transfer</button>
                  <button className="PayList">Card <span className="coming">Coming Soon</span></button>
                  <button className="PayList">P2P <span className="coming">Coming Soon</span></button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="sell-side">
            <div className="container">
              <div className="cont-buy-sell">
                <input
                  type="number"
                  className="textinput"
                  onChange={handleAmountChange}
                  placeholder="Amount"
                  inputMode="numeric"
                />
                <input
                  type="text"
                  className="textinput"
                  onChange={(e) => setBlurtUser(e.target.value)}
                  placeholder="Account Number"
                  inputMode="numeric"
                />
                <input
                  type="password"
                  className="textinput"
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Pin"
                  inputMode="numeric"
                />
              </div>
              <div className="btn-container">
                <button type="button" className="purchase-btn">Sell</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showBankTransferModal && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-button" onClick={closeModal}>×</button>
            <h2>Bank Transfer Details</h2>
            <input
              type="number"
              className="textinput"
              onChange={handleAmountChange}
              placeholder="Amount"
              inputMode="numeric"
            />
            <input
              type="text"
              className="textinput"
              onChange={(e) => setBlurtUser(e.target.value)}
              placeholder="Account Number"
              inputMode="numeric"
            />
            <input
              type="password"
              className="textinput"
              onChange={(e) => setPin(e.target.value)}
              placeholder="Pin"
              inputMode="numeric"
            />
            <button className="purchase-btn">Proceed</button>
          </div>
        </div>
      )}
    </div>
  );
};
