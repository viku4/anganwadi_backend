import { User, Anganwadi, Role } from "../models/index.js";
import mongoose from "mongoose";

export const createAnganwadiService = async (curruntUserId, data) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        const anganwadiAdmin = await Role.findOne({
            slug: "anganwadi_head"
        }).session(session);
        console.log("anganwadiAdmin :- " + anganwadiAdmin);

        // Create Anganwadi
        const [anganwadi] = await Anganwadi.create(
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
        // console.log("USER DATA:", {
        //     name: data.partnerName,
        //     username: data.partnerUsername,
        //     email: data.partnerEmail,
        //     phone: data.partnerPhone,
        //     password: data.partnerPassword,
        //     roleId: anganwadiAdmin._id,
        //     anganwadiId: anganwadi,
        //     createdBy: curruntUserId.id,
        // });
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

        // Everything successful
        await session.commitTransaction();

        return {
            ...anganwadi.toObject(),
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
