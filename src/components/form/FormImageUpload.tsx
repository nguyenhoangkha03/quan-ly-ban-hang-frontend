"use client";

import React from "react";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { X, Upload, Image as ImageIcon } from "lucide-react";

interface FormImageUploadProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // bytes
  accept?: Record<string, string[]>;
  className?: string;
  onUpload?: (files: File[]) => Promise<string[]>; // Upload và trả về URLs
}

export function FormImageUpload<T extends FieldValues>({
  name,
  control,
  label,
  required = false,
  disabled = false,
  error,
  multiple = false,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
  },
  className,
  onUpload,
}: FormImageUploadProps<T>) {
  const [uploading, setUploading] = React.useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const currentValue = field.value as string | string[] | undefined;
        const images = Array.isArray(currentValue)
          ? currentValue
          : currentValue
          ? [currentValue]
          : [];

        const onDrop = async (acceptedFiles: File[]) => {
          if (disabled || uploading) return;

          try {
            setUploading(true);

            // Nếu có onUpload callback, upload files và lấy URLs
            if (onUpload) {
              const urls = await onUpload(acceptedFiles);

              if (multiple) {
                field.onChange([...images, ...urls]);
              } else {
                field.onChange(urls[0]);
              }
            } else {
              // Nếu không có onUpload, tạo preview URLs (dùng cho demo)
              const urls = acceptedFiles.map((file) => URL.createObjectURL(file));

              if (multiple) {
                field.onChange([...images, ...urls]);
              } else {
                field.onChange(urls[0]);
              }
            }
          } catch (err) {
            console.error("Upload failed:", err);
          } finally {
            setUploading(false);
          }
        };

        const removeImage = (index: number) => {
          if (multiple) {
            const newImages = images.filter((_, i) => i !== index);
            field.onChange(newImages.length > 0 ? newImages : undefined);
          } else {
            field.onChange(undefined);
          }
        };

        const { getRootProps, getInputProps, isDragActive } = useDropzone({
          onDrop,
          accept,
          maxFiles: multiple ? maxFiles : 1,
          maxSize,
          multiple,
          disabled: disabled || uploading,
        });

        return (
          <div className={cn("w-full", className)}>
            {label && (
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}

            {/* Preview Images */}
            {images.length > 0 && (
              <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {images.map((url, index) => (
                  <div key={index} className="group relative aspect-square">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="h-full w-full rounded-lg object-cover"
                    />
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-lg opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            {(multiple || images.length === 0) && (
              <div
                {...getRootProps()}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors",
                  isDragActive
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                    : "border-gray-300 hover:border-gray-400 dark:border-gray-600",
                  disabled && "cursor-not-allowed opacity-50",
                  uploading && "cursor-wait",
                  error && "border-red-500"
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
                        PNG, JPG, WEBP tối đa {Math.round(maxSize / 1024 / 1024)}MB
                        {multiple && ` (tối đa ${maxFiles} ảnh)`}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
        );
      }}
    />
  );
}
