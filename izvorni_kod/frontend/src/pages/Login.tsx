import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import "../css/Login.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function Login() {
  const [tab, setTab] = useState<"user" | "restaurant">("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { login, googleAuth } = useAuthContext();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email.trim() || !password) {
      setError("Unesite email i lozinku");
      setLoading(false);
      return;
    }

    const emailRe = /^\S+@\S+\.\S+$/;
    if (!emailRe.test(email)) {
      setError("Unesite ispravan email");
      setLoading(false);
      return;
    }

    try {
      const userData = await login({ email, password });
      // Redirect based on user role
      if (userData?.role === "admin") {
        navigate("/admin");
      } else if (userData?.role === "restaurant") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "Prijava nije uspjela. Provjerite podatke.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credential: string) => {
    setError("");
    setGoogleLoading(true);
    try {
      const userData = await googleAuth({ token: credential });
      // Redirect based on user role
      if (userData?.role === "admin") {
        navigate("/admin");
      } else if (userData?.role === "restaurant") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "Google prijava nije uspjela. Pokušajte ponovno.");
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    const initGoogleSignIn = () => {
      if (!GOOGLE_CLIENT_ID) {
        console.warn('Google Client ID is not configured');
        return;
      }

      if (googleButtonRef.current && (window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: any) => {
            if (response.credential) {
              handleGoogleLogin(response.credential);
            }
          },
        });

        (window as any).google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "signin_with",
            locale: "hr",
          }
        );
      }
    };

    if ((window as any).google) {
      initGoogleSignIn();
    } else {
      const checkGoogle = setInterval(() => {
        if ((window as any).google) {
          clearInterval(checkGoogle);
          initGoogleSignIn();
        }
      }, 100);

      setTimeout(() => clearInterval(checkGoogle), 10000);
    }
  }, []);

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
          <label className="field-label">Email</label>
          <input
            className="input"
            type="email"
            placeholder="Unesite email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <label className="field-label">Lozinka</label>
          <input
            type="password"
            className="input"
            placeholder="Unesite lozinku"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          {error && <div className="error">{error}</div>}

          <button className="submit-btn" type="submit" disabled={loading || googleLoading}>
            {loading ? "Prijavljivanje..." : "Prijavi se"}
          </button>
        </form>

        <div className="divider">
          <span>ili</span>
        </div>

        <div className="google-button-container" ref={googleButtonRef}></div>

        <div className="links">
          <Link className="muted" to="/register">Nemate račun? Registrirajte se</Link>
          <Link className="muted" to="/register-restaurant">Vlasnik ste restorana? Registrirajte restoran</Link>
          <a className="muted" href="#">Zaboravili ste lozinku?</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
