import express from "express";
import { roleController } from "../controllers/index.js";
import { verifyAccessToken } from "../middlewares/index.js";
const router = express.Router();

router.post("/create", verifyAccessToken, roleController.createRole);
router.get("/get", verifyAccessToken, roleController.getRoles);

export default router;
