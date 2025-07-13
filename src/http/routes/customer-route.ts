import { Router } from "express";

import { createCustomerController } from "../controllers/create-customer";
import { listCustomersController } from "../controllers/list-customer";
import { getCustomerDetailsController } from "../controllers/get-customer-details";
import { updateCustomerController } from "../controllers/update-customer";
import { disableCustomerController } from "../controllers/disable-customer";
import { authenticate } from "../middleware.ts/authenticate";
import { checkPermission } from "../middleware.ts/check-permissions";
import { listCustomerSummaryController } from "../controllers/list-customer-summary";

export const customerRouter = Router();

customerRouter.post(
  "/customers",
  authenticate,
  checkPermission("create:customer"),
  createCustomerController
);
customerRouter.get(
  "/customers",
  authenticate,
  checkPermission("read:customer"),
  listCustomersController
);
customerRouter.get(
  "/customers/:id",
  authenticate,
  checkPermission("read:customer"),
  getCustomerDetailsController
);
customerRouter.put(
  "/customers/:id",
  authenticate,
  checkPermission("update:customer"),
  updateCustomerController
);
customerRouter.patch(
  "/customers/:id",
  authenticate,
  checkPermission("delete:customer"),
  disableCustomerController
);

customerRouter.get(
  "/summary",
  authenticate,
  checkPermission("read:customer"),
  listCustomerSummaryController
);
