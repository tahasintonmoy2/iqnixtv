"use client";

import { reset } from "@/actions/reset";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ResetSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CardWrapper } from "./card-wrapper";

export const ResetForm = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = (values: z.infer<typeof ResetSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      reset(values).then((data) => {
        setError(data?.error);
        setSuccess(data?.success);
        form.reset();
      });
    });
  };

  return (
    <CardWrapper
      backButtonHref="/auth/login"
      backButtonLabel="Sign In"
      headerLabel="Reset your password"
      description="Enter your account's email address below and we will email you a link to reset your password with"
      footerText="Back to"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    disabled={isPending || isSubmitting}
                    className="w-full mb-2"
                    placeholder="Email"
                    type="email"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="font-semibold text-red-600" />
              </FormItem>
            )}
          />
          <div>
            <FormError message={error} />
            <div className="mb-2">
              <FormSuccess message={success} />
            </div>
            <Button
              className="w-full mt-3"
              type="submit"
              disabled={isPending || isSubmitting}
            >
              Send code
            </Button>
          </div>
        </form>
      </Form>
    </CardWrapper>
  );
};
