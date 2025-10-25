import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/Login.css";

function Login() {
  const [tab, setTab] = useState<"user" | "restaurant">("user");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Unesite korisničko ime i lozinku");
      return;
    }

    // Simple client-side mock login: store a minimal user object in localStorage
    const user = { name: username, email: "" };
    localStorage.setItem("user", JSON.stringify(user));
    // notify app about auth change
    window.dispatchEvent(new Event("authChanged"));
    navigate("/");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="brand">RestoraniZEGE</h1>
        <p className="subtitle">Prijava</p>

        <div className="tabs">
          <button
            className={"tab " + (tab === "user" ? "active" : "")}
            onClick={() => setTab("user")}
            type="button"
          >
            Korisnik
          </button>
          <button
            className={"tab " + (tab === "restaurant" ? "active" : "")}
            onClick={() => setTab("restaurant")}
            type="button"
          >
            Restoran
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field-label">Korisničko ime</label>
          <input
            className="input"
            placeholder="Unesite korisničko ime"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="field-label">Lozinka</label>
          <input
            type="password"
            className="input"
            placeholder="Unesite lozinku"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <div className="error">{error}</div>}

          <button className="submit-btn" type="submit">Prijavi se</button>
        </form>

        <div className="links">
          <Link className="muted" to="/register">Nemate račun? Registrirajte se</Link>
          <a className="muted" href="#">Zaboravili ste lozinku?</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
