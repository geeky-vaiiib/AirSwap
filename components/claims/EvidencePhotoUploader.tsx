/**
 * Evidence Photo Uploader Component
 *
 * Handles uploading before and after reforestation photos with separate sections.
 * Supports drag & drop, validation, and preview for evidence photos.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Upload,
  X,
  Image,
  CheckCircle,
  AlertCircle,
  Loader2,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';

interface UploadedPhoto {
  file: File;
  name: string;
  type: 'image';
  size: number;
  url?: string;
  uploadProgress?: number;
  error?: string;
}

interface EvidencePhotoUploaderProps {
  beforePhotos?: UploadedPhoto[];
  afterPhotos?: UploadedPhoto[];
  onBeforePhotosChange: (photos: UploadedPhoto[]) => void;
  onAfterPhotosChange: (photos: UploadedPhoto[]) => void;
  className?: string;
}

export type { UploadedPhoto };

const MAX_FILES_PER_CATEGORY = 5;
const MAX_SIZE_DEFAULT = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = "image/jpeg,image/png,image/jpg,image/webp";

export default function EvidencePhotoUploader({
  beforePhotos = [],
  afterPhotos = [],
  onBeforePhotosChange,
  onAfterPhotosChange,
  className
}: EvidencePhotoUploaderProps) {
  const [uploadingPhotos, setUploadingPhotos] = useState<Record<string, UploadedPhoto[]>>({
    before: [],
    after: []
  });
  const [completedPhotos, setCompletedPhotos] = useState<Record<string, UploadedPhoto[]>>({
    before: [],
    after: []
  });
  const beforeFileInputRef = useRef<HTMLInputElement>(null);
  const afterFileInputRef = useRef<HTMLInputElement>(null);

  // Update parent when photos are completed
  useEffect(() => {
    if (completedPhotos.before.length > 0) {
      onBeforePhotosChange([...beforePhotos, ...completedPhotos.before]);
      setCompletedPhotos(prev => ({ ...prev, before: [] }));
    }
    if (completedPhotos.after.length > 0) {
      onAfterPhotosChange([...afterPhotos, ...completedPhotos.after]);
      setCompletedPhotos(prev => ({ ...prev, after: [] }));
    }
  }, [completedPhotos, beforePhotos, afterPhotos, onBeforePhotosChange, onAfterPhotosChange]);

  const getFileType = (file: File): UploadedPhoto['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    return 'image'; // default for photos
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File, category: 'before' | 'after'): string | null => {
    // Check file size
    if (file.size > MAX_SIZE_DEFAULT) {
      return `File too large (${formatFileSize(file.size)}). Maximum ${formatFileSize(MAX_SIZE_DEFAULT)}.`;
    }

    // Check file type
    const allowedTypes = ACCEPTED_TYPES.split(',');
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed: ${ACCEPTED_TYPES.replace(/,/g, ', ')}`;
    }

    // Check total files in category don't exceed limit
    const currentPhotos = category === 'before' ? beforePhotos : afterPhotos;
    const currentUploading = category === 'before' ? uploadingPhotos.before : uploadingPhotos.after;
    if (currentPhotos.length + currentUploading.length >= MAX_FILES_PER_CATEGORY) {
      return `Maximum ${MAX_FILES_PER_CATEGORY} photos allowed per category.`;
    }

    // Check if file already exists
    const categoryPhotos = [...currentPhotos, ...currentUploading];
    const existingFileNames = categoryPhotos.map(f => f.name.toLowerCase());
    if (existingFileNames.includes(file.name.toLowerCase())) {
      return 'Photo with this name already exists.';
    }

    return null;
  };

  const simulateUploadProgress = (category: 'before' | 'after', photoIndex: number) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        setUploadingPhotos(prev => {
          const categoryPhotos = [...prev[category]];
          if (categoryPhotos[photoIndex]) {
            categoryPhotos[photoIndex] = {
              ...categoryPhotos[photoIndex],
              uploadProgress: 100,
              url: URL.createObjectURL(categoryPhotos[photoIndex].file)
            };
          }
          return { ...prev, [category]: categoryPhotos };
        });

        // Move to completed photos after a short delay
        setTimeout(() => {
          setUploadingPhotos(prev => {
            const completedPhoto = prev[category][photoIndex];
            const newUploading = prev[category].filter((_, idx) => idx !== photoIndex);

            if (completedPhoto) {
              setCompletedPhotos(prevCompleted => ({
                ...prevCompleted,
                [category]: [...prevCompleted[category], { ...completedPhoto, uploadProgress: undefined }]
              }));
            }

            return { ...prev, [category]: newUploading };
          });
        }, 500);
      } else {
        setUploadingPhotos(prev => {
          const categoryPhotos = [...prev[category]];
          if (categoryPhotos[photoIndex]) {
            categoryPhotos[photoIndex] = { ...categoryPhotos[photoIndex], uploadProgress: progress };
          }
          return { ...prev, [category]: categoryPhotos };
        });
      }
    }, 200);
  };

  const processFiles = (files: File[], category: 'before' | 'after') => {
    const availableSlots = MAX_FILES_PER_CATEGORY - (category === 'before' ? beforePhotos.length : afterPhotos.length) - uploadingPhotos[category].length;

    if (availableSlots <= 0) {
      toast.error(`${category === 'before' ? 'Before' : 'After'} photos: Maximum ${MAX_FILES_PER_CATEGORY} photos allowed.`);
      return;
    }

    const filesToProcess = files.slice(0, availableSlots);
    const validFiles: File[] = [];
    const errors: string[] = [];

    filesToProcess.forEach(file => {
      const error = validateFile(file, category);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    // Show errors for invalid files
    errors.forEach(error => toast.error(error));

    if (validFiles.length === 0) return;

    // Add valid files to uploading state
    const newUploadingPhotos: UploadedPhoto[] = validFiles.map(file => ({
      file,
      name: file.name,
      type: getFileType(file),
      size: file.size,
      uploadProgress: 0,
    }));

    setUploadingPhotos(prev => ({
      ...prev,
      [category]: [...prev[category], ...newUploadingPhotos]
    }));

    // Start upload simulation for each photo
    newUploadingPhotos.forEach((_, index) => {
      const photoIndex = uploadingPhotos[category].length + index;
      setTimeout(() => simulateUploadProgress(category, photoIndex), Math.random() * 1000);
    });

    toast.success(`Starting upload of ${validFiles.length} ${category} photo${validFiles.length > 1 ? 's' : ''}`);
  };

  const onDrop = (category: 'before' | 'after') => useCallback((acceptedFiles: File[]) => {
    processFiles(acceptedFiles, category);
  }, [beforePhotos, afterPhotos, uploadingPhotos]);

  const removePhoto = (category: 'before' | 'after', index: number) => {
    const newPhotos = category === 'before'
      ? beforePhotos.filter((_, i) => i !== index)
      : afterPhotos.filter((_, i) => i !== index);

    if (category === 'before') {
      onBeforePhotosChange(newPhotos);
    } else {
      onAfterPhotosChange(newPhotos);
    }
  };

  const removeUploadingPhoto = (category: 'before' | 'after', index: number) => {
    setUploadingPhotos(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };

  const PhotoSection = ({
    title,
    photos,
    uploadingPhotos: sectionUploadingPhotos,
    onDropZone,
    inputRef,
    onSelectFiles
  }: {
    title: string;
    photos: UploadedPhoto[];
    uploadingPhotos: UploadedPhoto[];
    onDropZone: any;
    inputRef: React.RefObject<HTMLInputElement>;
    onSelectFiles: () => void;
  }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium flex items-center gap-2">
          <Camera className="h-4 w-4" />
          {title}
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSelectFiles}
        >
          <Upload className="mr-2 h-4 w-4" />
          Select Photos
        </Button>
      </div>

      <div {...onDropZone()}>
        <input {...onDropZone().getInputProps()} ref={inputRef} />
        <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors hover:border-primary/50">
          <div className="flex flex-col items-center gap-2">
            <Image className="h-8 w-8 text-muted-foreground" />
            <div className="text-sm font-medium">
              {onDropZone().isDragActive ? 'Drop photos here' : 'Drag & drop photos here'}
            </div>
            <div className="text-xs text-muted-foreground">
              or click to select (max {MAX_SIZE_DEFAULT / 1024 / 1024}MB each)
            </div>
          </div>
        </div>
      </div>

      {(photos.length > 0 || sectionUploadingPhotos.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Completed Photos */}
          {photos.map((photo, index) => (
            <div
              key={index}
              className="relative group border rounded-lg overflow-hidden bg-green-50 border-green-200"
            >
              <div className="aspect-square">
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removePhoto(title.toLowerCase().includes('before') ? 'before' : 'after', index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-xs p-1 truncate">
                {photo.name}
              </div>
              <CheckCircle className="absolute top-1 right-1 h-5 w-5 text-green-500 bg-white rounded-full" />
            </div>
          ))}

          {/* Uploading Photos */}
          {sectionUploadingPhotos.map((photo, index) => (
            <div
              key={`uploading-${index}`}
              className="relative border rounded-lg overflow-hidden"
            >
              <div className="aspect-square flex items-center justify-center bg-muted">
                {photo.uploadProgress === 100 ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : photo.error ? (
                  <AlertCircle className="h-8 w-8 text-red-500" />
                ) : (
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs p-2">
                <div className="truncate">{photo.name}</div>
                {photo.uploadProgress !== undefined && photo.uploadProgress < 100 && (
                  <Progress value={photo.uploadProgress} className="h-1 mt-1" />
                )}
                {photo.error && (
                  <div className="text-red-400 text-xs mt-1">{photo.error}</div>
                )}
              </div>
              <div className="absolute top-1 right-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeUploadingPhoto(title.toLowerCase().includes('before') ? 'before' : 'after', index)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <div>
            Upload photos showing your land {title.toLowerCase().includes('before') ? 'before reforestation' : 'after reforestation'}.
            At least one photo required per category. Files are securely stored for verification.
          </div>
        </div>
      </div>
    </div>
  );

  const beforeDropzone = useDropzone({
    onDrop: onDrop('before'),
    accept: ACCEPTED_TYPES.split(',').reduce((acc, type) => {
      acc[type.trim()] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: MAX_SIZE_DEFAULT,
    multiple: true,
    noClick: true,
  });

  const afterDropzone = useDropzone({
    onDrop: onDrop('after'),
    accept: ACCEPTED_TYPES.split(',').reduce((acc, type) => {
      acc[type.trim()] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: MAX_SIZE_DEFAULT,
    multiple: true,
    noClick: true,
  });

  return (
    <div className={`space-y-8 ${className || ''}`}>
      <div>
        <h3 className="text-lg font-semibold mb-4">Reforestation Evidence Photos</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PhotoSection
            title="Before Reforestation"
            photos={beforePhotos}
            uploadingPhotos={uploadingPhotos.before}
            onDropZone={() => beforeDropzone}
            inputRef={beforeFileInputRef}
            onSelectFiles={() => beforeFileInputRef.current?.click()}
          />

          <PhotoSection
            title="After Reforestation"
            photos={afterPhotos}
            uploadingPhotos={uploadingPhotos.after}
            onDropZone={() => afterDropzone}
            inputRef={afterFileInputRef}
            onSelectFiles={() => afterFileInputRef.current?.click()}
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Before photos: {beforePhotos.length}/{MAX_FILES_PER_CATEGORY}</span>
          <span>After photos: {afterPhotos.length}/{MAX_FILES_PER_CATEGORY}</span>
        </div>
      </div>
    </div>
  );
}
