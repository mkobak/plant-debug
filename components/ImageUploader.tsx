import React, { useState, useRef } from 'react';
import styles from '../styles/ImageUploader.module.css';
import { compressImage } from '../utils/imageCompression';

interface ImageUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ files, onFilesChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILES = 3;

  const processFiles = async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const remainingSlots = MAX_FILES - files.length;
    const filesToProcess = fileArray.slice(0, remainingSlots);

    const compressedFiles: File[] = [];
    for (const file of filesToProcess) {
      try {
        const compressedFile = await compressImage(file, 1, 3000);
        compressedFiles.push(compressedFile);
      } catch (err) {
        console.warn('Image compression failed, using original file.', err);
        compressedFiles.push(file);
      }
    }

    const updatedFiles = [...files, ...compressedFiles];
    onFilesChange(updatedFiles);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
      // Reset the input to allow selecting the same files again
      e.target.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
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
    // Only set isDragging to false if we're actually leaving the dropzone
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    onFilesChange(updatedFiles);
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const hasFiles = files.length > 0;
  const canAddMore = files.length < MAX_FILES;

  return (
    <div className={styles.uploaderContainer}>
      {/* Main upload area */}
      <div
        className={`${styles.dropzone} ${isDragging ? styles.dragging : ''} ${hasFiles ? styles.compact : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={canAddMore ? openFileSelector : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          capture="environment"
          multiple
          className={styles.fileInput}
          disabled={!canAddMore}
        />
        
        {!hasFiles ? (
          <div className={styles.uploadPrompt}>
            <div className={styles.uploadText}>
              <strong>Drop images here or click to select</strong>
              <div className={styles.uploadSubtext}>
                You can upload up to {MAX_FILES} images
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.compactPrompt}>
            {canAddMore && (
              <>
                <span className={styles.addMoreText}>
                  Drop more images or click to add ({files.length}/{MAX_FILES})
                </span>
              </>
            )}
            {!canAddMore && (
              <span className={styles.maxReachedText}>
                Maximum {MAX_FILES} images uploaded
              </span>
            )}
          </div>
        )}
      </div>

      {/* Image previews */}
      {hasFiles && (
        <div className={styles.previewContainer}>
          {files.map((file, index) => (
            <div key={index} className={styles.previewItem}>
              <img 
                src={URL.createObjectURL(file)} 
                alt={`Preview ${index + 1}`} 
                className={styles.previewImage} 
              />
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); removeFile(index); }} 
                className={styles.removeButton}
                aria-label={`Remove image ${index + 1}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;