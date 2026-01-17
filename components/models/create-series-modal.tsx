"use client";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useCreateSeries } from "@/hooks/use-create-series";
import { axiosClient } from "@/lib/axios-client";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Name is required",
  }),
});

export const CreateNewSeries = () => {
  const router = useRouter();
  const { isOpen, onClose } = useCreateSeries();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axiosClient.post(`/series`, values);
      router.push(
        `/studio/series/${response.data.id}/seasons`
      );
      onClose();
      toast.success("Series has been created!");
    } catch (error) {
      console.log(error);
      toast.error("Failed to create series");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new series</DialogTitle>
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
