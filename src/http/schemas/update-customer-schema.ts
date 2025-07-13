import { z } from "zod";
import { zodCepValidator } from "../../utils/cep-validator";
import { zodCNPJ } from "../../utils/cnpj-validator";

const cellphoneRegex = /^(\(?\d{2}\)?\s?)?(9\d{4})-?(\d{4})$/;
const businessPhoneRegex = /^(\(?\d{2}\)?\s?)?(\d{4})-?(\d{4})$/;

const addressSchema = z.object({
  streetAddress: z.string().optional(),
  zipCode: zodCepValidator.optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  neighborhood: z.string().optional(),
  number: z.string().optional(),
});

export const updateCustomerSchema = z
  .object({
    name: z.string().min(1, { message: "O campo Nome é obrigatório" }),
    document: zodCNPJ(),
    contactPerson: z.string().optional(),
    email: z
      .string()
      .email({ message: "Insira um email válido" })
      .optional()
      .or(z.literal("")),
    cellphone: z
      .string()
      .regex(cellphoneRegex, {
        message: "Número de celular inválido. Ex: (11) 91234-5678",
      })
      .optional()
      .nullable()
      .or(z.literal("")),
    businessPhone: z
      .string()
      .regex(businessPhoneRegex, {
        message: "Número de telefone comercial inválido. Ex: (11) 1234-5678",
      })
      .optional()
      .nullable()
      .or(z.literal("")),
    address: addressSchema.optional().nullable(),
    stateRegistration: z.string(),
  })
  .strict();

export type UpdateCustomerSchema = z.infer<typeof updateCustomerSchema>;
