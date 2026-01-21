import { Navigate } from 'react-router-dom';
import {useAuthContext } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

/**
 * ProtectedRoute - Zaštićena ruta koja provjerava autentikaciju i autorizaciju
 * 
 * @param children - Komponenta koja se prikazuje ako korisnik ima pristup
 * @param allowedRoles - Lista dozvoljenih uloga (ako nije definirano, samo provjerava autentikaciju)
 * @param redirectTo - Ruta na koju se preusmjerava ako nema pristup (default: '/login' ili '/')
 */
function ProtectedRoute({ children, allowedRoles, redirectTo }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuthContext();

  // Dok se učitava, prikaži loading
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

  // Ako korisnik nije ulogiran, preusmjeri na login
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo || '/login'} replace />;
  }

  // Ako su definirane dozvoljene uloge, provjeri ima li korisnik odgovarajuću ulogu
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // Korisnik nema dozvoljenu ulogu - preusmjeri na početnu stranicu
      return <Navigate to={redirectTo || '/'} replace />;
    }
  }

  // Korisnik ima pristup
  return <>{children}</>;
}

export default ProtectedRoute;
