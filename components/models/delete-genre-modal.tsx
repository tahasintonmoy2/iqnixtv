"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Genre } from "@/lib/generated/prisma";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface ActionDialogProps {
  data: Genre;
  onClose: () => void;
  isOpen: boolean;
  onConfirm: () => void;
}

export const DeleteGenreModal = ({
  data,
  onConfirm,
  onClose,
  isOpen,
}: ActionDialogProps) => {
  const formSchema = z.object({
    name: z.string().min(3, {
      message: `Please type "${data.name}" to delete`,
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const { isSubmitting } = form.formState;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription className="font-semibold">
            To delete, just type{" "}
            <span className="text-purple-600">&quot;{data.name}&quot;</span> in the below
            box. This action cannot be undo.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onConfirm)}
              onReset={() => form.reset()}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <>
                    <FormItem>
                      <FormControl>
                        <Input disabled={isSubmitting} {...field} />
                      </FormControl>
                      <FormMessage className="font-semibold text-red-600" />
                    </FormItem>
                    <DialogFooter className="mt-4">
                      <>
                        <DialogClose>
                          <Button
                            variant="outline"
                            onClick={() => form.reset()}
                          >
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button
                          className="bg-red-500 hover:bg-red-400"
                          disabled={field.value !== data.name || isSubmitting}
                        >
                          Delete
                        </Button>
                      </>
                    </DialogFooter>
                  </>
                )}
              />
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
