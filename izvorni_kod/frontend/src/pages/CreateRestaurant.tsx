import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import { api, CuisineType, PriceRange, type CreateRestaurantData } from "../services/api";
import "../css/CreateRestaurant.css";

const cuisineTypeLabels: Record<CuisineType, string> = {
  [CuisineType.ITALIAN]: "Talijanska",
  [CuisineType.CHINESE]: "Kineska",
  [CuisineType.MEXICAN]: "Meksička",
  [CuisineType.INDIAN]: "Indijska",
  [CuisineType.JAPANESE]: "Japanska",
  [CuisineType.THAI]: "Tajlandska",
  [CuisineType.MEDITERRANEAN]: "Mediteranska",
  [CuisineType.FAST_FOOD]: "Brza hrana",
  [CuisineType.VEGETARIAN]: "Vegetarijanska",
  [CuisineType.SEAFOOD]: "Morski plodovi",
  [CuisineType.STEAKHOUSE]: "Steakhouse",
  [CuisineType.BISTRO]: "Bistro",
  [CuisineType.CAFE]: "Kafić",
  [CuisineType.PIZZA]: "Pizzeria",
  [CuisineType.BAKERY]: "Pekara",
  [CuisineType.CROATIAN]: "Hrvatska",
};

const priceRangeLabels: Record<PriceRange, string> = {
  [PriceRange.LOW]: "€ - Niski",
  [PriceRange.MEDIUM]: "€€ - Srednji",
  [PriceRange.HIGH]: "€€€ - Visoki",
  [PriceRange.PREMIUM]: "€€€€ - Premium (Michelin)",
};

