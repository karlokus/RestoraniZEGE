import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Register.css";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    if (!email.trim() || !firstName.trim() || !lastName.trim() || !username.trim() || !password) {
      setError("Sva polja su obavezna.");
      return false;
    }
    // simple email check
    const emailRe = /^\S+@\S+\.\S+$/;
    if (!emailRe.test(email)) {
      setError("Unesite ispravan email.");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    const user = { name: firstName + " " + lastName, email, username };
    localStorage.setItem("user", JSON.stringify(user));
    window.dispatchEvent(new Event("authChanged"));
    navigate("/");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="brand">RestoraniZEGE</h1>
        <p className="subtitle">Registracija</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field-label">Email</label>
          <input className="input" placeholder="Unesite email" value={email} onChange={(e) => setEmail(e.target.value)} />

          <label className="field-label">Ime</label>
          <input className="input" placeholder="Unesite ime" value={firstName} onChange={(e) => setFirstName(e.target.value)} />

          <label className="field-label">Prezime</label>
          <input className="input" placeholder="Unesite prezime" value={lastName} onChange={(e) => setLastName(e.target.value)} />

          <label className="field-label">Korisničko ime</label>
          <input className="input" placeholder="Unesite korisničko ime" value={username} onChange={(e) => setUsername(e.target.value)} />

          <label className="field-label">Lozinka</label>
          <input type="password" className="input" placeholder="Unesite lozinku" value={password} onChange={(e) => setPassword(e.target.value)} />

          {error && <div className="error">{error}</div>}

          <button className="submit-btn" type="submit">Registriraj se</button>
        </form>

      </div>
    </div>
  );
}

export default Register;
