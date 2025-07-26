import React, { useEffect } from 'react';
import styles from '../../styles/ImageModal.module.css';

interface ImageModalProps {
  isOpen: boolean;
  imageSrc: string;
  imageAlt: string;
  onClose: () => void;
  currentIndex?: number;
  totalImages?: number;
  onPrevious?: () => void;
  onNext?: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ 
  isOpen, 
  imageSrc, 
  imageAlt, 
  onClose, 
  currentIndex, 
  totalImages, 
  onPrevious, 
  onNext 
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'ArrowLeft' && onPrevious) {
        onPrevious();
      }
      if (e.key === 'ArrowRight' && onNext) {
        onNext();
      }
    };

    const handleBodyScroll = () => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      handleBodyScroll();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Navigation arrows */}
        {totalImages && totalImages > 1 && (
          <>
            {onPrevious && currentIndex !== undefined && currentIndex > 0 && (
              <button 
                className={`${styles.navButton} ${styles.prevButton}`} 
                onClick={onPrevious}
                aria-label="Previous image"
              >
                ‹
              </button>
            )}
            {onNext && currentIndex !== undefined && totalImages && currentIndex < totalImages - 1 && (
              <button 
                className={`${styles.navButton} ${styles.nextButton}`} 
                onClick={onNext}
                aria-label="Next image"
              >
                ›
              </button>
            )}
          </>
        )}
        
        <div className={styles.imageWrapper}>
          <img 
            src={imageSrc} 
            alt={imageAlt} 
            className={styles.image}
          />
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            aria-label="Close image preview"
          >
            ×
          </button>
          
          {/* Image counter */}
          {totalImages && totalImages > 1 && currentIndex !== undefined && (
            <div className={styles.imageCounter}>
              {currentIndex + 1} / {totalImages}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
