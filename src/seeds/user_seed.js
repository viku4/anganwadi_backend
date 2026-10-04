// src/seeds/user.seed.js

import bcrypt from "bcrypt";
import { User, Role } from "../models/index.js";

export const seedSuperAdmin = async () => {
    try {
        const superAdminRole = await Role.findOne({
            slug: "super_admin",
        });

        if (!superAdminRole) {
            throw new Error("Super Admin role not found");
        }

        const existingUser = await User.findOne({
            username: "superadmin",
        });

        if (existingUser) {
            console.log("ℹ️ Super Admin already exists");
            return;
        }

        const hashedPassword = await bcrypt.hash(
            "Admin@123",
            10
        );

        await User.create({
            name: "Super Admin",
            username: "superadmin",
            password: hashedPassword,
            roleId: superAdminRole._id,
            email: "admin@gail.com",
            phone: "1234567890",
            status: 1,
        });

        console.log("✅ Super Admin created");
    } catch (error) {
        console.error("❌ Super Admin seed error:", error.message);
        throw error;
    }
};