"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getError } from "@/lib/get-error-message";
import { PencilIcon, X } from "lucide-react";
import { toast } from "sonner";
import { Series } from "@/lib/generated/prisma";

interface TitleFormPops {
  initialData: Series,
  contentId: string
}

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
});

export const SeriesTitleForm = ({ initialData, contentId }: TitleFormPops) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues:{
      name: initialData.name
    },
  });

  const toggleEdit = () => setIsEditing((current) => !current);

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/series/${contentId}`, values);
      toast.success("Series title updated!");
      toggleEdit();
      router.refresh();
    } catch (error) {
      toast.error(getError(error));
    }
  };

  return (
    <div className="mt-6 border bg-card rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Name
        <Button variant="ghost" type="button" onClick={toggleEdit}>
          {isEditing ? (
            <>
              <X className="size-5" />
              Cancel
            </>
          ) : (
            <>
              <PencilIcon className="size-4" />
              Edit name
            </>
          )}
        </Button>
      </div>
      {!isEditing && <p className="mt-2">{initialData.name}</p>}
      {!isEditing && !initialData.name && (
        <p className="mt-2 text-muted-foreground text-sm">No name set</p>
      )}
      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="Enter title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <div className="flex items-end justify-end gap-x-2">
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
