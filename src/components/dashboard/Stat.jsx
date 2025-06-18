import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import './Dashboard.css';

ChartJS.register(...registerables);

function Stat() {
  const selectedCoin = { value: 'blurt', label: 'Blurt (BLURT)' };
  const [selectedCurrency, setSelectedCurrency] = useState({ value: 'usd', label: 'USD' });
  const [selectedTimeRange, setSelectedTimeRange] = useState('7');
  const [priceHistory, setPriceHistory] = useState([]);
  const [convertedPrice, setConvertedPrice] = useState(null);
  const [conversionError, setConversionError] = useState(null);

  // Fetch historical data
  useEffect(() => {
    axios.get(`https://api.coingecko.com/api/v3/coins/${selectedCoin.value}/market_chart`, {
      params: {
        vs_currency: selectedCurrency.value,
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
  }, [selectedCurrency, selectedTimeRange]);

  // Fetch current price
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
          params: {
            ids: selectedCoin.value,
            vs_currencies: `${selectedCurrency.value}`,
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
  }, [selectedCurrency]);

  const chartData = {
    datasets: [
      {
        label: `Blurt (BLURT) Price in ${selectedCurrency.label}`,
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
            return `Price: ${price.toFixed(2)} ${selectedCurrency.label} on ${date.toLocaleString()}`;
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
          text: `Price (${selectedCurrency.label})`,
        },
        ticks: {
          beginAtZero: false,
        },
      },
    },
  };

  return (
    <div className="dashboard-container1">
      <h1 className="dashboard-title">Blurt (BLURT) Price Tracker</h1>

      <div className="select-section">
        <div className="select-box">
          <label>Select Currency</label>
          <select
            value={selectedCurrency.value}
            onChange={(e) => {
              const selected = e.target.value === 'usd'
                ? { value: 'usd', label: 'USD' }
                : { value: 'ngn', label: 'NGN' };
              setSelectedCurrency(selected);
            }}
            className="dropdown"
          >
            <option value="usd">USD</option>
            <option value="ngn">NGN</option>
          </select>
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
        <h2>1 BLURT in {selectedCurrency.label}</h2>
        {conversionError ? (
          <p style={{ color: 'red' }}>{conversionError}</p>
        ) : convertedPrice !== null ? (
          <p>
            = {convertedPrice.toLocaleString(undefined, {
              minimumFractionDigits: 4,
              maximumFractionDigits: 4,
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
