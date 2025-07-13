import { Router } from "express";
import { authenticate } from "../middleware.ts/authenticate";
import { checkPermission } from "../middleware.ts/check-permissions";
import { createConsignedController } from "../controllers/create-consigned";
import { listConsignedController } from "../controllers/list-consigned";
import { getConsignedController } from "../controllers/get-consigned";
import { countWineOnConsignedController } from "../controllers/count-consigned";
import { consignedHistoryController } from "../controllers/consigned-history";
import { addWinesOnConsignedController } from "../controllers/add-wines-consigned";
import { updateWineBalanceController } from "../controllers/update-wine-balance";
import { getWineTypeMetricsController } from "../controllers/wine-type-metrics";

export const consignedRoute = Router();

consignedRoute.post(
  "/consigned",
  authenticate,
  checkPermission("create:consigned"),
  createConsignedController
);

consignedRoute.get(
  "/consigned",
  authenticate,
  checkPermission("read:consigned"),
  listConsignedController
);

consignedRoute.get(
  "/consigned/customer/:customerId",
  authenticate,
  checkPermission("read:consigned"),
  consignedHistoryController
);

consignedRoute.get(
  "/consigned/:id",
  authenticate,
  checkPermission("read:consigned"),
  getConsignedController
);

consignedRoute.put(
  "/consigned/count/:id",
  authenticate,
  checkPermission("update:consigned"),
  countWineOnConsignedController
);

consignedRoute.put(
  "/consigned/new-wines/:id",
  authenticate,
  checkPermission("update:consigned"),
  addWinesOnConsignedController
);

consignedRoute.put(
  "/consigned/wine/balance",
  authenticate,
  checkPermission("update:consigned"),
  updateWineBalanceController
);

consignedRoute.get(
  "/consigned/wines/metrics", getWineTypeMetricsController)
