import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import "./withdraw.css";

export default function MyWithdrawRequests() {
  const [requests, setRequests] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return;
    setUserEmail(user.email);
    fetchMyRequestsFromAPI(user.email);
  };

  const fetchMyRequestsFromAPI = async (email) => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:4000/api/get-my-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await res.json();
      if (res.ok) {
        setRequests(result.withdrawals || []);
        setTransfers(result.transfers || []);
      } else {
        console.error("API error:", result.message);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
    setLoading(false);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>🧾 My Withdraw & Transfer Requests</h2>
        <button className="btn blue" onClick={() => fetchMyRequestsFromAPI(userEmail)}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <p className="loading">Loading...</p>
      ) : requests.length === 0 && transfers.length === 0 ? (
        <p className="loading">No requests found.</p>
      ) : (
        <>
          {/* Withdraw Section */}
          {requests.length > 0 && (
            <div className="memo-box">
              <h3>🏦 Withdraw Requests</h3>
              <div className="wallet-info" style={{ flexDirection: "column", gap: "10px" }}>
                {requests.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className="wallet-info"
                    style={{ cursor: "pointer", border: "1px solid #00f0ff", background: "#1a1a1a" }}
                  >
                    <div>
                      <div className="big-text">₦{Number(req.amount).toLocaleString()}</div>
                      <div className="small-text">Bank: {req.bank_name}</div>
                      <div className="small-text">Account: {req.account_number}</div>
                    </div>
                    <div className="right-text">
                      <div className="small-text">Name: {req.bank_username}</div>
                      <div className="small-text">Status: {req.sent_or_pending}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transfer Section */}
          {transfers.length > 0 && (
            <div className="memo-box">
              <h3>🔁 My Blurt Transfer Requests</h3>
              <div className="wallet-info" style={{ flexDirection: "column", gap: "10px" }}>
                {transfers.map((tx) => (
                  <div
                    key={tx.id}
                    className="wallet-info"
                    style={{ background: "#1a1a1a", border: "1px solid #aa00ff" }}
                  >
                    <div>
                      <div className="big-text">{Number(tx.amount).toFixed(3)} BLURT</div>
                      <div className="small-text">To: {tx.to_username}</div>
                    </div>
                    <div className="right-text">
                      <div className="small-text">Status: {tx.status}</div>
                      <div className="small-text">
                        {new Date(tx.created_at).toLocaleString("en-NG", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Withdraw Details Popup */}
      {selectedRequest && (
        <div className="popup-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h3>Withdraw Details</h3>
            <p>
              <strong>Account Name:</strong> {selectedRequest.bank_username}
            </p>
            <p>
              <strong>Amount:</strong> ₦
              {Number(selectedRequest.amount).toLocaleString("en-NG", {
                minimumFractionDigits: 2,
              })}
            </p>
            <p>
              <strong>Bank:</strong> {selectedRequest.bank_name}
            </p>
            <p>
              <strong>Account Number:</strong> {selectedRequest.account_number}
            </p>
            <p>
              <strong>Status:</strong> {selectedRequest.sent_or_pending}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(selectedRequest.created_at).toLocaleString()}
            </p>
            <div className="popup-buttons">
              <button className="btn blue" onClick={() => setSelectedRequest(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
