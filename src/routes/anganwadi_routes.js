import express from "express";
import { anganwadiController } from "../controllers/index.js";
import { createAnganwadiSchema,updateAnganwadiSchema } from "../validators/index.js";
import { validate, verifyAccessToken } from "../middlewares/index.js";

const router = express.Router();
const anganwadiCreateValidation = validate(createAnganwadiSchema);
const anganwadiUpdateValidation = validate(updateAnganwadiSchema);
router.post(
    "/create",
    verifyAccessToken,
    anganwadiCreateValidation,
    anganwadiController.createAnganwadi,
);

router.post(
    "/update",
    verifyAccessToken,
    anganwadiUpdateValidation,
    anganwadiController.updateAnganwadi,
);
router.post(
    "/get-by-id",
    verifyAccessToken,
    anganwadiController.getByIdAnganwadi,
);
export default router;
