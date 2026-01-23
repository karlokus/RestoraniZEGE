import { Navigate } from 'react-router-dom';
import {useAuthContext } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

/**
 * ProtectedRoute - zaštićena ruta koja provjerava autentikaciju i autorizaciju
 * 
 * @param children - komponenta koja se prikazuje ako korisnik ima pristup
 * @param allowedRoles - lista dozvoljenih uloga za pristup ruti
 * @param redirectTo - ruta na koju se preusmjerava ako nema pristup
 */
function ProtectedRoute({ children, allowedRoles, redirectTo }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuthContext();

// prikaz loadinga dok se ne ucita stanje
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Učitavanje...
      </div>
    );
  }

  // ako korisnik nije ulogiran, preusmjeri na login
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo || '/login'} replace />;
  }

  // provjeri ima li korisnik odgovarajuću ulogu
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      //user nema dozvoljenu ulogu - preusmjeri na početnu stranicu
      return <Navigate to={redirectTo || '/'} replace />;
    }
  }

  // user ima pristup
  return <>{children}</>;
}

export default ProtectedRoute;
