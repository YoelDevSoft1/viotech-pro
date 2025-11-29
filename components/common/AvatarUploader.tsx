"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, Loader2, X, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUploadAvatar, useDeleteAvatar } from "@/lib/hooks/useAvatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface AvatarUploaderProps {
  currentAvatar: string | null | undefined;
  userName: string;
  initials: string;
  size?: "sm" | "md" | "lg";
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function AvatarUploader({
  currentAvatar,
  userName,
  initials,
  size = "md",
}: AvatarUploaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadAvatar();
  const deleteMutation = useDeleteAvatar();

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-32 w-32",
    lg: "h-40 w-40",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const validateFile = (file: File): string | null => {
    // Validar tipo de archivo
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Solo se permiten archivos de imagen (JPG, PNG, WebP)";
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      return "El archivo no debe superar los 5MB";
    }

    return null;
  };

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const file = e.target.files?.[0];
      if (!file) return;

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
        setPreview(null);
        return;
      }

      setSelectedFile(file);
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadMutation.mutateAsync(selectedFile);
      setIsDialogOpen(false);
      setSelectedFile(null);
      setPreview(null);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      // El error ya se maneja en el hook
    }
  };

  const handleDelete = async () => {
    if (!currentAvatar) return;

    try {
      await deleteMutation.mutateAsync();
      setIsDialogOpen(false);
    } catch (error) {
      // El error ya se maneja en el hook
    }
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setError(null);
    setSelectedFile(null);
    setPreview(null);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isLoading = uploadMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <div className="flex flex-col items-center space-y-4">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={currentAvatar || undefined} alt={userName} />
          <AvatarFallback className={textSizeClasses[size]}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleOpenDialog}
          disabled={isLoading}
        >
          <Camera className="mr-2 h-4 w-4" />
          {currentAvatar ? "Cambiar foto" : "Subir foto"}
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Foto de Perfil</DialogTitle>
            <DialogDescription>
              Sube una nueva foto de perfil. Formatos: JPG, PNG, WebP (máx. 5MB)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Preview */}
            <div className="flex justify-center">
              <Avatar className="h-40 w-40">
                <AvatarImage
                  src={preview || currentAvatar || undefined}
                  alt={userName}
                />
                <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
              </Avatar>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* File Input */}
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                id="avatar-upload"
                disabled={isLoading}
              />
              <label htmlFor="avatar-upload">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full cursor-pointer"
                  disabled={isLoading}
                  asChild
                >
                  <span>
                    <Camera className="mr-2 h-4 w-4" />
                    Seleccionar imagen
                  </span>
                </Button>
              </label>
              {selectedFile && (
                <p className="text-xs text-muted-foreground text-center">
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              {currentAvatar && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </>
                  )}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isLoading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile || isLoading}
                className="flex-1"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

