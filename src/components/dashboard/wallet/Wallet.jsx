import React, { useEffect, useState } from "react";
import "./wallet.css";
import { supabase } from "../../../lib/supabase";

export default function Wallet() {
  const [profile, setProfile] = useState(null);
  const [bbalance, setBBalance] = useState("0.00");
  const [blurtRate, setBlurtRate] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupUsername, setPopupUsername] = useState("");
  const [showRequestPopup, setShowRequestPopup] = useState(false);
  const [requestType, setRequestType] = useState("buy");
  const [requestAmount, setRequestAmount] = useState("");
  const [isCheckingTransfer, setIsCheckingTransfer] = useState(false);
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success"); // 'success' or 'error'
  const [bvalue, setBValue] = useState("0.00");

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
    setBBalance(data.bbalance || "0.00");
    setBValue(data.bvalue || "0.00");
  };

  const fetchBlurtRate = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=blurt&vs_currencies=ngn"
      );
      const data = await res.json();
      setBlurtRate(data.blurt.ngn);
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
      setBBalance(balance.toFixed(4));

      const { error } = await supabase
        .from("users")
        .update({ bbalance: balance })
        .eq("email", profile.email);

      if (error) {
        console.error("Supabase update error:", error);
        showMessage("Failed to update balance.", "error");
      } else {
        showMessage("Blurt balance updated!");
      }
    } catch (error) {
      console.error("Blurt balance fetch error:", error);
      showMessage("Failed to fetch Blurt balance.", "error");
    } finally {
      setShowPopup(false);
    }
  };

  const handleBlurtRequest = (type) => {
    setRequestType(type);
    setShowRequestPopup(true);
  };

  const sendRequestToSupabase = async () => {
    if (!requestAmount || isNaN(requestAmount)) {
      showMessage("Please enter a valid amount.", "error");
      return;
    }

    // Check balance if selling blurt
    if (requestType === "sell") {
      const userBalance = parseFloat(bbalance);
      const amountToSell = parseFloat(requestAmount);

      if (amountToSell > userBalance) {
        showMessage("You don't have up to this amount.", "error");
        return;
      }
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
      console.error("Supabase insert error:", error);
      showMessage("Failed to send request.", "error");
    } else {
      showMessage("Request submitted successfully!");
      setShowRequestPopup(false);
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
        const currentBalance = parseFloat(bbalance);
        const newBalance = currentBalance + amountReceived;
        const newMemo = Math.random().toString(36).substring(2, 10).toUpperCase();

        const { error } = await supabase
          .from("users")
          .update({ bbalance: newBalance, memo: newMemo })
          .eq("email", profile.email);

        if (error) {
          console.error("Supabase update error:", error);
          showMessage("Error updating Supabase.", "error");
        } else {
          setBBalance(newBalance.toFixed(4));
          setProfile((prev) => ({ ...prev, bbalance: newBalance, memo: newMemo }));
          showMessage(`Received ${amountReceived} BLURT. Memo has been changed.`);
        }
      } else {
        showMessage("No recent matching transaction found.", "error");
      }
    } catch (err) {
      console.error("Error checking transfer:", err);
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
              <p className="big-text">{bbalance} BLURT</p>
              <p className="small-text">1 BLURT ≈ ₦{blurtRate ?? "..."}</p>
            </div>
            <div className="right-text">
              <p className="big-text">₦{bvalue}</p>
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
            <button className="btn yellow" onClick={() => handleBlurtRequest("sell")}>💵 Sell Blurt</button>
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

      {/* Buy/Sell Request popup */}
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
              <button className="btn" onClick={sendRequestToSupabase}>Send Request</button>
              <button className="btn cancel" onClick={() => setShowRequestPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Message popup */}
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
