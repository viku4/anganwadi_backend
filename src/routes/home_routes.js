import express from "express";
import { homeController } from "../controllers/index.js";
import { createUserSchema } from "../validators/index.js";
import { validate, verifyAccessToken } from "../middlewares/index.js";

const router = express.Router();
const userValidation = validate(createUserSchema);

router.get(
    "/states",
    verifyAccessToken,
    homeController.getStates,
);
router.post(
    "/districts",
    verifyAccessToken,
    homeController.getDistricts,
);
router.post(
    "/blocks",
    verifyAccessToken,
    homeController.getBlocks,
);
export default router;
