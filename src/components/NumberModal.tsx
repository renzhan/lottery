import React from 'react';
import styles from './NumberModal.module.css';

export interface NumberModalProps {
  number: string;
  visible: boolean;
  onClose: () => void;
}

export const NumberModal: React.FC<NumberModalProps> = ({ number, visible, onClose }) => {
  if (!visible) {
    return null;
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      data-testid="number-modal-overlay"
    >
      <div className={styles.modal}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          data-testid="number-modal-close"
          aria-label="关闭"
        >
          ×
        </button>
        <div className={styles.number} data-testid="number-modal-number">
          {number}
        </div>
      </div>
    </div>
  );
};
