
import { Request, Response } from "express";
import { createHmac } from "crypto";
import { z } from "zod";
import axios from "axios";

// This should be stored securely, e.g., in environment variables
const WEBHOOK_SECRET = process.env.BLING_CLIENT_SECRET;
const lambdaUrl = process.env.BLING_LAMBDA_URL

const nfeBodySchema = z.object({
   id: z.coerce.number()
})

type NFEBody = z.infer<typeof nfeBodySchema>


export const blingWebhookController = async (req: Request, res: Response) => {
  if (!WEBHOOK_SECRET) {
    console.error("WEBHOOK_SECRET is not defined.");
     res.status(500).send("Internal Server Error");
     return
  }

  const signature = req.header("X-Bling-Signature");

  if (!signature) {
     res.status(401).send("Signature not found.");
     return
  }

  const hmac = createHmac("sha256", WEBHOOK_SECRET!);
  hmac.update(JSON.stringify(req.body));
  const calculatedSignature = hmac.digest("hex");

  if (signature !== calculatedSignature) {
     res.status(401).send("Invalid signature.");
     return
  }

  // Process the webhook data
  const body = req.body;

  const {id: invoiceId} = nfeBodySchema.parse(body)

  const response = await axios.post(lambdaUrl!, {
     invoiceId 
  })

  console.log(response.data)

   res.status(200).send(body);
   return
};
