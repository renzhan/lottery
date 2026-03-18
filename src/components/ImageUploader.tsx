import React from 'react';
import styles from './ImageUploader.module.css';

export interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  selectedFile: File | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, selectedFile }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <div className={styles.uploader}>
      <label className={styles.label} htmlFor="image-upload">
        选择抽奖图片
      </label>
      <input
        id="image-upload"
        className={styles.fileInput}
        type="file"
        accept=".jpg,.jpeg,.png"
        onChange={handleChange}
      />
      {selectedFile && (
        <span className={styles.fileName}>已选择: {selectedFile.name}</span>
      )}
    </div>
  );
};
