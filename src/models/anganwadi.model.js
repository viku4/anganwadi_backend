import mongoose from "mongoose";

const anganwadiSchema = new mongoose.Schema(
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
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
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
anganwadiSchema.index(
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

const Anganwadi = mongoose.model("Anganwadi", anganwadiSchema);
export default Anganwadi;