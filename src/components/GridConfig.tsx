import React from 'react';
import styles from './GridConfig.module.css';

export interface GridConfigProps {
  rows: number;
  cols: number;
  onRowsChange: (rows: number) => void;
  onColsChange: (cols: number) => void;
}

export const GridConfig: React.FC<GridConfigProps> = ({ rows, cols, onRowsChange, onColsChange }) => {
  return (
    <div className={styles.gridConfig}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="grid-rows">垂直行数（默认5）</label>
        <input
          id="grid-rows"
          className={styles.input}
          type="number"
          value={rows}
          onChange={(e) => onRowsChange(Number(e.target.value))}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="grid-cols">水平列数（默认20）</label>
        <input
          id="grid-cols"
          className={styles.input}
          type="number"
          value={cols}
          onChange={(e) => onColsChange(Number(e.target.value))}
        />
      </div>
    </div>
  );
};
