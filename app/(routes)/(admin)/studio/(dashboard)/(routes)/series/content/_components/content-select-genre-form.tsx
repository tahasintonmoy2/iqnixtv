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
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import { Series } from "@/lib/generated/prisma";
import { getError } from "@/lib/get-error-message";
import { cn } from "@/lib/utils";
import { PencilIcon, X } from "lucide-react";
import { toast } from "sonner";

interface CategoryFormPops {
  initialData: Series;
  seriesId: string;
  options: { name: string; value: string }[];
}

const formSchema = z.object({
  genreId: z.array(z.string().min(1)),
});

export const ContentGenresForm = ({
  initialData,
  seriesId,
  options,
}: CategoryFormPops) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      genreId: Array.isArray(initialData.genreId) ? initialData?.genreId : [],
    },
  });

  const toggleEdit = () => setIsEditing((current) => !current);

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/series/${seriesId}`, values);
      toast.success("Series age rating updated!");
      toggleEdit();
      router.refresh();
    } catch (error) {
      toast.error(getError(error));
    }
  };

  const selectedOption = options.find(
    (option) => option.value === initialData.genreId
  );

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
            !initialData.genreId && "text-muted-foreground"
          )}
        >
          {selectedOption ? `${selectedOption.name}` : "No genre selected"}
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
                  <FormControl>
                    <MultiSelect
                      values={field.value ?? []}
                      onValuesChange={(vals) => field.onChange(vals)}
                    >
                      <MultiSelectTrigger
                        className="w-auto"
                        disabled={isSubmitting}
                      >
                        <MultiSelectValue
                          placeholder="Select genre..."
                          disabled={isSubmitting}
                        />
                      </MultiSelectTrigger>
                      <MultiSelectContent>
                        <MultiSelectGroup>
                          {options.map((item) => (
                            <MultiSelectItem
                              value={item.value}
                              key={item.value}
                            >
                              {item.name}
                            </MultiSelectItem>
                          ))}
                        </MultiSelectGroup>
                      </MultiSelectContent>
                    </MultiSelect>
                  </FormControl>
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
