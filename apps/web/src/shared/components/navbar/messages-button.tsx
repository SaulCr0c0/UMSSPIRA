'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import styles from './navbar.module.css';

interface MessagesButtonProps {
  // Callback para avisar a la Navbar que cierre otros menús
  onOpen?: () => void; 
  // Para saber si la Navbar abrió otro menú y debemos cerrarnos
  isOtherMenuOpen?: boolean; 
}

export function MessagesButton({ onOpen, isOtherMenuOpen }: MessagesButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Si la Navbar abre otro menú (ej. notificaciones), cerramos el nuestro
  useEffect(() => {
    if (isOtherMenuOpen) setIsOpen(false);
  }, [isOtherMenuOpen]);

  // CA-05: Cerrar con la tecla Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // CA-05: Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | FocusEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('focusin', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('focusin', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen && onOpen) {
      onOpen(); // Avisamos a la navbar que abra este
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.actionDropdown} ref={panelRef}>
      <button
        type="button"
        className={styles.iconButton}
        aria-label="Mensajes"
        aria-expanded={isOpen}
        onClick={handleToggle}
      >
        <MessageSquare size={22} strokeWidth={1.8} />
      </button>

      {isOpen && (
        <div className={styles.activityPopover} style={{ padding: '1rem', width: '280px' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '0.75rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
            Mensajes
          </h3>
          <Link
            href="/mensajes"
            onClick={() => setIsOpen(false)}
            style={{ display: 'block', textAlign: 'center', color: '#d97706', fontWeight: 600, fontSize: '0.875rem' }}
          >
            Ver todos los mensajes
          </Link>
        </div>
      )}
    </div>
  );
}