"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Episode } from "@/lib/generated/prisma";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { PencilIcon, X } from "lucide-react";
import { toast } from "sonner";

interface PriceFormPops {
  initialData: Episode;
  seasonId: string;
  episodeId: string;
  seriesId: string
}

const formSchema = z.object({
  releaseDate: z.date(),
});

export const EpisodeReleaseForm = ({
  initialData,
  seasonId,
  episodeId,
  seriesId
}: PriceFormPops) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      releaseDate: initialData?.releaseDate || new Date(),
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
      toast.success("Episode release date updated!");
      toggleEdit();
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Failed to update episode release date");
    }
  };

  return (
    <div className="mt-6 border bg-card rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Release Date
        <Button variant="ghost" type="button" onClick={toggleEdit}>
          {isEditing ? (
            <>
              <X className="size-5" />
            </>
          ) : (
            <>
              <PencilIcon className="size-4" />
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <p
          className={cn(
            "text-sm mt-2",
            !initialData.releaseDate &&
              "text-slate-400 dark:text-muted-foreground"
          )}
        >
          {initialData.releaseDate
            ? format(initialData.releaseDate, "MMM, do yyyy")
            : "No release date set"}
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
              name="releaseDate"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DatePicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
