import express from "express";
import { customerRouter } from "./http/routes/customer-route";
import { userRoute } from "./http/routes/user-route";
import cors from "cors";
import { dashboardMetricsController } from "./http/controllers/dashboard-metrics";
import { prisma } from "./lib/prisma";
import dotenv from "dotenv";
import { wineRoute } from "./http/routes/wine-route";

import { consignedRoute } from "./http/routes/consigned-route";
import { authenticate } from "./http/middleware.ts/authenticate";
import { checkPermission } from "./http/middleware.ts/check-permissions";
import { getAuthorizationCode } from "./integrations/get-authorization-code";
import { getBlingAccessToken } from "./integrations/get-access-token";
import { DynamoDBClient, GetItemCommand, GetItemCommandInput, GetResourcePolicyCommand, GetResourcePolicyCommandInput, ListTablesCommand, ListTablesCommandInput } from "@aws-sdk/client-dynamodb";
import axios from "axios";
import { InvokeAsyncCommandInput, InvokeCommand, InvokeCommandInput, LambdaClient } from "@aws-sdk/client-lambda";
import { getRefreshTokenFromDynamoDB, handler } from "./integrations/refresh-bling-token";
import { blingRouter } from "./http/routes/bling-route";


dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api", customerRouter);
app.use("/api", userRoute);
app.use("/api", wineRoute);
app.use("/api", consignedRoute);
app.use("/api", blingRouter)

app.get(
  "/api/metrics",
  authenticate,
  checkPermission("read:metrics"),
  dashboardMetricsController
);


const lambda = new LambdaClient({region: "us-east-2"})

app.get("/api/invoices", async (req, res) => {
  const result = await getAuthorizationCode()
  
  res.send()
  return

  
})


app.get("/api/bling/code", async (req, res) => {
  const { code } = req.query

  if (code) {
    const result = await getBlingAccessToken(code as string)
    console.log(result)
  }

  res.send( )
  return
})

app.listen(3000, () => {
  console.log("Server is listening on http://localhost:4000");
});

// Quando o processo receber sinal de encerramento (Ctrl+C ou kill)
process.on("SIGINT", async () => {
  console.log("SIGINT recebido: fechando Prisma...");
  await prisma.$disconnect();
  process.exit(0); // encerra o processo corretamente
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM recebido: fechando Prisma...");
  await prisma.$disconnect();
  process.exit(0);
});
