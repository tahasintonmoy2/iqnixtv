import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// PUT - Update a category
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name } = body;
    const {categoryId} = await params;

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Category name is required and must be at least 2 characters" },
        { status: 400 }
      );
    }

    const category = await db.genre.update({
      where: {
        id: categoryId,
      },
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const user = await currentUser();
    const {categoryId} = await params;
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if category is being used by any series
    const seriesCount = await db.series.count({
      where: {
        genreId: categoryId,
      },
    });

    if (seriesCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category that is being used by series" },
        { status: 400 }
      );
    }

    await db.genre.delete({
      where: {
        id: categoryId,
      },
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
} 