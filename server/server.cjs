// server.js
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const app = express();

const PAYSTACK_SECRET_KEY = "sk_test_8ba00d8f86d31fc6e1f16a62224c6a3f87dc0281";

app.use(cors());
app.use(express.json());

app.post("/api/check-paystack-transfers", async (req, res) => {
  const { memo } = req.body;

  if (!memo) {
    return res.status(400).json({ success: false, message: "Memo is required" });
  }

  try {
    const paystackRes = await fetch("https://api.paystack.co/transaction", {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await paystackRes.json();

    if (!data.status || !data.data) {
      return res.status(500).json({ success: false, message: "Failed to fetch transactions" });
    }

    const match = data.data.find((tx) => {
      const narration = tx.metadata?.custom_fields?.find(f => f.display_name === "Narration")?.value || tx.customer?.first_name || "";
      return (
        tx.status === "success" &&
        tx.metadata?.custom_fields &&
        narration?.toLowerCase() === memo.toLowerCase()
      );
    });

    if (!match) {
      return res.status(404).json({ success: false, message: "No matching transaction found" });
    }

    return res.json({
      success: true,
      amount: match.amount / 100, // Paystack returns amount in kobo
      reference: match.reference,
    });
  } catch (error) {
    console.error("Paystack API error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
