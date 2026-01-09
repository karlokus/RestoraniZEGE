import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import { api } from "../services/api";
import "../css/AdminDashboard.css";

// Types
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isBlocked: boolean;
  createdAt: string;
}

interface VerificationRequest {
  id: number;
  status: string;
  restaurant: {
    id: number;
    name: string;
    adress?: string;
    city?: string;
    phone?: string;
    email?: string;
    description?: string;
  };
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  requestedAt: string;
}

interface Comment {
  id: number;
  content: string;
  isVisible: boolean;
  createdAt: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  restaurant?: {
    id: number;
    name: string;
  };
}

type TabType = "verification" | "users" | "moderation";

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthContext();
  const [activeTab, setActiveTab] = useState<TabType>("verification");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for each tab
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  
  // Selected items for detailed view
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.role !== "admin") {
      navigate("/");
      return;
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      fetchData();
    }
  }, [activeTab, isAuthenticated, user]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      switch (activeTab) {
        case "verification":
          const requests = await api.getPendingVerifications();
          setVerificationRequests(requests);
          break;
        case "users":
          const allUsers = await api.getAllUsers();
          setUsers(allUsers);
          break;
        case "moderation":
          const allComments = await api.getAllComments();
          setComments(allComments);
          break;
      }
    } catch (err: any) {
      console.error("Failed to fetch data:", err);
      setError(err.message || "Greška pri dohvaćanju podataka");
    } finally {
      setLoading(false);
    }
  };

  // Verification handlers
  const handleApproveVerification = async (id: number) => {
    try {
      await api.approveVerification(id);
      setVerificationRequests(prev => prev.filter(r => r.id !== id));
      setSelectedVerification(null);
      alert("Zahtjev za verifikaciju odobren!");
    } catch (err: any) {
      alert(err.message || "Greška pri odobravanju zahtjeva");
    }
  };

  const handleRejectVerification = async (id: number) => {
    const reason = prompt("Unesite razlog odbijanja:");
    if (!reason) return;
    
    try {
      await api.rejectVerification(id, reason);
      setVerificationRequests(prev => prev.filter(r => r.id !== id));
      setSelectedVerification(null);
      alert("Zahtjev za verifikaciju odbijen.");
    } catch (err: any) {
      alert(err.message || "Greška pri odbijanju zahtjeva");
    }
  };

  const handleDeleteRestaurant = async (restaurantId: number) => {
    if (!confirm("Jeste li sigurni da želite obrisati ovaj restoran?")) return;
    
    try {
      await api.deleteRestaurant(restaurantId);
      setVerificationRequests(prev => prev.filter(r => r.restaurant.id !== restaurantId));
      setSelectedVerification(null);
      alert("Restoran je obrisan.");
    } catch (err: any) {
      alert(err.message || "Greška pri brisanju restorana");
    }
  };

  // User management handlers
  const handleBlockUser = async (userId: number) => {
    try {
      await api.blockUser(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBlocked: true } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, isBlocked: true });
      }
      alert("Korisnik je blokiran.");
    } catch (err: any) {
      alert(err.message || "Greška pri blokiranju korisnika");
    }
  };

  const handleUnblockUser = async (userId: number) => {
    try {
      await api.unblockUser(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBlocked: false } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, isBlocked: false });
      }
      alert("Korisnik je odblokiran.");
    } catch (err: any) {
      alert(err.message || "Greška pri odblokiranju korisnika");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Jeste li sigurni da želite obrisati ovog korisnika?")) return;
    
    try {
      await api.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setSelectedUser(null);
      alert("Korisnik je obrisan.");
    } catch (err: any) {
      alert(err.message || "Greška pri brisanju korisnika");
    }
  };

  // Comment moderation handlers
  const handleApproveComment = async (commentId: number) => {
    try {
      await api.showComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      alert("Komentar je odobren.");
    } catch (err: any) {
      alert(err.message || "Greška pri odobravanju komentara");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Jeste li sigurni da želite ukloniti ovaj komentar?")) return;
    
    try {
      await api.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      alert("Komentar je uklonjen.");
    } catch (err: any) {
      alert(err.message || "Greška pri uklanjanju komentara");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("hr-HR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  // Get counts for tab badges
  const verificationCount = verificationRequests.length;
  const moderationCount = comments.filter(c => !c.isVisible).length;

  return (
    <div className="admin-dashboard">
      {/* Header - same style as Home */}
      <header className="admin-header">
        <div className="header-things">
          <div className="brand-wrap">
            <Link to="/" className="header-title">RestoraniZEGE</Link>
            <span className="brand-sub">ZAGREB</span>
          </div>

          <div className="header-center">
            <span className="admin-page-title">🛡️ Administrator</span>
          </div>

          <div className="header-right">
            <button className="logout-btn" onClick={handleLogout}>
              Odjava
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-container">
          {/* Tabs */}
          <div className="admin-tabs">
            <button
              className={`tab-btn ${activeTab === "verification" ? "active" : ""}`}
              onClick={() => { setActiveTab("verification"); setSelectedUser(null); setSelectedVerification(null); }}
            >
              <span className="tab-icon">🏪</span>
              Verifikacija restorana
              {verificationCount > 0 && <span className="tab-badge">{verificationCount}</span>}
            </button>
            <button
              className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
              onClick={() => { setActiveTab("users"); setSelectedUser(null); setSelectedVerification(null); }}
            >
              <span className="tab-icon">👥</span>
              Upravljanje korisnicima
            </button>
            <button
              className={`tab-btn ${activeTab === "moderation" ? "active" : ""}`}
              onClick={() => { setActiveTab("moderation"); setSelectedUser(null); setSelectedVerification(null); }}
            >
              <span className="tab-icon">💬</span>
              Moderiranje sadržaja
              {moderationCount > 0 && <span className="tab-badge">{moderationCount}</span>}
            </button>
          </div>

          {/* Error message */}
          {error && <div className="admin-error">{error}</div>}

          {/* Loading */}
          {loading && <div className="admin-loading">Učitavanje...</div>}

          {/* Tab content */}
          {!loading && (
            <div className="tab-content">
              {/* Verification Tab */}
              {activeTab === "verification" && (
                <div className="verification-section">
                  {selectedVerification ? (
                    // Verification detail view
                    <div className="detail-view">
                      <h2>Restorani na čekanju verifikacije ({verificationRequests.length})</h2>
                      <button className="btn-back" onClick={() => setSelectedVerification(null)}>
                        ← Nazad
                      </button>
                      
                      <div className="detail-card">
                        <div className="detail-row">
                          <span className="detail-label">Naziv restorana</span>
                          <span className="detail-value bold">{selectedVerification.restaurant.name}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Vlasnik</span>
                          <span className="detail-value">{selectedVerification.user?.firstName} {selectedVerification.user?.lastName}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Email</span>
                          <span className="detail-value link">{selectedVerification.user?.email}</span>
                        </div>
                        {selectedVerification.restaurant.phone && (
                          <div className="detail-row">
                            <span className="detail-label">Telefon</span>
                            <span className="detail-value">{selectedVerification.restaurant.phone}</span>
                          </div>
                        )}
                        <div className="detail-row">
                          <span className="detail-label">Mjesto</span>
                          <span className="detail-value">{selectedVerification.restaurant.city || "Zagreb"}</span>
                        </div>
                        {selectedVerification.restaurant.description && (
                          <div className="detail-row">
                            <span className="detail-label">Opis</span>
                            <span className="detail-value">{selectedVerification.restaurant.description}</span>
                          </div>
                        )}
                      </div>

                      <div className="detail-actions">
                        <button
                          className="btn btn-approve"
                          onClick={() => handleApproveVerification(selectedVerification.id)}
                        >
                          ✓ Odobri
                        </button>
                        <button
                          className="btn btn-reject"
                          onClick={() => handleRejectVerification(selectedVerification.id)}
                        >
                          ✕ Odbij
                        </button>
                        <button
                          className="btn btn-delete-outline"
                          onClick={() => handleDeleteRestaurant(selectedVerification.restaurant.id)}
                        >
                          🗑 Obriši
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Verification list view
                    <>
                      <h2>Restorani na čekanju verifikacije ({verificationRequests.length})</h2>
                      {verificationRequests.length === 0 ? (
                        <p className="empty-message">Nema zahtjeva za verifikaciju.</p>
                      ) : (
                        <div className="list-view">
                          {verificationRequests.map((request) => (
                            <div 
                              key={request.id} 
                              className="list-item"
                              onClick={() => setSelectedVerification(request)}
                            >
                              <div className="list-item-info">
                                <h3>{request.restaurant.name}</h3>
                                <p>Vlasnik: {request.user?.firstName} {request.user?.lastName}</p>
                                <p>Prijava: {formatDate(request.requestedAt)}</p>
                              </div>
                              <button className="btn-icon">👁</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <div className="users-section">
                  {selectedUser ? (
                    // User detail view
                    <div className="detail-view">
                      <h2>Upravljanje korisnicima</h2>
                      <button className="btn-back" onClick={() => setSelectedUser(null)}>
                        ← Nazad
                      </button>
                      
                      <div className="detail-card">
                        <div className="detail-row">
                          <span className="detail-label">Korisničko ime</span>
                          <span className="detail-value bold">{selectedUser.firstName}_{selectedUser.lastName?.toLowerCase()}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Email</span>
                          <span className="detail-value">{selectedUser.email}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Status</span>
                          <span className={`detail-value status ${selectedUser.isBlocked ? "blocked" : "active"}`}>
                            {selectedUser.isBlocked ? "BLOKIRAN" : "AKTIVAN"}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Registracija</span>
                          <span className="detail-value">{formatDate(selectedUser.createdAt)}</span>
                        </div>
                      </div>

                      <div className="detail-actions">
                        {selectedUser.isBlocked ? (
                          <button
                            className="btn btn-unblock"
                            onClick={() => handleUnblockUser(selectedUser.id)}
                          >
                            ✓ Odblokiraj
                          </button>
                        ) : (
                          <button
                            className="btn btn-block"
                            onClick={() => handleBlockUser(selectedUser.id)}
                          >
                            ✕ Blokiraj
                          </button>
                        )}
                        <button
                          className="btn btn-delete-outline"
                          onClick={() => handleDeleteUser(selectedUser.id)}
                        >
                          🗑 Obriši
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Users list view
                    <>
                      <h2>Upravljanje korisnicima</h2>
                      {users.length === 0 ? (
                        <p className="empty-message">Nema korisnika.</p>
                      ) : (
                        <div className="list-view">
                          {users.map((u) => (
                            <div 
                              key={u.id} 
                              className="list-item"
                              onClick={() => setSelectedUser(u)}
                            >
                              <div className="list-item-info">
                                <h3>{u.firstName} {u.lastName}</h3>
                                <p>{u.email}</p>
                              </div>
                              <span className={`status-badge ${u.isBlocked ? "blocked" : "active"}`}>
                                {u.isBlocked ? "✕ Blokiran" : "✓ Aktivan"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Moderation Tab */}
              {activeTab === "moderation" && (
                <div className="moderation-section">
                  <h2>Sadržaj na čekanju moderacije ({comments.filter(c => !c.isVisible).length})</h2>
                  {comments.filter(c => !c.isVisible).length === 0 ? (
                    <p className="empty-message">Nema sadržaja za moderiranje.</p>
                  ) : (
                    <div className="list-view">
                      {comments.filter(c => !c.isVisible).map((comment) => (
                        <div key={comment.id} className="comment-item">
                          <div className="comment-info">
                            <div className="comment-meta">
                              <span className="comment-type">Slika</span>
                              <span className="comment-restaurant">{comment.restaurant?.name}</span>
                            </div>
                            <p className="comment-text">"{comment.content}"</p>
                            <span className="comment-author">Autor: {comment.user?.firstName} {comment.user?.lastName}</span>
                          </div>
                          <button 
                            className="btn-icon-danger"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            ⊘
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Comment actions at bottom */}
                  {comments.filter(c => !c.isVisible).length > 0 && (
                    <div className="moderation-actions">
                      <button className="btn btn-approve-full" onClick={() => {
                        const pendingComments = comments.filter(c => !c.isVisible);
                        if (pendingComments.length > 0) {
                          handleApproveComment(pendingComments[0].id);
                        }
                      }}>
                        ✓ Odobri
                      </button>
                      <button className="btn btn-delete-full" onClick={() => {
                        const pendingComments = comments.filter(c => !c.isVisible);
                        if (pendingComments.length > 0) {
                          handleDeleteComment(pendingComments[0].id);
                        }
                      }}>
                        🗑 Ukloni
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
