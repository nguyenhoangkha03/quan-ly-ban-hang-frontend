"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, Image as ImageIcon, Star } from "lucide-react";
import { ProductImage } from "@/types";
import { useUploadProductImages, useDeleteProductImage } from "@/hooks/api";
import { cn } from "@/lib/utils";

interface ProductImageManagerProps {
  productId: number;
  images: ProductImage[];
  maxImages?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * Product Image Manager Component
 * Manage product images: upload, delete, reorder, set primary
 * Used in Edit Product page
 */
export function ProductImageManager({
  productId,
  images = [],
  maxImages = 5,
  disabled = false,
  className,
}: ProductImageManagerProps) {
  const [uploading, setUploading] = useState(false);
  const uploadImages = useUploadProductImages();
  const deleteImage = useDeleteProductImage();

  const sortedImages = [...images].sort((a, b) => a.displayOrder - b.displayOrder);

  const onDrop = async (acceptedFiles: File[]) => {
    if (disabled || uploading) return;
    if (images.length + acceptedFiles.length > maxImages) {
      alert(`Chỉ được tải tối đa ${maxImages} ảnh!`);
      return;
    }

    try {
      setUploading(true);

      // Create metadata for each file
      const metadata = acceptedFiles.map((_, index) => ({
        imageType: "gallery" as const,
        isPrimary: images.length === 0 && index === 0, // First image is primary if no images exist
        displayOrder: images.length + index,
      }));

      await uploadImages.mutateAsync({
        productId,
        files: acceptedFiles,
        metadata,
      });
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: number) => {
    if (disabled) return;
    if (!window.confirm("Bạn có chắc muốn xóa ảnh này?")) return;

    try {
      await deleteImage.mutateAsync({ productId, imageId });
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: maxImages - images.length,
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true,
    disabled: disabled || uploading || images.length >= maxImages,
  });

  return (
    <div className={cn("w-full", className)}>
      <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
        Hình ảnh sản phẩm
        <span className="ml-2 text-xs text-gray-500">
          ({images.length}/{maxImages})
        </span>
      </label>

      {/* Current Images */}
      {sortedImages.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {sortedImages.map((image, index) => (
            <div key={image.id} className="group relative aspect-square">
              <img
                src={image.imageUrl}
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

              {/* Delete Button */}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleDelete(image.id)}
                  disabled={deleteImage.isPending}
                  className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-lg opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Display Order */}
              <div className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
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
                  {images.length < maxImages && ` (còn ${maxImages - images.length} ảnh)`}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {images.length >= maxImages && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Đã đạt giới hạn {maxImages} ảnh. Xóa ảnh cũ để tải ảnh mới.
        </p>
      )}
    </div>
  );
}
