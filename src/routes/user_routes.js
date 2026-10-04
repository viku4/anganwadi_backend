import express from "express";
import { userController } from "../controllers/index.js";
import { createUserSchema } from "../validators/index.js";
import { validate, verifyAccessToken } from "../middlewares/index.js";

const router = express.Router();
const userValidation = validate(createUserSchema);

router.post(
  "/add-update",
  verifyAccessToken,
  userValidation,
  userController.createUser,
);
router.post("/get", verifyAccessToken, userController.getUsers);
router.post("/login", userController.loginUser);
router.post("/refreshToken", userController.refreshToken);

export default router;
