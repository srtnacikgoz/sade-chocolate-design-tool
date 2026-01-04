import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { designService } from '../../services/designService';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface DesignUploadProps {
  designId: string;
  onUploadSuccess?: () => void;
}

export const DesignUpload = ({ designId, onUploadSuccess }: DesignUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      return await designService.uploadDesign(designId, file);
    },
    onSuccess: () => {
      // Invalidate design query to refresh data
      queryClient.invalidateQueries({ queryKey: ['design', designId] });
      setSelectedFile(null);
      onUploadSuccess?.();
    },
  });

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/svg+xml', 'application/pdf', 'image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Geçersiz dosya tipi! Sadece SVG, PDF, PNG veya JPEG kabul edilir.');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('Dosya çok büyük! Maksimum 10MB yüklenebilir.');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card padding="lg">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Özel Tasarım Yükle
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Canva, Illustrator veya diğer tasarım araçlarından hazırladığınız dosyayı yükleyin.
          </p>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging
              ? 'border-gray-800 bg-gray-50'
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
        >
          {selectedFile ? (
            <div className="space-y-2">
              <div className="text-4xl">📄</div>
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFile(null)}
              >
                Değiştir
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-5xl">📤</div>
              <div>
                <p className="text-gray-700 font-medium">
                  Dosyayı buraya sürükleyin
                </p>
                <p className="text-sm text-gray-500">veya</p>
              </div>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Dosya Seç
              </Button>
              <p className="text-xs text-gray-500">
                SVG, PDF, PNG veya JPEG (Maks. 10MB)
              </p>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".svg,.pdf,.png,.jpg,.jpeg,image/svg+xml,application/pdf,image/png,image/jpeg"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Upload button */}
        {selectedFile && (
          <div className="flex justify-end">
            <Button
              onClick={handleUpload}
              isLoading={uploadMutation.isPending}
              disabled={!selectedFile}
            >
              Yükle
            </Button>
          </div>
        )}

        {/* Error message */}
        {uploadMutation.isError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              Yükleme başarısız: {(uploadMutation.error as Error).message}
            </p>
          </div>
        )}

        {/* Success message */}
        {uploadMutation.isSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              Tasarım başarıyla yüklendi!
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
