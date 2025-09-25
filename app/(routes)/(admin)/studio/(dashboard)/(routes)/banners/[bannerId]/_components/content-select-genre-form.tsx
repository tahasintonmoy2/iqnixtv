"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { SeriesBanner } from "@/lib/generated/prisma";
import { getError } from "@/lib/get-error-message";
import { cn } from "@/lib/utils";
import { PencilIcon, X } from "lucide-react";
import { toast } from "sonner";

interface CategoryFormPops {
  initialData: SeriesBanner;
  bannerId: string;
  options: { name: string; value: string }[];
}

const formSchema = z.object({
  genreId: z.array(z.string().min(1)),
});

export const ContentGenresForm = ({
  initialData,
  bannerId,
  options,
}: CategoryFormPops) => {
  const toStringArray = (value: unknown): string[] => {
    if (Array.isArray(value)) return value as string[];
    if (typeof value === "string")
      return value
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
    return [];
  };
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      genreId: toStringArray(initialData.genreId),
    },
  });

  const toggleEdit = () => setIsEditing((current) => !current);

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/series/banner/${bannerId}`, values);
      toast.success("Series banner genre updated!");
      toggleEdit();
      router.refresh();
    } catch (error) {
      toast.error(getError(error));
    }
  };

  const selectedIds = toStringArray(initialData.genreId);
  const selectedNames = options
    .filter((option) => selectedIds.includes(option.value))
    .map((option) => option.name);

  return (
    <div className="mt-6 border bg-card rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Categories
        <Button variant="ghost" onClick={toggleEdit}>
          {isEditing ? (
            <>
              <X className="h-5 w-5 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <PencilIcon className="h-4 w-4 mr-2" />
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <p
          className={cn(
            "text-sm mt-2",
            selectedNames.length === 0 && "text-muted-foreground"
          )}
        >
          {selectedNames.length > 0
            ? selectedNames.join(", ")
            : "No genre selected"}
        </p>
      )}
      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="genreId"
              render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-2 gap-4">
                    {options.map((item) => {
                      const isChecked = Array.isArray(field.value)
                        ? field.value.includes(item.value)
                        : false;
                      return (
                        <div key={item.value}>
                          <div className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                id={item.value}
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  const current = Array.isArray(field.value)
                                    ? field.value
                                    : [];
                                  if (checked) {
                                    field.onChange([...current, item.value]);
                                  } else {
                                    field.onChange(
                                      current.filter((v) => v !== item.value)
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <Label htmlFor={item.value}>{item.name}</Label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Selected Categories:</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(form.watch("genreId")) && form.watch("genreId").length > 0 ? (
                        form.watch("genreId").map((categoryId: string) => {
                          const option = options.find((opt) => opt.value === categoryId);
                          return (
                            <Badge key={categoryId} variant="secondary">
                              {option ? option.name : categoryId}
                            </Badge>
                          );
                        })
                      ) : (
                        <span className="text-muted-foreground">No categories selected</span>
                      )}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-end gap-x-2">
              <Button disabled={!isValid || isSubmitting} type="submit">
                Save
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
