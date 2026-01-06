import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import { api, type Event, type CreateEventData, type UpdateEventData } from "../services/api";
import "../css/ManageEvents.css";

function ManageEvents() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthContext();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    restaurantId: id || "",
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "restaurant") {
      navigate("/login");
      return;
    }
    if (id) {
      fetchEvents();
    }
  }, [isAuthenticated, user, id]);

  const fetchEvents = async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/events?restaurantId=${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to fetch events:", err);
      setError("Nije moguće dohvatiti događaje.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.title || !formData.description || !formData.eventDate || !formData.eventTime) {
      setError("Molimo popunite sva obavezna polja.");
      return;
    }

    // Kombiniraj datum i vrijeme u ISO format
    const dateTimeString = `${formData.eventDate}T${formData.eventTime}:00`;
    console.log("Slanje događaja s datumom:", dateTimeString);

    try {
      if (isEditing && editingEventId) {
        const updateData: UpdateEventData = {
          title: formData.title,
          description: formData.description,
          eventDate: dateTimeString,
        };
        console.log("Update data:", updateData);
        await api.updateEvent(editingEventId, updateData);
        alert("Događaj je uspješno ažuriran!");
      } else {
        const createData: CreateEventData = {
          restaurantId: formData.restaurantId,
          title: formData.title,
          description: formData.description,
          eventDate: dateTimeString,
        };
        await api.createEvent(createData);
        alert("Događaj je uspješno kreiran!");
      }
      
      // Reset form
      setFormData({
        restaurantId: id || "",
        title: "",
        description: "",
        eventDate: "",
        eventTime: "",
      });
      setIsEditing(false);
      setEditingEventId(null);
      fetchEvents();
    } catch (err: any) {
      console.error("Failed to save event:", err);
      setError(err.message || "Nije moguće spremiti događaj.");
    }
  };

  const handleEdit = (event: Event) => {
    const dateTime = new Date(event.eventDate);
    const date = dateTime.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = dateTime.toTimeString().slice(0, 5); // HH:MM
    
    setFormData({
      restaurantId: id || "",
      title: event.title,
      description: event.description,
      eventDate: date,
      eventTime: time,
    });
    setIsEditing(true);
    setEditingEventId(event.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setFormData({
      restaurantId: id || "",
      title: "",
      description: "",
      eventDate: "",
      eventTime: "",
    });
    setIsEditing(false);
    setEditingEventId(null);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Jeste li sigurni da želite obrisati ovaj događaj?")) {
      return;
    }

    try {
      await api.deleteEvent(eventId);
      fetchEvents();
      alert("Događaj je uspješno obrisan.");
    } catch (err: any) {
      console.error("Failed to delete event:", err);
      alert(err.message || "Nije moguće obrisati događaj.");
    }
  };

  if (!isAuthenticated || user?.role !== "restaurant") {
    return null;
  }

  return (
    <div className="manage-events-page">
      <header className="manage-events-header">
        <div className="header-content">
          <Link to="/dashboard" className="back-link">
            ← Natrag na Dashboard
          </Link>
          <h1>Upravljanje događajima</h1>
        </div>
      </header>

      <main className="manage-events-main">
        <div className="manage-events-container">
          
          {/* Event Form */}
          <section className="event-form-section">
            <h2>{isEditing ? "Uredi događaj" : "Dodaj novi događaj"}</h2>
            <form onSubmit={handleSubmit} className="event-form">
              <div className="form-group">
                <label htmlFor="title">Naziv događaja *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Opis *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="eventDate">Datum događaja *</label>
                <input
                  type="date"
                  id="eventDate"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="eventTime">Vrijeme događaja *</label>
                <input
                  type="time"
                  id="eventTime"
                  name="eventTime"
                  value={formData.eventTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {isEditing ? "Ažuriraj događaj" : "Dodaj događaj"}
                </button>
                {isEditing && (
                  <button type="button" onClick={handleCancelEdit} className="btn-cancel">
                    Odustani
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* Events List */}
          <section className="events-section">
            <h2>Postojeći događaji</h2>
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Učitavanje...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="no-events">
                <p>Još nemate kreiranih događaja.</p>
              </div>
            ) : (
              <div className="events-list">
                {events.map((event) => (
                  <div key={event.id} className="event-card">
                    <div className="event-content">
                      <h3>{event.title}</h3>
                      <p className="event-date">
                        📅 {new Date(event.eventDate).toLocaleDateString('hr-HR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        {' u '}
                        🕐 {new Date(event.eventDate).toLocaleTimeString('hr-HR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="event-description">{event.description}</p>
                    </div>
                    <div className="event-actions">
                      <button onClick={() => handleEdit(event)} className="btn-edit">
                        Uredi
                      </button>
                      <button onClick={() => handleDelete(event.id)} className="btn-delete">
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

export default ManageEvents;
