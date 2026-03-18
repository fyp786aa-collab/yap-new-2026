export async function logVerificationEmailFailure(
  email: string,
  error: unknown,
): Promise<void> {
  const timestamp = new Date().toISOString();
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : JSON.stringify(error);

  console.error("[verification-email-failure]", {
    timestamp,
    email,
    error: errorMessage,
  });
}
