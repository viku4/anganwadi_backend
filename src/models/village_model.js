import mongoose from "mongoose";

const villageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
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
        status: {
            type: Number,
            enum: [1, 0],
            default: 1,
        },
    },
    {
        versionKey: false,
        timestamps: true,
    }
);
villageSchema.index(
    {
        stateId: 1,
        districtId: 1,
        blockId: 1,
        name: 1,
    },
    {
        unique: true,
    }
);

const Village = mongoose.model("Village", villageSchema);

export default Village;