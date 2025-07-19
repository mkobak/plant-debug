import React, { useState } from 'react';
import styles from '../styles/ImageUploader.module.css';

interface ImageUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ files, onFilesChange }) => {
  const [isDragging, setIsDragging] = useState(false);

  // Handle file selection for a specific slot
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, slot: number) => {
    if (e.target.files && e.target.files[0]) {
      const newFile = e.target.files[0];
      const updatedFiles = [...files];
      updatedFiles[slot] = newFile;
      onFilesChange(updatedFiles.filter(Boolean));
    }
  };

  // Drag and drop for a specific slot
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, slot: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFile = e.dataTransfer.files[0];
      const updatedFiles = [...files];
      updatedFiles[slot] = newFile;
      onFilesChange(updatedFiles.filter(Boolean));
      e.dataTransfer.clearData();
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

  const removeFile = (slot: number) => {
    const updatedFiles = [...files];
    updatedFiles[slot] = undefined as any;
    onFilesChange(updatedFiles.filter(Boolean));
  };

  // Render 3 slots
  return (
    <div className={styles.uploaderContainer}>
      <div className={styles.previewContainer} style={{ justifyContent: 'flex-start' }}>
        {[0, 1, 2].map((slot) => (
          <div
            key={slot}
            className={styles.previewItem}
            style={{ border: files[slot] ? 'none' : '2px dashed #ccc', background: files[slot] ? 'none' : '#fafbfc', position: 'relative', cursor: 'pointer' }}
            onClick={() => document.getElementById(`fileInput${slot}`)?.click()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={(e) => handleDrop(e, slot)}
          >
            {files[slot] ? (
              <>
                <img src={URL.createObjectURL(files[slot])} alt={`preview ${slot}`} className={styles.previewImage} />
                <button type="button" onClick={(e) => { e.stopPropagation(); removeFile(slot); }} className={styles.removeButton}>&times;</button>
              </>
            ) : (
              <>
                <input
                  type="file"
                  id={`fileInput${slot}`}
                  onChange={(e) => handleFileChange(e, slot)}
                  accept="image/png, image/jpeg, image/webp, image/heic"
                  className={styles.fileInput}
                />
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 24 }}>
                  +
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <div style={{ color: '#888', fontSize: '0.98em', marginTop: 8, textAlign: 'left' }}>
        Drag & drop or click a slot to select an image. You can upload up to 3 images.
      </div>
    </div>
  );
};

export default ImageUploader;