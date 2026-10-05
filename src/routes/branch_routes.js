import express from "express";
import { branchController } from "../controllers/index.js";
import { createAnganwadiSchema } from "../validators/index.js";
import { validate, verifyAccessToken } from "../middlewares/index.js";

const router = express.Router();
const anganwadiValidation = validate(createAnganwadiSchema);

router.post(
    "/create",
    verifyAccessToken,
    anganwadiValidation,
    branchController.createBranch,
);

export default router;
