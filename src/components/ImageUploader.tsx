import React from 'react';
import styles from './ImageUploader.module.css';

export interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  selectedFile: File | null;
  label?: string;
  inputId?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  selectedFile,
  label = '选择抽奖图片',
  inputId = 'image-upload',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <div className={styles.uploader}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
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
