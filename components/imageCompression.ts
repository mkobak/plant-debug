import imageCompression from 'browser-image-compression';

export async function compressImage(file: File, maxSizeMB = 1, maxWidthOrHeight = 3000): Promise<File> {
  const options = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
    initialQuality: 0.8,
  };
  return await imageCompression(file, options);
}
