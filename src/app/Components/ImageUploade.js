"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/lib/api";
import { useUser } from "@/components/UserProvider";
import {useRouter} from "next/navigation"

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_FILES = 3;
const MAX_WIDTH = 800;
const MAX_HEIGHT = 600;
const QUALITY = 0.7;

export default function ImageUploader({ id, module }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);
  const {user} = useUser()
  const router = useRouter()

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || []);

    const validFiles = selected.filter((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a supported image format`);
        return false;
      }
      return true;
    });

    const remainingSlots = MAX_FILES - files.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);

    if (validFiles.length > remainingSlots) {
      toast.warning(`You can only upload a maximum of ${MAX_FILES} images`);
    }

    if (filesToAdd.length === 0) return;

    setFiles((prev) => [...prev, ...filesToAdd]);

    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviews((prev) => [...prev, ev.target.result]);
      };
      reader.readAsDataURL(file);
    });

    if (inputRef.current) inputRef.current.value = "";
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas not supported"));

          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = (height * MAX_WIDTH) / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = (width * MAX_HEIGHT) / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          resolve(canvas.toDataURL("image/jpeg", QUALITY));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      const resizedImages = await Promise.all(files.map(resizeImage));
      setProgress(40);

      const response = await api.post(
        `/api/images/upload?id=${id}&module=${module}`,
        {
          image : resizedImages,
        }
      );

      setProgress(80);

      const data = response.data || {};

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setProgress(100);
      toast.success("Images uploaded successfully");

      // Clear local state
      setFiles([]);
      setPreviews([]);

      // Optional: reload page after success
      router.refresh();
    } catch (error) {
      toast.error("Error uploading images");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardContent className="pt-6 space-y-4">
        {/* Dropzone */}
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
            "hover:border-primary/50 hover:bg-muted/50",
            uploading && "opacity-50 pointer-events-none"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            multiple
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading || files.length >= MAX_FILES}
          />

          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-muted">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Click to select images</p>
              <p className="text-sm text-muted-foreground mt-1">
                JPG, PNG, WebP or GIF • Max {MAX_FILES} images
              </p>
            </div>
            {files.length > 0 && (
              <Badge variant="secondary">
                {files.length} / {MAX_FILES} selected
              </Badge>
            )}
          </div>
        </div>

        {/* Previews */}
        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {previews.map((src, index) => (
              <div key={index} className="relative group aspect-square">
                <img
                  src={src}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border"
                />
                {!uploading && (
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Progress */}
        {uploading && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              Uploading... {progress}%
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="flex-1"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 h-4 w-4" />
                Upload {files.length > 0 ? `(${files.length})` : ""}
              </>
            )}
          </Button>

          {files.length > 0 && !uploading && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFiles([]);
                setPreviews([]);
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}