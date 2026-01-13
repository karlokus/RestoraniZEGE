import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import { api, type Restaurant } from "../services/api";
import chefImg from "../assets/chef.png";
import "../css/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthContext();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.role !== "restaurant") {
      navigate("/");
      return;
    }

    fetchMyRestaurants();
  }, [isAuthenticated, user, navigate]);

  const fetchMyRestaurants = async () => {
    setLoading(true);
    setError("");
    try {
      // Get all restaurants and filter by owner
      const allRestaurants = await api.getRestaurants();
      console.log("All restaurants:", allRestaurants);
      console.log("Current user:", user);
      const myRestaurants = allRestaurants.filter((r: any) => {
        console.log(`Restaurant ${r.id}:`, {
          restaurantUserId: r.user?.id,
          restaurantDirectUserId: r.userId,
          currentUserId: user?.id,
          matches: r.user?.id === user?.id || r.userId === user?.id
        });
        return r.user?.id === user?.id || r.userId === user?.id;
      });
      console.log("My restaurants:", myRestaurants);
      setRestaurants(myRestaurants);
    } catch (err: any) {
      console.error("Failed to fetch restaurants:", err);
      setError("Nije moguće dohvatiti restorane.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRestaurant = async (id: number, name: string) => {
    if (!confirm(`Jeste li sigurni da želite obrisati restoran "${name}"?`)) {
      return;
    }

    try {
      await api.deleteRestaurant(id);
      setRestaurants(prev => prev.filter(r => r.id !== id));
      alert("Restoran je uspješno obrisan.");
    } catch (err: any) {
      console.error("Failed to delete restaurant:", err);
      alert(err.message || "Nije moguće obrisati restoran.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!isAuthenticated || user?.role !== "restaurant") {
    return null;
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <Link to="/" className="dashboard-logo">
            RestoraniZEGE
          </Link>
          <div className="dashboard-header-center">
            <img className="dashboard-chef-img" src={chefImg} alt="Chef" />
          </div>
          <div className="dashboard-user">
            <span className="user-name">
              {user?.firstName} {user?.lastName}
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              Odjava
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-title-row">
            <div>
              <h1>Moji Restorani</h1>
              <p style={{color: 'var(--text-secondary)', margin: '0.5rem 0 0 0', fontSize: '0.95rem'}}>
                Upravljajte svojim restoranima i događajima
              </p>
            </div>
            <Link to="/dashboard/create-restaurant" className="btn-add-restaurant">
              + Dodaj restoran
            </Link>
          </div>

          {error && <div className="dashboard-error">{error}</div>}

          {loading ? (
            <div className="dashboard-loading">
              <div className="spinner"></div>
              <p>Učitavanje vaših restorana...</p>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="dashboard-empty">
              <div className="empty-icon">🍽️</div>
              <h2>Nemate još nijedan restoran</h2>
              <p>Dodajte svoj prvi restoran i počnite privlačiti goste!</p>
              <Link to="/dashboard/create-restaurant" className="btn-add-restaurant-large">
                Dodaj prvi restoran
              </Link>
            </div>
          ) : (
            <>
              <div style={{
                marginBottom: '1.5rem',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem'
              }}>
                Ukupno restorana: <strong style={{color: 'var(--text-primary)'}}>{restaurants.length}</strong>
              </div>
              <div className="restaurants-grid">
                {restaurants.map((restaurant) => (
                  <div key={restaurant.id} className="restaurant-card">
                    <div className="restaurant-card-header">
                      <h3>{restaurant.name}</h3>
                      <span className={`status-badge ${restaurant.verified ? 'verified' : 'pending'}`}>
                        {restaurant.verified ? 'Verificiran' : 'Na čekanju'}
                      </span>
                    </div>

                    <div className="restaurant-card-body">
                      {restaurant.description && (
                        <p className="restaurant-description">{restaurant.description}</p>
                      )}

                      <div className="restaurant-info">
                        {restaurant.cuisineType && (
                          <div className="info-item">
                            <span className="info-icon">🍴</span>
                            <span>{restaurant.cuisineType}</span>
                          </div>
                        )}
                        {restaurant.adress && (
                          <div className="info-item">
                            <span className="info-icon">📍</span>
                            <span>{restaurant.adress}, {restaurant.city}</span>
                          </div>
                        )}
                        {restaurant.phone && (
                          <div className="info-item">
                            <span className="info-icon">📞</span>
                            <span>{restaurant.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="restaurant-stats">
                        <div className="stat">
                          <span className="stat-value">{(Number(restaurant.averageRating) || 0).toFixed(1)}</span>
                          <span className="stat-label">Ocjena</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">{restaurant.totalRatings || 0}</span>
                          <span className="stat-label">Recenzija</span>
                        </div>
                      </div>
                    </div>

                    <div className="restaurant-card-actions">
                      <Link
                        to={`/dashboard/edit-restaurant/${restaurant.id}`}
                        className="btn-edit"
                      >
                        ✎ Uredi
                      </Link>
                      <Link
                        to={`/dashboard/manage-photos/${restaurant.id}`}
                        className="btn-photos"
                      >
                        Slike
                      </Link>
                      <Link
                        to={`/dashboard/manage-events/${restaurant.id}`}
                        className="btn-events"
                      >
                        Događaji
                      </Link>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteRestaurant(restaurant.id, restaurant.name)}
                      >
                        Obriši
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
