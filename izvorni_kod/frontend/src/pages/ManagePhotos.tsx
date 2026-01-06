import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import { api, type RestaurantPhoto } from "../services/api";
import "../css/ManagePhotos.css";

function ManagePhotos() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthContext();
  const [photos, setPhotos] = useState<RestaurantPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "restaurant") {
      navigate("/login");
      return;
    }
    fetchPhotos();
  }, [isAuthenticated, user, id]);

  const fetchPhotos = async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/restaurant-photos/restaurant/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch photos');
      }
      const data = await response.json();
      setPhotos(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to fetch photos:", err);
      setError("Nije moguće dohvatiti slike.");
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Molimo odaberite sliku.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Slika je prevelika. Maksimalna veličina je 5MB.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !id) return;
    
    setUploading(true);
    setError("");
    try {
      await api.uploadPhoto({
        restaurantId: parseInt(id),
        file: selectedFile,
      });
      setSelectedFile(null);
      setPreviewUrl("");
      fetchPhotos();
      alert("Slika je uspješno uploadana!");
    } catch (err: any) {
      console.error("Failed to upload photo:", err);
      setError(err.message || "Nije moguće uploadati sliku.");
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (photoId: number) => {
    try {
      await api.setPrimaryPhoto(photoId);
      fetchPhotos();
      alert("Primarna slika postavljena!");
    } catch (err: any) {
      console.error("Failed to set primary photo:", err);
      alert(err.message || "Nije moguće postaviti primarnu sliku.");
    }
  };

  const handleDelete = async (photoId: number) => {
    if (!confirm("Jeste li sigurni da želite obrisati ovu sliku?")) {
      return;
    }

    try {
      await api.deletePhoto(photoId);
      fetchPhotos();
      alert("Slika je uspješno obrisana.");
    } catch (err: any) {
      console.error("Failed to delete photo:", err);
      alert(err.message || "Nije moguće obrisati sliku.");
    }
  };

  if (!isAuthenticated || user?.role !== "restaurant") {
    return null;
  }

  return (
    <div className="manage-photos-page">
      <header className="manage-photos-header">
        <div className="header-content">
          <Link to="/dashboard" className="back-link">
            ← Natrag na Dashboard
          </Link>
          <h1>Upravljanje slikama</h1>
        </div>
      </header>

      <main className="manage-photos-main">
        <div className="manage-photos-container">
          
          {/* Upload Section */}
          <section className="upload-section">
            <h2>Upload nove slike</h2>
            <div className="upload-form">
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="photo-file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <label htmlFor="photo-file" className="file-label">
                  {selectedFile ? selectedFile.name : "Odaberi sliku"}
                </label>
              </div>
              
              {previewUrl && (
                <div className="preview-wrapper">
                  <img src={previewUrl} alt="Preview" className="preview-image" />
                </div>
              )}

              <button
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="btn-upload"
              >
                {uploading ? "Uploading..." : "Upload sliku"}
              </button>
            </div>
          </section>

          {error && <div className="error-message">{error}</div>}

          {/* Photos Grid */}
          <section className="photos-section">
            <h2>Postojeće slike</h2>
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Učitavanje...</p>
              </div>
            ) : photos.length === 0 ? (
              <div className="no-photos">
                <p>Još nemate uploadanih slika.</p>
              </div>
            ) : (
              <div className="photos-grid">
                {photos.map((photo) => (
                  <div key={photo.id} className="photo-card">
                    <div className="photo-image-wrapper">
                      <img src={photo.photoUrl} alt="Restaurant" className="photo-image" />
                      {photo.isPrimary && (
                        <span className="primary-badge">Primarna</span>
                      )}
                    </div>
                    <div className="photo-actions">
                      {!photo.isPrimary && (
                        <button
                          onClick={() => handleSetPrimary(photo.id)}
                          className="btn-set-primary"
                        >
                          Postavi kao primarnu
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(photo.id)}
                        className="btn-delete"
                      >
                        Obriši
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default ManagePhotos;
