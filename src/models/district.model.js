import mongoose from "mongoose";

const districtSchema = new mongoose.Schema(
    {
        stateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "State",
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        code: {
            type: String,
            trim: true,
            uppercase: true,
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

    districtSchema.index(
        { stateId: 1, name: 1 },
        { unique: true }
    );

const District = mongoose.model("District", districtSchema);

export default District;