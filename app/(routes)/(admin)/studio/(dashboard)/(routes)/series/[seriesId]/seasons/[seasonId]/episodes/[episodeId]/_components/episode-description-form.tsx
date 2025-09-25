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
import { Textarea } from "@/components/ui/textarea";
import { Episode } from "@/lib/generated/prisma";
import { PencilIcon, X } from "lucide-react";
import { toast } from "sonner";

interface DescriptionFormPops {
  initialData: Episode;
  episodeId: string;
  seasonId: string;
  seriesId: string;
}

const formSchema = z.object({
  description: z.string().min(10, {
    message: "Description is required",
  }),
});

export const EpisodeDescriptionForm = ({
  initialData,
  episodeId,
  seasonId,
  seriesId
}: DescriptionFormPops) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData.description || "",
    },
  });

  const toggleEdit = () => setIsEditing((current) => !current);

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(
        `/api/series/${seriesId}/season/${seasonId}/episode/${episodeId}`,
        values
      );
      toast.success("Episode description updated!");
      toggleEdit();
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Failed to update episode description");
    }
  };

  return (
    <div className="mt-6 border dark:bg-card rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Episode description
        <Button variant="ghost" type="button" onClick={toggleEdit}>
          {isEditing ? (
            <>
              <X className="size-5" />
              Cancel
            </>
          ) : (
            <>
              <PencilIcon className="size-4" />
              Edit description
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <p className="mt-2">
          {initialData.description ? (
            initialData.description
          ) : (
            <p className="text-muted-foreground">No description</p>
          )}
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
              name="description"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        disabled={isSubmitting}
                        placeholder="Enter description"
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
