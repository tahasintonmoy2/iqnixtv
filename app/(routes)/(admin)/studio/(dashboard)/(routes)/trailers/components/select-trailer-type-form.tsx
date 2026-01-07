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
import { Trailers } from "@/lib/generated/prisma";
import { cn } from "@/lib/utils";
import { PencilIcon, X } from "lucide-react";
import { toast } from "sonner";

interface CategoryFormPops {
  initialData: Trailers;
  trailerId: string;
  options: { name: string; value: string }[];
}

const formSchema = z.object({
  type: z.enum(["TRAILER", "TEASER", "CLIP"]),
});

export const SelectTrailerTypeForm = ({
  initialData,
  trailerId,
  options,
}: CategoryFormPops) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: initialData?.type || "TRAILER",
    },
  });

  const toggleEdit = () => setIsEditing((current) => !current);

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/series/trailer/${trailerId}`, values);
      toast.success("Series updated");
      toggleEdit();
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Failed to update series. Please try again.");
    }
  };

  const selectedOption = options.find(
    (option) => option.value === initialData.type
  );

  return (
    <div className="mt-6 border bg-card rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Trailer Type
        <Button variant="ghost" onClick={toggleEdit}>
          {isEditing ? (
            <>
              <X className="h-5 w-5 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit type
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <p
          className={cn(
            "text-sm mt-2",
            !initialData.type && "text-slate-400 dark:text-muted-foreground"
          )}
        >
          {selectedOption ? selectedOption.name : "No trailer type selected"}
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select series" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {options.map((series) => (
                        <SelectItem key={series.value} value={series.value}>
                          {series.name}
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
