import { z } from "zod";

export const authenticateUserSchema = z.object({
  email: z.string().email({ message: "Esse campo é obrigatório" }),
  password: z.string({ message: "Esse campo é obrigatório" }),
});

export type AuthenticateUserSchema = z.infer<typeof authenticateUserSchema>;
