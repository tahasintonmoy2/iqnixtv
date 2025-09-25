"use client";
import { Edit, Loader2, MoreHorizontal, Plus, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AddCategoryDialog } from "@/components/add-category-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCategories } from "@/hooks/use-categories";
import { DeleteGenreModal } from "./models/delete-genre-modal";

export function CategoriesList() {
  const {
    categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const router = useRouter();

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setShowEditDialog(true);
  };

  const handleSaveCategory = async (category: any) => {
    setEditingCategory(null);
    // Refresh the page after successful save
    router.refresh();
  };

  const handleDeleteCategory = async (categoryId: string) => {
    setShowDeleteDialog(true);

    setDeletingCategory(categoryId);
    try {
      await deleteCategory(categoryId);
      // Refresh the page after successful deletion
      router.refresh();
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setDeletingCategory(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="loader" />
        <span className="ml-2">Loading categories...</span>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <>
            {showDeleteDialog && deletingCategory === category.id && (
              <DeleteGenreModal
                data={category}
                onClose={() => setShowDeleteDialog(false)}
                isOpen={showDeleteDialog}
                onConfirm={() => handleDeleteCategory(category.id)}
              />
            )}
            <Card key={category.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full bg-${category.color}-500`}
                    />
                    <CardTitle>{category.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setShowDeleteDialog(true)}
                        disabled={deletingCategory === category.id}
                      >
                        {deletingCategory === category.id ? (
                          <div className="loader" />
                        ) : (
                          <Trash className="mr-2 size-4" />
                        )}
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>
                  {category.contentCount || 0} items • Created{" "}
                  {new Date(category.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent key={category.color}>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {category.contentCount || 0} items
                  </div>
                  <div className="flex gap-1">
                    {category.isPublished ? (
                      <Badge variant="outline">Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleEditCategory(category)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Category
                </Button>
              </CardFooter>
            </Card>
          </>
        ))}

        {categories.length === 0 && (
          <Card className="flex flex-col items-center justify-center border-dashed p-6 col-span-full">
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <div className="rounded-full bg-muted p-3">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No categories yet</h3>
              <p className="text-sm text-muted-foreground">
                Create your first category to organize your content
              </p>
            </div>
          </Card>
        )}
      </div>

      <AddCategoryDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        category={editingCategory}
        onSave={handleSaveCategory}
        onCreateCategory={createCategory}
        onUpdateCategory={updateCategory}
      />
    </>
  );
}
