import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import '../css/Profile.css';

export default function Profile() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const display = {
    name: user?.name || user?.username || 'Korisnik',
    email: user?.email || '—',
    phone: (user as any)?.phone || '—',
    city: (user as any)?.city || '—',
    registeredAt:
      (user as any)?.createdAt
        ? new Date((user as any).createdAt).toLocaleDateString('hr-HR')
        : '—',
  };

  const inicijali = useMemo(() => {
    const full = (display.name || '').trim();
    if (!full) return '';
    const dijelovi = full.split(/\s+/);
    const ime = dijelovi[0]?.[0] ?? '';
    const prez = dijelovi.length > 1 ? dijelovi[dijelovi.length - 1][0] : (dijelovi[0]?.[1] ?? '');
    return (ime + prez).toUpperCase();
  }, [display.name]);

  const onEdit = () => {
    alert("Dodat uređivanje profila!!");
  };

  const onDelete = async () => {
    if (!confirm("Jeste li sigurni da želite obrisati račun?")) return;
    // TODO!! pozovi backend za brisanje, zasad samo logout
    await logout?.();
    navigate('/');
  };

  return (
    <div className="profile-page">
      <section className="card profile-card">
        <header className="profile-header">
          <div className="profile-head-left">
            <div className="avatar">{inicijali}</div>
            <div className="name-wrap">
              <h1 className="profile-name">{display.name}</h1>
              <div className="profile-subtitle">Korisnički profil</div>
            </div>
          </div>
          <button className="btn edit-btn" onClick={onEdit}>
            ✎ Uredi
          </button>
        </header>

        <div className="profile-fields">
          <div className="field-row">
            <span className="field-icon">✉️</span>
            <div className="field-text">
              <div className="field-label">Email</div>
              <div className="field-value">{display.email}</div>
            </div>
          </div>

          <div className="field-row">
            <span className="field-icon">📞</span>
            <div className="field-text">
              <div className="field-label">Telefon</div>
              <div className="field-value">{display.phone}</div>
            </div>
          </div>

          <div className="field-row">
            <span className="field-icon">📍</span>
            <div className="field-text">
              <div className="field-label">Mjesto</div>
              <div className="field-value">{display.city}</div>
            </div>
          </div>

          <div className="field-row muted">
            <span className="field-icon">📅</span>
            <div className="field-text">
              <div className="field-label">Datum registracije</div>
              <div className="field-value">{display.registeredAt}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="card options-card">
        <h2 className="options-title">Dodatne opcije</h2>

        <button className="option-row" onClick={() => alert('Promjena lozinke uskoro.')}>
          Promijeni lozinku
        </button>

        <button className="option-row" onClick={() => alert('Upravljanje pravima pristupa uskoro.')}>
          Upravljaј pravima pristupa
        </button>

        <button className="option-row danger" onClick={onDelete}>
          Obriši račun
        </button>
      </section>
    </div>
  );
}