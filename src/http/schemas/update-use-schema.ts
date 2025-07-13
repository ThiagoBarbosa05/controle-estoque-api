import { z } from "zod";

export const updateUserSchema = z.object({
  email: z.string().email({ message: "Insira um email válido" }),
  newPassword: z.string().optional().nullable(),
  name: z.string().min(1, { message: "Insira um nome para o usuário" }),
  associatedCustomerId: z.string().optional().nullable(),
  roleId: z.string(),
  // permissionsId: z.array(z.string()).optional()
});

export type UpdateUserSchemaType = z.infer<typeof updateUserSchema>;
