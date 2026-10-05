import { User, Branch, Role } from "../models/index.js";
import mongoose from "mongoose";

export const createBranchService = async (curruntUserId, data) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        const anganwadiAdmin = await Role.findOne({
            slug: "branch_head"
        }).session(session);
        console.log("curruntUserId :- " + curruntUserId);

        // Create Anganwadi
        const [branch] = await Branch.create(
            [
                {
                    name: data.name,
                    stateId: data.stateId,
                    districtId: data.districtId,
                    blockId: data.blockId,
                    villageId: data.villageId,
                    pincode: data.pincode,
                    address: data.address,
                    createdBy: curruntUserId.id,
                },
            ],
            { session }
        );
        console.log("USER DATA:", {
            name: data.partnerName,
            username: data.partnerUsername,
            email: data.partnerEmail,
            phone: data.partnerPhone,
            password: data.partnerPassword,
            roleId: anganwadiAdmin._id,
            anganwadiId: branch._id,
            createdBy: curruntUserId.id,
        });
        const [user] = await User.create(
            [
                {
                    name: data.partnerName,
                    username: data.partnerUsername,
                    email: data.partnerEmail,
                    phone: data.partnerPhone,
                    password: data.partnerPassword,
                    roleId: anganwadiAdmin._id,
                    branchId: branch._id,
                    createdBy: curruntUserId.id,
                },
            ],
            { session }
        );

        // Everything successful
        await session.commitTransaction();

        return {
            ...branch.toObject(),
            user: user,
        };

    } catch (error) {
        // Any error → rollback everything
        await session.abortTransaction();

        throw error;

    } finally {
        await session.endSession();
    }
};
