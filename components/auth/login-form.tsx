"use client";

import {login} from "@/actions/login";
import {FormError} from "@/components/form-error";
import {FormSuccess} from "@/components/form-success";
import {Button} from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {Input} from "@/components/ui/input";
import {LoginSchema} from "@/schemas";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSearchParams} from "next/navigation";
import {useState, useTransition} from "react";
import {useForm} from "react-hook-form";
import * as z from "zod";
import {CardWrapper} from "./card-wrapper";
import Link from "next/link";
import {cn} from "@/lib/utils";
import {Eye, EyeOff} from "lucide-react";

export const LoginForm = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [showTwoFactor, setShowTwoFactor] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showEmailVerification, setShowEmailVerification] = useState<boolean>(false);

  const searchParams = useSearchParams();
  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Email already used with a different sign in method. Please use the other method you signed up with."
      : "";

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {isSubmitting, errors} = form.formState;

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      login(values)
        .then((data) => {
          if (data?.error) {
            setError(data.error);
            form.reset();
          }
          if (data?.success) {
            if (data.success.includes("Confirmation email sent")) {
              setShowEmailVerification(true)
              setSuccess(data.success)
            } else {
              setSuccess(data.success);
              form.reset();
            }
          }
          if (data?.twoFactor) {
            setShowTwoFactor(true);
          }
        });
    });
  };

  return (
    <CardWrapper
      backButtonHref="/auth/sign-up"
      backButtonLabel="Sign Up"
      headerLabel="Sign In"
      description="Welcome back, Sign in to your account"
      footerText="Don't have an account?"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {showEmailVerification && (
            <div className="flex justify-center items-center w-full">
              <FormField
                control={form.control}
                name="code"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>One-Time Password</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0}/>
                          <InputOTPSlot index={1}/>
                          <InputOTPSlot index={2}/>
                        </InputOTPGroup>
                        <InputOTPSeparator/>
                        <InputOTPGroup>
                          <InputOTPSlot index={3}/>
                          <InputOTPSlot index={4}/>
                          <InputOTPSlot index={5}/>
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormDescription>
                      Enter the 6-digit verification code sent from your email
                    </FormDescription>
                    <FormMessage/>
                  </FormItem>
                )}
              />
            </div>
          )}
          {showTwoFactor && (
            <div className="flex justify-center items-center w-full">
              <FormField
                control={form.control}
                name="code"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>One-Time Password</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0}/>
                          <InputOTPSlot index={1}/>
                          <InputOTPSlot index={2}/>
                        </InputOTPGroup>
                        <InputOTPSeparator/>
                        <InputOTPGroup>
                          <InputOTPSlot index={3}/>
                          <InputOTPSlot index={4}/>
                          <InputOTPSlot index={5}/>
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormDescription>
                      Enter the 6-digit verification code sent from your email
                    </FormDescription>
                    <FormMessage/>
                  </FormItem>
                )}
              />
            </div>
          )}
          {!showTwoFactor && !showEmailVerification && (
            <>
              <FormField
                control={form.control}
                name="email"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending || isSubmitting}
                        className="w-full"
                        placeholder="yu@example.com"
                        type="email"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="font-semibold text-red-600"/>
                  </FormItem>
                )}
              />
              <div>
                <FormField
                  control={form.control}
                  name="password"
                  render={({field}) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Link
                          href="/auth/reset"
                          className="text-sm text-primary hover:underline flex items-end justify-end"
                        >
                          Forgot password
                        </Link>
                      </div>
                      <FormControl>
                        <div className="flex items-center relative">
                          <Input
                            disabled={isPending || isSubmitting}
                            className={cn(
                              "w-full",
                              errors.password &&
                              "focus-visible:ring-red-600 border-red-600 focus-visible:border-input"
                            )}
                            placeholder="Enter your password"
                            type={showPassword ? "text" : "password"}
                            {...field}
                          />
                          <button
                            type="button"
                            className="text-muted-foreground absolute right-2 cursor-pointer hover:bg-transparent hover:text-white/80 transition"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <Eye className="size-5"/>
                            ) : (
                              <EyeOff className="size-5"/>
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="font-semibold text-red-600"/>
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}
          <div>
            <FormError message={error || urlError}/>
            <div className="mb-2">
              <FormSuccess message={success}/>
            </div>
            <Button
              className="w-full mt-3"
              type="submit"
              disabled={isPending || isSubmitting}
            >
              {showEmailVerification ? "Verify Email" : showTwoFactor ? "Confirm" : "Login"}
            </Button>
          </div>
        </form>
      </Form>
    </CardWrapper>
  );
};
