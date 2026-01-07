"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl, FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateTrailer } from "@/hooks/use-create-trailer";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Name is required",
  }),
});

export const CreateNewTrailer = () => {
  const router = useRouter();
  const { isOpen, onClose } = useCreateTrailer();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post(`/api/series/trailer`, values);
      router.push(
        `/studio/trailers/${response.data.id}`
      );
      onClose();
      toast.success("Trailer has been created!");
    } catch (error) {
      console.log(error);
      toast.error("Failed to create trailer. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="capitalize">Create new trailer</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage className="font-semibold text-red-500" />
                </FormItem>
              )}
            />
            <div className="flex justify-end mt-4">
              <DialogClose>
                <Button type="button" variant="outline" className="mr-2">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!isValid || isSubmitting}>
                Contiune
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
