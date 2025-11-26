"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, Image as ImageIcon, Star, Save } from "lucide-react";
import { ProductImage } from "@/types";
import { useUploadProductImages, useDeleteProductImage, useSetPrimaryProductImage } from "@/hooks/api";
import { cn } from "@/lib/utils";

interface ProductImageManagerProps {
  productId: number;
  images: ProductImage[];
  maxImages?: number;
  disabled?: boolean;
  className?: string;
  hidePreview?: boolean;
  onImagesChange?: (newImages: File[]) => void;
}

interface PreviewImage {
  id: string; // Temporary ID for preview
  file?: File;
  preview: string; // Data URL for preview
  altText?: string;
  isPrimary?: boolean;
  displayOrder: number;
  uploaded?: boolean; // Was this from API response
  apiImageId?: number; // If from API
}

/**
 * Product Image Manager Component - REDESIGNED
 * Step 1: Select & preview multiple images
 * Step 2: Remove unwanted images
 * Step 3: Save all images at once
 */
export function ProductImageManager({
  productId,
  images = [],
  maxImages = 5,
  disabled = false,
  className,
  hidePreview = false,
  onImagesChange,
}: ProductImageManagerProps) {
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>(
    images.map((img, idx) => ({
      id: `api-${img.id}`,
      preview: img.imageUrl,
      altText: img.altText,
      isPrimary: img.isPrimary,
      displayOrder: idx,
      uploaded: true,
      apiImageId: img.id,
    }))
  );
  const [uploading, setUploading] = useState(false);
  const uploadImages = useUploadProductImages();
  const deleteImage = useDeleteProductImage();
  const setPrimaryImage = useSetPrimaryProductImage();

  const sortedImages = [...previewImages].sort((a, b) => a.displayOrder - b.displayOrder);
  const newImages = previewImages.filter((img) => !img.uploaded && img.file);
  const hasChanges = newImages.length > 0;

  const onDrop = (acceptedFiles: File[]) => {
    if (disabled || uploading) return;
    if (previewImages.length + acceptedFiles.length > maxImages) {
      alert(`Chỉ được tải tối đa ${maxImages} ảnh!`);
      return;
    }

    // Add to preview list (don't upload yet)
    const newPreviews = acceptedFiles.map((file, index) => ({
      id: `temp-${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      displayOrder: previewImages.length + index,
      isPrimary: previewImages.length === 0 && index === 0,
      uploaded: false,
    }));

    setPreviewImages([...previewImages, ...newPreviews]);
  };

  const handleRemoveImage = (imageId: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa ảnh này?")) return;

    const image = previewImages.find((img) => img.id === imageId);
    if (!image) return;

    // If it's a new preview image, just remove from preview
    if (!image.uploaded) {
      URL.revokeObjectURL(image.preview);
      setPreviewImages(previewImages.filter((img) => img.id !== imageId));
      return;
    }

    // If it's already uploaded, delete from API
    if (image.apiImageId) {
      handleDeleteFromAPI(image.apiImageId);
    }
  };

  const handleDeleteFromAPI = async (imageId: number) => {
    try {
      await deleteImage.mutateAsync({ productId, imageId });
      setPreviewImages(previewImages.filter((img) => img.apiImageId !== imageId));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    const image = previewImages.find((img) => img.id === imageId);
    if (!image || !image.apiImageId) return;

    try {
      await setPrimaryImage.mutateAsync({ productId, imageId: image.apiImageId });
      setPreviewImages(
        previewImages.map((img) => ({
          ...img,
          isPrimary: img.id === imageId,
        }))
      );
    } catch (error) {
      console.error("Set primary failed:", error);
    }
  };

  const handleSaveImages = async () => {
    if (newImages.length === 0) {
      alert("Không có ảnh mới để lưu!");
      return;
    }

    try {
      setUploading(true);

      const files = newImages.map((img) => img.file!);
      const metadata = newImages.map((img, idx) => ({
        imageType: "gallery" as const,
        isPrimary: img.isPrimary || false,
        displayOrder: img.displayOrder,
      }));

      await uploadImages.mutateAsync({
        productId,
        files,
        metadata,
      });

      // Clear preview after successful upload
      const uploadedIds = newImages.map((img) => img.id);
      setPreviewImages(
        previewImages.filter((img) => !uploadedIds.includes(img.id))
      );

      // Notify parent of saved images
      onImagesChange?.(files);

      alert("Tải lên ảnh thành công!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Tải lên ảnh thất bại!");
    } finally {
      setUploading(false);
    }
  };

  const getNewImages = () => previewImages.filter((img) => !img.uploaded && img.file);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: maxImages - previewImages.length,
    maxSize: 5 * 1024 * 1024,
    multiple: true,
    disabled: disabled || uploading || previewImages.length >= maxImages,
  });

  return (
    <div className={cn("w-full", className)}>
      <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
        Hình ảnh sản phẩm
        <span className="ml-2 text-xs text-gray-500">
          ({previewImages.length}/{maxImages})
        </span>
      </label>

      {/* Preview Images */}
      {sortedImages.length > 0 && !hidePreview && (
        <div className="mb-4">
          <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            Xem trước ({sortedImages.length})
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {sortedImages.map((image, index) => (
              <div key={image.id} className="group relative aspect-square">
                <img
                  src={image.preview}
                  alt={image.altText || `Product image ${index + 1}`}
                  className="h-full w-full rounded-lg object-cover border-2 border-gray-200 dark:border-gray-700"
                />

                {/* Primary Badge */}
                {image.isPrimary && (
                  <div className="absolute left-2 top-2 rounded-full bg-yellow-500 px-2 py-1 text-xs font-medium text-white flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Chính
                  </div>
                )}

                {/* Set Primary Button */}
                {!disabled && !image.isPrimary && image.uploaded && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(image.id)}
                    disabled={setPrimaryImage.isPending}
                    className="absolute left-2 top-2 rounded-full bg-gray-800/70 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-yellow-500 disabled:opacity-50 flex items-center gap-1"
                    title="Đặt làm ảnh chính"
                  >
                    <Star className="h-3 w-3" />
                  </button>
                )}

                {/* Delete Button */}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(image.id)}
                    disabled={deleteImage.isPending || uploading}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-lg opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {/* Status Badge */}
                <div className="absolute bottom-2 right-2 rounded text-xs text-white">
                  {image.uploaded ? (
                    <span className="bg-green-500/80 px-2 py-1 rounded">
                      ✓ Đã lưu
                    </span>
                  ) : (
                    <span className="bg-blue-500/80 px-2 py-1 rounded">
                      Chờ lưu
                    </span>
                  )}
                </div>

                <div className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Area */}
      {previewImages.length < maxImages && (
        <div
          {...getRootProps()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors",
            isDragActive
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
              : "border-gray-300 hover:border-gray-400 dark:border-gray-600",
            disabled && "cursor-not-allowed opacity-50",
            uploading && "cursor-wait"
          )}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center text-center">
            {uploading ? (
              <>
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  Đang tải lên...
                </p>
              </>
            ) : isDragActive ? (
              <>
                <Upload className="h-12 w-12 text-blue-500" />
                <p className="mt-3 text-sm font-medium text-blue-600 dark:text-blue-400">
                  Thả ảnh vào đây
                </p>
              </>
            ) : (
              <>
                <ImageIcon className="h-12 w-12 text-gray-400" />
                <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
                  Nhấp hoặc kéo thả ảnh vào đây
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, WEBP tối đa 5MB
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Save Button - Only show if there are new images */}
      {hasChanges && !hidePreview && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={handleSaveImages}
            disabled={uploading || newImages.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-900"
          >
            <Save className="h-4 w-4" />
            Lưu {newImages.length} ảnh mới
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {newImages.length} ảnh chưa lưu
          </span>
        </div>
      )}
    </div>
  );
}
