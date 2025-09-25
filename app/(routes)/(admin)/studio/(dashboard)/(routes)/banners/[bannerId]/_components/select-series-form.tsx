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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SeriesBanner } from "@/lib/generated/prisma";
import { getError } from "@/lib/get-error-message";
import { cn } from "@/lib/utils";
import { PencilIcon, X } from "lucide-react";
import { toast } from "sonner";

interface CategoryFormPops {
  initialData: SeriesBanner;
  bannerId: string;
  options: { name: string; value: string; type: string | null }[];
}

const formSchema = z.object({
  seriesId: z.string().min(1),
});

export const SelectSeriesForm = ({
  initialData,
  bannerId,
  options,
}: CategoryFormPops) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      seriesId: initialData?.seriesId || "",
    },
  });

  const toggleEdit = () => setIsEditing((current) => !current);

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(
        `/api/series/banner/${bannerId}`,
        values
      );
      toast.success("Series banner updated");
      toggleEdit();
      router.refresh();
    } catch (error) {
      toast.error(getError(error));
    }
  };

  const selectedOption = options.find(
    (option) => option.value === initialData.seriesId
  );

  return (
    <div className="mt-6 border bg-card rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Series
        <Button variant="ghost" onClick={toggleEdit}>
          {isEditing ? (
            <>
              <X className="size-5" />
              Cancel
            </>
          ) : (
            <>
              <PencilIcon className="size-4" />
              Edit series
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <p
          className={cn(
            "text-sm mt-2",
            !initialData.seriesId && "text-slate-400 dark:text-muted-foreground"
          )}
        >
          {selectedOption 
            ? `${selectedOption.name}`
            : "No series selected"}
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
              name="seriesId"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select series" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {options.map((series) => (
                        <SelectItem key={series.value} value={series.value}>
                          {series.name} ({series.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
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
