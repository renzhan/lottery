import React from 'react';
import styles from './NumberModal.module.css';

export interface NumberModalProps {
  number: string;
  visible: boolean;
  onClose: () => void;
}

export const NumberModal: React.FC<NumberModalProps> = ({ number, visible }) => {
  if (!visible) {
    return null;
  }

  return (
    <div
      className={styles.overlay}
      data-testid="number-modal-overlay"
    >
      <div className={styles.modal}>
        <div className={styles.number} data-testid="number-modal-number">
          {number}
        </div>
      </div>
    </div>
  );
};
