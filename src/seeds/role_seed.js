// src/seeds/role.seed.js

import { Role } from "../models/index.js";

const roles = [
    {
        name: "Super Admin",
        slug: "super_admin",

    },
    {
        name: "Branch Head",
        slug: "branch_head",

    },
    {
        name: "Branch Staff",
        slug: "branch_staff",

    },
    {
        name: "Branch Account",
        slug: "branch_account",

    },
    {
        name: "Anganwadi Worker",
        slug: "anganwadi_worker",
    },
];

export const seedRoles = async () => {
    for (const role of roles) {
        await Role.create(
            role
        );
    }

    console.log("✅ Roles seeded successfully");
};