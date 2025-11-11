import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import "../css/Register.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { register, googleAuth } = useAuthContext();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const validate = () => {
    if (!email.trim() || !firstName.trim() || !lastName.trim() || !password) {
      setError("Sva polja su obavezna.");
      return false;
    }
    const emailRe = /^\S+@\S+\.\S+$/;
    if (!emailRe.test(email)) {
      setError("Unesite ispravan email.");
      return false;
    }
    if (password.length < 6) {
      setError("Lozinka mora imati najmanje 6 znakova.");
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
        role: "user",
      });
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Registracija nije uspjela. Pokušajte ponovno.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credential: string) => {
    setError("");
    setGoogleLoading(true);
    try {
      await googleAuth({ token: credential });
      navigate("/");
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
            text: "signup_with",
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
        <p className="subtitle">Registracija</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field-label">Email</label>
          <input className="input" placeholder="Unesite email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />

          <label className="field-label">Ime</label>
          <input className="input" placeholder="Unesite ime" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={loading} />

          <label className="field-label">Prezime</label>
          <input className="input" placeholder="Unesite prezime" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={loading} />

          <label className="field-label">Lozinka</label>
          <input type="password" className="input" placeholder="Unesite lozinku" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />

          {error && <div className="error">{error}</div>}

          <button className="submit-btn" type="submit" disabled={loading || googleLoading}>
            {loading ? "Registriranje..." : "Registriraj se"}
          </button>
        </form>

        <div className="divider">
          <span>ili</span>
        </div>

        <div className="google-button-container" ref={googleButtonRef}></div>

      </div>
    </div>
  );
}

export default Register;
