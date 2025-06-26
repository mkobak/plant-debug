import React, { useState } from 'react';
import styles from '../styles/ImageUploader.module.css';

interface ImageUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ files, onFilesChange }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      onFilesChange([...files, ...newFiles]);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      onFilesChange([...files, ...newFiles]);
      e.dataTransfer.clearData();
    }
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.uploaderContainer}>
      <div
        className={`${styles.dropzone} ${isDragging ? styles.dragging : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <input type="file" id="fileInput" multiple onChange={handleFileChange} accept="image/png, image/jpeg, image/webp, image/heic" className={styles.fileInput} />
        <p>Drag & drop images here, or click to select files</p>
      </div>
      <div className={styles.previewContainer}>
        {files.map((file, index) => (
          <div key={index} className={styles.previewItem}>
            <img src={URL.createObjectURL(file)} alt={`preview ${index}`} className={styles.previewImage} />
            <button type="button" onClick={() => removeFile(index)} className={styles.removeButton}>&times;</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;