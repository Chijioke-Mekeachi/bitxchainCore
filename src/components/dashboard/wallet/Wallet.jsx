import React, { useEffect, useState } from "react";
import "./wallet.css";
import { supabase } from "../../../lib/supabase";

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

  useEffect(() => {
    fetchBlurtRate();
    fetchUserProfile();
  }, []);

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
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=blurt&vs_currencies=ngn"
      );
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

  // const handleSellBlurt = async (amountStr) => {
  //   const amt = parseFloat(amountStr);
  //   if (isNaN(amt) || amt <= 0) return showMessage("Invalid amount.", "error");

  //   const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  //   if (authError || !authUser) return showMessage("User not authenticated.", "error");

  //   const { data: user, error: fetchError } = await supabase
  //     .from('users')
  //     .select('bbalance, balance')
  //     .eq('email', authUser.email)
  //     .single();

  //   if (fetchError) return showMessage("Failed to fetch balances.", "error");

  //   const currentBlurtBalance = parseFloat(user.bbalance);
  //   const currentNairaBalance = parseFloat(user.balance);
  //   if (currentBlurtBalance < amt) return showMessage("Insufficient Blurt balance.", "error");

  //   const rate = parseFloat(blurtRate);
  //   if (isNaN(rate) || rate <= 0) return showMessage("Invalid Blurt rate.", "error");

  //   const newNairaBalance = currentNairaBalance + rate * amt;
  //   const newBlurtBalance = currentBlurtBalance - amt;

  //   const { error: updateError } = await supabase
  //     .from('users')
  //     .update({ balance: newNairaBalance, bbalance: newBlurtBalance })
  //     .eq('email', authUser.email);

  //   if (updateError) {
  //     showMessage("Failed to update balances.", "error");
  //   } else {
  //     setBlurtBalance(newBlurtBalance.toFixed(4));
  //     setNairaBalance(newNairaBalance.toFixed(2));
  //     setProfile(prev => prev ? { ...prev, bbalance: newBlurtBalance, balance: newNairaBalance } : null);
  //     showMessage('Sell successful!', 'success');
  //     setShowSellPopup(false);
  //     setRequestAmount("");
  //   }
  // };
  //   const handleBuyBlurt = async (amountStr) => {
  //   const amt = parseFloat(amountStr);
  //   if (isNaN(amt) || amt <= 0) return showMessage("Invalid amount.", "error");

  //   const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  //   if (authError || !authUser) return showMessage("User not authenticated.", "error");

  //   const { data: user, error: fetchError } = await supabase
  //     .from('users')
  //     .select('bbalance, balance')
  //     .eq('email', authUser.email)
  //     .single();

  //   if (fetchError) return showMessage("Failed to fetch balances.", "error");

  //   const currentBlurtBalance = parseFloat(user.bbalance);
  //   const currentNairaBalance = parseFloat(user.balance);

  //   const rate = parseFloat(blurtRate);
  //   if (isNaN(rate) || rate <= 0) return showMessage("Invalid Blurt rate.", "error");

  //   const costInNaira = rate * amt;
  //   if (currentNairaBalance < costInNaira) return showMessage("Insufficient Naira balance.", "error");

  //   const newNairaBalance = currentNairaBalance - costInNaira;
  //   const newBlurtBalance = currentBlurtBalance + amt;

  //   const { error: updateError } = await supabase
  //     .from('users')
  //     .update({ balance: newNairaBalance, bbalance: newBlurtBalance })
  //     .eq('email', authUser.email);

  //   if (updateError) {
  //     showMessage("Failed to update balances.", "error");
  //   } else {
  //     setBlurtBalance(newBlurtBalance.toFixed(4));
  //     setNairaBalance(newNairaBalance.toFixed(2));
  //     setProfile(prev => prev ? { ...prev, bbalance: newBlurtBalance, balance: newNairaBalance } : null);
  //     showMessage('Buy successful!', 'success');
  //     setShowRequestPopup(false);
  //     setRequestAmount("");
  //   }
  // };
  const handleBuyBlurt = async (amountStr) => {
    const amt = parseFloat(amountStr);
    if (isNaN(amt) || amt <= 0) return showMessage("Invalid amount.", "error");

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) return showMessage("User not authenticated.", "error");

    try {
      const response = await fetch("http://localhost:5000/api/buy-blurt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authUser.email,
          amount: amt,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return showMessage(result.message || "Failed to buy Blurt.", "error");
      }

      setBlurtBalance(parseFloat(result.newBlurtBalance).toFixed(4));
      setNairaBalance(parseFloat(result.newNairaBalance).toFixed(2));
      setProfile((prev) => ({
        ...prev,
        bbalance: result.newBlurtBalance,
        balance: result.newNairaBalance,
      }));

      showMessage(`Bought ${amt} BLURT successfully!`);
      setShowRequestPopup(false);
      setRequestAmount("");
    } catch (err) {
      console.error("Error buying Blurt:", err);
      showMessage("Server error during transaction.", "error");
    }
  };



  const handleSellBlurt = async (amountStr) => {
    const amt = parseFloat(amountStr);
    if (isNaN(amt) || amt <= 0) return showMessage("Invalid amount.", "error");

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) return showMessage("User not authenticated.", "error");

    try {
      const response = await fetch("http://localhost:5000/api/sell-blurt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authUser.email,
          amount: amt,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return showMessage(result.message || "Failed to sell Blurt.", "error");
      }

      setBlurtBalance(parseFloat(result.newBlurtBalance).toFixed(4));
      setNairaBalance(parseFloat(result.newNairaBalance).toFixed(2));
      setProfile((prev) => ({
        ...prev,
        bbalance: result.newBlurtBalance,
        balance: result.newNairaBalance,
      }));

      showMessage(`Sold ${amt} BLURT successfully!`);
      setShowSellPopup(false);
      setRequestAmount("");
    } catch (err) {
      console.error("Error selling Blurt:", err);
      showMessage("Server error during transaction.", "error");
    }
  };


  const updateBlurtBalance = async () => {
    if (!popupUsername) return showMessage("Please enter your Blurt username.", "error");

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
      setBlurtBalance(balance.toFixed(4));

      const { error } = await supabase
        .from("users")
        .update({ bbalance: balance })
        .eq("email", profile.email);

      if (error) return showMessage("Failed to update balance.", "error");
      showMessage("Blurt balance updated!");
    } catch (error) {
      showMessage("Failed to fetch Blurt balance.", "error");
    } finally {
      setShowPopup(false);
    }
  };

  const handleBlurtRequest = (type) => {
    setRequestType(type);
    setShowRequestPopup(true);
    setRequestAmount("");
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
  };

  const handleTransferConfirmation = async () => {
    setIsCheckingTransfer(true);
    try {
      const response = await fetch("https://rpc.blurt.world", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "call",
          params: ["condenser_api", "get_account_history", ["bitxchain", -1, 1000]],
          id: 1,
        }),
      });

      const json = await response.json();
      const history = json.result;

      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const matchingTxs = history
        .map(([, tx]) => tx)
        .filter((tx) => {
          const isTransfer = tx.op[0] === "transfer";
          const matchesMemo = tx.op[1].memo === profile.memo;
          const isToBitxchain = tx.op[1].to === "bitxchain";
          const txTime = new Date(tx.timestamp + "Z");
          return isTransfer && matchesMemo && isToBitxchain && txTime >= threeDaysAgo;
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      if (matchingTxs.length > 0) {
        const latestTx = matchingTxs[0];
        const amountReceived = parseFloat(latestTx.op[1].amount.split(" ")[0]);
        const currentBalance = parseFloat(blurtBalance);
        const newBalance = currentBalance + amountReceived;
        const newMemo = Math.random().toString(36).substring(2, 10).toUpperCase();

        const { error } = await supabase
          .from("users")
          .update({ bbalance: newBalance, memo: newMemo })
          .eq("email", profile.email);

        if (error) {
          showMessage("Error updating Supabase.", "error");
        } else {
          setBlurtBalance(newBalance.toFixed(4));
          setProfile((prev) => ({ ...prev, bbalance: newBalance, memo: newMemo }));
          showMessage(`Received ${amountReceived} BLURT. Memo has been changed.`);
        }
      } else {
        showMessage("No recent matching transaction found.", "error");
      }
    } catch (err) {
      showMessage("Failed to check transfer.", "error");
    }
    setIsCheckingTransfer(false);
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
          <div className="wallet-info">
            <div>
              <p className="big-text">{blurtBalance} BLURT</p>
              <p className="small-text">1 BLURT ≈ ₦{blurtRate ?? "..."}</p>
            </div>
            <div className="right-text">
              <p className="big-text">₦{nairaBalance}</p>
              <button className="btn green">Withdraw</button>
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
            <button className="btn blue" onClick={() => setShowPopup(true)}>💰 Add Fund</button>
            <button className="btn purple" onClick={() => handleBlurtRequest("buy")}>💱 Buy Blurt</button>
            <button className="btn yellow" onClick={() => { setRequestType("sell"); setShowSellPopup(true); setRequestAmount(""); }}>💵 Sell Blurt</button>
          </div>
        </div>
      </div>

      {/* Add Fund popup */}
      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h3>Update Blurt Balance</h3>
            <input
              type="text"
              placeholder="Blurt Username"
              value={popupUsername}
              onChange={(e) => setPopupUsername(e.target.value)}
              className="popup-input"
            />
            <div className="popup-buttons">
              <button className="btn" onClick={updateBlurtBalance}>Update Balance</button>
              <button className="btn cancel" onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Buy Request popup */}
      {showRequestPopup && (
        <div className="popup-overlay">
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h3>{requestType.toUpperCase()} BLURT</h3>
            <input
              type="number"
              placeholder="Enter amount"
              value={requestAmount}
              onChange={(e) => setRequestAmount(e.target.value)}
              className="popup-input"
            />
            <div className="popup-buttons">
              <button className="btn" onClick={() => {
                requestType === "buy" ? handleBuyBlurt(requestAmount) : sendRequestToSupabase();
              }}>
                Send Request
              </button>
              <button className="btn cancel" onClick={() => setShowRequestPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Sell Request popup */}
      {showSellPopup && (
        <div className="popup-overlay">
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h3>SELL BLURT</h3>
            <input
              type="number"
              placeholder="Enter amount"
              value={requestAmount}
              onChange={(e) => setRequestAmount(e.target.value)}
              className="popup-input"
            />
            <div className="popup-buttons">
              <button className="btn" onClick={() => handleSellBlurt(requestAmount)}>Send Request</button>
              <button className="btn cancel" onClick={() => setShowSellPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Message popup */}
      {showMessagePopup && (
        <div className="popup-overlay">
          <div className={`popup ${messageType}`}>
            <h3>{messageType === "success" ? "✅" : "❌"} {message}</h3>
          </div>
        </div>
      )}
    </div>
  );
}
