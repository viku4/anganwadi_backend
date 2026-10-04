import mongoose from "mongoose";

const blockSchema = new mongoose.Schema(
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
blockSchema.index(
    {
        stateId: 1,
        districtId: 1,
        name: 1,
    },
    {
        unique: true,
    }
);

const Block = mongoose.model("Block", blockSchema);

export default Block;