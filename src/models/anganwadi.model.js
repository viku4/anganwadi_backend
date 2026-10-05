const mongoose = require("mongoose");

const anganwadiSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
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

        pincode: {
            type: String,
            required: true,
            trim: true
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

module.exports = mongoose.model("Anganwadi", anganwadiSchema);