function CreateRestaurant() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthContext();

  const [formData, setFormData] = useState<CreateRestaurantData>({
    name: "",
    description: "",
    cuisineType: undefined,
    priceRange: undefined,
    adress: "",
    city: "",
    phone: "",
    email: "",
    website: "",
  });

  const [workingHours, setWorkingHours] = useState({
    monday: "",
    tuesday: "",
    wednesday: "",
    thursday: "",
    friday: "",
    saturday: "",
    sunday: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated or not restaurant role
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (user?.role !== "restaurant") {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value || undefined,
    }));
  };

  const handleWorkingHoursChange = (day: string, value: string) => {
    setWorkingHours(prev => ({ ...prev, [day]: value }));
  };

  const validate = () => {
    if (!formData.name.trim()) {
      setError("Naziv restorana je obavezan.");
      return false;
    }
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError("Unesite ispravan email restorana.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);

    try {
      // Clean up empty strings
      const cleanData: CreateRestaurantData = {
        name: formData.name.trim(),
      };

      if (formData.description?.trim()) cleanData.description = formData.description.trim();
      if (formData.cuisineType) cleanData.cuisineType = formData.cuisineType;
      if (formData.priceRange) cleanData.priceRange = formData.priceRange;
      if (formData.adress?.trim()) cleanData.adress = formData.adress.trim();
      if (formData.city?.trim()) cleanData.city = formData.city.trim();
      if (formData.phone?.trim()) cleanData.phone = formData.phone.trim();
      if (formData.email?.trim()) cleanData.email = formData.email.trim();
      if (formData.website?.trim()) cleanData.website = formData.website.trim();

      // Konvertiraj workingHours objekt u JSON string
      const hasWorkingHours = Object.values(workingHours).some(v => v.trim());
      if (hasWorkingHours) {
        cleanData.workingHours = JSON.stringify(workingHours);
      }

      await api.createRestaurant(cleanData);
      alert("Restoran je uspješno kreiran! Administrator će verificirati vaš restoran.");
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Failed to create restaurant:", err);
      setError(err.message || "Nije moguće kreirati restoran. Pokušajte ponovno.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-restaurant-page">
      <div className="create-restaurant-container">
        <div className="create-restaurant-header">
          <h1>Dodaj novi restoran</h1>
          <p>Ispunite podatke o vašem restoranu. Administrator će verificirati unos.</p>
        </div>

        <form className="create-restaurant-form" onSubmit={handleSubmit}>
          <section className="form-section">
            <h2>Osnovni podaci</h2>

            <div className="form-group">
              <label htmlFor="name">Naziv restorana *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="npr. Pizzeria Napoli"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Opis restorana</label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Opišite svoj restoran, specijalitete, atmosferu..."
                rows={4}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="cuisineType">Vrsta kuhinje</label>
              <select
                id="cuisineType"
                name="cuisineType"
                value={formData.cuisineType || ""}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Odaberite vrstu kuhinje</option>
                {Object.entries(cuisineTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priceRange">Cijenovni razred</label>
              <select
                id="priceRange"
                name="priceRange"
                value={formData.priceRange || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    priceRange: value ? Number(value) as PriceRange : undefined,
                  }));
                }}
                disabled={loading}
              >
                <option value="">Odaberite cijenovni razred</option>
                {Object.entries(priceRangeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="form-section">
            <h2>Lokacija</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="adress">Adresa</label>
                <input
                  type="text"
                  id="adress"
                  name="adress"
                  value={formData.adress || ""}
                  onChange={handleChange}
                  placeholder="npr. Ilica 10"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">Grad</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city || ""}
                  onChange={handleChange}
                  placeholder="npr. Zagreb"
                  disabled={loading}
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Kontakt</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Telefon</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  placeholder="npr. +385 1 2345 678"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email restorana</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  placeholder="npr. info@restoran.hr"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="website">Web stranica</label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website || ""}
                onChange={handleChange}
                placeholder="npr. https://www.restoran.hr"
                disabled={loading}
              />
            </div>
          </section>

          <section className="form-section">
            <h2>Radno vrijeme</h2>
            <p className="section-hint">Unesite radno vrijeme za svaki dan (npr. 10:00-22:00 ili Zatvoreno)</p>

            <div className="working-hours-grid">
              <div className="form-group">
                <label htmlFor="monday">Ponedjeljak</label>
                <input
                  type="text"
                  id="monday"
                  value={workingHours.monday}
                  onChange={(e) => handleWorkingHoursChange('monday', e.target.value)}
                  placeholder="10:00-22:00"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="tuesday">Utorak</label>
                <input
                  type="text"
                  id="tuesday"
                  value={workingHours.tuesday}
                  onChange={(e) => handleWorkingHoursChange('tuesday', e.target.value)}
                  placeholder="10:00-22:00"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="wednesday">Srijeda</label>
                <input
                  type="text"
                  id="wednesday"
                  value={workingHours.wednesday}
                  onChange={(e) => handleWorkingHoursChange('wednesday', e.target.value)}
                  placeholder="10:00-22:00"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="thursday">Četvrtak</label>
                <input
                  type="text"
                  id="thursday"
                  value={workingHours.thursday}
                  onChange={(e) => handleWorkingHoursChange('thursday', e.target.value)}
                  placeholder="10:00-22:00"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="friday">Petak</label>
                <input
                  type="text"
                  id="friday"
                  value={workingHours.friday}
                  onChange={(e) => handleWorkingHoursChange('friday', e.target.value)}
                  placeholder="10:00-22:00"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="saturday">Subota</label>
                <input
                  type="text"
                  id="saturday"
                  value={workingHours.saturday}
                  onChange={(e) => handleWorkingHoursChange('saturday', e.target.value)}
                  placeholder="10:00-23:00"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="sunday">Nedjelja</label>
                <input
                  type="text"
                  id="sunday"
                  value={workingHours.sunday}
                  onChange={(e) => handleWorkingHoursChange('sunday', e.target.value)}
                  placeholder="Zatvoreno"
                  disabled={loading}
                />
              </div>
            </div>
          </section>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/dashboard")}
              disabled={loading}
            >
              Odustani
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Kreiranje..." : "Kreiraj restoran"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRestaurant;
