import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import "../css/Register.css";

function RegisterRestaurant() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuthContext();

  const validate = () => {
    if (!email.trim() || !firstName.trim() || !lastName.trim() || !password || !confirmPassword) {
      setError("Sva polja su obavezna.");
      return false;
    }
    const emailRe = /^\S+@\S+\.\S+$/;
    if (!emailRe.test(email)) {
      setError("Unesite ispravan email.");
      return false;
    }
    // Password validation matching backend requirements
    const passwordRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRe.test(password)) {
      setError("Lozinka mora sadržavati minimalno 8 znakova, jedno veliko slovo, jedno malo slovo, jedan broj i jedan specijalni znak (@$!%*?&).");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Lozinke se ne podudaraju.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!validate()) {
      setLoading(false);
      return;
    }

    try {
      await register({
        firstName,
        lastName,
        email,
        password,
        role: "restaurant", // uloga vlasnika
      });
      // nako nregistracije preusmjeri na kreiranje restorana
      navigate("/dashboard/create-restaurant");
    } catch (err: any) {
      setError(err.message || "Registracija nije uspjela. Pokušajte ponovno.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card restaurant-register-card">
        <h1 className="brand">RestoraniZEGE</h1>
        <p className="subtitle">Registracija za vlasnike restorana</p>
        <p className="info-text">
          Registrirajte se kao vlasnik restorana i dodajte svoj restoran u našu bazu.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field-label">Email *</label>
          <input 
            className="input" 
            type="email"
            placeholder="vas@email.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            disabled={loading} 
          />

          <div className="name-row">
            <div className="name-field">
              <label className="field-label">Ime *</label>
              <input 
                className="input" 
                placeholder="Ime" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                disabled={loading} 
              />
            </div>
            <div className="name-field">
              <label className="field-label">Prezime *</label>
              <input 
                className="input" 
                placeholder="Prezime" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                disabled={loading} 
              />
            </div>
          </div>

          <label className="field-label">Lozinka *</label>
          <input 
            type="password" 
            className="input" 
            placeholder="Min. 8 znakova, veliko/malo slovo, broj, spec. znak" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            disabled={loading} 
          />

          <label className="field-label">Potvrdi lozinku *</label>
          <input 
            type="password" 
            className="input" 
            placeholder="Ponovite lozinku" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            disabled={loading} 
          />

          {error && <div className="error">{error}</div>}

          <button className="submit-btn restaurant-btn" type="submit" disabled={loading}>
            {loading ? "Registriranje..." : "Registriraj se kao vlasnik"}
          </button>
        </form>

        <div className="divider">
          <span>ili</span>
        </div>

        <p className="switch-text">
          Već imate račun? <Link to="/login">Prijavite se</Link>
        </p>
        <p className="switch-text">
          Niste vlasnik restorana? <Link to="/register">Registrirajte se kao korisnik</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterRestaurant;
