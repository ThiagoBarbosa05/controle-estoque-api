import { Router } from "express";

import { authenticateUserController } from "../controllers/authenticate-user-controller";
import { createUserController } from "../controllers/create-user";
import { authenticate } from "../middleware.ts/authenticate";
import { checkPermission } from "../middleware.ts/check-permissions";
import { listRolesController } from "../controllers/list-roles";
import { listUsersController } from "../controllers/list-users";
import { getUserController } from "../controllers/get-user";
import { updateUserController } from "../controllers/update-user";
import { deleteUserController } from "../controllers/delete-user";

export const userRoute = Router();

userRoute.post("/authenticate", authenticateUserController);
userRoute.post(
  "/users",
  authenticate,
  checkPermission("create:user"),
  createUserController
);
userRoute.get(
  "/users/roles",
  authenticate,
  checkPermission("read:roles"),
  listRolesController
);
userRoute.get(
  "/users",
  authenticate,
  checkPermission("read:users"),
  listUsersController
);
userRoute.get(
  "/users/:userId",
  authenticate,
  checkPermission("read:users"),
  getUserController
);

userRoute.put(
  "/users/:id",
  authenticate,
  checkPermission("update:users"),
  updateUserController
);
userRoute.delete(
  "/users/:id",
  authenticate,
  checkPermission("delete:users"),
  deleteUserController
);
