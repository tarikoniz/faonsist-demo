'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { FILE_UPLOAD } from '@/lib/constants';

interface FileWithProgress {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
    url?: string;
}

interface FileUploadProps {
    accept?: string;
    multiple?: boolean;
    maxSize?: number;
    maxFiles?: number;
    onUpload?: (files: File[]) => Promise<string[]>;
    onComplete?: (urls: string[]) => void;
    className?: string;
}

export function FileUpload({
    accept = FILE_UPLOAD.ALLOWED_EXTENSIONS.join(','),
    multiple = true,
    maxSize = FILE_UPLOAD.MAX_SIZE,
    maxFiles = 5,
    onUpload,
    onComplete,
    className,
}: FileUploadProps) {
    const [files, setFiles] = useState<FileWithProgress[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) return Image;
        if (file.type.includes('pdf')) return FileText;
        return File;
    };

    const validateFile = (file: File): string | undefined => {
        if (file.size > maxSize) {
            return `Dosya boyutu ${formatFileSize(maxSize)} değerini aşıyor`;
        }
        return undefined;
    };

    const handleFiles = useCallback(
        async (selectedFiles: FileList | File[]) => {
            const fileArray = Array.from(selectedFiles).slice(0, maxFiles - files.length);

            const newFiles: FileWithProgress[] = fileArray.map((file) => {
                const error = validateFile(file);
                return {
                    file,
                    progress: 0,
                    status: error ? ('error' as const) : ('pending' as const),
                    error,
                };
            });

            setFiles((prev) => [...prev, ...newFiles]);

            // Upload valid files
            const validFiles = newFiles.filter((f) => f.status === 'pending');

            if (validFiles.length > 0 && onUpload) {
                for (const fileItem of validFiles) {
                    try {
                        setFiles((prev) =>
                            prev.map((f) =>
                                f.file === fileItem.file ? { ...f, status: 'uploading' } : f
                            )
                        );

                        // Simulate upload progress
                        for (let i = 0; i <= 100; i += 10) {
                            await new Promise((r) => setTimeout(r, 50));
                            setFiles((prev) =>
                                prev.map((f) =>
                                    f.file === fileItem.file ? { ...f, progress: i } : f
                                )
                            );
                        }

                        const urls = await onUpload([fileItem.file]);

                        setFiles((prev) =>
                            prev.map((f) =>
                                f.file === fileItem.file
                                    ? { ...f, status: 'completed', url: urls[0], progress: 100 }
                                    : f
                            )
                        );
                    } catch (error) {
                        setFiles((prev) =>
                            prev.map((f) =>
                                f.file === fileItem.file
                                    ? { ...f, status: 'error', error: 'Yükleme başarısız' }
                                    : f
                            )
                        );
                    }
                }

                // Notify completion
                const completedUrls = files
                    .filter((f) => f.status === 'completed' && f.url)
                    .map((f) => f.url!);
                onComplete?.(completedUrls);
            }
        },
        [files, maxFiles, maxSize, onUpload, onComplete]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
        },
        [handleFiles]
    );

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className={cn('space-y-4', className)}>
            {/* Drop Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => inputRef.current?.click()}
                className={cn(
                    'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
                    isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/30'
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                    className="hidden"
                />

                <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-sm text-foreground font-medium">
                    Dosyaları sürükleyip bırakın veya tıklayın
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    Maksimum {formatFileSize(maxSize)}, en fazla {maxFiles} dosya
                </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((item, index) => {
                        const Icon = getFileIcon(item.file);

                        return (
                            <div
                                key={index}
                                className={cn(
                                    'flex items-center gap-3 p-3 rounded-lg bg-surface border',
                                    item.status === 'error' ? 'border-destructive/50' : 'border-border'
                                )}
                            >
                                <div className="p-2 rounded-lg bg-muted">
                                    <Icon className="h-5 w-5 text-muted-foreground" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{item.file.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatFileSize(item.file.size)}
                                        {item.error && (
                                            <span className="text-destructive ml-2">{item.error}</span>
                                        )}
                                    </p>

                                    {item.status === 'uploading' && (
                                        <Progress value={item.progress} className="h-1 mt-2" />
                                    )}
                                </div>

                                {item.status === 'uploading' ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                ) : (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeFile(index)}
                                        className="h-8 w-8"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
