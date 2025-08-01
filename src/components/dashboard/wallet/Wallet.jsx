import React, { useEffect, useState } from "react";
import "./wallet.css";
import { supabase } from "../../../lib/supabase";
import MyWithdrawRequests from "./Withdraw";
import Stat from "../Stat";

export default function Wallet() {
  const [profile, setProfile] = useState(null);
  const [blurtBalance, setBlurtBalance] = useState("0.0000");
  const [nairaBalance, setNairaBalance] = useState("0.00");
  const [blurtRate, setBlurtRate] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupUsername, setPopupUsername] = useState("");
  const [showRequestPopup, setShowRequestPopup] = useState(false);
  const [showSellPopup, setShowSellPopup] = useState(false);
  const [requestType, setRequestType] = useState("buy");
  const [requestAmount, setRequestAmount] = useState("");
  const [isCheckingTransfer, setIsCheckingTransfer] = useState(false);
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [loadingBuy, setLoadingBuy] = useState(false);
  const [loadingSell, setLoadingSell] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawBankName, setWithdrawBankName] = useState("");
  const [withdrawBankUsername, setWithdrawBankUsername] = useState("");
  const [withdrawAccountNumber, setWithdrawAccountNumber] = useState("");
  const [loadingWithdraw, setLoadingWithdraw] = useState(false);
  const [transfers, setTransfers] = useState([]);
  const [withdrawMethod, setWithdrawMethod] = useState("naira"); // or 'usdt'
  const [walletAddress, setWalletAddress] = useState(""); // for USDT

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setProfile(user);
    };

    getProfile();
  }, []);



  useEffect(() => {
    fetchBlurtRate();
    fetchUserProfile();
  }, []);
  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const { data } = await axios.post("https://bitapi-0m8c.onrender.com/api/get-transfer-requests", {
          email: userEmail,
        });
        setTransfers(data.transfers);
      } catch (err) {
        console.error("Failed to load transfer requests", err);
      }
    };

    fetchTransfers();
  }, []);

  const handleBlurtRequest = (type) => {
    setRequestType(type);
    setShowRequestPopup(true);
    setRequestAmount("");
  };

  const fetchUserProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const userEmail = session?.user?.email;
    if (!userEmail) return;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", userEmail)
      .single();
    if (error) {
      console.error("Failed to fetch user profile:", error);
      return;
    }

    setProfile(data);
    setPopupUsername(data.busername || "");
    setBlurtBalance(data.bbalance != null ? parseFloat(data.bbalance).toFixed(4) : "0.0000");
    setNairaBalance(data.balance != null ? parseFloat(data.balance).toFixed(2) : "0.00");
  };


  const fetchBlurtRate = async () => {
    try {
      const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=blurt&vs_currencies=ngn");
      const data = await res.json();
      if (data?.blurt?.ngn != null) {
        setBlurtRate(data.blurt.ngn);
      }
    } catch (err) {
      console.error("Failed to fetch Blurt rate:", err);
    }
  };

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setShowMessagePopup(true);
    setTimeout(() => {
      setShowMessagePopup(false);
    }, 3000);
  };

  const handleBuyBlurt = async (amountStr) => {
    const amt = parseFloat(amountStr);
    if (isNaN(amt) || amt <= 0) return showMessage("Invalid amount.", "error");

    setLoadingBuy(true);
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        showMessage("User not authenticated.", "error");
        return;
      }

      const response = await fetch("https://bitapi-0m8c.onrender.com/api/buy-blurt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, amount: amt }),
      });

      const result = await response.json();
      if (!response.ok) {
        console.error("Buy error:", result.error);
        showMessage(result.error || "Failed to buy Blurt", "error");
        return;
      }

      setBlurtBalance(Number(result.newBlurtBalance || 0).toFixed(4));
      setNairaBalance(Number(result.newNairaBalance || 0).toFixed(2));

      setProfile((prev) => ({
        ...prev,
        bbalance: result.newBlurtBalance,
        balance: result.newNairaBalance,
      }));
      showMessage("Buy successful!", "success");
      setShowRequestPopup(false);
      setRequestAmount("");
    } catch (err) {
      console.error("Buy request failed:", err);
      console.log("Buy request failed:", err);
      showMessage("Unexpected error occurred.", "error");
    } finally {
      setLoadingBuy(false);
    }
  };

  const handleSellBlurt = async (amountStr) => {
    const amt = parseFloat(amountStr);
    if (isNaN(amt) || amt <= 0) return showMessage("Invalid amount.", "error");

    setLoadingSell(true);
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return showMessage("User not authenticated.", "error");

      const response = await fetch("https://bitapi-0m8c.onrender.com/api/sell-blurt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, amount: amt }),
      });

      const result = await response.json();
      if (!response.ok) {
        console.error("Sell error:", result.error);
        return showMessage(result.error || "Failed to sell Blurt", "error");
      }

      showMessage("Sell successful!", "success");
      setShowSellPopup(false);
      setRequestAmount("");
      await fetchUserProfile();
    } catch (err) {
      console.error("Sell request failed:", err);
      showMessage("Unexpected error occurred.", "error");
    }
    setLoadingSell(false);
  };

  const sendRequestToSupabase = async () => {
    if (!requestAmount || isNaN(requestAmount)) {
      showMessage("Please enter a valid amount.", "error");
      return;
    }

    if (requestType === "sell" && parseFloat(requestAmount) > parseFloat(blurtBalance)) {
      showMessage("You don't have up to this amount.", "error");
      return;
    }

    setLoadingRequest(true);
    const { error } = await supabase.from("blurt_requests").insert([
      {
        user_id: profile.id,
        username: profile.username,
        busername: profile.busername,
        email: profile.email,
        request_type: requestType.toUpperCase(),
        amount: parseFloat(requestAmount),
        memo: profile.memo,
      },
    ]);

    if (error) {
      showMessage("Failed to send request.", "error");
    } else {
      showMessage("Request submitted successfully!");
      setShowRequestPopup(false);
      setShowSellPopup(false);
      setRequestAmount("");
    }
    setLoadingRequest(false);
  };

  const updateBlurtBalance = async () => {
    if (!popupUsername) return showMessage("Please enter your Blurt username.", "error");

    setLoadingUpdate(true);
    try {
      const res = await fetch("https://rpc.blurt.world", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "call",
          params: ["condenser_api", "get_accounts", [[popupUsername]]],
          id: 1,
        }),
      });

      const json = await res.json();
      const account = json.result?.[0];
      if (!account) return showMessage("Blurt account not found.", "error");

      const balance = parseFloat(account.balance.split(" ")[0]);

      const { error } = await supabase
        .from("users")
        .update({ bbalance: balance })
        .eq("email", profile.email);

      if (error) return showMessage("Failed to update balance.", "error");
      showMessage("Blurt balance updated!");
      await fetchUserProfile();
    } catch (error) {
      showMessage("Failed to fetch Blurt balance.", "error");
    }
    setShowPopup(false);
    setLoadingUpdate(false);
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(parseFloat(withdrawAmount))) {
      return showMessage("Enter a valid amount.", "error");
    }

    const parsedAmount = parseFloat(withdrawAmount);
    if (
      (withdrawMethod === "naira" && parsedAmount < 500) ||
      (withdrawMethod === "usdt" && parsedAmount < 5)
    ) {
      return showMessage(
        withdrawMethod === "naira"
          ? "Minimum withdrawal is ₦500"
          : "Minimum USDT withdrawal is $5",
        "error"
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return showMessage("User not authenticated", "error");
    }

    setLoadingWithdraw(true);

    try {
      const payload = {
        email: profile.email,
        amount: parsedAmount,
        method: withdrawMethod,
        user_id: profile.id,
      };

      if (withdrawMethod === "naira") {
        if (!withdrawBankName || !withdrawBankUsername || !withdrawAccountNumber) {
          return showMessage("Fill all bank details.", "error");
        }

        payload.accountName = withdrawBankUsername;
        payload.accountNumber = withdrawAccountNumber;
        payload.bank = withdrawBankName;
      }

      if (withdrawMethod === "usdt") {
        if (!walletAddress) {
          return showMessage("Enter your USDT wallet address.", "error");
        }

        payload.walletAddress = walletAddress;
      }

      const res = await fetch("https://bitapi-0m8c.onrender.com/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Withdrawal failed.");
      }

      showMessage(data.message || "Withdraw successful!", "success");

      // Update local state balances
      if (withdrawMethod === "naira" && data.newBalance) {
        setNairaBalance(parseFloat(data.newBalance).toFixed(2));
      }
      if (withdrawMethod === "usdt" && data.newBalance) {
        setBlurtBalance(parseFloat(data.newBalance).toFixed(4));
      }

      // Reset form
      setWithdrawAmount("");
      setWithdrawBankName("");
      setWithdrawBankUsername("");
      setWithdrawAccountNumber("");
      setWalletAddress("");
      setShowWithdraw(false);
    } catch (error) {
      console.error("Withdraw error:", error);
      showMessage(error.message || "Error submitting withdrawal", "error");
    } finally {
      setLoadingWithdraw(false);
    }
  };




  const handleTransferConfirmation = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/confirm-transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: profile.email }), // or however you access the logged-in user's email
      });

      const result = await response.json();

      if (!response.ok) {
        showMessage(result.message || "Transfer confirmation failed.", "error");
        return;
      }

      showMessage(result.message, "success");

      // Optionally update local state/UI
      if (result.newBlurtBalance) {
        setBlurtBalance(result.newBlurtBalance);
      }

      // Optional: refresh user profile/memo
      fetchUserProfile?.();

    } catch (error) {
      console.error("Error confirming transfer:", error);
      showMessage("Error contacting the server.", "error");
    }
  };
  const sendToSupabase = async () => {
    if (!popupUsername || !requestAmount || isNaN(requestAmount)) {
      showMessage("Fill all fields correctly", "error");
      return;
    }

    if (parseFloat(requestAmount) > parseFloat(blurtBalance)) {
      showMessage("Insufficient balance.", "error");
      return;
    }

    setLoadingRequest(true);

    const { error } = await supabase.from("blurt_requests").insert([
      {
        user_id: profile.id,
        username: profile.username,
        busername: profile.busername,
        email: profile.email,
        request_type: "TRANSFER",
        amount: parseFloat(requestAmount),
        memo: `To: ${popupUsername}`,
      },
    ]);

    if (error) {
      showMessage("Failed to send transfer request.", "error");
    } else {
      showMessage("Transfer request submitted!");
      setPopupUsername("");
      setRequestAmount("");
      setShowPopup(false);
    }

    setLoadingRequest(false);
  };

  const sendTransferRequestViaAPI = async ({ profile, username, amount, memo = "", showMessage, onDone }) => {
    if (!username || !amount || isNaN(amount)) {
      showMessage("❗ Fill all fields correctly", "error");
      return;
    }

    try {
      const res = await fetch("https://bitapi-0m8c.onrender.com/api/insert-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: profile.id,
          username: profile.username,
          busername: profile.busername,
          email: profile.email,
          amount: parseFloat(amount),
          memo,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        showMessage("✅ Transfer request sent!", "success");
        onDone?.();
      } else {
        showMessage("❌ " + (result.message || "Failed"), "error");
      }
    } catch (err) {
      console.error("❌ Request error:", err);
      showMessage("❌ Network error", "error");
    }
  };
  const handleSend = async () => {
    setLoadingRequest(true);

    await sendTransferRequestViaAPI({
      profile,
      username: popupUsername,
      amount: requestAmount,
      showMessage,
      onDone: () => {
        setPopupUsername("");
        setRequestAmount("");
        setShowPopup(false);
      },
    });

    setLoadingRequest(false);
  };


  if (!profile) return <div className="loading">Loading wallet...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <div className="profile-card">
          <h2>{profile.username}</h2>
          <p>Email: {profile.email}</p>
          <p>Blurt Username: {profile.busername}</p>
          <p>Memo: <code>{profile.memo}</code></p>
        </div>

        <div className="wallet-section">
          <div className="top">
            <div className="wallet-info">
            <div>
              <p className="big-text">{blurtBalance} BLURT</p>
              <p className="small-text">
                1 BLURT ≈ ₦{blurtRate ? (blurtRate - blurtRate * 0.33).toFixed(2) : "..."}
              </p>

            </div>
            <div className="right-text">
              <p className="big-text">₦{nairaBalance}</p>
              <button className="btn green" onClick={() => { setShowWithdraw(true) }}>Withdraw</button>
            </div>
          </div>

          </div>

          <div className="memo-box">
            <h2>Fund account via Transfer</h2>
            <p><strong>Send BLURT to:</strong> <code>bitxchain</code></p>
            <p><strong>Use Memo:</strong> <code>{profile.memo}</code></p>
            <button className="btn black" onClick={handleTransferConfirmation}>
              {isCheckingTransfer ? "Checking..." : "I have made a transfer"}
            </button>
          </div>

          <div className="btn-group">
            <button
              className="btn blue"
              onClick={() => {
                setRequestType("transfer");
                setShowPopup(true);
                setPopupUsername("");
                setRequestAmount("");
              }}
            >
              Transfer Blurt
            </button>
            <button className="btn purple" onClick={() => handleBlurtRequest("buy")}>💱 Buy Blurt</button>
            <button className="btn yellow" onClick={() => { setRequestType("sell"); setShowSellPopup(true); setRequestAmount(""); }}>💵 Sell Blurt</button>
          </div>
        </div>
        <div className="recent-box">
          <h2 className="recent-header">📄 Recent Requests</h2>
          <MyWithdrawRequests />
        </div>
      </div>
      <Stat />

      {/* Add Fund popup */}
      {showPopup && requestType === "transfer" && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h3>Transfer BLURT</h3>

            <input
              type="text"
              placeholder="Receiver Blurt Username"
              value={popupUsername}
              onChange={(e) => setPopupUsername(e.target.value)}
              className="popup-input"
            />

            <input
              type="number"
              placeholder="Amount"
              value={requestAmount}
              onChange={(e) => setRequestAmount(e.target.value)}
              className="popup-input"
            />

            <div className="popup-buttons">
              <button
                className="btn"
                onClick={
                  handleSend
                }
              >
                {loadingRequest ? "Sending..." : "Send"}
              </button>

              <button className="btn cancel" onClick={() => setShowPopup(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}





      {showWithdraw && (
        <div className="popup-overlay" onClick={() => setShowWithdraw(false)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h3>Withdraw Funds</h3>

            <div className="popup-input">
              <label>Withdrawal Type</label>
              <select
                value={withdrawMethod}
                onChange={(e) => setWithdrawMethod(e.target.value)}
              >
                <option value="naira">₦ Naira Bank</option>
                <option value="usdt">USDT Wallet</option>
              </select>
            </div>

            <input
              type="number"
              placeholder={`Amount to Withdraw (${withdrawMethod === "usdt" ? "min $5" : "min ₦500"})`}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="popup-input"
            />

            {withdrawMethod === "naira" && (
              <>
                <input
                  type="text"
                  placeholder="Bank Name (e.g., Access Bank)"
                  value={withdrawBankName}
                  onChange={(e) => setWithdrawBankName(e.target.value)}
                  className="popup-input"
                />
                <input
                  type="text"
                  placeholder="Account Holder Name"
                  value={withdrawBankUsername}
                  onChange={(e) => setWithdrawBankUsername(e.target.value)}
                  className="popup-input"
                />
                <input
                  type="text"
                  placeholder="Account Number"
                  value={withdrawAccountNumber}
                  onChange={(e) => setWithdrawAccountNumber(e.target.value)}
                  className="popup-input"
                />
              </>
            )}

            {withdrawMethod === "usdt" && (
              <input
                type="text"
                placeholder="USDT Wallet Address (TRC20 preferred)"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="popup-input"
              />
            )}

            <div className="popup-buttons">
              <button className="btn" onClick={handleWithdraw}>
                {loadingWithdraw ? "Submitting..." : "Submit Withdraw"}
              </button>
              <button className="btn cancel" onClick={() => setShowWithdraw(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Buy Request popup */}
      {
        showRequestPopup && (
          <div className="popup-overlay">
            <div className="popup" onClick={(e) => e.stopPropagation()}>
              <h3>{requestType.toUpperCase()} BLURT</h3>
              <input
                type="number"
                placeholder="Enter amount of blurt "
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                className="popup-input"
              />
              <div className="popup-buttons">
                <button className="btn" onClick={() => handleBuyBlurt(requestAmount)}>
                  {loadingBuy ? "Processing..." : "Send Request"}
                </button>
                <button className="btn cancel" onClick={() => setShowRequestPopup(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )
      }

      {/* Sell Request popup */}
      {
        showSellPopup && (
          <div className="popup-overlay">
            <div className="popup" onClick={(e) => e.stopPropagation()}>
              <h3>SELL BLURT</h3>
              <input
                type="number"
                placeholder="Enter amount of blurt"
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                className="popup-input"
              />
              <div className="popup-buttons">
                <button className="btn" onClick={() => handleSellBlurt(requestAmount)}>
                  {loadingSell ? "Processing..." : "Send Request"}
                </button>
                <button className="btn cancel" onClick={() => setShowSellPopup(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )
      }


      {/* Message popup */}
      {
        showMessagePopup && (
          <div className="popup-overlay">
            <div className={`popup ${messageType}`}>
              <h3>{messageType === "success" ? "✅" : "❌"} {message}</h3>
            </div>
          </div>
        )
      }
    </div >
  );
}
