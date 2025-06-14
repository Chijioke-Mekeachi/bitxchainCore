import React, { useEffect, useState } from "react";
import "./wallet.css";
import { supabase } from "../../../lib/supabase";

export default function Wallet() {
  const [profile, setProfile] = useState(null);
  const [bbalance, setBBalance] = useState("0.00");
  const [blurtRate, setBlurtRate] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupUsername, setPopupUsername] = useState("");

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
  };

  const fetchBlurtRate = async () => {
    try {
      const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=blurt&vs_currencies=ngn");
      const data = await res.json();
      setBlurtRate(data.blurt.ngn);
    } catch (err) {
      console.error("Failed to fetch Blurt rate:", err);
    }
  };

  const updateBlurtBalance = async () => {
    if (!popupUsername) return alert("Please enter your Blurt username.");

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
      if (!account) return alert("Blurt account not found.");

      const balance = parseFloat(account.balance.split(" ")[0]);
      setBBalance(balance.toFixed(4));

      const { error } = await supabase
        .from("users")
        .update({ bbalance: balance })
        .eq("email", profile.email);

      if (error) console.error("Supabase update error:", error);
      else alert("Blurt balance updated!");
    } catch (error) {
      console.error("Blurt balance fetch error:", error);
    } finally {
      setShowPopup(false);
    }
  };

  if (!profile) return <div className="loading">Loading wallet...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <div className="profile-card">
          <img
            src={`https://placehold.co/100x100?text=${profile.username?.[0] || "U"}`}
            alt="User"
            className="avatar"
          />
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Blurt Username:</strong> {profile.busername}</p>
          <p><strong>Memo:</strong> {profile.memo}</p>
        </div>

        <div className="wallet-section">
          <div className="wallet-info">
            <div>
              <p className="big-text">{bbalance} BLURT</p>
              <p className="small-text">1 BLURT ≈ ₦{blurtRate ?? "..."}</p>
            </div>
            <div className="right-text">
              <p className="big-text">
                ₦{blurtRate && bbalance ? (blurtRate * bbalance).toFixed(2) : "0.00"}
              </p>
              <button className="btn green">Withdraw</button>
            </div>
          </div>

          <div className="memo-box">
            <p><strong>Memo Key:</strong> {profile.memo}</p>
            <ul>
              <li>Send BLURT to <code>blurtexchanger</code></li>
              <li>Use the memo key provided above</li>
              <li>Click "I have made a transfer" when done</li>
            </ul>
            <button className="btn black">I have made a transfer</button>
          </div>

          <div className="btn-group">
            <button className="btn blue">💰 Add Fund</button>
            <button className="btn purple">💱 Buy Blurt</button>
            <button className="btn yellow">💵 Sell Blurt</button>
            <button className="btn dark" onClick={() => setShowPopup(true)}>
              ➕ Add Blurt Balance
            </button>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Fetch Blurt Balance</h3>
            <input
              type="text"
              placeholder="Enter Blurt Username"
              value={popupUsername}
              onChange={(e) => setPopupUsername(e.target.value)}
              className="popup-input"
            />
            <div className="popup-buttons">
              <button className="btn" onClick={updateBlurtBalance}>Fetch</button>
              <button className="btn cancel" onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
