import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuthContext } from "../contexts/AuthContext";
import chefImg from "../assets/chef.png";
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
  restaurant: {
    id: number;
    name: string;
    adress?: string;
    city?: string;
    phone?: string;
    email?: string;
    description?: string;
    user?: {
      id: number;
      firstName: string;
      lastName: string;
    };
  };
  status: string;
  createdAt: string;
  isVirtual?: boolean; // true za restorane bez verification requesta
}

interface ReviewItem {
  id: number;
  type: 'comment' | 'rating';
  content: string;
  rating?: number;
  isVisible?: boolean;
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

interface Restaurant {
  id: number;
  name: string;
  adress?: string;
  city?: string;
  phone?: string;
  email?: string;
  description?: string;
  verified?: boolean;
  createdAt?: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

type TabType = "verification" | "users" | "moderation" | "restaurants";

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("verification");
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Data states
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount and tab change
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (activeTab === "verification") {
        // Dohvati postojeće verification requests
        const pendingRequests = await api.getPendingVerifications();
        
        // Dohvati sve restorane
        const allRestaurants = await api.getRestaurants();
        
        // Filtriraj neverificirane restorane koji NEMAJU verification request
        const restaurantIdsWithRequest = new Set(
          pendingRequests.map((req: VerificationRequest) => req.restaurant?.id)
        );
        
        const unverifiedWithoutRequest = allRestaurants
          .filter((r: Restaurant) => !r.verified && !restaurantIdsWithRequest.has(r.id))
          .map((r: Restaurant) => ({
            // Kreiraj "virtualni" verification request za prikaz
            id: -r.id, // Negativan ID za razlikovanje
            restaurant: {
              id: r.id,
              name: r.name,
              adress: r.adress,
              city: r.city,
              phone: r.phone,
              email: r.email,
              description: r.description,
              user: r.user,
            },
            status: 'pending',
            createdAt: r.createdAt || new Date().toISOString(),
            isVirtual: true, // Oznaka da je virtualni request
          }));
        
        // Kombiniraj i sortiraj
        const combined = [...pendingRequests, ...unverifiedWithoutRequest];
        setVerificationRequests(combined);
      } else if (activeTab === "users") {
        const data = await api.getAllUsers();
        // Filter out admin users from the list
        setUsers(data.filter((user: User) => user.role !== "admin"));
      } else if (activeTab === "moderation") {
        // Dohvati sve restorane pa za svaki dohvati ratinge
        const allReviews: ReviewItem[] = [];
        
        // Dohvati sve restorane (uključujući neverificirane za admin)
        const restaurants = await api.getRestaurants();
        
        // Za svaki restoran dohvati ratinge
        for (const restaurant of restaurants) {
          try {
            const ratings = await api.getRatingsByRestaurant(restaurant.id);
            // Pretvori ratinge u ReviewItem format
            for (const rating of ratings) {
              if (rating.comment) { // Samo ako ima komentar
                allReviews.push({
                  id: rating.id,
                  type: 'rating',
                  content: rating.comment,
                  rating: rating.rating,
                  createdAt: rating.createdAt,
                  user: rating.user,
                  restaurant: {
                    id: restaurant.id,
                    name: restaurant.name
                  }
                });
              }
            }
          } catch (err) {
            console.error(`Failed to fetch ratings for restaurant ${restaurant.id}:`, err);
          }
        }
        
        allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReviews(allReviews);
      } else if (activeTab === "restaurants") {
        const data = await api.getRestaurants();
        setRestaurants(data);
      }
    } catch (err: any) {
      setError(err.message || "Greška pri dohvaćanju podataka");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const { logout } = useAuthContext();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // ==================== VERIFICATION ACTIONS ====================
  const handleApproveVerification = async (verification: VerificationRequest) => {
    try {
      if (verification.isVirtual) {
        // Za virtualne requestove - direktno verificiraj restoran
        await api.updateRestaurant(verification.restaurant.id, { verified: true });
      } else {
        // Za prave verification requestove
        await api.approveVerification(verification.id);
      }
      setVerificationRequests(prev => prev.filter(v => v.id !== verification.id));
      setSelectedVerification(null);
      alert("Restoran je uspješno verificiran!");
    } catch (err: any) {
      alert(err.message || "Greška pri odobravanju verifikacije");
    }
  };

  const handleRejectVerification = async (verification: VerificationRequest) => {
    const reason = prompt("Unesite razlog odbijanja:");
    if (!reason) return;
    
    try {
      if (verification.isVirtual) {
        // Za virtualne requestove - samo ukloni iz liste (restoran ostaje neverificiran)
        // Opcionalno: moglo bi se implementirati slanje emaila vlasniku
        alert("Restoran nije verificiran. Vlasnik će morati poslati novi zahtjev.");
      } else {
        // Za prave verification requestove
        await api.rejectVerification(verification.id, reason);
        alert("Zahtjev za verifikaciju je odbijen.");
      }
      setVerificationRequests(prev => prev.filter(v => v.id !== verification.id));
      setSelectedVerification(null);
    } catch (err: any) {
      alert(err.message || "Greška pri odbijanju verifikacije");
    }
  };

  const handleDeleteVerification = async (id: number) => {
    if (!confirm("Jeste li sigurni da želite obrisati ovaj zahtjev?")) return;
    
    try {
      // Note: If there's no delete endpoint, we just remove from UI
      setVerificationRequests(prev => prev.filter(v => v.id !== id));
      setSelectedVerification(null);
      alert("Zahtjev je uklonjen.");
    } catch (err: any) {
      alert(err.message || "Greška pri brisanju zahtjeva");
    }
  };

  // ==================== USER ACTIONS ====================
  const handleBlockUser = async (userId: number) => {
    try {
      await api.blockUser(userId);
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, isBlocked: true } : u
      ));
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
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, isBlocked: false } : u
      ));
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

  const handleChangeRole = async (userId: number, newRole: string) => {
    if (!confirm(`Jeste li sigurni da želite promijeniti ulogu korisnika u "${newRole}"?`)) return;
    
    try {
      await api.changeUserRole(userId, newRole);
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
      alert("Uloga korisnika je promijenjena.");
    } catch (err: any) {
      alert(err.message || "Greška pri promjeni uloge korisnika");
    }
  };

  // ==================== REVIEW/RATING ACTIONS ====================
  const handleDeleteReview = async (review: ReviewItem) => {
    if (!confirm("Jeste li sigurni da želite obrisati ovu recenziju?")) return;
    
    try {
      if (review.type === 'rating') {
        await api.deleteRating(review.id);
      } else {
        await api.deleteComment(review.id);
      }
      setReviews(prev => prev.filter(r => !(r.id === review.id && r.type === review.type)));
      setSelectedReview(null);
      alert("Recenzija je obrisana.");
    } catch (err: any) {
      alert(err.message || "Greška pri brisanju recenzije");
    }
  };

  const handleDeleteRestaurant = async (restaurantId: number) => {
    if (!confirm("Jeste li sigurni da želite obrisati ovaj restoran? Ova radnja će obrisati sve povezane podatke (slike, evente, recenzije).")) return;
    
    try {
      await api.deleteRestaurant(restaurantId);
      setRestaurants(prev => prev.filter(r => r.id !== restaurantId));
      setSelectedRestaurant(null);
      alert("Restoran je uspješno obrisan.");
    } catch (err: any) {
      alert(err.message || "Greška pri brisanju restorana");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("hr-HR");
  };

  const renderVerificationTab = () => {
    if (selectedVerification) {
      return (
        <div className="admin-detail-view">
          <h2>Restorani na čekanju verifikacije ({verificationRequests.length})</h2>
          <button className="back-button" onClick={() => setSelectedVerification(null)}>
            ← Nazad
          </button>

          <div className="detail-content">
            <div className="detail-row">
              <span className="detail-label">Naziv restorana</span>
              <span className="detail-value">{selectedVerification.restaurant.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Vlasnik</span>
              <span className="detail-value">
                {selectedVerification.restaurant.user 
                  ? `${selectedVerification.restaurant.user.firstName} ${selectedVerification.restaurant.user.lastName}`
                  : "Nepoznato"}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email</span>
              <span className="detail-value">{selectedVerification.restaurant.email || "N/A"}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Telefon</span>
              <span className="detail-value">{selectedVerification.restaurant.phone || "N/A"}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Mjesto</span>
              <span className="detail-value">{selectedVerification.restaurant.city || "N/A"}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Adresa</span>
              <span className="detail-value">{selectedVerification.restaurant.adress || "N/A"}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Opis</span>
              <span className="detail-value">{selectedVerification.restaurant.description || "N/A"}</span>
            </div>
            {selectedVerification.isVirtual && (
              <div className="detail-row">
                <span className="detail-label">Napomena</span>
                <span className="detail-value" style={{ color: '#f57c00', fontStyle: 'italic' }}>
                  Restoran je ručno dodan u bazu bez formalnog zahtjeva za verifikaciju.
                </span>
              </div>
            )}
          </div>

          <div className="detail-actions">
            <button 
              className="action-btn approve"
              onClick={() => handleApproveVerification(selectedVerification)}
            >
              Odobri
            </button>
            <button 
              className="action-btn reject"
              onClick={() => handleRejectVerification(selectedVerification)}
            >
              Odbij
            </button>
            {!selectedVerification.isVirtual && (
              <button 
                className="action-btn delete-outline"
                onClick={() => handleDeleteVerification(selectedVerification.id)}
              >
                Obriši
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="admin-list-view">
        <h2>Restorani na čekanju verifikacije ({verificationRequests.length})</h2>
        {loading && <p>Učitavanje...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && verificationRequests.length === 0 && (
          <p className="no-data">Nema zahtjeva za verifikaciju.</p>
        )}
        <div className="list-items">
          {verificationRequests.map((request) => (
            <div
              key={request.id}
              className="list-item verification-card"
              onClick={() => setSelectedVerification(request)}
            >
              <div className="verification-card-left">
                <div className="verification-status">Na čekanju</div>
              </div>
              
              <div className="verification-card-content">
                <div className="verification-card-title">
                  <h3>{request.restaurant.name}</h3>
                </div>
                
                <div className="verification-card-info">
                  <div className="info-group">
                    <span className="info-label">Owner</span>
                    <span className="info-value">
                      {request.restaurant.user 
                        ? `${request.restaurant.user.firstName} ${request.restaurant.user.lastName}`
                        : "Unknown"}
                    </span>
                  </div>
                  
                  {request.restaurant.city && (
                    <div className="info-group">
                      <span className="info-label">Location</span>
                      <span className="info-value">{request.restaurant.city}</span>
                    </div>
                  )}
                  
                  {request.restaurant.phone && (
                    <div className="info-group">
                      <span className="info-label">Phone</span>
                      <span className="info-value">{request.restaurant.phone}</span>
                    </div>
                  )}
                </div>
                
                {request.restaurant.description && (
                  <p className="verification-description">{request.restaurant.description.substring(0, 120)}</p>
                )}
              </div>
              
              <div className="verification-card-right">
                <span className="date-label">{formatDate(request.createdAt)}</span>
                <span className="action-arrow">›</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderUsersTab = () => {
    if (selectedUser) {
      return (
        <div className="admin-detail-view">
          <h2>Upravljanje korisnicima</h2>
          <button className="back-button" onClick={() => setSelectedUser(null)}>
            ← Nazad
          </button>

          <div className="detail-content">
            <div className="detail-row">
              <span className="detail-label">Korisničko ime</span>
              <span className="detail-value">{selectedUser.firstName} {selectedUser.lastName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email</span>
              <span className="detail-value">{selectedUser.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Uloga</span>
              <div className="detail-value role-control">
                <select 
                  value={selectedUser.role}
                  onChange={(e) => handleChangeRole(selectedUser.id, e.target.value)}
                  className="role-select"
                >
                  <option value="user">user</option>
                  <option value="restaurant">restaurant</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <span className={`detail-value status-${selectedUser.isBlocked ? 'blocked' : 'active'}`}>
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
                className="action-btn approve"
                onClick={() => handleUnblockUser(selectedUser.id)}
              >
                Odblokiraj
              </button>
            ) : (
              <button 
                className="action-btn block"
                onClick={() => handleBlockUser(selectedUser.id)}
              >
                Blokiraj
              </button>
            )}
            <button 
              className="action-btn delete-outline"
              onClick={() => handleDeleteUser(selectedUser.id)}
            >
              Obriši
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="admin-list-view">
        <h2>Upravljanje korisnicima</h2>
        {loading && <p>Učitavanje...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && users.length === 0 && (
          <p className="no-data">Nema korisnika.</p>
        )}
        <div className="list-items">
          {users.map((user) => (
            <div
              key={user.id}
              className="list-item"
              onClick={() => setSelectedUser(user)}
            >
              <div className="item-info">
                <span className="item-name">{user.firstName} {user.lastName}</span>
                <span className="item-details">{user.email}</span>
              </div>
              <span className={`status-badge ${user.isBlocked ? 'blocked' : 'active'}`}>
                {user.isBlocked ? '⊘ Blokiran' : '✓ Aktivan'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderModerationTab = () => {
    if (selectedReview) {
      return (
        <div className="admin-detail-view">
          <h2>Moderiranje sadržaja</h2>
          <button className="back-button" onClick={() => setSelectedReview(null)}>
            ← Nazad
          </button>

          <div className="detail-content">
            <div className="detail-row">
              <span className="detail-label">Restoran</span>
              <span className="detail-value">{selectedReview.restaurant?.name || "Nepoznato"}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Autor</span>
              <span className="detail-value">
                {selectedReview.user 
                  ? `${selectedReview.user.firstName} ${selectedReview.user.lastName}`
                  : "Nepoznato"}
              </span>
            </div>
            {selectedReview.rating && (
              <div className="detail-row">
                <span className="detail-label">Ocjena</span>
                <span className="detail-value">{selectedReview.rating}/5</span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Komentar</span>
              <span className="detail-value comment-content">"{selectedReview.content}"</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Datum</span>
              <span className="detail-value">{formatDate(selectedReview.createdAt)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Tip</span>
              <span className="detail-value">{selectedReview.type === 'rating' ? 'Recenzija' : 'Komentar'}</span>
            </div>
          </div>

          <div className="detail-actions detail-actions-full">
            <button 
              className="action-btn delete full-width"
              onClick={() => handleDeleteReview(selectedReview)}
            >
              Obriši recenziju
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="admin-list-view">
        <h2>Sve recenzije ({reviews.length})</h2>
        {loading && <p>Učitavanje recenzija...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && reviews.length === 0 && (
          <p className="no-data">Nema recenzija za prikaz.</p>
        )}
        <div className="list-items">
          {reviews.map((review) => (
            <div
              key={`${review.type}-${review.id}`}
              className="list-item moderation-item"
              onClick={() => setSelectedReview(review)}
            >
              <div className="item-info">
                <div className="moderation-header">
                  <span className="moderation-restaurant">{review.restaurant?.name || "Nepoznati restoran"}</span>
                  {review.rating && (
                    <span className="rating-badge">
                      {review.rating}/5
                    </span>
                  )}
                </div>
                <span className="item-content">"{review.content.length > 100 ? review.content.substring(0, 100) + '...' : review.content}"</span>
                <span className="item-details">
                  Autor: {review.user 
                    ? `${review.user.firstName} ${review.user.lastName}`
                    : "Nepoznato"} • {formatDate(review.createdAt)}
                </span>
              </div>
              <span className="item-action">→</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRestaurantsTab = () => {
    if (selectedRestaurant) {
      return (
        <div className="admin-detail-view">
          <h2>Detalji restorana</h2>
          <button className="back-button" onClick={() => setSelectedRestaurant(null)}>
            ← Nazad
          </button>

          <div className="detail-content">
            <div className="detail-row">
              <span className="detail-label">Naziv</span>
              <span className="detail-value">{selectedRestaurant.name}</span>
            </div>
            {selectedRestaurant.city && (
              <div className="detail-row">
                <span className="detail-label">Grad</span>
                <span className="detail-value">{selectedRestaurant.city}</span>
              </div>
            )}
            {selectedRestaurant.adress && (
              <div className="detail-row">
                <span className="detail-label">Adresa</span>
                <span className="detail-value">{selectedRestaurant.adress}</span>
              </div>
            )}
            {selectedRestaurant.phone && (
              <div className="detail-row">
                <span className="detail-label">Telefon</span>
                <span className="detail-value">{selectedRestaurant.phone}</span>
              </div>
            )}
            {selectedRestaurant.email && (
              <div className="detail-row">
                <span className="detail-label">Email</span>
                <span className="detail-value">{selectedRestaurant.email}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Status verifikacije</span>
              <span className={`detail-value status-${selectedRestaurant.verified ? 'active' : 'blocked'}`}>
                {selectedRestaurant.verified ? "VERIFICIRAN" : "NIJE VERIFICIRAN"}
              </span>
            </div>
            {selectedRestaurant.user && (
              <div className="detail-row">
                <span className="detail-label">Vlasnik</span>
                <span className="detail-value">
                  {selectedRestaurant.user.firstName} {selectedRestaurant.user.lastName}
                </span>
              </div>
            )}
            {selectedRestaurant.description && (
              <div className="detail-row">
                <span className="detail-label">Opis</span>
                <span className="detail-value">{selectedRestaurant.description}</span>
              </div>
            )}
          </div>

          <div className="detail-actions detail-actions-full">
            <button 
              className="action-btn delete full-width"
              onClick={() => handleDeleteRestaurant(selectedRestaurant.id)}
            >
              Obriši restoran
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="admin-list-view">
        <h2>Svi restorani ({restaurants.length})</h2>
        {loading && <p>Učitavanje...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && restaurants.length === 0 && (
          <p className="no-data">Nema restorana.</p>
        )}
        <div className="list-items">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="list-item"
              onClick={() => setSelectedRestaurant(restaurant)}
            >
              <div className="item-info">
                <span className="item-name">{restaurant.name}</span>
                <span className="item-details">
                  {restaurant.city}{restaurant.adress ? `, ${restaurant.adress}` : ''}
                </span>
              </div>
              <span className={`status-badge ${restaurant.verified ? 'active' : 'pending'}`}>
                {restaurant.verified ? '✓ Verificiran' : '⏳ Nije verificiran'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="admin-dashboard">
      {/* Header - Moderan dizajn kao Dashboard */}
      <header className="admin-dashboard-header">
        <div className="dashboard-header-content">
          <Link to="/" className="dashboard-logo">
            RestoraniZEGE
          </Link>
          <div className="dashboard-header-center">
            <img className="dashboard-chef-img" src={chefImg} alt="Chef" />
          </div>
          <div className="dashboard-user">
            <span className="user-name">Administrator</span>
            <button className="logout-btn" onClick={handleLogout}>
              Odjava
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-container">
          {/* Tabs */}
          <div className="admin-tabs">
            <button
              className={`tab-btn ${activeTab === "verification" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("verification");
                setSelectedVerification(null);
              }}
            >
              Verifikacija restorana
              {verificationRequests.length > 0 && (
                <span className="tab-badge">{verificationRequests.length}</span>
              )}
            </button>
            <button
              className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("users");
                setSelectedUser(null);
              }}
            >
              Upravljanje korisnicima
            </button>
            <button
              className={`tab-btn ${activeTab === "moderation" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("moderation");
                setSelectedReview(null);
              }}
            >
              Moderiranje sadržaja
              {reviews.length > 0 && (
                <span className="tab-badge">{reviews.length}</span>
              )}
            </button>
            <button
              className={`tab-btn ${activeTab === "restaurants" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("restaurants");
                setSelectedRestaurant(null);
              }}
            >
              Svi restorani
            </button>
          </div>

          {/* Tab Content */}
          <div className="admin-content">
            {activeTab === "verification" && renderVerificationTab()}
            {activeTab === "users" && renderUsersTab()}
            {activeTab === "moderation" && renderModerationTab()}
            {activeTab === "restaurants" && renderRestaurantsTab()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
