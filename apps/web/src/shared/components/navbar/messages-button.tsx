'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import styles from './navbar.module.css';

interface MessagesButtonProps {
  onOpen?: () => void;
  isOtherMenuOpen?: boolean;
}

export function MessagesButton({ onOpen, isOtherMenuOpen }: MessagesButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOtherMenuOpen) setIsOpen(false);
  }, [isOtherMenuOpen]);

  // CA-05: Cerrar con Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // CA-05: Cerrar clic fuera
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
    if (!isOpen && onOpen) onOpen();
    setIsOpen(!isOpen);
  };

  return (
    <div className={`${styles.actionDropdown} ${styles.messageAction}`} ref={panelRef}>
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
        <div className={styles.activityPopover}>
          <div className={styles.activityPanel}>
            <h2>Mensajes</h2>
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <Link 
                href="/mensajes" 
                onClick={() => setIsOpen(false)}
                style={{ color: '#b06c30', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}
              >
                Ver todos los mensajes
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}