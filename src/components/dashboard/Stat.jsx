import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import './Dashboard.css';

ChartJS.register(...registerables);

function Stat() {
  const [coinList, setCoinList] = useState([]);
  const [currencyList, setCurrencyList] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState({ value: 'bitcoin', label: 'Bitcoin (BTC)' });
  const [selectedCurrency, setSelectedCurrency] = useState({ value: 'usd', label: 'USD' });
  const [selectedTimeRange, setSelectedTimeRange] = useState('7');
  const [priceHistory, setPriceHistory] = useState([]);
  const [convertedPrice, setConvertedPrice] = useState(null);
  const [conversionError, setConversionError] = useState(null);

  // Fetch coin list
  useEffect(() => {
    axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 250,
        page: 1,
      }
    })
    .then(response => {
      const formatted = response.data.map(coin => ({
        value: coin.id,
        label: `${coin.name} (${coin.symbol.toUpperCase()})`,
      }));
      const missingTokens = [
        { value: 'blurt', label: 'Blurt (BLURT)' },
        { value: 'steem', label: 'Steemit (STEEM)' },
        { value: 'hive', label: 'Hive (HIVE)' },
      ];
      setCoinList([...formatted, ...missingTokens]);
    })
    .catch(error => console.error("Error fetching coins:", error));
  }, []);

  // Fetch currency list
  useEffect(() => {
    axios.get('https://api.coingecko.com/api/v3/simple/supported_vs_currencies')
      .then(response => {
        const options = response.data.map(curr => ({
          value: curr,
          label: curr.toUpperCase(),
        }));
        setCurrencyList(options);
      })
      .catch(error => console.error("Error fetching fiat currencies:", error));
  }, []);

  // Fetch price history
  useEffect(() => {
    if (!selectedCoin?.value || !selectedTimeRange) return;

    axios.get(`https://api.coingecko.com/api/v3/coins/${selectedCoin.value}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: selectedTimeRange,
      }
    })
    .then(response => {
      const data = response.data.prices.map(item => ({
        x: new Date(item[0]),
        y: item[1],
      }));
      setPriceHistory(data);
    })
    .catch(error => console.error("Error fetching historical data: ", error));
  }, [selectedCoin, selectedTimeRange]);

  // Fetch live price in selected currency (only CoinGecko)
  useEffect(() => {
    if (!selectedCoin?.value || !selectedCurrency?.value) return;

    const fetchPrice = async () => {
      try {
        const res = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
          params: {
            ids: selectedCoin.value,
            vs_currencies: selectedCurrency.value,
          }
        });

        const price = res.data[selectedCoin.value]?.[selectedCurrency.value];
        if (price == null) {
          setConversionError(`Conversion data unavailable for ${selectedCurrency.label}`);
          setConvertedPrice(null);
        } else {
          setConvertedPrice(price);
          setConversionError(null);
        }
      } catch (err) {
        console.error("Error during conversion:", err);
        setConversionError("An error occurred while fetching conversion data.");
        setConvertedPrice(null);
      }
    };

    fetchPrice();
  }, [selectedCoin, selectedCurrency]);

  // Chart config
  const chartData = {
    datasets: [
      {
        label: `${selectedCoin.label} Price (USD)`,
        data: priceHistory,
        borderColor: 'rgba(0, 123, 255, 1)',
        backgroundColor: 'rgba(0, 123, 255, 0.3)',
        fill: true,
        borderWidth: 2,
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        mode: 'nearest',
        intersect: false,
        callbacks: {
          label: function (tooltipItem) {
            const date = tooltipItem.raw.x;
            const price = tooltipItem.raw.y;
            return `Price: ${price.toFixed(2)} USD on ${date.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'PPpp',
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Price (USD)',
        },
        ticks: {
          beginAtZero: false,
        },
      },
    },
  };

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: '#333',
      borderColor: '#555',
      color: '#fff',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: '#333',
      color: '#fff',
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isFocused ? '#555' : isSelected ? '#444' : '#333',
      color: '#fff',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#fff',
    }),
    input: (base) => ({
      ...base,
      color: '#fff',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#aaa',
    }),
  };

  return (
    <div className="dashboard-container1">
      <h1 className="dashboard-title">Crypto Exchange Dashboard</h1>

      <div className="select-section">
        <div className="select-box">
          <label>Select Cryptocurrency</label>
          <Select
            options={coinList}
            value={selectedCoin}
            onChange={setSelectedCoin}
            placeholder="Choose coin..."
            isSearchable
            styles={customSelectStyles}
          />
        </div>

        <div className="select-box">
          <label>Select Currency</label>
          <Select
            options={currencyList}
            value={selectedCurrency}
            onChange={setSelectedCurrency}
            placeholder="Choose currency..."
            isSearchable
            styles={customSelectStyles}
          />
        </div>

        <div className="select-box">
          <label>Select Time Range</label>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="dropdown"
          >
            <option value="1">1 Day</option>
            <option value="7">7 Days</option>
            <option value="30">30 Days</option>
            <option value="90">90 Days</option>
            <option value="365">1 Year</option>
            <option value="max">Max</option>
          </select>
        </div>
      </div>

      <div className="price-display">
        <h2>{selectedCoin.label} in {selectedCurrency.label}</h2>
        {conversionError ? (
          <p style={{ color: 'red' }}>{conversionError}</p>
        ) : convertedPrice !== null ? (
          <p>
            1 {selectedCoin.label.split(' ')[0]} = {convertedPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} {selectedCurrency.label}
          </p>
        ) : (
          <p>Loading conversion data...</p>
        )}
      </div>

      <div className="chart-container">
        {priceHistory.length > 0 ? (
          <Chart type="line" data={chartData} options={chartOptions} />
        ) : (
          <p>Loading chart...</p>
        )}
      </div>
    </div>
  );
}

export default Stat;
