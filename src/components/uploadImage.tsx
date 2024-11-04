import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type ImageUploadProps = {
  label: string;
  multiple?: boolean;
  onChange: (files: File[]) => void;
  value: File[];
  accept?: string;
};

const ImageUpload = ({ 
  label, 
  multiple = false, 
  onChange, 
  value = [],
  accept = "image/*" 
}: ImageUploadProps) => {
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
    
    // Call parent onChange
    onChange(multiple ? [...value, ...files] : files);
  };

  const removeFile = (index: number) => {
    const newFiles = [...value];
    newFiles.splice(index, 1);
    onChange(newFiles);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]); // Clean up URL
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
            className="hidden"
            id={`file-upload-${label}`}
          />
          <Button 
            type="button" 
            variant="outline"
            className="w-full"
            onClick={() => document.getElementById(`file-upload-${label}`)?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Choose {multiple ? 'Files' : 'File'}
          </Button>
        </div>
      </div>

      {(value.length > 0 || previews.length > 0) && (
        <div className="grid grid-cols-3 gap-4">
          {value.map((file, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <img
                  src={previews[index] || URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFile(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
                <p className="mt-2 text-sm truncate">{file.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;