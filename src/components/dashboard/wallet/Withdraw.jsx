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
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return;
    setUserEmail(user.email);
    fetchMyRequestsFromAPI(user.email);
  };

  const fetchMyRequestsFromAPI = async (email) => {
    setLoading(true);
    try {
      const res = await fetch("https://bitapi-0m8c.onrender.com/api/get-my-requests", {
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
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: "#00f0ff" }}>🧾 My Requests</h2>
        <button className="btn yellow" onClick={() => fetchMyRequestsFromAPI(userEmail)}>
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
            <>
              <h3 className="section-title">🏦 Withdraw Requests</h3>
              <div className="message-table">
                <div className="table-header">
                  <div>Account Name</div>
                  <div>Amount</div>
                  <div>Bank</div>
                  <div>Acct No.</div>
                  <div>Status</div>
                </div>

                {requests.map((req) => (
                  <div
                    className="table-row"
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                  >
                    <div>{req.bank_username}</div>
                    <div>₦{Number(req.amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}</div>
                    <div>{req.bank_name}</div>
                    <div>{req.account_number}</div>
                    <div className="status-cell">{req.sent_or_pending}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Transfer Section */}
          {transfers.length > 0 && (
            <>
              <h3 className="section-title" style={{ marginTop: "2rem" }}>
                🔁 BLURT Transfer Requests
              </h3>
              <div className="message-table">
                <div className="table-header">
                  <div>Receiver</div>
                  <div>Amount</div>
                  <div>Status</div>
                  <div>Date</div>
                </div>

                {transfers.map((tx) => (
                  <div className="table-row" key={tx.id}>
                    <div>{tx.busername}</div>
                    <div>{Number(tx.amount).toFixed(3)} BLURT</div>
                    <div className="status-cell">
                      {tx.read ? (
                        <span style={{ color: "#00ff99" }}>✅ Sent</span>
                      ) : (
                        <span style={{ color: "#ffcc00" }}>⌛ Pending</span>
                      )}
                    </div>
                    <div>
                      {new Date(tx.created_at).toLocaleString("en-NG", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Withdraw Details Popup */}
      {selectedRequest && (
        <div className="popup-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h3>Withdraw Request Details</h3>
            <p><strong>Account Name:</strong> {selectedRequest.bank_username}</p>
            <p><strong>Amount:</strong> ₦{Number(selectedRequest.amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}</p>
            <p><strong>Bank:</strong> {selectedRequest.bank_name}</p>
            <p><strong>Account Number:</strong> {selectedRequest.account_number}</p>
            <p><strong>Status:</strong> {selectedRequest.sent_or_pending}</p>
            <p><strong>Date:</strong> {new Date(selectedRequest.created_at).toLocaleString()}</p>

            <div className="popup-buttons">
              <button className="btn cancel" onClick={() => setSelectedRequest(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
