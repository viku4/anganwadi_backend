import express from "express";
import roleRoutes from "./role_routes.js";
import userRoutes from "./user_routes.js";
import homeRoutes from "./home_routes.js";
const router = express.Router();

router.use("/roles", roleRoutes);
router.use("/users", userRoutes);
router.use("/homes", homeRoutes);

export default router;
