import { User, Branch, Role, State, District } from "../models/index.js";
import mongoose from "mongoose";

export const createBranchService = async (currentUserId, data) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Get Branch Head role
        const branchHeadRole = await Role.findOne({
            slug: "branch_head",
        }).session(session);

        if (!branchHeadRole) {
            throw new Error("Branch Head role not found");
        }

        console.log("currentUserId:", currentUserId);

        // Get State
        const branchState = await State.findById(data.stateId)
            .select("name")
            .session(session);

        if (!branchState) {
            throw new Error("State not found");
        }

        // Get District
        const branchDistrict = await District.findById(data.districtId)
            .select("name")
            .session(session);

        if (!branchDistrict) {
            throw new Error("District not found");
        }

        // Generate State Code
        const stateCode = branchState.name
            .replace(/\s+/g, "")
            .substring(0, 2)
            .toUpperCase();

        // Generate District Code
        const districtCode = branchDistrict.name
            .replace(/\s+/g, "")
            .substring(0, 3)
            .toUpperCase();

        // BR-BI-NAW
        const codePrefix = `BR-${stateCode}-${districtCode}`;

        // Find latest Branch code
        const lastBranch = await Branch.findOne({
            code: new RegExp(`^${codePrefix}-\\d+$`),
        })
            .sort({ _id: -1 })
            .select("code")
            .session(session);

        let sequence = 1;

        if (lastBranch) {
            const lastNumber = parseInt(
                lastBranch.code.split("-").pop(),
                10
            );

            sequence = lastNumber + 1;
        }

        // BR-BI-NAW-1
        const finalBranchCode = `${codePrefix}-${sequence}`;

        console.log("Final Branch Code:", finalBranchCode);

        // Create Branch
        const [branch] = await Branch.create(
            [
                {
                    name: data.name,
                    code: finalBranchCode,
                    stateId: data.stateId,
                    districtId: data.districtId,
                    blockId: data.blockId,
                    villageId: data.villageId,
                    address: data.address,
                    createdBy: currentUserId.id,
                },
            ],
            { session }
        );

        // Create Branch Head User
        const [user] = await User.create(
            [
                {
                    name: data.partnerName,
                    username: data.partnerUsername,
                    email: data.partnerEmail,
                    phone: data.partnerPhone,
                    password: data.partnerPassword,
                    roleId: branchHeadRole._id,
                    createdBy: currentUserId.id,
                    branchId: branch._id,
                },
            ],
            { session }
        );

        // Update Branch with User ID
        const updatedBranch = await Branch.findByIdAndUpdate(
            branch._id,
            {
                $set: {
                    userId: user._id,
                },
            },
            {
                new: true,
                runValidators: true,
                session,
            }
        );

        if (!updatedBranch) {
            throw new Error("Failed to update Branch userId");
        }

        // Commit transaction
        await session.commitTransaction();

        return {
            ...updatedBranch.toObject(),
            user: user.toObject(),
        };

    } catch (error) {
        await session.abortTransaction();
        throw error;

    } finally {
        await session.endSession();
    }
};
