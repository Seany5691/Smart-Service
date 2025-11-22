"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, File, Trash2 } from "lucide-react";
import { fileService } from "@/lib/firebase/storage";
import { toast } from "sonner";

interface FileUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (files: any[]) => void;
    ticketId: string;
}

export default function FileUploadModal({ isOpen, onClose, onSuccess, ticketId }: FileUploadModalProps) {
    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            toast.error("Please select at least one file");
            return;
        }

        setLoading(true);
        try {
            const uploadedFiles = await fileService.uploadMultiple(
                selectedFiles,
                `tickets/${ticketId}`
            );

            toast.success(`${uploadedFiles.length} file(s) uploaded successfully!`);
            onSuccess(uploadedFiles);
            setSelectedFiles([]);
            onClose();
        } catch (error) {
            console.error("Error uploading files:", error);
            toast.error("Failed to upload files. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-card rounded-lg shadow-lg w-full max-w-lg m-4">
                <div className="flex items-center justify-between border-b p-6">
                    <h2 className="text-2xl font-bold">Upload Files</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground mb-4">
                            Click to select files or drag and drop
                        </p>
                        <input
                            type="file"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                            id="file-upload"
                        />
                        <label htmlFor="file-upload">
                            <Button type="button" variant="outline" asChild>
                                <span>Select Files</span>
                            </Button>
                        </label>
                    </div>

                    {selectedFiles.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Selected Files:</p>
                            {selectedFiles.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <File className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">{file.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {(file.size / 1024).toFixed(2)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeFile(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpload} disabled={loading || selectedFiles.length === 0}>
                            {loading ? "Uploading..." : `Upload ${selectedFiles.length} file(s)`}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
