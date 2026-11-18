import { useEffect, useState } from 'react';
import { BRAND } from '../config/site';

/** Estado que persiste en localStorage (preferencias de vista del panel, por ejemplo). */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* almacenamiento no disponible: la preferencia vive solo en memoria */
    }
  }, [key, value]);

  return [value, setValue];
}

/** Cierra menús o popovers al hacer clic fuera o presionar Escape. */
export function useDismiss(ref, onDismiss, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;
    const handlePointer = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onDismiss();
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') onDismiss();
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [ref, onDismiss, enabled]);
}

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${BRAND.name}` : `${BRAND.name} — ${BRAND.tagline}`;
  }, [title]);
}
