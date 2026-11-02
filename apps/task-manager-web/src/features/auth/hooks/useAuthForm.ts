import { useState } from "react";
import { postAuth } from "@/features/auth/api";
import { mapServerErrors, type ErrorKey } from "@/features/auth/validation";

type Validator = (value: string) => ErrorKey | undefined;

export function useAuthForm<F extends string>(
  path: "register" | "login",
  initialValues: Record<F, string>,
  validators: Record<F, Validator>,
  onSuccess?: () => void,
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<string, ErrorKey>>>({});
  const [unexpected, setUnexpected] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSuccess(false);
    setUnexpected(false);
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    const found: Partial<Record<string, ErrorKey>> = {};

    for (const field of Object.keys(validators) as F[]) {
      found[field] = validators[field](values[field]);
    }

    setErrors(found);
    if (Object.values(found).some(Boolean)) return;

    const payload = Object.fromEntries(
      Object.entries<string>(values).map(([key, value]) => [
        key,
        key === "password" ? value : value.trim(),
      ]),
    );

    setUnexpected(false);
    setSuccess(false);
    setLoading(true);

    try {
      const { success, status, data } = await postAuth(path, payload);

      if (success) {
        setSuccess(true);
        onSuccess?.();
      } else if (status === 400) {
        const { fieldErrors, unexpected: hasUnknown } = mapServerErrors(
          data.message,
        );
        setErrors(fieldErrors);
        setUnexpected(hasUnknown);
      } else {
        setUnexpected(true);
      }
    } catch {
      setUnexpected(true);
    } finally {
      setLoading(false);
    }
  }

  return {
    values,
    errors,
    unexpected,
    success,
    loading,
    handleChange,
    handleSubmit,
  };
}
