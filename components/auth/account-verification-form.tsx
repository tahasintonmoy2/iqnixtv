"use client";

import { accountVerification } from "@/actions/account-verification";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export const AccountVerificationForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("code");
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const onSubmit = useCallback(() => {
    if (success || error) return;

    if (!token) {
      setError("Missing token");
      return;
    }

    accountVerification(token)
      .then((data) => {
        setSuccess(data.success);
        setError(data.error);
      })
      .catch((error) => {
        setError(error.message);
      });
  }, [token, success, error]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <CardWrapper
      headerLabel="Verifying your account"
      description="Please wait while we verify your account."
      backButtonLabel="Login"
      backButtonHref="/auth/login"
      footerText="Back to"
    >
      <div className="flex justify-center items-center w-full mb-4 flex-col">
        {!success && !error && (
          <div className="h-20 flex items-center justify-center rounded-md">
            <div className="loader-lt"></div>
            <p className="ml-2">Loading</p>
          </div>
        )}
        <div className="mt-4">
          <FormSuccess message={success} />
          {!success && <FormError message={error} />}
        </div>
      </div>
    </CardWrapper>
  );
};
