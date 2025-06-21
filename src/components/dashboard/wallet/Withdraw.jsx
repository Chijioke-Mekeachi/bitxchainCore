import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import "./withdraw.css";

export default function MyWithdrawRequests() {
  const [requests, setRequests] = useState([]);
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
    fetchMyRequests(user.email);
  };

  const fetchMyRequests = async (email) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("withdraw_requests")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching withdraw requests:", error);
    } else {
      setRequests(data);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this request?");
    if (!confirm) return;

    const { error } = await supabase
      .from("withdraw_requests")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      return;
    }

    setRequests((prev) => prev.filter((req) => req.id !== id));
    setSelectedRequest(null);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>🧾 My Withdraw Requests</h2>
        <button className="refresh-button" onClick={() => fetchMyRequests(userEmail)}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <p className="loading">Loading...</p>
      ) : requests.length === 0 ? (
        <p className="loading">No withdraw requests found.</p>
      ) : (
        <div className="message-table">
          <div className="table-header">
            <div>Account Name</div>
            <div>Amount</div>
            <div>Bank</div>
            <div>Account Number</div>
            <div>Status</div>
          </div>

          {requests.map((req) => (
            <div
              className="table-row"
              key={req.id}
              onClick={() => setSelectedRequest(req)}
            >
              <div>{req.bank_username}</div>
              <div>
                ₦{Number(req.amount).toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                })}
              </div>
              <div>{req.bank_name}</div>
              <div>{req.account_number}</div>
              <div className="status-cell">{req.sent_or_pending}</div>
            </div>
          ))}
        </div>
      )}

      {selectedRequest && (
        <div className="popup-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h3>Request Details</h3>
            <p><strong>Account Name:</strong> {selectedRequest.bank_username}</p>
            <p><strong>Amount:</strong> ₦{Number(selectedRequest.amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}</p>
            <p><strong>Bank:</strong> {selectedRequest.bank_name}</p>
            <p><strong>Account Number:</strong> {selectedRequest.account_number}</p>
            <p><strong>Status:</strong> {selectedRequest.sent_or_pending}</p>
            <p><strong>Date:</strong> {new Date(selectedRequest.created_at).toLocaleString()}</p>

            <div className="btn-holder">
              <button className="btn red" onClick={() => handleDelete(selectedRequest.id)}>🗑 Delete</button>
              <button className="close-button" onClick={() => setSelectedRequest(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
