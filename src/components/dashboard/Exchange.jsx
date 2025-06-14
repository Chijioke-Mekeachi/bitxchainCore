import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import axios from 'axios';

export default function Exchange() {
  const [coins, setCoins] = useState([]);
  const [fromCoin, setFromCoin] = useState('blurt');
  const [toCoin, setToCoin] = useState('bitcoin');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [rate, setRate] = useState(0);
  const [loadingCoins, setLoadingCoins] = useState(true);

  // Fetch coins on load
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const res = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 100,
            page: 1,
            sparkline: false,
          },
        });

        const blurtCoin = {
          id: 'blurt',
          symbol: 'blurt',
          name: 'Blurt',
        };

        const coinsWithBlurt = [blurtCoin, ...res.data];
        setCoins(coinsWithBlurt);
      } catch (err) {
        console.error('Error fetching coin list:', err);
      } finally {
        setLoadingCoins(false);
      }
    };

    fetchCoins();
  }, []);

  // Fetch conversion rate
  useEffect(() => {
    const fetchRates = async () => {
      if (!fromCoin || !toCoin || fromCoin === toCoin || !fromAmount) return;

      try {
        const res1 = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
          params: { ids: fromCoin, vs_currencies: 'usd' },
        });

        const res2 = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
          params: { ids: toCoin, vs_currencies: 'usd' },
        });

        const fromRate = res1.data?.[fromCoin]?.usd;
        const toRate = res2.data?.[toCoin]?.usd;

        if (fromRate && toRate) {
          const conversionRate = fromRate / toRate;
          setRate(conversionRate);

          const converted = parseFloat(fromAmount) * conversionRate;
          setToAmount(converted.toFixed(6));
        }
      } catch (err) {
        console.error('Error fetching conversion rates:', err);
      }
    };

    fetchRates();
  }, [fromCoin, toCoin, fromAmount]);

  const handleFromAmountChange = (e) => {
    const value = e.target.value;
    setFromAmount(value);

    if (rate && !isNaN(value)) {
      const converted = parseFloat(value) * rate;
      setToAmount(converted.toFixed(6));
    } else {
      setToAmount('');
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Swap Coin</h1>

      <div className="swapCard">
        <div className="swapSection">
          <div className="topsect">
            <select value={fromCoin} onChange={(e) => setFromCoin(e.target.value)}>
              {loadingCoins ? (
                <option>Loading...</option>
              ) : (
                coins.map((coin) => (
                  <option key={coin.id} value={coin.id}>
                    {coin.name}
                  </option>
                ))
              )}
            </select>
            <input
              type="number"
              value={fromAmount}
              onChange={handleFromAmountChange}
              placeholder="Amount"
            />
          </div>
7
          <div className="downsect">
            <select value={toCoin} onChange={(e) => setToCoin(e.target.value)}>
              {loadingCoins ? (
                <option>Loading...</option>
              ) : (
                coins.map((coin) => (
                  <option key={coin.id} value={coin.id}>
                    {coin.name}
                  </option>
                ))
              )}
            </select>
            <input type="text" value={toAmount} readOnly placeholder="Converted amount" />
          </div>
        </div>
      </div>
    </div>
  );
}
