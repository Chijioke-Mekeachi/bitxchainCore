import React, { useEffect, useState } from "react";
import "./wallet.css";
import { supabase } from "../../../lib/supabase";
import emailjs from "@emailjs/browser";

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
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [bvalue, setBValue] = useState("0.00");


  useEffect(() => {
    fetchBlurtRate();
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      handleTransferConfirmation();
    }
  }, [profile]);



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
    setBValue(data.bvalue || "0.00"); // <-- Add this
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

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessPopup(true);
    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 3000);
  };

  const updateBlurtBalance = async () => {
    if (!popupUsername) return showSuccess("Please enter your Blurt username.");

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
      if (!account) return showSuccess("Blurt account not found.");

      const balance = parseFloat(account.balance.split(" ")[0]);
      setBBalance(balance.toFixed(4));

      const { error } = await supabase
        .from("users")
        .update({ bbalance: balance })
        .eq("email", profile.email);

      if (error) console.error("Supabase update error:", error);
      else showSuccess("Blurt balance updated!");
    } catch (error) {
      console.error("Blurt balance fetch error:", error);
    } finally {
      setShowPopup(false);
    }
  };

  const handleBlurtRequest = (type) => {
    setRequestType(type);
    setShowRequestPopup(true);
  };

  const sendRequestEmail = async () => {
    if (!requestAmount || isNaN(requestAmount)) {
      showSuccess("Please enter a valid amount.");
      return;
    }

    const templateParams = {
      name: profile.username,
      username: profile.busername,
      amount: requestAmount,
      time: new Date().toLocaleString(),
      request_type: requestType.toUpperCase(),
    };

    try {
      await emailjs.send(
        "service_fsn8ljb",
        "template_go4xsnc",
        templateParams,
        "HIblo4h_NIYHJgbHb"
      );
      showSuccess("Request sent successfully!");
      setShowRequestPopup(false);
      setRequestAmount("");
    } catch (err) {
      console.error("EmailJS error:", err);
      showSuccess("Failed to send request.");
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
          showSuccess("Error updating Supabase.");
        } else {
          setBBalance(newBalance.toFixed(4));
          setProfile((prev) => ({ ...prev, bbalance: newBalance, memo: newMemo }));
          showSuccess(`Received ${amountReceived} BLURT. Memo has been changed.`);
        }
      } else {
        showSuccess("No recent matching transaction found.");
      }
    } catch (err) {
      console.error("Error checking transfer:", err);
      showSuccess("Failed to check transfer.");
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
              <p className="big-text">
                ₦{bvalue}
              </p>
              <button className="btn green">Withdraw</button>
            </div>

          </div>

          <div className="memo-box">
            <p><strong>Send BLURT to:</strong> <code>bitxchain</code></p>
            <p><strong>Use Memo:</strong> <code>{profile.memo}</code></p>
            <button className="btn black" onClick={handleTransferConfirmation}>
              {isCheckingTransfer ? "Checking..." : "I have made a transfer"}
            </button>
          </div>

          <div className="btn-group">
            <button className="btn blue">💰 Add Fund</button>
            <button className="btn purple" onClick={() => handleBlurtRequest("buy")}>💱 Buy Blurt</button>
            <button className="btn yellow" onClick={() => handleBlurtRequest("sell")}>💵 Sell Blurt</button>
          </div>
        </div>
      </div>

      {showRequestPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>{requestType.toUpperCase()} BLURT</h3>
            <input
              type="number"
              placeholder="Enter amount"
              value={requestAmount}
              onChange={(e) => setRequestAmount(e.target.value)}
              className="popup-input"
            />
            <div className="popup-buttons">
              <button className="btn" onClick={sendRequestEmail}>Send Request</button>
              <button className="btn cancel" onClick={() => setShowRequestPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessPopup && (
        <div className="popup-overlay">
          <div className="popup success">
            <h3>✅ {successMessage}</h3>
          </div>
        </div>
      )}
    </div>
  );
}
