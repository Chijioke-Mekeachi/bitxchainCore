const express = require("express");
const axios = require("axios");
const cors = require("cors");

require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;

// Create Customer on Paystack
app.post("/create-customer", async (req, res) => {
  const { email, first_name, last_name } = req.body;

  try {
    const response = await axios.post(
      "https://api.paystack.co/customer",
      { email, first_name, last_name },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error("Error creating customer:", err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

// Assign Virtual Account to Customer
app.post("/create-virtual-account", async (req, res) => {
  const { customer_code } = req.body;

  try {
    const response = await axios.post(
      "https://api.paystack.co/dedicated_account",
      {
        customer: customer_code,
        preferred_bank: "wema-bank",
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error("Error creating virtual account:", err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
