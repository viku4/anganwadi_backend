import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        code: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            uppercase: true,
        },
        stateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "State",
            required: true,
        },
        districtId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "District",
            required: true,
        },

        blockId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Block",
            required: true,
        },

        villageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Village",
            required: true,
        },
        latitude: {
            type: Number,
            default: null
        },

        longitude: {
            type: Number,
            default: null
        },

        address: {
            type: String,
            trim: true,
            default: null
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        status: {
            type: Number,
            enum: [1, 0],
            default: 1,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        versionKey: false,
        timestamps: true,
    }
);
branchSchema.index(
    {
        stateId: 1,
        districtId: 1,
        blockId: 1,
        villageId: 1,
        name: 1,
    },
    {
        unique: true,
    }
);

const Branch = mongoose.model("Branch", branchSchema);
export default Branch;