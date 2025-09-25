"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
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
import { useEpisode } from "@/hooks/use-episode";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Name is required",
  }),
});

interface CreateNewEpisodeProps {
  seasonId: string | null;
  seriesId: string
}

export const CreateNewEpisode = ({ seasonId, seriesId }: CreateNewEpisodeProps) => {
  const { isOpen, onClose } = useEpisode();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post(`/api/series/${seriesId}/season/${seasonId}/episode`, values);
      router.push(
        `/studio/series/${seriesId}/seasons/${seasonId}/episodes/${response.data.id}`
      );
      toast.success("Episode has been created!");
      onClose();
    } catch (error) {
      console.log(error);
      toast.error("Failed to create episode");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new episode</DialogTitle>
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
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
