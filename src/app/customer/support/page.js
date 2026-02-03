"use client";
import { useEffect, useState, useRef } from "react";
import Sidebar from "../partials/Sidebar";
import {
  getCustomerSupportTickets,
  createCustomerSupportTicket,
  getCustomerSupportTicketConv,
  replyCustomerSupportTicket,
  closeCustomerSupportTicket,
} from "@/lib/api/global.service";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const TICKET_TYPES = [
  "Website problem",
  "Partner request",
  "Complaint",
  "Info inquiry",
];
const TICKET_PRIORITIES = ["Urgent", "High", "Medium", "Low"];

function formatDate(date) {
  return new Date(date).toLocaleString();
}

export default function SupportTicketPage() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("snapcart_token");
    if (!token) {
      if (!localStorage.getItem("snapcart_token")) {
        localStorage.setItem("snapcart_last_route", window.location.pathname);
        router.push("/auth/login");
      }
      return;
    }
  }, [router]);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalForm, setModalForm] = useState({
    subject: "",
    type: TICKET_TYPES[0],
    priority: TICKET_PRIORITIES[0],
    description: "",
    images: [],
  });
  const [modalErrors, setModalErrors] = useState({});
  const [showConv, setShowConv] = useState(false);
  const [convLoading, setConvLoading] = useState(false);
  const [conv, setConv] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyMsg, setReplyMsg] = useState("");
  const [replyImages, setReplyImages] = useState([]);
  const [replyLoading, setReplyLoading] = useState(false);

  // Load tickets
  useEffect(() => {
    setLoading(true);
    getCustomerSupportTickets()
      .then(setTickets)
      .catch(() => router.replace("/auth/login"))
      .finally(() => setLoading(false));
  }, []);

  // Modal form handlers
  const handleModalChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images" && files) {
      setModalForm((f) => ({
        ...f,
        images: [...f.images, ...Array.from(files)],
      }));
    } else {
      setModalForm((f) => ({ ...f, [name]: value }));
    }
    setModalErrors((e) => ({ ...e, [name]: undefined }));
  };
  const handleRemoveModalImage = (idx) => {
    setModalForm((f) => ({
      ...f,
      images: f.images.filter((_, i) => i !== idx),
    }));
  };

  // Create ticket
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setModalErrors({});
    if (!modalForm.subject) return setModalErrors({ subject: "Required" });
    if (!modalForm.type) return setModalErrors({ type: "Required" });
    if (!modalForm.priority) return setModalErrors({ priority: "Required" });
    if (!modalForm.description) return setModalErrors({ description: "Required" });
    setModalLoading(true);
    try {
      await createCustomerSupportTicket(modalForm);
      toast.success("Ticket created!");
      setShowModal(false);
      setModalForm({
        subject: "",
        type: TICKET_TYPES[0],
        priority: TICKET_PRIORITIES[0],
        description: "",
        images: [],
      });
      // Reload tickets
      setLoading(true);
      getCustomerSupportTickets()
        .then(setTickets)
        .finally(() => setLoading(false));
    } catch (err) {
      router.replace("/auth/login")
    }
    setModalLoading(false);
  };

  // Conversation
  const handleShowConv = async (ticket) => {
    setActiveTicket(ticket);
    setShowConv(true);
    setConvLoading(true);
    try {
      const data = await getCustomerSupportTicketConv(ticket.id);
      setConv(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load conversation");
      setConv([]);
    }
    setConvLoading(false);
  };

  // Reply
  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMsg && replyImages.length === 0) return;
    setReplyLoading(true);
    try {
      await replyCustomerSupportTicket(activeTicket.id, replyMsg, replyImages);
      setReplyMsg("");
      setReplyImages([]);
      // Reload conversation
      const data = await getCustomerSupportTicketConv(activeTicket.id);
      setConv(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to send reply");
    }
    setReplyLoading(false);
  };
  const handleRemoveReplyImage = (idx) => {
    setReplyImages((imgs) => imgs.filter((_, i) => i !== idx));
  };

  // Close ticket
  const handleCloseTicket = async () => {
    try {
      await closeCustomerSupportTicket(activeTicket.id);
      toast.success("Ticket closed");
      setShowConv(false);
      setActiveTicket(null);
      // Reload tickets
      setLoading(true);
      getCustomerSupportTickets()
        .then(setTickets)
        .finally(() => setLoading(false));
    } catch {
      toast.error("Failed to close ticket");
    }
  };

  // UI
  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* Sidebar */}
        <div className="col-12 col-lg-3">
          <Sidebar active={6} />
        </div>
        {/* Main Content */}
        <div className="col-12 col-lg-9">
          <div className="bg-white rounded-4 shadow-sm p-4 p-md-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0">Support ticket</h4>
              <button className="btn btn-light border" onClick={() => setShowModal(true)}>
                Add New Ticket
              </button>
            </div>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="cart-table-header">
                    <th>Topic</th>
                    <th>Submission date</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">Loading...</td>
                    </tr>
                  ) : tickets.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">No support tickets found.</td>
                    </tr>
                  ) : (
                    tickets.map((t) => (
                      <tr key={t.id}>
                        <td>{t.subject}</td>
                        <td>{formatDate(t.created_at)}</td>
                        <td>{t.type}</td>
                        <td>
                          <span className="badge" style={{
                            background: t.status === "open" ? "#fbbf24" : "#22c55e",
                            color: "#fff",
                            fontWeight: 500,
                            fontSize: 14,
                          }}>
                            {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-light border rounded-circle me-2" title="View" onClick={() => handleShowConv(t)}>
                            <i className="fas fa-eye text-primary"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Modal: Create Ticket */}
      {showModal && (
        <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.25)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleCreateTicket}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Submit new ticket</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-2 text-muted">You will get response.</div>
                  <div className="row g-3">
                    <div className="col-md-12">
                      <label className="form-label fw-semibold">Subject</label>
                      <input
                        type="text"
                        className={`form-control${modalErrors.subject ? " is-invalid" : ""}`}
                        name="subject"
                        value={modalForm.subject}
                        onChange={handleModalChange}
                        required
                      />
                      {modalErrors.subject && <div className="invalid-feedback">{modalErrors.subject}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Type</label>
                      <select
                        className="form-control"
                        name="type"
                        value={modalForm.type}
                        onChange={handleModalChange}
                        required
                      >
                        {TICKET_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Priority</label>
                      <select
                        className="form-control"
                        name="priority"
                        value={modalForm.priority}
                        onChange={handleModalChange}
                        required
                      >
                        {TICKET_PRIORITIES.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-12">
                      <label className="form-label fw-semibold">Describe your issue</label>
                      <textarea
                        className={`form-control${modalErrors.description ? " is-invalid" : ""}`}
                        name="description"
                        rows={4}
                        value={modalForm.description}
                        onChange={handleModalChange}
                        required
                      />
                      {modalErrors.description && <div className="invalid-feedback">{modalErrors.description}</div>}
                    </div>
                    <div className="col-md-12">
                      <label className="form-label fw-semibold">Attachment</label>
                      <div className="d-flex gap-2 flex-wrap mb-2">
                        {modalForm.images.map((img, idx) => (
                          <div key={idx} className="position-relative" style={{ width: 60, height: 60 }}>
                            <img
                              src={URL.createObjectURL(img)}
                              alt="attachment"
                              style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger pt-1 d-flex align-items-center position-absolute"
                              style={{ top: -8, right: -8, borderRadius: "50%", padding: 2, width: 20, height: 20 }}
                              onClick={() => handleRemoveModalImage(idx)}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        ))}
                        {modalForm.images.length < 3 && (
                          <label className="d-flex align-items-center justify-content-center border rounded" style={{ width: 60, height: 60, cursor: "pointer" }}>
                            <i className="fas fa-image text-muted"></i>
                            <input
                              type="file"
                              name="images"
                              accept="image/*"
                              multiple
                              style={{ display: "none" }}
                              onChange={handleModalChange}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-dark" onClick={() => setShowModal(false)}>Close</button>
                  <button type="submit" className="btn btn-primary" disabled={modalLoading}>
                    {modalLoading ? "Submitting..." : "Submit a ticket"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Modal: Conversation */}
      {showConv && (
        <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.25)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{ minHeight: 500 }}>
              <div className="modal-header">
                <div>
                  <div className="fw-bold">{activeTicket?.subject}</div>
                  <div>
                    <span className="badge bg-warning text-dark me-2">{activeTicket?.type}</span>
                    <span className="badge bg-primary me-2">{activeTicket?.priority}</span>
                    <span className="badge" style={{
                      background: activeTicket?.status === "open" ? "#fbbf24" : "#22c55e",
                      color: "#fff",
                    }}>
                      {activeTicket?.status?.charAt(0).toUpperCase() + activeTicket?.status?.slice(1)}
                    </span>
                  </div>
                </div>
                <button type="button" className="btn btn-outline-danger" onClick={handleCloseTicket}>
                  Close This Ticket
                </button>
                <button type="button" className="btn-close ms-2" onClick={() => setShowConv(false)}></button>
              </div>
              <div className="modal-body" style={{ background: "#f9fafb", minHeight: 300, maxHeight: 400, overflowY: "auto" }}>
                {convLoading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : conv.length === 0 ? (
                  <div className="text-center py-4 text-muted">No conversation found.</div>
                ) : (
                  conv.map((msg, idx) => (
                    <div key={idx} className="mb-4">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="fw-bold">{msg.admin_id ? "Support" : "You"}</span>
                        <span className="text-muted small">{formatDate(msg.created_at)}</span>
                      </div>
                      <div>
                        {msg.customer_message && (
                          <div className="bg-white rounded-3 p-2 mb-2">{msg.customer_message}</div>
                        )}
                        {msg.admin_message && (
                          <div className="bg-primary text-white rounded-3 p-2 mb-2">{msg.admin_message}</div>
                        )}
                        {Array.isArray(msg.attachment_full_url) && msg.attachment_full_url.length > 0 && (
                          <div className="d-flex gap-2 flex-wrap">
                            {msg.attachment_full_url.map((a, i) => (
                              <img
                                key={i}
                                src={a.path}
                                alt="attachment"
                                style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleReply}>
                <div className="modal-footer d-flex align-items-end gap-2">
                  <label className="d-flex align-items-center justify-content-center border rounded" style={{ width: 40, height: 40, cursor: "pointer" }}>
                    <i className="fas fa-image text-muted"></i>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: "none" }}
                      onChange={(e) => setReplyImages([...replyImages, ...Array.from(e.target.files)])}
                    />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Write your message here..."
                    value={replyMsg}
                    onChange={(e) => setReplyMsg(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary" disabled={replyLoading || (!replyMsg && replyImages.length === 0)}>
                    <i className="fas fa-paper-plane"></i>
                  </button>
                  {/* Show selected images */}
                  {replyImages.map((img, idx) => (
                    <div key={idx} className="position-relative" style={{ width: 40, height: 40 }}>
                      <img
                        src={URL.createObjectURL(img)}
                        alt="attachment"
                        style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-danger position-absolute"
                        style={{ top: -8, right: -8, borderRadius: "50%", padding: 2 }}
                        onClick={() => handleRemoveReplyImage(idx)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .modal.fade.show {
          display: block;
          background: rgba(0,0,0,0.25);
        }
        .modal-dialog {
          max-width: 900px;
        }
      `}</style>
    </div>
  );
}
