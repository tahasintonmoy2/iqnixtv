"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useCreateThreads } from "@/hooks/use-create-threads";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Hash } from "lucide-react";
import { useRouter } from "next/navigation";

interface CreateThreadsModelProps {
  forumId: string;
}

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title is required",
  }),
  content: z.string().min(2, {
    message: "Content is required",
  }),
});

export const CreateThreadsModel = ({forumId}: CreateThreadsModelProps) => {
  const { isOpen, onClose } = useCreateThreads();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post(`/api/forum/${forumId}/threads`, values);
      toast.success("Threads posted");
      form.reset();
      onClose();
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Failed to post thread. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New thread</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormControl>
                    <Input
                      placeholder="Title"
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button variant="secondary" size="sm" className="mb-3" type="button">
              <Hash className="size-4" />
              Add Tags
            </Button>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Body text"
                      className="resize-none max-h-48"
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end mt-4">
              <Button type="submit" disabled={isSubmitting || !isValid}>
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="loader"></div>
                    <p>Loading</p>
                  </div>
                ) : (
                  <p>Post</p>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
