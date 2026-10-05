import express from "express";
import roleRoutes from "./role_routes.js";
import userRoutes from "./user_routes.js";
import homeRoutes from "./home_routes.js";
import anganwadiRoutes from "./anganwadi_routes.js";
import branchRoutes from "./branch_routes.js";
const router = express.Router();

router.use("/roles", roleRoutes);
router.use("/users", userRoutes);
router.use("/homes", homeRoutes);
router.use("/anganwadi", anganwadiRoutes);
router.use("/branch", branchRoutes);

export default router;
