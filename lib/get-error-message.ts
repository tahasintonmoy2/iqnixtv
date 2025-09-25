export const getError = (error: unknown): string => {
  let message: string;

  if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === "object" && "message" in error) {
    message = String(error.message);
  } else if (typeof error === "string") {
    message = error;
  } else {
    message = "Something went wrong!";
  }

  return message;
};

export const getErrorMessage = (error: unknown): string => {
  const errorMessage = getError(error);
  return errorMessage || "An unexpected error occurred.";
};