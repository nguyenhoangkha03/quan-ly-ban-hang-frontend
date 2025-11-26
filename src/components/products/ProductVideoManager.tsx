"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { X, Video as VideoIcon } from "lucide-react";
import { ProductVideo } from "@/types";
import { cn } from "@/lib/utils";

interface ProductVideoManagerProps {
  productId?: number;
  video?: ProductVideo | null;
  disabled?: boolean;
  className?: string;
  onVideoChange?: (file: File | null) => void;
}

interface PreviewVideo {
  file?: File;
  preview: string;
  title?: string;
  videoType?: string;
  uploaded?: boolean;
  apiVideoId?: number;
}

/**
 * Product Video Manager Component - REDESIGNED
 * Select & preview single video (max 1)
 * Used in Product Create modal alongside ProductImageManager
 * Batch save with images
 */
export function ProductVideoManager({
  productId,
  video,
  disabled = false,
  className,
  onVideoChange,
}: ProductVideoManagerProps) {
  const [previewVideo, setPreviewVideo] = useState<PreviewVideo | null>(
    video
      ? {
          preview: video.videoUrl,
          title: video.title,
          videoType: video.videoType,
          uploaded: true,
          apiVideoId: video.id,
        }
      : null
  );

  const onDrop = (acceptedFiles: File[]) => {
    if (disabled) return;
    if (acceptedFiles.length === 0) return;

    // Only take first file (max 1 video)
    const file = acceptedFiles[0];

    const preview = URL.createObjectURL(file);
    setPreviewVideo({
      file,
      preview,
      videoType: "demo",
      uploaded: false,
    });

    onVideoChange?.(file);
  };

  const handleRemoveVideo = () => {
    if (!window.confirm("Bạn có chắc muốn xóa video này?")) return;

    if (previewVideo?.file) {
      URL.revokeObjectURL(previewVideo.preview);
    }
    setPreviewVideo(null);
    onVideoChange?.(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/mp4": [".mp4"],
      "video/quicktime": [".mov"],
      "video/x-msvideo": [".avi"],
      "video/x-matroska": [".mkv"],
      "video/webm": [".webm"],
    },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024,
    multiple: false,
    disabled: disabled || !!previewVideo,
  });

  return (
    <div className={cn("w-full", className)}>
      <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
        Video sản phẩm
        <span className="ml-2 text-xs text-gray-500">
          (Tối đa 1 video)
        </span>
      </label>

      {/* Preview Video */}
      {previewVideo && (
        <div className="mb-4">
          <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            Video đã chọn
          </h3>
          <div className="relative aspect-video max-w-sm rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-black">
            {/* Video Preview (thumbnail or play button) */}
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <VideoIcon className="h-16 w-16 text-gray-400" />
            </div>

            {/* Video Title */}
            {previewVideo.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-3 py-2">
                <p className="text-sm text-white truncate">{previewVideo.title}</p>
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-2 right-2 rounded text-xs text-white">
              {previewVideo.uploaded ? (
                <span className="bg-green-500/80 px-2 py-1 rounded">
                  ✓ Đã lưu
                </span>
              ) : (
                <span className="bg-blue-500/80 px-2 py-1 rounded">
                  Chờ lưu
                </span>
              )}
            </div>

            {/* Delete Button */}
            {!disabled && (
              <button
                type="button"
                onClick={handleRemoveVideo}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-lg hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Upload Area - Only show if no video selected */}
      {!previewVideo && (
        <div
          {...getRootProps()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors",
            isDragActive
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
              : "border-gray-300 hover:border-gray-400 dark:border-gray-600",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center text-center">
            <VideoIcon className="h-12 w-12 text-gray-400" />
            <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
              Nhấp hoặc kéo thả video vào đây
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              MP4, MOV, AVI, MKV, WebM tối đa 500MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

