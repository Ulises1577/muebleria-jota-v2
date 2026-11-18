import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, SESSION_EXPIRED_EVENT } from '../services/authService';
import { isAdminUser } from '../services/session';
import { ROUTES } from '../config/routes';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => (authService.getToken() ? authService.getUser() : null));

  // Al cargar, se confirma con el servidor que el token siga siendo válido
  useEffect(() => {
    if (!authService.getToken()) return undefined;
    let active = true;
    authService
      .me()
      .then((current) => active && setUser(current))
      .catch((error) => {
        // Solo se cierra la sesión si el servidor rechazó el token; un corte de red no la borra.
        if (!active || ![401, 403, 404].includes(error?.status)) return;
        authService.logout();
        setUser(null);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleExpired = () => {
      authService.logout();
      setUser(null);
      navigate(ROUTES.login, { state: { from: window.location.pathname, expired: true } });
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
  }, [navigate]);

  const login = useCallback(async (credentials) => {
    const result = await authService.login(credentials);
    setUser(result.user);
    return result.user;
  }, []);

  const register = useCallback(async (data) => {
    const result = await authService.register(data);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data) => {
    const updated = await authService.updateMe(data);
    setUser(updated);
    return updated;
  }, []);

  const value = useMemo(
    () => ({ user, isAdmin: isAdminUser(user), login, register, logout, updateProfile }),
    [user, login, register, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return context;
};
