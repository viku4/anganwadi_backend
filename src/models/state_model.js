import mongoose from "mongoose";

const stateSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        status: {
            type: Number,
            enum: [1, 0],
            default: 0,
        },
    },
    {
        versionKey: false,
        timestamps: true,
    }
);

const State = mongoose.model("State", stateSchema);

export default State;