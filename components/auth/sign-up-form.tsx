"use client";

import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { SignUpSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CardWrapper } from "./card-wrapper";

export const SignUpForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isShow, setIsShow] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isShowOTP, setIsShowOTP] = useState(false);
  const { signup, loading } = useAuth();

  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const { isSubmitting, errors } = form.formState;

  const onSubmit = async (values: z.infer<typeof SignUpSchema>) => {
    try {
      await signup(
        values.email,
        values.password,
        values.firstName,
        values.lastName
      );
      form.reset();
      setSuccess(
        "Sign up successful! Please check your email for the verification code."
      );
    } catch (error) {
      console.log(error);
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <CardWrapper
      backButtonHref="/auth/sign-in"
      backButtonLabel="Sign In"
      headerLabel="Sign Up"
      description={isShowOTP ? "Verify your account" : "Create an your account"}
      footerText="Already have an account?"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          {isShowOTP && (
            <div className="flex justify-center items-center w-full">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>One-Time Password</FormLabel>
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        {...field}
                        disabled={isSubmitting}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormDescription>
                      Enter the 6-digit verification code sent from your email
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
          {!isShowOTP && (
            <>
              <div className="flex items-center gap-x-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading || isSubmitting}
                          className={cn(
                            "w-full my-2",
                            errors.firstName &&
                              "focus-visible:ring-red-600 border-red-600 focus-visible:border-input"
                          )}
                          placeholder="Enter your first name"
                          type="text"
                          autoComplete="name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="font-semibold text-red-600" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading || isSubmitting}
                          className={cn(
                            "w-full my-2",
                            errors.lastName &&
                              "focus-visible:ring-red-600 border-red-600 focus-visible:border-input"
                          )}
                          placeholder="Enter your last name"
                          type="text"
                          autoComplete="name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="font-semibold text-red-600" />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading || isSubmitting}
                        className={cn(
                          "w-full my-2",
                          errors.email &&
                            "focus-visible:ring-red-600 border-red-600 focus-visible:border-input"
                        )}
                        placeholder="Enter your email"
                        type="email"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="font-semibold text-red-600" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="flex items-center relative">
                        <Input
                          disabled={loading || isSubmitting}
                          className={cn(
                            "w-full my-2",
                            errors.password &&
                              "focus-visible:ring-red-600 border-red-600 focus-visible:border-input"
                          )}
                          placeholder="Enter your password"
                          type={isShow ? "text" : "password"}
                          {...field}
                        />
                        <button
                          type="button"
                          className="text-muted-foreground absolute right-2 cursor-pointer hover:bg-transparent hover:text-white/80 transition"
                          onClick={() => setIsShow(!isShow)}
                        >
                          {isShow ? (
                            <Eye className="size-5" />
                          ) : (
                            <EyeOff className="size-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />
            </>
          )}
          <div>
            <FormError message={error} />
            <div className="mb-2">
              <FormSuccess message={success} />
            </div>
            <Button
              className="w-full mt-3"
              type="submit"
              disabled={loading || isSubmitting}
            >
              {isShowOTP ? "Verify Email" : "Sign Up"}
            </Button>
          </div>
        </form>
      </Form>
    </CardWrapper>
  );
};
