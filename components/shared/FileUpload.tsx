
import React, { useState, useCallback, useRef } from 'react';
import { Button } from './Button';
import { MAX_IMAGE_SIZE_MB, MAX_VIDEO_SIZE_MB } from '../../constants';

interface FileUploadProps {
  onFileSelect: (file: File, base64Data: string | null) => void;
  accept: string; // e.g., "image/*", "video/*"
  label?: string;
  fileTypeLabel: 'image' | 'video';
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, accept, label = "Upload File", fileTypeLabel }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxFileSize = fileTypeLabel === 'image' ? MAX_IMAGE_SIZE_MB : MAX_VIDEO_SIZE_MB;

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > maxFileSize * 1024 * 1024) {
        setError(`File is too large. Max size: ${maxFileSize}MB.`);
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        return;
      }

      setSelectedFile(file);
      
      if (fileTypeLabel === 'image') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
          onFileSelect(file, reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // For video, we might not generate a base64 preview by default due to size.
        // Send null for base64Data, the component using this can decide if it needs to read it.
        setPreviewUrl(URL.createObjectURL(file)); // Show a preview if browser supports it
        onFileSelect(file, null); // Send null for base64 for video initially
      }
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [onFileSelect, fileTypeLabel, maxFileSize]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-4 p-4 border-2 border-dashed border-neutral-DEFAULT dark:border-gray-600 rounded-lg text-center">
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
        aria-label={`Upload ${fileTypeLabel}`}
      />
      {previewUrl && fileTypeLabel === 'image' && (
        <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto mb-2 rounded" />
      )}
      {previewUrl && fileTypeLabel === 'video' && (
         <p className="text-sm text-neutral-dark dark:text-neutral-light-accent mb-2">Video selected: {selectedFile?.name}</p>
      )}
      {!selectedFile && <p className="text-neutral-dark dark:text-neutral-light-accent mb-2">{label}</p>}
      <Button onClick={triggerFileInput} variant="outline" icon="fas fa-upload">
        {selectedFile ? `Change ${fileTypeLabel}` : `Select ${fileTypeLabel}`}
      </Button>
      {error && <p className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
};