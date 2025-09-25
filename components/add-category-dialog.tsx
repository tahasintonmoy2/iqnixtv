"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Genre } from "@/lib/generated/prisma";
import { cn } from "@/lib/utils";
import axios from "axios";
import { Loader2, Tag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Genre | null;
  onSave?: (category: Genre) => void;
  onCreateCategory?: (categoryData: {
    name: string;
    color: string;
    isPublished: boolean;
  }) => Promise<Genre>;
  onUpdateCategory?: (
    categoryId: string,
    categoryData: { name: string; color: string; isPublished: boolean }
  ) => Promise<Genre>;
}

const categoryColors = [
  { name: "Red", value: "red", class: "bg-red-500" },
  { name: "Blue", value: "blue", class: "bg-blue-500" },
  { name: "Green", value: "green", class: "bg-green-500" },
  { name: "Yellow", value: "yellow", class: "bg-yellow-500" },
  { name: "Purple", value: "purple", class: "bg-purple-500" },
  { name: "Pink", value: "pink", class: "bg-pink-500" },
  { name: "Orange", value: "orange", class: "bg-orange-500" },
  { name: "Teal", value: "teal", class: "bg-teal-500" },
];

export function AddCategoryDialog({
  open,
  onOpenChange,
  category,
  onSave,
  onCreateCategory,
  onUpdateCategory,
}: AddCategoryDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Genre>({
    name: category?.name || "",
    id: category?.id || `cat_${Date.now()}`,
    isPublished: category?.isPublished ?? true,
    color: category?.color ?? "blue",
    contentCount: category?.contentCount ?? null,
    createdAt: category?.createdAt ?? new Date(),
    updatedAt: category?.updatedAt ?? new Date(),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Category name must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const categoryData = {
        name: formData.name,
        color: formData.color || "blue",
        isPublished: formData.isPublished,
      };

      let savedCategory;
      if (category) {
        // Update existing category
        if (onUpdateCategory) {
          savedCategory = await onUpdateCategory(category.id, categoryData);
        } else {
          const response = await axios.patch(
            `/api/categories/${category.id}`,
            categoryData
          );

          if (response.status !== 200) {
            const errorData = response.data;
            throw new Error(errorData.error || "Failed to update category");
          }
          savedCategory = response.data;
        }
      } else {
        // Create new category
        if (onCreateCategory) {
          savedCategory = await onCreateCategory(categoryData);
        } else {
          const response = await axios.post("/api/categories", categoryData);

          if (response.status !== 200 && response.status !== 201) {
            const errorData = response.data;
            throw new Error(errorData.error || "Failed to create category");
          }
          savedCategory = response.data;
        }
      }

      onSave?.(savedCategory);
      onOpenChange(false);

      // Reset form if adding new category
      if (!category) {
        setFormData({
          name: "",
          id: `cat_${Date.now()}`,
          isPublished: true,
          color: "blue",
          contentCount: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save category"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setErrors({});
    if (!category) {
      setFormData({
        name: "",
        id: `cat_${Date.now()}`,
        isPublished: true,
        color: "blue",
        contentCount: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            {category ? "Edit Category" : "Add New Category"}
          </DialogTitle>
          <DialogDescription>
            {category
              ? "Update the category details and settings."
              : "Create a new category to organize your content library."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Category Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter category name"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Color Selection */}
          <div className="grid gap-2">
            <Label>Category Color</Label>
            <div className="flex flex-wrap gap-2">
              {categoryColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, color: color.value })
                  }
                  className={cn(
                    "size-8 rounded-full",
                    color.class &&
                      "border-2 hover:scale-110 transition-transform",
                    formData.color === color.value
                      ? "border-foreground"
                      : "border-transparent"
                  )}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Visible to Users</Label>
                <p className="text-sm text-muted-foreground">
                  Make this category visible in the app
                </p>
              </div>
              <Switch
                checked={formData.isPublished}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPublished: checked })
                }
              />
            </div>
          </div>

          {/* Preview */}
          <div className="grid gap-2">
            <Label>Preview</Label>
            <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
              <div
                className={`w-4 h-4 rounded-full bg-${formData.color}-500`}
              />
              <span className="font-medium">
                {formData.name || "Category Name"}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {category ? "Update Category" : "Create Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
