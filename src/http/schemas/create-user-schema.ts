import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email({ message: "Insira um email válido" }),
  password: z.string().min(1, { message: "Insira uma senha para o usuário" }),
  name: z.string().min(1, { message: "Insira um nome para o usuário" }),
  associatedCustomerId: z.string().optional().nullable(),
  roleId: z.string(),
  permissionsId: z.array(z.string()).optional(),
});

export type CreateUserSchemaType = z.infer<typeof createUserSchema>;
