import React, { useState } from 'react';
import { ImageUploader } from './ImageUploader';
import { GridConfig } from './GridConfig';
import { validateGridInput, validateImageFile } from '../utils';
import type { LotteryConfig } from '../types';
import styles from './ConfigPage.module.css';

export interface ConfigPageProps {
  onConfigComplete: (config: LotteryConfig) => void;
}

export const ConfigPage: React.FC<ConfigPageProps> = ({ onConfigComplete }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(20);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);

    if (!imageFile || !validateImageFile(imageFile)) {
      setError('请先上传抽奖图片');
      return;
    }

    if (!validateGridInput(rows) || !validateGridInput(cols)) {
      setError('切分数量必须为大于 0 的正整数');
      return;
    }

    onConfigComplete({ imageFile, rows, cols });
  };

  return (
    <div className={styles.configPage}>
      <h1 className={styles.title}>抽奖拼图配置</h1>
      <div className={styles.form}>
        <ImageUploader onImageSelect={setImageFile} selectedFile={imageFile} />
        <GridConfig
          rows={rows}
          cols={cols}
          onRowsChange={setRows}
          onColsChange={setCols}
        />
        {error && <div className={styles.error} role="alert">{error}</div>}
        <button className={styles.submitBtn} onClick={handleSubmit}>
          进入抽奖
        </button>
      </div>
    </div>
  );
};
