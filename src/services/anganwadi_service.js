import { User, Anganwadi, Role, State, District } from "../models/index.js";
import mongoose from "mongoose";

export const createAnganwadiService = async (curruntUserId, data) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const anganwadiAdmin = await Role.findOne({
            slug: "sevika",
        }).session(session);

        if (!anganwadiAdmin) {
            throw new Error("Sevika role not found");
        }

        const anganwadiState = await State.findById(data.stateId)
            .select("name")
            .session(session);

        const anganwadiDistrict = await District.findById(data.districtId)
            .select("name")
            .session(session);

        if (!anganwadiState) {
            throw new Error("State not found");
        }

        if (!anganwadiDistrict) {
            throw new Error("District not found");
        }

        const stateCode = anganwadiState.name
            .replace(/\s+/g, "")
            .substring(0, 2)
            .toUpperCase();

        const districtCode = anganwadiDistrict.name
            .replace(/\s+/g, "")
            .substring(0, 3)
            .toUpperCase();

        const codePrefix = `AWC-${stateCode}-${districtCode}`;

        // Find latest code
        const lastAnganwadi = await Anganwadi.findOne({
            code: new RegExp(`^${codePrefix}-\\d+$`),
        })
            .sort({ _id: -1 })
            .select("code")
            .session(session);

        let sequence = 1;

        if (lastAnganwadi) {
            const lastNumber = parseInt(
                lastAnganwadi.code.split("-").pop(),
                10
            );

            sequence = lastNumber + 1;
        }

        const finalAnganwadiCode = `${codePrefix}-${sequence}`;

        console.log("Final Anganwadi Code:", finalAnganwadiCode);

        // Create Anganwadi
        const [anganwadi] = await Anganwadi.create(
            [
                {
                    name: data.name,
                    code: finalAnganwadiCode,
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

        // Create User
        const [user] = await User.create(
            [
                {
                    name: data.partnerName,
                    username: data.partnerUsername,
                    email: data.partnerEmail,
                    phone: data.partnerPhone,
                    password: data.partnerPassword,
                    roleId: anganwadiAdmin._id,
                    anganwadiId: anganwadi._id,
                    createdBy: curruntUserId.id,
                },
            ],
            { session }
        );

        // Update Anganwadi with User ID
        const updatedAnganwadi = await Anganwadi.findByIdAndUpdate(
            anganwadi._id,
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

        if (!updatedAnganwadi) {
            throw new Error("Failed to update Anganwadi userId");
        }

        await session.commitTransaction();

        return {
            ...updatedAnganwadi.toObject(),
            user,
        };

    } catch (error) {
        await session.abortTransaction();
        throw error;

    } finally {
        await session.endSession();
    }
};



export const updateAnganwadiService = async (id, data) => {
    try {
        const updatedAnganwadi = await Anganwadi.findByIdAndUpdate(
            id,
            { $set: data },
            {
                new: true,
                runValidators: true
            }
        );
        return updatedAnganwadi;
    } catch (error) {
        throw error;
    }
};
export const findByIdAnganwadiService = async (id) => {
    try {
        const user = await Anganwadi.findOne({ _id: id })
            .populate("userId")
            .populate("stateId")
            .populate("districtId")
            .populate("blockId")
            .populate("villageId");
        return user;

    } catch (error) {
        console.error("Error in loginUserService:", error);
        throw error;
    }
};