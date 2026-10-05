import express from "express";
import { anganwadiController } from "../controllers/index.js";
import { createAnganwadiSchema } from "../validators/index.js";
import { validate, verifyAccessToken } from "../middlewares/index.js";

const router = express.Router();
const anganwadiValidation = validate(createAnganwadiSchema);

router.get(
    "/create",
    verifyAccessToken,
    anganwadiValidation,
    anganwadiController.createAnganwadi,
);

export default router;
