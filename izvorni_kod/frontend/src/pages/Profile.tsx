import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { api } from '../services/api';
import '../css/Profile.css';

export default function Profile() {
  const { user, logout, updateUser } = useAuthContext();
  const navigate = useNavigate();

  // Edit profile modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Change password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const display = {
    name: user?.name || 'Korisnik',
    email: user?.email || '—',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  };

  const inicijali = useMemo(() => {
    const full = (display.name || '').trim();
    if (!full) return '';
    const dijelovi = full.split(/\s+/);
    const ime = dijelovi[0]?.[0] ?? '';
    const prez = dijelovi.length > 1 ? dijelovi[dijelovi.length - 1][0] : (dijelovi[0]?.[1] ?? '');
    return (ime + prez).toUpperCase();
  }, [display.name]);

  const openEditModal = () => {
    setEditFirstName(display.firstName);
    setEditLastName(display.lastName);
    setEditEmail(display.email === '—' ? '' : display.email);
    setEditError('');
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditError('');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setEditLoading(true);

    try {
      await updateUser({
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
      });
      setShowEditModal(false);
    } catch (err: any) {
      setEditError(err.message || 'Greška prilikom ažuriranja profila');
    } finally {
      setEditLoading(false);
    }
  };

  const openPasswordModal = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess('');
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Nove lozinke se ne podudaraju');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Nova lozinka mora imati najmanje 8 znakova');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/;
    if (!passwordRegex.test(newPassword)) {
      setPasswordError('Nova lozinka mora sadržavati barem jedno malo slovo, jedno veliko slovo i jedan broj');
      return;
    }

    setPasswordLoading(true);

    try {
      await api.changePassword({ oldPassword, newPassword });
      setPasswordSuccess('Lozinka je uspješno promijenjena!');
      setTimeout(() => {
        setShowPasswordModal(false);
      }, 1500);
    } catch (err: any) {
      setPasswordError(err.message || 'Greška prilikom promjene lozinke');
    } finally {
      setPasswordLoading(false);
    }
  };

  const onDelete = async () => {
    if (!confirm('Jeste li sigurni da želite obrisati račun? Ova radnja je nepovratna.')) return;

    try {
      if (user?.id) {
        await api.deleteUser(user.id);
      }
      await logout?.();
      navigate('/');
    } catch (err: any) {
      alert(err.message || 'Greška prilikom brisanja računa');
    }
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
          <button className="btn edit-btn" onClick={openEditModal}>
            ✎ Uredi
          </button>
        </header>

        <div className="profile-fields">
          <div className="field-row">
            <span className="field-icon">👤</span>
            <div className="field-text">
              <div className="field-label">Ime</div>
              <div className="field-value">{display.firstName || '—'}</div>
            </div>
          </div>
          <div className="field-row">
            <span className="field-icon">👤</span>
            <div className="field-text">
              <div className="field-label">Prezime</div>
              <div className="field-value">{display.lastName || '—'}</div>
            </div>
          </div>
          <div className="field-row">
            <span className="field-icon">✉️</span>
            <div className="field-text">
              <div className="field-label">Email</div>
              <div className="field-value">{display.email}</div>
            </div>
          </div>
        </div>

        <div className="profile-actions-divider" />

        <button className="option-row embedded" onClick={openPasswordModal}>
          Promijeni lozinku
        </button>

        <button className="option-row danger embedded" onClick={onDelete}>
          Obriši račun
        </button>
      </section>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Uredi profil</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="firstName">Ime</label>
                <input
                  type="text"
                  id="firstName"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Prezime</label>
                <input
                  type="text"
                  id="lastName"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                />
              </div>
              {editError && <div className="error-message">{editError}</div>}
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeEditModal}>
                  Odustani
                </button>
                <button type="submit" className="btn btn-primary" disabled={editLoading}>
                  {editLoading ? 'Spremanje...' : 'Spremi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={closePasswordModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Promijeni lozinku</h2>
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label htmlFor="oldPassword">Trenutna lozinka</label>
                <input
                  type="password"
                  id="oldPassword"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">Nova lozinka</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <small className="form-hint">
                  Min. 8 znakova, jedno veliko slovo, jedno malo slovo i jedan broj
                </small>
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Potvrdi novu lozinku</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {passwordError && <div className="error-message">{passwordError}</div>}
              {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closePasswordModal}>
                  Odustani
                </button>
                <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                  {passwordLoading ? 'Spremanje...' : 'Promijeni lozinku'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}