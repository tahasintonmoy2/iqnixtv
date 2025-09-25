"use client";

import { resetPassword } from "@/actions/reset-password";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ResetPasswordSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CardWrapper } from "./card-wrapper";

export const ResetPasswordForm = () => {
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | undefined>("");
	const [success, setSuccess] = useState<string | undefined>("");
	const searchParams = useSearchParams();
	const token = searchParams.get("code");

	const form = useForm<z.infer<typeof ResetPasswordSchema>>({
		resolver: zodResolver(ResetPasswordSchema),
		defaultValues: {
			password: "",
		},
	});

	const { isSubmitting } = form.formState;

	const onSubmit = (values: z.infer<typeof ResetPasswordSchema>) => {
		setError("");
		setSuccess("");

		startTransition(() => {
			resetPassword(values, token).then((data) => {
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
			description="Please enter your new password"
			footerText="Back to"
		>
			<div className="flex justify-center items-center w-full">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											maxLength={15}
											{...field}
											placeholder="New password"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormError message={error} />
						<div className="mb-2">
							<FormSuccess message={success} />
						</div>
						<Button
							type="submit"
							className="w-72"
							size="lg"
							disabled={isSubmitting || isPending}
						>
							Submit
						</Button>
					</form>
				</Form>
			</div>
		</CardWrapper>
	);
};