import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { DEFAULT_ERROR_MESSAGE } from "../../../../../../shared/utils";
import { registerSchema } from "../schema/register-schema";
import { registerService } from "../services/register.service";
import type { RegisteredUser, RegisterFormValues } from "../types/register.types";

export function useRegisterForm() {
  const [registeredUser, setRegisteredUser] = useState<RegisteredUser | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const onSubmit = form.handleSubmit(async ({ name, email, password }) => {
    setNotice(null);
    setRegisteredUser(null);

    try {
      const user = await registerService({ name, email, password });
      setRegisteredUser(user);
      form.reset();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE);
    }
  });

  return {
    ...form,
    notice,
    registeredUser,
    onSubmit,
  };
}
